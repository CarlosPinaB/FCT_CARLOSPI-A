<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreActivityRequest;
use App\Http\Requests\UpdateActivityRequest;
use App\Models\Activity;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class ActivityController extends Controller
{
    /**
     * Create a new controller instance.
     */
    public function __construct()
    {
        $this->middleware('auth:sanctum')->except(['index', 'show']);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $activities = Activity::with(['category', 'teacher'])
            ->where('is_active', true)
            ->orderBy('start_date', 'asc')
            ->get();

        return response()->json([
            'data' => $activities
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreActivityRequest $request): JsonResponse
    {
        $data = $request->validated();

        // Asignar el user_id del profesor autenticado
        $data['user_id'] = $request->user()->id;

        // Si no se especifica is_active, por defecto será true
        if (!isset($data['is_active'])) {
            $data['is_active'] = true;
        }

        $activity = Activity::create($data);
        $activity->load(['category', 'teacher']);

        return response()->json([
            'data' => $activity
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Activity $activity): JsonResponse
    {
        $activity->load(['category', 'teacher', 'participants']);

        return response()->json([
            'data' => $activity
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateActivityRequest $request, Activity $activity): JsonResponse
    {
        $activity->update($request->validated());
        $activity->load(['category', 'teacher']);

        return response()->json([
            'data' => $activity
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Activity $activity): JsonResponse
    {
        // Verificar autorización: solo el profesor que creó la actividad puede eliminarla
        $user = $request->user();
        if (
            !$user ||
            $user->role !== 'profesor' ||
            $activity->user_id !== $user->id
        ) {
            return response()->json([
                'message' => 'No tienes permisos para eliminar esta actividad.'
            ], 403);
        }

        $activity->delete();

        return response()->json(null, 204);
    }

    /**
     * Get activities for the authenticated teacher.
     */
    public function myActivities(Request $request): JsonResponse
    {
        $user = $request->user();
        $activities = Activity::with(['category', 'participants'])
            ->where('user_id', $user->id)
            ->orderBy('start_date', 'asc')
            ->get();

        return response()->json([
            'data' => $activities
        ]);
    }
}
