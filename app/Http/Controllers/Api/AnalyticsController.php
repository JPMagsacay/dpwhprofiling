<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EmployeeProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function dashboard(): JsonResponse
    {
        $now = now();

        // Basic counts
        $totalEmployees = EmployeeProfile::count();
        $activeEmployees = EmployeeProfile::whereNull('separation_date')->whereNull('separation_cause')->count();
        $inactiveEmployees = EmployeeProfile::whereNotNull('separation_date')->orWhereNotNull('separation_cause')->count();

        // Employment status breakdown
        $employmentStatus = EmployeeProfile::query()
            ->select('employment_status', DB::raw('COUNT(*) as count'))
            ->groupBy('employment_status')
            ->get()
            ->mapWithKeys(fn ($item) => [strtolower($item->employment_status) => $item->count]);

        // Years of service breakdown
        $employees = EmployeeProfile::all();
        $yearsOfService = [
            'under_5' => 0,
            'under_10' => 0,
            'under_15' => 0,
            'under_20' => 0,
            'over_20' => 0,
        ];

        foreach ($employees as $employee) {
            $serviceYears = $employee->separation_date
                ? $employee->separation_date->diffInYears($employee->created_at)
                : $now->diffInYears($employee->created_at);

            if ($serviceYears < 5) {
                $yearsOfService['under_5']++;
            } elseif ($serviceYears < 10) {
                $yearsOfService['under_10']++;
            } elseif ($serviceYears < 15) {
                $yearsOfService['under_15']++;
            } elseif ($serviceYears < 20) {
                $yearsOfService['under_20']++;
            } else {
                $yearsOfService['over_20']++;
            }
        }

        return response()->json([
            'cards' => [
                'total_employees' => $totalEmployees,
                'active_employees' => $activeEmployees,
                'inactive_employees' => $inactiveEmployees,
            ],
            'employment_status' => [
                'permanent' => $employmentStatus['permanent'] ?? 0,
                'casual' => $employmentStatus['casual'] ?? 0,
            ],
            'years_of_service' => $yearsOfService,
        ]);
    }
}

