<?php

$files = [
    'app/Models/Setting.php' => '<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = [
        \'business_name\', \'email\', \'phone\', \'address\',
        \'opening_time\', \'closing_time\', \'working_days\',
        \'appointment_duration\', \'is_booking_enabled\'
    ];

    protected $casts = [
        \'is_booking_enabled\' => \'boolean\',
        \'working_days\' => \'array\'
    ];
}
',
    'app/Models/Appointment.php' => '<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Appointment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        \'name\', \'email\', \'phone\', \'message\',
        \'appointment_date\', \'appointment_time\', \'status\'
    ];
}
',
    'database/migrations/2026_07_11_050059_create_settings_table.php' => '<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create(\'settings\', function (Blueprint $table) {
            $table->id();
            $table->string(\'business_name\')->nullable();
            $table->string(\'email\')->nullable();
            $table->string(\'phone\')->nullable();
            $table->text(\'address\')->nullable();
            $table->time(\'opening_time\')->nullable();
            $table->time(\'closing_time\')->nullable();
            $table->json(\'working_days\')->nullable();
            $table->integer(\'appointment_duration\')->default(30);
            $table->boolean(\'is_booking_enabled\')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists(\'settings\');
    }
};
',
    'database/migrations/2026_07_11_050059_create_appointments_table.php' => '<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create(\'appointments\', function (Blueprint $table) {
            $table->id();
            $table->string(\'name\');
            $table->string(\'email\');
            $table->string(\'phone\');
            $table->text(\'message\')->nullable();
            $table->date(\'appointment_date\');
            $table->time(\'appointment_time\');
            $table->enum(\'status\', [\'pending\', \'approved\', \'rejected\'])->default(\'pending\');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists(\'appointments\');
    }
};
',
    'app/Http/Requests/UpdateSettingRequest.php' => '<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSettingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            \'business_name\' => \'nullable|string|max:255\',
            \'email\' => \'nullable|email|max:255\',
            \'phone\' => \'nullable|string|max:50\',
            \'address\' => \'nullable|string\',
            \'opening_time\' => \'nullable|date_format:H:i\',
            \'closing_time\' => \'nullable|date_format:H:i\',
            \'working_days\' => \'nullable|array\',
            \'appointment_duration\' => \'nullable|integer|min:1\',
            \'is_booking_enabled\' => \'nullable|boolean\',
        ];
    }
}
',
    'app/Http/Requests/StoreAppointmentRequest.php' => '<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAppointmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            \'name\' => \'required|string|max:255\',
            \'email\' => \'required|email|max:255\',
            \'phone\' => \'required|string|max:50\',
            \'message\' => \'nullable|string\',
            \'appointment_date\' => \'required|date|after_or_equal:today\',
            \'appointment_time\' => \'required|date_format:H:i\',
        ];
    }
}
',
    'app/Http/Requests/UpdateAppointmentRequest.php' => '<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAppointmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            \'status\' => \'required|in:pending,approved,rejected\',
        ];
    }
}
',
    'app/Http/Resources/SettingResource.php' => '<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SettingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return parent::toArray($request);
    }
}
',
    'app/Http/Resources/AppointmentResource.php' => '<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AppointmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return parent::toArray($request);
    }
}
',
    'app/Services/SettingService.php' => '<?php

namespace App\Services;

use App\Models\Setting;

class SettingService
{
    public function getSetting()
    {
        return Setting::firstOrCreate([], [
            \'business_name\' => \'Default Business\',
            \'email\' => \'admin@example.com\',
            \'phone\' => \'1234567890\',
            \'address\' => \'123 Default Street\',
            \'opening_time\' => \'09:00\',
            \'closing_time\' => \'17:00\',
            \'working_days\' => [\'Monday\', \'Tuesday\', \'Wednesday\', \'Thursday\', \'Friday\'],
            \'appointment_duration\' => 30,
            \'is_booking_enabled\' => true
        ]);
    }

    public function updateSetting(array $data)
    {
        $setting = $this->getSetting();
        $setting->update($data);
        return $setting;
    }
}
',
    'app/Services/AppointmentService.php' => '<?php

namespace App\Services;

use App\Models\Appointment;

class AppointmentService
{
    public function getAllPaginated(int $perPage = 15)
    {
        return Appointment::latest()->paginate($perPage);
    }

    public function create(array $data)
    {
        return Appointment::create($data);
    }

