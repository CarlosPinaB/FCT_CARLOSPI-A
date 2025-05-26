<?php

namespace Database\Factories;

use App\Models\Activity;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Activity>
 */
class ActivityFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startDate = $this->faker->dateTimeBetween('now', '+2 months');
        $endDate = $this->faker->dateTimeBetween($startDate, '+6 months');

        return [
            'name' => $this->faker->sentence(3),
            'description' => $this->faker->paragraph(),
            'category_id' => Category::factory(),
            'user_id' => User::factory(['role' => 'profesor']),
            'max_participants' => $this->faker->numberBetween(5, 30),
            'start_date' => $startDate,
            'end_date' => $endDate,
            'location' => $this->faker->optional()->randomElement([
                'Aula 101',
                'Gimnasio',
                'Laboratorio',
                'Patio',
                'Sala de música',
                'Biblioteca'
            ]),
            'is_active' => $this->faker->boolean(80) // 80% probabilidad de estar activa
        ];
    }

    /**
     * Indicate that the activity is active.
     */
    public function active(): static
    {
        return $this->state(fn(array $attributes) => [
            'is_active' => true,
        ]);
    }

    /**
     * Indicate that the activity is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn(array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Indicate that the activity has a specific teacher.
     */
    public function forTeacher(User $teacher): static
    {
        return $this->state(fn(array $attributes) => [
            'user_id' => $teacher->id,
        ]);
    }

    /**
     * Indicate that the activity belongs to a specific category.
     */
    public function inCategory(Category $category): static
    {
        return $this->state(fn(array $attributes) => [
            'category_id' => $category->id,
        ]);
    }
}
