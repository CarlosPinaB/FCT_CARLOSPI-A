<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear un profesor de prueba
        User::create([
            'name' => 'Profesor Test',
            'email' => 'profesor@test.com',
            'password' => Hash::make('password123'),
            'role' => 'profesor'
        ]);

        // Crear un alumno de prueba
        User::create([
            'name' => 'Alumno Test',
            'email' => 'alumno@test.com',
            'password' => Hash::make('password123'),
            'role' => 'alumno'
        ]);

        // Crear algunos usuarios adicionales
        User::create([
            'name' => 'María García',
            'email' => 'maria.garcia@test.com',
            'password' => Hash::make('password123'),
            'role' => 'profesor'
        ]);

        User::create([
            'name' => 'Carlos López',
            'email' => 'carlos.lopez@test.com',
            'password' => Hash::make('password123'),
            'role' => 'alumno'
        ]);
    }
}
