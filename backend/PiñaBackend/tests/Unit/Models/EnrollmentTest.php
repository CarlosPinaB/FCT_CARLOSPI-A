<?php

namespace Tests\Unit\Models;

use App\Models\Enrollment;
use App\Models\Activity;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class EnrollmentTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function it_can_create_an_enrollment()
    {
        $activity = Activity::factory()->create();
        $student = User::factory()->create();

        $enrollment = Enrollment::factory()->create([
            'activity_id' => $activity->id,
            'user_id' => $student->id,
            'status' => 'pending'
        ]);

        $this->assertInstanceOf(Enrollment::class, $enrollment);
        $this->assertEquals($activity->id, $enrollment->activity_id);
        $this->assertEquals($student->id, $enrollment->user_id);
        $this->assertEquals('pending', $enrollment->status);
    }

    #[Test]
    public function it_belongs_to_an_activity()
    {
        $activity = Activity::factory()->create();
        $enrollment = Enrollment::factory()->create([
            'activity_id' => $activity->id
        ]);

        $this->assertInstanceOf(Activity::class, $enrollment->activity);
        $this->assertEquals($activity->id, $enrollment->activity->id);
    }

    #[Test]
    public function it_belongs_to_a_student()
    {
        $student = User::factory()->create();
        $enrollment = Enrollment::factory()->create([
            'user_id' => $student->id
        ]);

        $this->assertInstanceOf(User::class, $enrollment->student);
        $this->assertEquals($student->id, $enrollment->student->id);
    }

    #[Test]
    public function it_validates_required_fields()
    {
        $this->expectException(\Illuminate\Database\QueryException::class);

        Enrollment::factory()->create([
            'activity_id' => null,
            'user_id' => null
        ]);
    }

    #[Test]
    public function it_validates_status_values()
    {
        $this->expectException(\Illuminate\Database\QueryException::class);

        Enrollment::factory()->create([
            'status' => 'invalid_status'
        ]);
    }
}
