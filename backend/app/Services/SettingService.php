<?php

namespace App\Services;

use App\Models\Setting;

class SettingService
{
    public function getSetting()
    {
        return Setting::firstOrCreate([], [
            'business_name' => 'Default Business',
            'email' => 'admin@example.com',
            'phone' => '1234567890',
            'address' => '123 Default Street',
            'opening_time' => '09:00',
            'closing_time' => '17:00',
            'working_days' => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            'appointment_duration' => 30,
            'is_booking_enabled' => true
        ]);
    }

    public function updateSetting(array $data)
    {
        $setting = $this->getSetting();
        $setting->update($data);
        return $setting;
    }
}
