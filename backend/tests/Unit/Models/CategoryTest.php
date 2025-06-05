<?php

namespace Tests\Unit\Models;

use App\Models\Category;
use App\Models\Activity;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class CategoryTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function it_can_create_a_category()
    {
        $category = Category::factory()->create([
            'name' => 'Deportes',
            'description' => 'Actividades deportivas'
        ]);

        $this->assertInstanceOf(Category::class, $category);
        $this->assertEquals('Deportes', $category->name);
        $this->assertEquals('Actividades deportivas', $category->description);
    }

    #[Test]
    public function it_has_many_activities()
    {
        $category = Category::factory()->create();
        $activities = Activity::factory()->count(3)->create([
            'category_id' => $category->id
        ]);

        $this->assertCount(3, $category->activities);
        $this->assertInstanceOf(Activity::class, $category->activities->first());
    }

    #[Test]
    public function it_validates_required_fields()
    {
        $this->expectException(\Illuminate\Database\QueryException::class);

        Category::factory()->create([
            'name' => null
        ]);
    }
}
