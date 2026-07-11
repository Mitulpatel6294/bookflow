<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAppointmentRequest;
use App\Http\Requests\UpdateAppointmentRequest;
use App\Http\Resources\AppointmentResource;
use App\Models\Appointment;
use App\Services\AppointmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AppointmentController extends Controller
{
    protected $appointmentService;

    public function __construct(AppointmentService $appointmentService)
    {
        $this->appointmentService = $appointmentService;
    }

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'status']);
        $perPage = $request->input('per_page', 15);
        
        $appointments = $this->appointmentService->getAllPaginated($filters, $perPage);
        
        return response()->json([
            'success' => true,
            'data' => AppointmentResource::collection($appointments)->response()->getData(true)
        ]);
    }

    public function store(StoreAppointmentRequest $request): JsonResponse
    {
        try {
            $appointment = $this->appointmentService->create($request->validated());
            return response()->json([
                'success' => true,
                'message' => 'Appointment booked successfully',
                'data' => new AppointmentResource($appointment)
            ], 201);
        } catch (\Exception $e) {
            Log::error("Failed to book appointment: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to book appointment. Please try again.'
            ], 500);
        }
    }

    public function show(Appointment $appointment): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => new AppointmentResource($appointment)
        ]);
    }

    public function update(UpdateAppointmentRequest $request, Appointment $appointment): JsonResponse
    {
        try {
            $updated = $this->appointmentService->updateStatus($appointment, $request->status);
            return response()->json([
                'success' => true,
                'message' => 'Appointment status updated successfully',
                'data' => new AppointmentResource($updated)
            ]);
        } catch (\Exception $e) {
            Log::error("Failed to update appointment: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update appointment.'
            ], 500);
        }
    }

    public function destroy(Appointment $appointment): JsonResponse
    {
        try {
            $this->appointmentService->delete($appointment);
            return response()->json([
                'success' => true,
                'message' => 'Appointment deleted successfully'
            ], 200); // 200 with message or 204 no content
        } catch (\Exception $e) {
            Log::error("Failed to delete appointment: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete appointment.'
            ], 500);
        }
    }
}
