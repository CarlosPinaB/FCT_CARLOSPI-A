<?php

namespace Tests\Feature;

use App\Models\Activity;
use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ActivityControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\CategorySeeder::class);
    }

    public function test_guest_can_list_activities()
    {
        $teacher = User::factory()->create(['role' => 'profesor']);
        $category = Category::first();

        Activity::factory()->count(3)->create([
            'user_id' => $teacher->id,
            'category_id' => $category->id,
            'is_active' => true
        ]);

        $response = $this->getJson('/api/activities');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'description',
                        'start_date',
                        'end_date',
                        'max_participants',
                        'location',
                        'is_active',
                        'category',
                        'teacher'
                    ]
                ]
            ]);
    }

    public function test_guest_can_show_activity()
    {
        $teacher = User::factory()->create(['role' => 'profesor']);
        $category = Category::first();

        $activity = Activity::factory()->create([
            'user_id' => $teacher->id,
            'category_id' => $category->id
        ]);

        $response = $this->getJson("/api/activities/{$activity->id}");

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'id' => $activity->id,
                    'name' => $activity->name,
                    'description' => $activity->description
                ]
            ]);
    }

    public function test_teacher_can_create_activity()
    {
        $teacher = User::factory()->create(['role' => 'profesor']);
        $category = Category::first();

        Sanctum::actingAs($teacher);

        $activityData = [
            'name' => 'Nueva Actividad',
            'description' => 'Descripción de la actividad',
            'start_date' => now()->addDays(1)->format('Y-m-d H:i:s'),
            'end_date' => now()->addDays(30)->format('Y-m-d H:i:s'),
            'max_participants' => 20,
            'location' => 'Aula 101',
            'category_id' => $category->id
        ];

        $response = $this->postJson('/api/activities', $activityData);

        $response->assertStatus(201)
            ->assertJson([
                'data' => [
                    'name' => 'Nueva Actividad',
                    'description' => 'Descripción de la actividad',
                    'max_participants' => 20,
                    'location' => 'Aula 101'
                ]
            ]);

        $this->assertDatabaseHas('activities', [
            'name' => 'Nueva Actividad',
            'user_id' => $teacher->id,
            'category_id' => $category->id
        ]);
    }

    public function test_student_cannot_create_activity()
    {
        $student = User::factory()->create(['role' => 'alumno']);
        $category = Category::first();

        Sanctum::actingAs($student);

        $activityData = [
            'name' => 'Nueva Actividad',
            'description' => 'Descripción de la actividad',
            'start_date' => now()->addDays(1)->format('Y-m-d H:i:s'),
            'end_date' => now()->addDays(30)->format('Y-m-d H:i:s'),
            'max_participants' => 20,
            'category_id' => $category->id
        ];

        $response = $this->postJson('/api/activities', $activityData);

        $response->assertStatus(403);
    }

    public function test_guest_cannot_create_activity()
    {
        $category = Category::first();

        $activityData = [
            'name' => 'Nueva Actividad',
            'description' => 'Descripción de la actividad',
            'start_date' => now()->addDays(1)->format('Y-m-d H:i:s'),
            'end_date' => now()->addDays(30)->format('Y-m-d H:i:s'),
            'max_participants' => 20,
            'category_id' => $category->id
        ];

        $response = $this->postJson('/api/activities', $activityData);

        $response->assertStatus(401);
    }

    public function test_teacher_can_update_own_activity()
    {
        $teacher = User::factory()->create(['role' => 'profesor']);
        $category = Category::first();

        $activity = Activity::factory()->create([
            'user_id' => $teacher->id,
            'category_id' => $category->id
        ]);

        Sanctum::actingAs($teacher);

        $updateData = [
            'name' => 'Actividad Actualizada',
            'description' => 'Nueva descripción',
            'max_participants' => 30
        ];

        $response = $this->putJson("/api/activities/{$activity->id}", $updateData);

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'name' => 'Actividad Actualizada',
                    'description' => 'Nueva descripción',
                    'max_participants' => 30
                ]
            ]);

        $this->assertDatabaseHas('activities', [
            'id' => $activity->id,
            'name' => 'Actividad Actualizada',
            'description' => 'Nueva descripción'
        ]);
    }

    public function test_teacher_cannot_update_other_teacher_activity()
    {
        $teacher1 = User::factory()->create(['role' => 'profesor']);
        $teacher2 = User::factory()->create(['role' => 'profesor']);
        $category = Category::first();

        $activity = Activity::factory()->create([
            'user_id' => $teacher1->id,
            'category_id' => $category->id
        ]);

        Sanctum::actingAs($teacher2);

        $updateData = [
            'name' => 'Actividad Actualizada',
            'description' => 'Nueva descripción'
        ];

        $response = $this->putJson("/api/activities/{$activity->id}", $updateData);

        $response->assertStatus(403);
    }

    public function test_teacher_can_delete_own_activity()
    {
        $teacher = User::factory()->create(['role' => 'profesor']);
        $category = Category::first();

        $activity = Activity::factory()->create([
            'user_id' => $teacher->id,
            'category_id' => $category->id
        ]);

        Sanctum::actingAs($teacher);

        $response = $this->deleteJson("/api/activities/{$activity->id}");

        $response->assertStatus(204);

        $this->assertDatabaseMissing('activities', [
            'id' => $activity->id
        ]);
    }

    public function test_teacher_cannot_delete_other_teacher_activity()
    {
        $teacher1 = User::factory()->create(['role' => 'profesor']);
        $teacher2 = User::factory()->create(['role' => 'profesor']);
        $category = Category::first();

        $activity = Activity::factory()->create([
            'user_id' => $teacher1->id,
            'category_id' => $category->id
        ]);

        Sanctum::actingAs($teacher2);

        $response = $this->deleteJson("/api/activities/{$activity->id}");

        $response->assertStatus(403);

        $this->assertDatabaseHas('activities', [
            'id' => $activity->id
        ]);
    }

    public function test_teacher_can_get_own_activities()
    {
        $teacher = User::factory()->create(['role' => 'profesor']);
        $otherTeacher = User::factory()->create(['role' => 'profesor']);
        $category = Category::first();

        // Actividades del profesor autenticado
        Activity::factory()->count(2)->create([
            'user_id' => $teacher->id,
            'category_id' => $category->id
        ]);

        // Actividades de otro profesor
        Activity::factory()->create([
            'user_id' => $otherTeacher->id,
            'category_id' => $category->id
        ]);

        Sanctum::actingAs($teacher);

        $response = $this->getJson('/api/my-activities');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    public function test_create_activity_validation_errors()
    {
        $teacher = User::factory()->create(['role' => 'profesor']);

        Sanctum::actingAs($teacher);

        $response = $this->postJson('/api/activities', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'name',
                'description',
                'start_date',
                'end_date',
                'max_participants',
                'category_id'
            ]);
    }

    public function test_activity_dates_validation()
    {
        $teacher = User::factory()->create(['role' => 'profesor']);
        $category = Category::first();

        Sanctum::actingAs($teacher);

        $activityData = [
            'name' => 'Test Activity',
            'description' => 'Test Description',
            'start_date' => now()->addDays(10)->format('Y-m-d H:i:s'),
            'end_date' => now()->addDays(5)->format('Y-m-d H:i:s'), // End date before start date
            'max_participants' => 20,
            'category_id' => $category->id
        ];

        $response = $this->postJson('/api/activities', $activityData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['end_date']);
    }
}
