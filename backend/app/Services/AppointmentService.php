<?php

namespace App\Services;

use App\Models\Appointment;
use Illuminate\Support\Facades\DB;

class AppointmentService
{
    public function getAllPaginated(array $filters, int $perPage = 15)
    {
        $query = Appointment::query();

        // Search by name, email, or phone
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('email', 'ilike', "%{$search}%")
                  ->orWhere('phone', 'ilike', "%{$search}%");
            });
        }

        // Filter by status
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
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
            $appointment->update(['status' => $status]);
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
