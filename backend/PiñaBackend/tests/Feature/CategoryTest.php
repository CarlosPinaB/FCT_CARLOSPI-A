<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\User;
use App\Models\Category;
use Laravel\Sanctum\Sanctum;

class CategoryTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Configurar la base de datos de testing
        $this->artisan('migrate');
    }

    /** @test */
    public function guests_can_list_categories()
    {
        // Arrange: Crear algunas categorías
        $category1 = Category::create([
            'name' => 'Deportes',
            'description' => 'Actividades deportivas'
        ]);

        $category2 = Category::create([
            'name' => 'Arte',
            'description' => 'Actividades artísticas'
        ]);

        // Act: Hacer petición GET
        $response = $this->getJson('/api/categories');

        // Assert: Verificar respuesta
        $response->assertStatus(200)
            ->assertJsonCount(2, 'data')
            ->assertJsonFragment(['name' => 'Deportes'])
            ->assertJsonFragment(['name' => 'Arte']);
    }

    /** @test */
    public function professors_can_create_categories()
    {
        // Arrange: Crear un profesor autenticado
        $professor = User::create([
            'name' => 'Profesor Test',
            'email' => 'profesor@test.com',
            'password' => bcrypt('password'),
            'role' => 'profesor'
        ]);

        Sanctum::actingAs($professor);

        $categoryData = [
            'name' => 'Música',
            'description' => 'Actividades musicales'
        ];

        // Act: Hacer petición POST
        $response = $this->postJson('/api/categories', $categoryData);

        // Assert: Verificar respuesta y base de datos
        $response->assertStatus(201)
            ->assertJsonFragment(['name' => 'Música'])
            ->assertJsonFragment(['description' => 'Actividades musicales']);

        $this->assertDatabaseHas('categories', $categoryData);
    }

    /** @test */
    public function students_cannot_create_categories()
    {
        // Arrange: Crear un alumno autenticado
        $student = User::create([
            'name' => 'Alumno Test',
            'email' => 'alumno@test.com',
            'password' => bcrypt('password'),
            'role' => 'alumno'
        ]);

        Sanctum::actingAs($student);

        $categoryData = [
            'name' => 'Música',
            'description' => 'Actividades musicales'
        ];

        // Act: Hacer petición POST
        $response = $this->postJson('/api/categories', $categoryData);

        // Assert: Verificar que se deniega el acceso
        $response->assertStatus(403);
        $this->assertDatabaseMissing('categories', $categoryData);
    }

    /** @test */
    public function guests_cannot_create_categories()
    {
        // Arrange
        $categoryData = [
            'name' => 'Música',
            'description' => 'Actividades musicales'
        ];

        // Act: Hacer petición POST sin autenticación
        $response = $this->postJson('/api/categories', $categoryData);

        // Assert: Verificar que requiere autenticación
        $response->assertStatus(401);
        $this->assertDatabaseMissing('categories', $categoryData);
    }

    /** @test */
    public function can_show_specific_category()
    {
        // Arrange: Crear una categoría
        $category = Category::create([
            'name' => 'Tecnología',
            'description' => 'Actividades tecnológicas'
        ]);

        // Act: Hacer petición GET para categoría específica
        $response = $this->getJson("/api/categories/{$category->id}");

        // Assert: Verificar respuesta
        $response->assertStatus(200)
            ->assertJsonFragment(['name' => 'Tecnología'])
            ->assertJsonFragment(['description' => 'Actividades tecnológicas']);
    }

    /** @test */
    public function returns_404_for_nonexistent_category()
    {
        // Act: Hacer petición GET para categoría inexistente
        $response = $this->getJson('/api/categories/999');

        // Assert: Verificar que retorna 404
        $response->assertStatus(404);
    }

    /** @test */
    public function professors_can_update_categories()
    {
        // Arrange: Crear una categoría y un profesor
        $category = Category::create([
            'name' => 'Ciencia',
            'description' => 'Actividades científicas'
        ]);

        $professor = User::create([
            'name' => 'Profesor Test',
            'email' => 'profesor@test.com',
            'password' => bcrypt('password'),
            'role' => 'profesor'
        ]);

        Sanctum::actingAs($professor);

        $updateData = [
            'name' => 'Ciencias Exactas',
            'description' => 'Actividades de matemáticas y física'
        ];

        // Act: Hacer petición PUT
        $response = $this->putJson("/api/categories/{$category->id}", $updateData);

        // Assert: Verificar respuesta y base de datos
        $response->assertStatus(200)
            ->assertJsonFragment(['name' => 'Ciencias Exactas']);

        $this->assertDatabaseHas('categories', $updateData);
    }

    /** @test */
    public function students_cannot_update_categories()
    {
        // Arrange: Crear una categoría y un alumno
        $category = Category::create([
            'name' => 'Ciencia',
            'description' => 'Actividades científicas'
        ]);

        $student = User::create([
            'name' => 'Alumno Test',
            'email' => 'alumno@test.com',
            'password' => bcrypt('password'),
            'role' => 'alumno'
        ]);

        Sanctum::actingAs($student);

        $updateData = [
            'name' => 'Ciencias Exactas',
            'description' => 'Actividades de matemáticas y física'
        ];

        // Act: Hacer petición PUT
        $response = $this->putJson("/api/categories/{$category->id}", $updateData);

        // Assert: Verificar que se deniega el acceso
        $response->assertStatus(403);
    }

    /** @test */
    public function professors_can_delete_categories()
    {
        // Arrange: Crear una categoría y un profesor
        $category = Category::create([
            'name' => 'Literatura',
            'description' => 'Actividades literarias'
        ]);

        $professor = User::create([
            'name' => 'Profesor Test',
            'email' => 'profesor@test.com',
            'password' => bcrypt('password'),
            'role' => 'profesor'
        ]);

        Sanctum::actingAs($professor);

        // Act: Hacer petición DELETE
        $response = $this->deleteJson("/api/categories/{$category->id}");

        // Assert: Verificar respuesta y base de datos
        $response->assertStatus(200);
        $this->assertDatabaseMissing('categories', ['id' => $category->id]);
    }

    /** @test */
    public function students_cannot_delete_categories()
    {
        // Arrange: Crear una categoría y un alumno
        $category = Category::create([
            'name' => 'Literatura',
            'description' => 'Actividades literarias'
        ]);

        $student = User::create([
            'name' => 'Alumno Test',
            'email' => 'alumno@test.com',
            'password' => bcrypt('password'),
            'role' => 'alumno'
        ]);

        Sanctum::actingAs($student);

        // Act: Hacer petición DELETE
        $response = $this->deleteJson("/api/categories/{$category->id}");

        // Assert: Verificar que se deniega el acceso
        $response->assertStatus(403);
        $this->assertDatabaseHas('categories', ['id' => $category->id]);
    }

    /** @test */
    public function category_name_is_required()
    {
        // Arrange: Crear un profesor autenticado
        $professor = User::create([
            'name' => 'Profesor Test',
            'email' => 'profesor@test.com',
            'password' => bcrypt('password'),
            'role' => 'profesor'
        ]);

        Sanctum::actingAs($professor);

        $categoryData = [
            'description' => 'Actividades sin nombre'
        ];

        // Act: Hacer petición POST sin nombre
        $response = $this->postJson('/api/categories', $categoryData);

        // Assert: Verificar error de validación
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    /** @test */
    public function category_name_must_be_unique()
    {
        // Arrange: Crear una categoría existente y un profesor
        Category::create([
            'name' => 'Deporte',
            'description' => 'Actividades deportivas'
        ]);

        $professor = User::create([
            'name' => 'Profesor Test',
            'email' => 'profesor@test.com',
            'password' => bcrypt('password'),
            'role' => 'profesor'
        ]);

        Sanctum::actingAs($professor);

        $categoryData = [
            'name' => 'Deporte', // Nombre duplicado
            'description' => 'Otra descripción'
        ];

        // Act: Intentar crear categoría con nombre duplicado
        $response = $this->postJson('/api/categories', $categoryData);

        // Assert: Verificar error de validación
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }
}
