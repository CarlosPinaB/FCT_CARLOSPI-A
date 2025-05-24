<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\Hash;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class AuthControllerTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    #[Test]
    public function user_can_register_with_valid_data()
    {
        $userData = [
            'name' => 'Juan Pérez',
            'email' => 'juan@ejemplo.com',
            'password' => 'password123',
            'role' => 'alumno'
        ];

        $response = $this->postJson('/api/register', $userData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'user' => [
                    'id',
                    'name',
                    'email',
                    'role'
                ],
                'token'
            ]);

        $this->assertDatabaseHas('users', [
            'name' => 'Juan Pérez',
            'email' => 'juan@ejemplo.com',
            'role' => 'alumno'
        ]);

        // Verificar que la contraseña está encriptada
        $user = User::where('email', 'juan@ejemplo.com')->first();
        $this->assertTrue(Hash::check('password123', $user->password));
    }

    #[Test]
    public function user_can_register_as_profesor()
    {
        $userData = [
            'name' => 'María García',
            'email' => 'maria@ejemplo.com',
            'password' => 'password123',
            'role' => 'profesor'
        ];

        $response = $this->postJson('/api/register', $userData);

        $response->assertStatus(201);

        $this->assertDatabaseHas('users', [
            'email' => 'maria@ejemplo.com',
            'role' => 'profesor'
        ]);
    }

    #[Test]
    public function registration_requires_name()
    {
        $userData = [
            'email' => 'test@ejemplo.com',
            'password' => 'password123',
            'role' => 'alumno'
        ];

        $response = $this->postJson('/api/register', $userData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    #[Test]
    public function registration_requires_email()
    {
        $userData = [
            'name' => 'Test User',
            'password' => 'password123',
            'role' => 'alumno'
        ];

        $response = $this->postJson('/api/register', $userData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    #[Test]
    public function registration_requires_valid_email()
    {
        $userData = [
            'name' => 'Test User',
            'email' => 'invalid-email',
            'password' => 'password123',
            'role' => 'alumno'
        ];

        $response = $this->postJson('/api/register', $userData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    #[Test]
    public function registration_requires_unique_email()
    {
        // Crear un usuario existente
        User::factory()->create(['email' => 'existing@ejemplo.com']);

        $userData = [
            'name' => 'Test User',
            'email' => 'existing@ejemplo.com',
            'password' => 'password123',
            'role' => 'alumno'
        ];

        $response = $this->postJson('/api/register', $userData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    #[Test]
    public function registration_requires_password()
    {
        $userData = [
            'name' => 'Test User',
            'email' => 'test@ejemplo.com',
            'role' => 'alumno'
        ];

        $response = $this->postJson('/api/register', $userData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    #[Test]
    public function registration_requires_password_min_8_characters()
    {
        $userData = [
            'name' => 'Test User',
            'email' => 'test@ejemplo.com',
            'password' => '123',
            'role' => 'alumno'
        ];

        $response = $this->postJson('/api/register', $userData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    #[Test]
    public function registration_requires_valid_role()
    {
        $userData = [
            'name' => 'Test User',
            'email' => 'test@ejemplo.com',
            'password' => 'password123',
            'role' => 'invalid_role'
        ];

        $response = $this->postJson('/api/register', $userData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['role']);
    }

    #[Test]
    public function user_can_login_with_valid_credentials()
    {
        $user = User::factory()->create([
            'email' => 'test@ejemplo.com',
            'password' => Hash::make('password123')
        ]);

        $credentials = [
            'email' => 'test@ejemplo.com',
            'password' => 'password123'
        ];

        $response = $this->postJson('/api/login', $credentials);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'user' => [
                    'id',
                    'name',
                    'email',
                    'role'
                ],
                'token'
            ]);
    }

    #[Test]
    public function user_cannot_login_with_invalid_email()
    {
        $credentials = [
            'email' => 'nonexistent@ejemplo.com',
            'password' => 'password123'
        ];

        $response = $this->postJson('/api/login', $credentials);

        $response->assertStatus(401)
            ->assertJson([
                'message' => 'Credenciales inválidas'
            ]);
    }

    #[Test]
    public function user_cannot_login_with_invalid_password()
    {
        $user = User::factory()->create([
            'email' => 'test@ejemplo.com',
            'password' => Hash::make('correctpassword')
        ]);

        $credentials = [
            'email' => 'test@ejemplo.com',
            'password' => 'wrongpassword'
        ];

        $response = $this->postJson('/api/login', $credentials);

        $response->assertStatus(401)
            ->assertJson([
                'message' => 'Credenciales inválidas'
            ]);
    }

    #[Test]
    public function login_requires_email()
    {
        $credentials = [
            'password' => 'password123'
        ];

        $response = $this->postJson('/api/login', $credentials);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    #[Test]
    public function login_requires_password()
    {
        $credentials = [
            'email' => 'test@ejemplo.com'
        ];

        $response = $this->postJson('/api/login', $credentials);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    #[Test]
    public function authenticated_user_can_logout()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test_token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
            'Accept' => 'application/json'
        ])->postJson('/api/logout');

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Sesión cerrada correctamente'
            ]);

        // Verificar que el token fue eliminado
        $this->assertDatabaseMissing('personal_access_tokens', [
            'token' => hash('sha256', $token)
        ]);
    }

    #[Test]
    public function unauthenticated_user_cannot_logout()
    {
        $response = $this->postJson('/api/logout');

        $response->assertStatus(401);
    }

    #[Test]
    public function authenticated_user_can_get_profile()
    {
        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@ejemplo.com',
            'role' => 'alumno'
        ]);

        $token = $user->createToken('test_token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
            'Accept' => 'application/json'
        ])->getJson('/api/user');

        $response->assertStatus(200)
            ->assertJson([
                'id' => $user->id,
                'name' => 'Test User',
                'email' => 'test@ejemplo.com',
                'role' => 'alumno'
            ])
            ->assertJsonMissing(['password']);
    }

    #[Test]
    public function unauthenticated_user_cannot_get_profile()
    {
        $response = $this->getJson('/api/user');

        $response->assertStatus(401);
    }
}
