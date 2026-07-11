<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Setting;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        Setting::create([
            'business_name' => 'BookFlow Demo',
            'email' => 'info@bookflow.com',
            'phone' => '1-800-BOOKFLOW',
            'address' => '123 Appoint St, Tech City',
            'opening_time' => '09:00:00',
            'closing_time' => '17:00:00',
            'working_days' => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            'appointment_duration' => 30,
            'is_booking_enabled' => true
        ]);
    }
}