    public function updateStatus(Appointment $appointment, string $status)
    {
        $appointment->update([\'status\' => $status]);
        return $appointment;
    }
    
    public function delete(Appointment $appointment)
    {
        $appointment->delete();
    }
}
',
    'app/Http/Controllers/Api/V1/SettingController.php' => '<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateSettingRequest;
use App\Http\Resources\SettingResource;
use App\Services\SettingService;
use Illuminate\Http\JsonResponse;

class SettingController extends Controller
{
    protected $settingService;

    public function __construct(SettingService $settingService)
    {
        $this->settingService = $settingService;
    }

    public function index(): JsonResponse
    {
        $setting = $this->settingService->getSetting();
        return response()->json([
            \'success\' => true,
            \'data\' => new SettingResource($setting)
        ]);
    }

    public function update(UpdateSettingRequest $request): JsonResponse
    {
        $setting = $this->settingService->updateSetting($request->validated());
        return response()->json([
            \'success\' => true,
            \'message\' => \'Settings updated successfully\',
            \'data\' => new SettingResource($setting)
        ]);
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

class AppointmentController extends Controller
{
    protected $appointmentService;

    public function __construct(AppointmentService $appointmentService)
    {
        $this->appointmentService = $appointmentService;
    }

    public function index(): JsonResponse
    {
        $appointments = $this->appointmentService->getAllPaginated();
        return response()->json([
            \'success\' => true,
            \'data\' => AppointmentResource::collection($appointments)->response()->getData(true)
        ]);
    }

    public function store(StoreAppointmentRequest $request): JsonResponse
    {
        $appointment = $this->appointmentService->create($request->validated());
        return response()->json([
            \'success\' => true,
            \'message\' => \'Appointment booked successfully\',
            \'data\' => new AppointmentResource($appointment)
        ], 201);
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
        $updated = $this->appointmentService->updateStatus($appointment, $request->status);
        return response()->json([
            \'success\' => true,
            \'message\' => \'Appointment status updated successfully\',
            \'data\' => new AppointmentResource($updated)
        ]);
    }

    public function destroy(Appointment $appointment): JsonResponse
    {
        $this->appointmentService->delete($appointment);
        return response()->json([
            \'success\' => true,
            \'message\' => \'Appointment deleted successfully\'
        ]);
    }
}
',
    'app/Http/Controllers/Api/V1/AuthController.php' => '<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            \'email\' => \'required|email\',
            \'password\' => \'required\',
        ]);

        if (!Auth::attempt($request->only(\'email\', \'password\'))) {
            throw ValidationException::withMessages([
                \'email\' => [\'Invalid credentials.\'],
            ]);
        }

        $user = Auth::user();
        $token = $user->createToken(\'admin-token\')->plainTextToken;

        return response()->json([
            \'success\' => true,
            \'message\' => \'Login successful\',
            \'token\' => $token,
            \'user\' => $user
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            \'success\' => true,
            \'message\' => \'Logout successful\'
        ]);
    }
}
',
    'routes/api.php' => '<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\SettingController;
use App\Http\Controllers\Api\V1\AppointmentController;

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
            return $request->user();
        });

        Route::put(\'/settings\', [SettingController::class, \'update\']);
        
        Route::get(\'/appointments\', [AppointmentController::class, \'index\']);
        Route::get(\'/appointments/{appointment}\', [AppointmentController::class, \'show\']);
        Route::put(\'/appointments/{appointment}\', [AppointmentController::class, \'update\']);
        Route::delete(\'/appointments/{appointment}\', [AppointmentController::class, \'destroy\']);
    });
});
',
    'database/seeders/DatabaseSeeder.php' => '<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::factory()->create([
            \'name\' => \'Admin\',
            \'email\' => \'admin@admin.com\',
            \'password\' => Hash::make(\'password\'),
        ]);

        $this->call([
            SettingSeeder::class,
            AppointmentSeeder::class,
        ]);
    }
}
',
    'database/seeders/SettingSeeder.php' => '<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Setting;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        Setting::create([
            \'business_name\' => \'BookFlow Demo\',
            \'email\' => \'info@bookflow.com\',
            \'phone\' => \'1-800-BOOKFLOW\',
            \'address\' => \'123 Appoint St, Tech City\',
            \'opening_time\' => \'09:00:00\',
            \'closing_time\' => \'17:00:00\',
            \'working_days\' => [\'Monday\', \'Tuesday\', \'Wednesday\', \'Thursday\', \'Friday\'],
            \'appointment_duration\' => 30,
            \'is_booking_enabled\' => true
        ]);
    }
}
',
    'database/seeders/AppointmentSeeder.php' => '<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Appointment;

class AppointmentSeeder extends Seeder
{
    public function run(): void
    {
        Appointment::factory(20)->create();
    }
}
',
    'database/factories/AppointmentFactory.php' => '<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class AppointmentFactory extends Factory
{
    public function definition(): array
    {
        return [
            \'name\' => fake()->name(),
            \'email\' => fake()->unique()->safeEmail(),
            \'phone\' => fake()->phoneNumber(),
            \'message\' => fake()->sentence(),
            \'appointment_date\' => fake()->dateTimeBetween(\'now\', \'+1 month\')->format(\'Y-m-d\'),
            \'appointment_time\' => fake()->time(\'H:i\'),
            \'status\' => fake()->randomElement([\'pending\', \'approved\', \'rejected\']),
        ];
    }
}
',
    'app/Exceptions/Handler.php' => '<?php
// Note: Laravel 11/12 configures exceptions in bootstrap/app.php
'
];

foreach ($files as $path => $content) {
    if (file_exists($path) || !file_exists($path)) {
        // Just put the content
        @mkdir(dirname($path), 0755, true);
        file_put_contents($path, $content);
    }
}
echo "Done";
