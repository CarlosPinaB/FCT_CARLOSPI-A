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
            'user_id' => User::factory(),
            'max_participants' => $this->faker->optional()->numberBetween(5, 30),
            'start_date' => $startDate,
            'end_date' => $endDate
        ];
    }
}
