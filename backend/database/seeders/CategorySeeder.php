<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Deportes',
                'description' => 'Actividades deportivas y de acondicionamiento físico'
            ],
            [
                'name' => 'Arte y Cultura',
                'description' => 'Talleres de arte, música, teatro y actividades culturales'
            ],
            [
                'name' => 'Tecnología',
                'description' => 'Programación, robótica, diseño digital y nuevas tecnologías'
            ],
            [
                'name' => 'Ciencias',
                'description' => 'Experimentos, investigación y actividades científicas'
            ],
            [
                'name' => 'Idiomas',
                'description' => 'Cursos y talleres de idiomas extranjeros'
            ]
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
