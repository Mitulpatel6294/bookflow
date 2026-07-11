<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\SettingController;
use App\Http\Controllers\Api\V1\AppointmentController;
use App\Http\Controllers\Api\V1\DashboardController;

Route::prefix('v1')->group(function () {
    // Auth Routes
    Route::post('/login', [AuthController::class, 'login']);
    
    // Public Routes
    Route::get('/settings', [SettingController::class, 'index']);
    Route::post('/appointments', [AppointmentController::class, 'store']);

    // Protected Admin Routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/user', function (Request $request) {
            return response()->json(['success' => true, 'data' => $request->user()]);
        });

        Route::get('/dashboard', [DashboardController::class, 'index']);

        Route::put('/settings', [SettingController::class, 'update']);
        
        Route::get('/appointments', [AppointmentController::class, 'index']);
        Route::get('/appointments/{appointment}', [AppointmentController::class, 'show']);
        Route::patch('/appointments/{appointment}', [AppointmentController::class, 'update']);
        Route::delete('/appointments/{appointment}', [AppointmentController::class, 'destroy']);
    });
});
