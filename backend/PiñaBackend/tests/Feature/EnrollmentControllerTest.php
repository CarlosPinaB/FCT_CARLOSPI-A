<?php

namespace Tests\Feature;

use App\Models\Activity;
use App\Models\Category;
use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class EnrollmentControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    #[Test]
    public function student_can_enroll_in_activity()
    {
        $student = User::factory()->create(['role' => 'alumno']);
        $activity = Activity::factory()->create(['max_participants' => 10]);

        Sanctum::actingAs($student);

        $response = $this->postJson("/api/activities/{$activity->id}/enroll");

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'activity_id',
                    'user_id',
                    'status',
                    'created_at',
                    'updated_at'
                ]
            ]);

        $this->assertDatabaseHas('enrollments', [
            'activity_id' => $activity->id,
            'user_id' => $student->id,
            'status' => 'pending'
        ]);
    }

    #[Test]
    public function teacher_cannot_enroll_in_activity()
    {
        $teacher = User::factory()->create(['role' => 'profesor']);
        $activity = Activity::factory()->create();

        Sanctum::actingAs($teacher);

        $response = $this->postJson("/api/activities/{$activity->id}/enroll");

        $response->assertStatus(403)
            ->assertJson([
                'message' => 'Solo los alumnos pueden inscribirse en actividades.'
            ]);
    }

    #[Test]
    public function guest_cannot_enroll_in_activity()
    {
        $activity = Activity::factory()->create();

        $response = $this->postJson("/api/activities/{$activity->id}/enroll");

        $response->assertStatus(401);
    }

    #[Test]
    public function student_cannot_enroll_twice_in_same_activity()
    {
        $student = User::factory()->create(['role' => 'alumno']);
        $activity = Activity::factory()->create();

        // Primera inscripción
        Enrollment::factory()->create([
            'activity_id' => $activity->id,
            'user_id' => $student->id,
            'status' => 'pending'
        ]);

        Sanctum::actingAs($student);

        $response = $this->postJson("/api/activities/{$activity->id}/enroll");

        $response->assertStatus(409)
            ->assertJson([
                'message' => 'Ya estás inscrito en esta actividad.'
            ]);
    }

    #[Test]
    public function student_cannot_enroll_when_activity_is_full()
    {
        $student = User::factory()->create(['role' => 'alumno']);
        $activity = Activity::factory()->create(['max_participants' => 1]);

        // Llenar la actividad
        $otherStudent = User::factory()->create(['role' => 'alumno']);
        Enrollment::factory()->create([
            'activity_id' => $activity->id,
            'user_id' => $otherStudent->id,
            'status' => 'approved'
        ]);

        Sanctum::actingAs($student);

        $response = $this->postJson("/api/activities/{$activity->id}/enroll");

        $response->assertStatus(409)
            ->assertJson([
                'message' => 'La actividad está llena.'
            ]);
    }

    #[Test]
    public function student_can_cancel_enrollment()
    {
        $student = User::factory()->create(['role' => 'alumno']);
        $activity = Activity::factory()->create();
        $enrollment = Enrollment::factory()->create([
            'activity_id' => $activity->id,
            'user_id' => $student->id,
            'status' => 'pending'
        ]);

        Sanctum::actingAs($student);

        $response = $this->deleteJson("/api/enrollments/{$enrollment->id}");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Inscripción cancelada exitosamente.'
            ]);

        $this->assertDatabaseHas('enrollments', [
            'id' => $enrollment->id,
            'status' => 'cancelled'
        ]);
    }

    #[Test]
    public function student_cannot_cancel_other_student_enrollment()
    {
        $student1 = User::factory()->create(['role' => 'alumno']);
        $student2 = User::factory()->create(['role' => 'alumno']);
        $activity = Activity::factory()->create();
        $enrollment = Enrollment::factory()->create([
            'activity_id' => $activity->id,
            'user_id' => $student2->id,
            'status' => 'pending'
        ]);

        Sanctum::actingAs($student1);

        $response = $this->deleteJson("/api/enrollments/{$enrollment->id}");

        $response->assertStatus(403)
            ->assertJson([
                'message' => 'No tienes permisos para cancelar esta inscripción.'
            ]);
    }

    #[Test]
    public function student_can_get_their_enrollments()
    {
        $student = User::factory()->create(['role' => 'alumno']);
        $activities = Activity::factory()->count(3)->create();

        foreach ($activities as $activity) {
            Enrollment::factory()->create([
                'activity_id' => $activity->id,
                'user_id' => $student->id
            ]);
        }

        // Crear inscripción de otro estudiante (no debe aparecer)
        $otherStudent = User::factory()->create(['role' => 'alumno']);
        $otherActivity = Activity::factory()->create();
        Enrollment::factory()->create([
            'activity_id' => $otherActivity->id,
            'user_id' => $otherStudent->id
        ]);

        Sanctum::actingAs($student);

        $response = $this->getJson('/api/my-enrollments');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data')
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'activity_id',
                        'user_id',
                        'status',
                        'activity' => [
                            'id',
                            'name',
                            'description',
                            'start_date',
                            'end_date'
                        ]
                    ]
                ]
            ]);
    }

    #[Test]
    public function teacher_can_get_enrollments_for_their_activity()
    {
        $teacher = User::factory()->create(['role' => 'profesor']);
        $activity = Activity::factory()->create(['user_id' => $teacher->id]);
        $students = User::factory()->count(3)->create(['role' => 'alumno']);

        foreach ($students as $student) {
            Enrollment::factory()->create([
                'activity_id' => $activity->id,
                'user_id' => $student->id
            ]);
        }

        Sanctum::actingAs($teacher);

        $response = $this->getJson("/api/activities/{$activity->id}/enrollments");

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data')
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'activity_id',
                        'user_id',
                        'status',
                        'student' => [
                            'id',
                            'name',
                            'email'
                        ]
                    ]
                ]
            ]);
    }

    #[Test]
    public function teacher_cannot_get_enrollments_for_other_teacher_activity()
    {
        $teacher1 = User::factory()->create(['role' => 'profesor']);
        $teacher2 = User::factory()->create(['role' => 'profesor']);
        $activity = Activity::factory()->create(['user_id' => $teacher2->id]);

        Sanctum::actingAs($teacher1);

        $response = $this->getJson("/api/activities/{$activity->id}/enrollments");

        $response->assertStatus(403)
            ->assertJson([
                'message' => 'No tienes permisos para ver las inscripciones de esta actividad.'
            ]);
    }

    #[Test]
    public function teacher_can_approve_enrollment()
    {
        $teacher = User::factory()->create(['role' => 'profesor']);
        $student = User::factory()->create(['role' => 'alumno']);
        $activity = Activity::factory()->create(['user_id' => $teacher->id]);
        $enrollment = Enrollment::factory()->create([
            'activity_id' => $activity->id,
            'user_id' => $student->id,
            'status' => 'pending'
        ]);

        Sanctum::actingAs($teacher);

        $response = $this->patchJson("/api/enrollments/{$enrollment->id}/approve");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Inscripción aprobada exitosamente.'
            ]);

        $this->assertDatabaseHas('enrollments', [
            'id' => $enrollment->id,
            'status' => 'approved'
        ]);
    }

    #[Test]
    public function teacher_can_reject_enrollment()
    {
        $teacher = User::factory()->create(['role' => 'profesor']);
        $student = User::factory()->create(['role' => 'alumno']);
        $activity = Activity::factory()->create(['user_id' => $teacher->id]);
        $enrollment = Enrollment::factory()->create([
            'activity_id' => $activity->id,
            'user_id' => $student->id,
            'status' => 'pending'
        ]);

        Sanctum::actingAs($teacher);

        $response = $this->patchJson("/api/enrollments/{$enrollment->id}/reject");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Inscripción rechazada exitosamente.'
            ]);

        $this->assertDatabaseHas('enrollments', [
            'id' => $enrollment->id,
            'status' => 'rejected'
        ]);
    }

    #[Test]
    public function teacher_cannot_approve_enrollment_for_other_teacher_activity()
    {
        $teacher1 = User::factory()->create(['role' => 'profesor']);
        $teacher2 = User::factory()->create(['role' => 'profesor']);
        $student = User::factory()->create(['role' => 'alumno']);
        $activity = Activity::factory()->create(['user_id' => $teacher2->id]);
        $enrollment = Enrollment::factory()->create([
            'activity_id' => $activity->id,
            'user_id' => $student->id,
            'status' => 'pending'
        ]);

        Sanctum::actingAs($teacher1);

        $response = $this->patchJson("/api/enrollments/{$enrollment->id}/approve");

        $response->assertStatus(403)
            ->assertJson([
                'message' => 'No tienes permisos para gestionar esta inscripción.'
            ]);
    }

    #[Test]
    public function enrollment_validation_errors()
    {
        $student = User::factory()->create(['role' => 'alumno']);

        Sanctum::actingAs($student);

        // Intentar inscribirse en actividad inexistente
        $response = $this->postJson('/api/activities/999/enroll');

        $response->assertStatus(404);
    }
}
