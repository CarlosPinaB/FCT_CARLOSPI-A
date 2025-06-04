<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\Enrollment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EnrollmentController extends Controller
{
    /**
     * Create a new controller instance.
     */
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    /**
     * Enroll a student in an activity.
     */
    public function enroll(Request $request, Activity $activity): JsonResponse
    {
        $user = $request->user();

        // Solo los alumnos pueden inscribirse
        if ($user->role !== 'alumno') {
            return response()->json([
                'message' => 'Solo los alumnos pueden inscribirse en actividades.'
            ], 403);
        }

        // Verificar si ya está inscrito con una inscripción activa
        $existingActiveEnrollment = Enrollment::where('activity_id', $activity->id)
            ->where('user_id', $user->id)
            ->whereIn('status', ['approved', 'pending'])
            ->first();

        if ($existingActiveEnrollment) {
            return response()->json([
                'message' => 'Ya estás inscrito en esta actividad.'
            ], 409);
        }

        // Si existe una inscripción cancelada, la eliminamos para permitir re-inscripción
        $cancelledEnrollment = Enrollment::where('activity_id', $activity->id)
            ->where('user_id', $user->id)
            ->where('status', 'cancelled')
            ->first();

        if ($cancelledEnrollment) {
            $cancelledEnrollment->delete();
        }

        // Verificar si la actividad está llena
        $approvedEnrollments = Enrollment::where('activity_id', $activity->id)
            ->where('status', 'approved')
            ->count();

        if ($activity->max_participants && $approvedEnrollments >= $activity->max_participants) {
            return response()->json([
                'message' => 'La actividad está llena.'
            ], 409);
        }

        // Crear la inscripción (automáticamente aprobada)
        $enrollment = Enrollment::create([
            'activity_id' => $activity->id,
            'user_id' => $user->id,
            'status' => 'approved'
        ]);

        return response()->json([
            'data' => $enrollment
        ], 201);
    }

    /**
     * Cancel an enrollment.
     */
    public function cancel(Request $request, Enrollment $enrollment): JsonResponse
    {
        $user = $request->user();

        // Solo el estudiante propietario puede cancelar su inscripción
        if ($enrollment->user_id !== $user->id) {
            return response()->json([
                'message' => 'No tienes permisos para cancelar esta inscripción.'
            ], 403);
        }

        // Actualizar el estado a cancelado
        $enrollment->update(['status' => 'cancelled']);

        return response()->json([
            'message' => 'Inscripción cancelada exitosamente.'
        ]);
    }

    /**
     * Get enrollments for the authenticated student.
     */
    public function myEnrollments(Request $request): JsonResponse
    {
        $user = $request->user();

        $enrollments = Enrollment::with(['activity' => function ($query) {
            $query->select('id', 'name', 'description', 'start_date', 'end_date', 'location');
        }])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => $enrollments
        ]);
    }

    /**
     * Get enrollments for a specific activity (teacher only).
     */
    public function activityEnrollments(Request $request, Activity $activity): JsonResponse
    {
        $user = $request->user();

        // Solo el profesor propietario puede ver las inscripciones
        if ($user->role !== 'profesor' || $activity->user_id !== $user->id) {
            return response()->json([
                'message' => 'No tienes permisos para ver las inscripciones de esta actividad.'
            ], 403);
        }

        $enrollments = Enrollment::with(['student' => function ($query) {
            $query->select('id', 'name', 'email');
        }])
            ->where('activity_id', $activity->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => $enrollments
        ]);
    }

    /**
     * Approve an enrollment (teacher only).
     */
    public function approve(Request $request, Enrollment $enrollment): JsonResponse
    {
        $user = $request->user();

        // Cargar la actividad relacionada
        $enrollment->load('activity');

        // Solo el profesor propietario puede aprobar inscripciones
        if ($user->role !== 'profesor' || $enrollment->activity->user_id !== $user->id) {
            return response()->json([
                'message' => 'No tienes permisos para gestionar esta inscripción.'
            ], 403);
        }

        // Verificar si la actividad está llena antes de aprobar
        $approvedEnrollments = Enrollment::where('activity_id', $enrollment->activity_id)
            ->where('status', 'approved')
            ->count();

        if ($enrollment->activity->max_participants && $approvedEnrollments >= $enrollment->activity->max_participants) {
            return response()->json([
                'message' => 'No se puede aprobar: la actividad está llena.'
            ], 409);
        }

        // Aprobar la inscripción
        $enrollment->update(['status' => 'approved']);

        return response()->json([
            'message' => 'Inscripción aprobada exitosamente.'
        ]);
    }

    /**
     * Reject an enrollment (teacher only).
     */
    public function reject(Request $request, Enrollment $enrollment): JsonResponse
    {
        $user = $request->user();

        // Cargar la actividad relacionada
        $enrollment->load('activity');

        // Solo el profesor propietario puede rechazar inscripciones
        if ($user->role !== 'profesor' || $enrollment->activity->user_id !== $user->id) {
            return response()->json([
                'message' => 'No tienes permisos para gestionar esta inscripción.'
            ], 403);
        }

        // Rechazar la inscripción
        $enrollment->update(['status' => 'rejected']);

        return response()->json([
            'message' => 'Inscripción rechazada exitosamente.'
        ]);
    }

    /**
     * Unenroll a student from an activity (teacher only).
     * Allows teachers to remove students from their activities.
     */
    public function unenrollStudent(Request $request, Enrollment $enrollment): JsonResponse
    {
        $user = $request->user();

        // Cargar la actividad y el estudiante relacionados
        $enrollment->load(['activity', 'student']);

        // Solo el profesor propietario puede desinscribir estudiantes
        if ($user->role !== 'profesor' || $enrollment->activity->user_id !== $user->id) {
            return response()->json([
                'message' => 'No tienes permisos para gestionar esta inscripción.'
            ], 403);
        }

        // Verificar que la inscripción esté activa
        if ($enrollment->status === 'cancelled') {
            return response()->json([
                'message' => 'El estudiante ya está desinscrito de esta actividad.'
            ], 400);
        }

        // Actualizar el estado a cancelado
        $enrollment->update(['status' => 'cancelled']);

        return response()->json([
            'message' => 'Estudiante desinscrito exitosamente.',
            'data' => [
                'enrollment_id' => $enrollment->id,
                'student_name' => $enrollment->student->name,
                'activity_name' => $enrollment->activity->name,
                'status' => 'cancelled'
            ]
        ]);
    }

    /**
     * Re-enroll a cancelled student in an activity (teacher only).
     * Allows teachers to reinstate students who were previously cancelled.
     */
    public function reenrollStudent(Request $request, Enrollment $enrollment): JsonResponse
    {
        $user = $request->user();

        // Cargar la actividad y el estudiante relacionados
        $enrollment->load(['activity', 'student']);

        // Solo el profesor propietario puede reinscribir estudiantes
        if ($user->role !== 'profesor' || $enrollment->activity->user_id !== $user->id) {
            return response()->json([
                'message' => 'No tienes permisos para gestionar esta inscripción.'
            ], 403);
        }

        // Verificar que la inscripción esté cancelada
        if ($enrollment->status !== 'cancelled') {
            return response()->json([
                'message' => 'Solo se pueden reinscribir estudiantes que estén cancelados.'
            ], 400);
        }

        // Verificar si la actividad está llena
        $approvedEnrollments = Enrollment::where('activity_id', $enrollment->activity_id)
            ->where('status', 'approved')
            ->count();

        if ($enrollment->activity->max_participants && $approvedEnrollments >= $enrollment->activity->max_participants) {
            return response()->json([
                'message' => 'No se puede reinscribir: la actividad está llena.'
            ], 409);
        }

        // Actualizar el estado a aprobado
        $enrollment->update(['status' => 'approved']);

        return response()->json([
            'message' => 'Estudiante reinscrito exitosamente.',
            'data' => [
                'enrollment_id' => $enrollment->id,
                'student_name' => $enrollment->student->name,
                'activity_name' => $enrollment->activity->name,
                'status' => 'approved'
            ]
        ]);
    }
}
