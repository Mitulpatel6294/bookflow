<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = [
        'business_name', 'email', 'phone', 'address',
        'opening_time', 'closing_time', 'working_days',
        'appointment_duration', 'is_booking_enabled'
    ];

    protected $casts = [
        'is_booking_enabled' => 'boolean',
        'working_days' => 'array'
    ];
}
