<?php

$files = [
    'routes/api.php' => '<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\SettingController;
use App\Http\Controllers\Api\V1\AppointmentController;
use App\Http\Controllers\Api\V1\DashboardController;

Route::prefix(\'v1\')->group(function () {
    // Auth Routes
    Route::post(\'/login\', [AuthController::class, \'login\']);
    
    // Public Routes
    Route::get(\'/settings\', [SettingController::class, \'index\']);
    Route::post(\'/appointments\', [AppointmentController::class, \'store\']);

    // Protected Admin Routes
    Route::middleware(\'auth:sanctum\')->group(function () {
        Route::post(\'/logout\', [AuthController::class, \'logout\']);
        Route::get(\'/user\', function (Request $request) {
            return response()->json([\'success\' => true, \'data\' => $request->user()]);
        });

        Route::get(\'/dashboard\', [DashboardController::class, \'index\']);

        Route::put(\'/settings\', [SettingController::class, \'update\']);
        
        Route::get(\'/appointments\', [AppointmentController::class, \'index\']);
        Route::get(\'/appointments/{appointment}\', [AppointmentController::class, \'show\']);
        Route::patch(\'/appointments/{appointment}\', [AppointmentController::class, \'update\']);
        Route::delete(\'/appointments/{appointment}\', [AppointmentController::class, \'destroy\']);
    });
});
',
    'app/Http/Controllers/Api/V1/DashboardController.php' => '<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $stats = [
            \'total_appointments\' => Appointment::count(),
            \'pending_appointments\' => Appointment::where(\'status\', \'pending\')->count(),
            \'approved_appointments\' => Appointment::where(\'status\', \'approved\')->count(),
            \'rejected_appointments\' => Appointment::where(\'status\', \'rejected\')->count(),
            \'today_appointments\' => Appointment::whereDate(\'appointment_date\', today())->count(),
        ];

        return response()->json([
            \'success\' => true,
            \'data\' => $stats
        ]);
    }
}
',
    'app/Services/AppointmentService.php' => '<?php

namespace App\Services;

use App\Models\Appointment;
use Illuminate\Support\Facades\DB;

class AppointmentService
{
    public function getAllPaginated(array $filters, int $perPage = 15)
    {
        $query = Appointment::query();

        // Search by name, email, or phone
        if (!empty($filters[\'search\'])) {
            $search = $filters[\'search\'];
            $query->where(function ($q) use ($search) {
                $q->where(\'name\', \'ilike\', "%{$search}%")
                  ->orWhere(\'email\', \'ilike\', "%{$search}%")
                  ->orWhere(\'phone\', \'ilike\', "%{$search}%");
            });
        }

        // Filter by status
        if (!empty($filters[\'status\'])) {
            $query->where(\'status\', $filters[\'status\']);
        }

        // Latest first
        return $query->latest()->paginate($perPage);
    }

    public function create(array $data)
    {
        return DB::transaction(function () use ($data) {
            return Appointment::create($data);
        });
    }

    public function updateStatus(Appointment $appointment, string $status)
    {
        return DB::transaction(function () use ($appointment, $status) {
            $appointment->update([\'status\' => $status]);
            return $appointment;
        });
    }
    
    public function delete(Appointment $appointment)
    {
        return DB::transaction(function () use ($appointment) {
            $appointment->delete();
            return true;
        });
    }
}
',
    'app/Http/Controllers/Api/V1/AppointmentController.php' => '<?php

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
        $filters = $request->only([\'search\', \'status\']);
        $perPage = $request->input(\'per_page\', 15);
        
        $appointments = $this->appointmentService->getAllPaginated($filters, $perPage);
        
        return response()->json([
            \'success\' => true,
            \'data\' => AppointmentResource::collection($appointments)->response()->getData(true)
        ]);
    }

    public function store(StoreAppointmentRequest $request): JsonResponse
    {
        try {
            $appointment = $this->appointmentService->create($request->validated());
            return response()->json([
                \'success\' => true,
                \'message\' => \'Appointment booked successfully\',
                \'data\' => new AppointmentResource($appointment)
            ], 201);
        } catch (\Exception $e) {
            Log::error("Failed to book appointment: " . $e->getMessage());
            return response()->json([
                \'success\' => false,
                \'message\' => \'Failed to book appointment. Please try again.\'
            ], 500);
        }
    }

    public function show(Appointment $appointment): JsonResponse
    {
        return response()->json([
            \'success\' => true,
            \'data\' => new AppointmentResource($appointment)
        ]);
    }

    public function update(UpdateAppointmentRequest $request, Appointment $appointment): JsonResponse
    {
        try {
            $updated = $this->appointmentService->updateStatus($appointment, $request->status);
            return response()->json([
                \'success\' => true,
                \'message\' => \'Appointment status updated successfully\',
                \'data\' => new AppointmentResource($updated)
            ]);
        } catch (\Exception $e) {
            Log::error("Failed to update appointment: " . $e->getMessage());
            return response()->json([
                \'success\' => false,
                \'message\' => \'Failed to update appointment.\'
            ], 500);
        }
    }

    public function destroy(Appointment $appointment): JsonResponse
    {
        try {
            $this->appointmentService->delete($appointment);
            return response()->json([
                \'success\' => true,
                \'message\' => \'Appointment deleted successfully\'
            ], 200); // 200 with message or 204 no content
        } catch (\Exception $e) {
            Log::error("Failed to delete appointment: " . $e->getMessage());
            return response()->json([
                \'success\' => false,
                \'message\' => \'Failed to delete appointment.\'
            ], 500);
        }
    }
}
',
];

foreach ($files as $path => $content) {
    if (file_exists($path) || !file_exists($path)) {
        @mkdir(dirname($path), 0755, true);
        file_put_contents($path, $content);
    }
}
echo "Done updates";
