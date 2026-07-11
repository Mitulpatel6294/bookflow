<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $stats = [
            'total_appointments' => Appointment::count(),
            'pending_appointments' => Appointment::where('status', 'pending')->count(),
            'approved_appointments' => Appointment::where('status', 'approved')->count(),
            'rejected_appointments' => Appointment::where('status', 'rejected')->count(),
            'today_appointments' => Appointment::whereDate('appointment_date', today())->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}
