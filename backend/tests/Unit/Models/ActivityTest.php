<?php

namespace Tests\Unit\Models;

use App\Models\Activity;
use App\Models\Category;
use App\Models\User;
use App\Models\Enrollment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ActivityTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function it_can_create_an_activity()
    {
        $category = Category::factory()->create();
        $teacher = User::factory()->create();

        $activity = Activity::factory()->create([
            'name' => 'Fútbol',
            'description' => 'Clase de fútbol',
            'start_date' => now(),
            'end_date' => now()->addMonths(3),
            'max_participants' => 20,
            'category_id' => $category->id,
            'user_id' => $teacher->id
        ]);

        $this->assertInstanceOf(Activity::class, $activity);
        $this->assertEquals('Fútbol', $activity->name);
        $this->assertEquals('Clase de fútbol', $activity->description);
        $this->assertEquals(20, $activity->max_participants);
    }

    #[Test]
    public function it_belongs_to_a_category()
    {
        $category = Category::factory()->create();
        $activity = Activity::factory()->create([
            'category_id' => $category->id
        ]);

        $this->assertInstanceOf(Category::class, $activity->category);
        $this->assertEquals($category->id, $activity->category->id);
    }

    #[Test]
    public function it_belongs_to_a_teacher()
    {
        $teacher = User::factory()->create();
        $activity = Activity::factory()->create([
            'user_id' => $teacher->id
        ]);

        $this->assertInstanceOf(User::class, $activity->teacher);
        $this->assertEquals($teacher->id, $activity->teacher->id);
    }

    #[Test]
    public function it_has_many_enrollments()
    {
        $activity = Activity::factory()->create();
        $enrollments = Enrollment::factory()->count(3)->create([
            'activity_id' => $activity->id
        ]);

        $this->assertCount(3, $activity->enrollments);
        $this->assertInstanceOf(Enrollment::class, $activity->enrollments->first());
    }

    #[Test]
    public function it_has_many_participants()
    {
        $activity = Activity::factory()->create();
        $students = User::factory()->count(3)->create();

        foreach ($students as $student) {
            Enrollment::factory()->create([
                'activity_id' => $activity->id,
                'user_id' => $student->id
            ]);
        }

        $this->assertCount(3, $activity->participants);
        $this->assertInstanceOf(User::class, $activity->participants->first());
    }

    #[Test]
    public function it_validates_required_fields()
    {
        $this->expectException(\Illuminate\Database\QueryException::class);

        Activity::factory()->create([
            'name' => null,
            'category_id' => null,
            'user_id' => null
        ]);
    }
}
