<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ActivityController;
use App\Http\Controllers\EnrollmentController;

// Ruta de prueba
Route::get('/test', function () {
    return response()->json(['message' => 'API Test Works!']);
});

// Rutas públicas de autenticación
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Rutas públicas de categorías (lectura)
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{category}', [CategoryController::class, 'show']);

// Rutas públicas de actividades (lectura)
Route::get('/activities', [ActivityController::class, 'index']);
Route::get('/activities/{activity}', [ActivityController::class, 'show']);

// Rutas protegidas por Sanctum
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Rutas de perfil de usuario
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::put('/profile/password', [AuthController::class, 'changePassword']);

    // Rutas de categorías que requieren autenticación (solo profesores)
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{category}', [CategoryController::class, 'update']);
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

    // Rutas de actividades que requieren autenticación
    Route::post('/activities', [ActivityController::class, 'store']);
    Route::put('/activities/{activity}', [ActivityController::class, 'update']);
    Route::delete('/activities/{activity}', [ActivityController::class, 'destroy']);

    // Ruta especial para obtener las actividades del profesor autenticado
    Route::get('/my-activities', [ActivityController::class, 'myActivities']);

    // Rutas de inscripciones (enrollments)
    Route::post('/activities/{activity}/enroll', [EnrollmentController::class, 'enroll']);
    Route::delete('/enrollments/{enrollment}', [EnrollmentController::class, 'cancel']);
    Route::get('/my-enrollments', [EnrollmentController::class, 'myEnrollments']);
    Route::get('/activities/{activity}/enrollments', [EnrollmentController::class, 'activityEnrollments']);
    Route::patch('/enrollments/{enrollment}/approve', [EnrollmentController::class, 'approve']);
    Route::patch('/enrollments/{enrollment}/reject', [EnrollmentController::class, 'reject']);
});
