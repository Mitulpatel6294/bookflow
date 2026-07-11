<?php

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
            'success' => true,
            'data' => new SettingResource($setting)
        ]);
    }

    public function update(UpdateSettingRequest $request): JsonResponse
    {
        $setting = $this->settingService->updateSetting($request->validated());
        return response()->json([
            'success' => true,
            'message' => 'Settings updated successfully',
            'data' => new SettingResource($setting)
        ]);
    }
}
