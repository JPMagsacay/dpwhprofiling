<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AttendanceRecord;
use App\Models\DateRangeSalaryRecord;
use App\Models\EmployeeProfile;
use App\Models\YearlySalaryRecord;
use DateTime;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

class YearlySalaryController extends Controller
{
    public function index($employeeProfileId): JsonResponse
    {
        // Get both yearly and date range records
        $yearlyRecords = YearlySalaryRecord::query()
            ->where('employee_profile_id', $employeeProfileId)
            ->orderByDesc('year')
            ->orderBy('employment_status_snapshot')
            ->orderByDesc('id')
            ->get();

        $dateRangeRecords = DateRangeSalaryRecord::query()
            ->where('employee_profile_id', $employeeProfileId)
            ->orderByDesc('start_date')
            ->orderByDesc('id')
            ->get();

        // Combine and process all records
        $allRecords = $this->combineRecords($yearlyRecords, $dateRangeRecords, $employeeProfileId);

        // Debug logging
        \Log::info('Salary records for employee ' . $employeeProfileId . ':', [
            'yearly_count' => $yearlyRecords->count(),
            'date_range_count' => $dateRangeRecords->count(),
            'total_count' => $allRecords->count(),
            'sample_yearly' => $yearlyRecords->first(),
            'sample_date_range' => $dateRangeRecords->first(),
        ]);

        return response()->json([
            'records' => $allRecords->values()->all(),
        ]);
    }

    public function upsert(Request $request, EmployeeProfile $employeeProfile): JsonResponse
    {
        $validated = $request->validate([
            'year' => ['nullable', 'integer', 'min:1900', 'max:2200'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'salary' => ['required', 'numeric', 'min:0'],
            'employment_status' => ['nullable', 'string', 'max:255'],
        ]);

        $salary = (float) $validated['salary'];
        $statusSnapshot = trim((string) ($validated['employment_status'] ?? ''));
        if ($statusSnapshot === '') {
            $statusSnapshot = trim((string) ($employeeProfile->employment_status ?? ''));
        }

        // Check if this is a date range record
        $isDateRange = isset($validated['start_date']) && isset($validated['end_date']);

        if ($isDateRange) {
            // Save to date_range_salary_records table
            $record = new DateRangeSalaryRecord;
            $record->employee_profile_id = $employeeProfile->id;
            $record->start_date = $validated['start_date'];
            $record->end_date = $validated['end_date'];
            $record->salary = $salary;
            $record->working_days = $this->calculateWorkingDays($validated['start_date'], $validated['end_date']);
            $record->weekend_days = $this->calculateWeekendDays($validated['start_date'], $validated['end_date']);
            $record->range_key = $employeeProfile->id . '_' . $validated['start_date'] . '_' . $validated['end_date'];
            
            // Set snapshot data
            $record->designation_snapshot = $employeeProfile->designation ?? $employeeProfile->position ?? '';
            $record->employment_status_snapshot = $statusSnapshot;
            $record->station_place_of_assignment_snapshot = $employeeProfile->station_place_of_assignment ?? $employeeProfile->address ?? '';
            $record->branch_snapshot = $employeeProfile->branch ?? '';
            $record->separation_date_snapshot = $employeeProfile->separation_date;
            $record->separation_cause_snapshot = (string) ($employeeProfile->separation_cause ?? '');
            
            $record->save();

            $savedRecord = $record;
        } else {
            // Save to yearly_salary_records table
            $year = (int) ($validated['year'] ?? date('Y'));
            $salary = (float) $validated['salary'];

            $latestSameRecord = YearlySalaryRecord::query()
                ->where('employee_profile_id', $employeeProfile->id)
                ->where('year', $year)
                ->where('employment_status_snapshot', $statusSnapshot)
                ->orderByDesc('id')
                ->first();

            $minSalary = $this->attendanceMinimumForYear($employeeProfile, $year, $statusSnapshot);

            // Only apply minimum salary validation for permanent employees
            if (strtolower(trim($statusSnapshot)) === 'permanent' && $salary < $minSalary) {
                throw ValidationException::withMessages([
                    'salary' => [
                        "Salary cannot be less than the attendance-based amount ({$minSalary}). You may enter a higher amount.",
                    ],
                ]);
            }

            $record = $latestSameRecord ?? new YearlySalaryRecord;
            $record->employee_profile_id = $employeeProfile->id;
            $record->year = $year;
            $record->salary = $salary;
            $record->employment_status_snapshot = $statusSnapshot;
            $record->designation_snapshot = '';

            if (! $latestSameRecord) {
                $record->station_place_of_assignment_snapshot = (string) ($employeeProfile->station_place_of_assignment ?: $employeeProfile->address ?: '');
                $record->branch_snapshot = (string) ($employeeProfile->branch ?? '');
            }
            
            // Always capture separation data (snapshots preserve historical data)
            $record->separation_date_snapshot = $employeeProfile->separation_date;
            $record->separation_cause_snapshot = (string) ($employeeProfile->separation_cause ?? '');

            $record->save();

            // Process date ranges for display
            $allYearlyRecords = YearlySalaryRecord::query()
                ->where('employee_profile_id', $employeeProfile->id)
                ->orderByDesc('year')
                ->orderBy('employment_status_snapshot')
                ->orderByDesc('id')
                ->get();
                
            $processedRecords = $this->processDateRanges($allYearlyRecords, $employeeProfile);
            
            $savedRecord = $processedRecords->firstWhere('id', $record->id);
        }

        // Get all records for response
        $yearlyRecords = YearlySalaryRecord::query()
            ->where('employee_profile_id', $employeeProfile->id)
            ->orderByDesc('year')
            ->orderBy('employment_status_snapshot')
            ->orderByDesc('id')
            ->get();

        $dateRangeRecords = DateRangeSalaryRecord::query()
            ->where('employee_profile_id', $employeeProfile->id)
            ->orderByDesc('start_date')
            ->orderByDesc('id')
            ->get();

        $allRecords = $this->combineRecords($yearlyRecords, $dateRangeRecords, $employeeProfile);

        return response()->json([
            'record' => $savedRecord,
            'records' => $allRecords->values()->all(),
        ]);
    }

    public function destroy(EmployeeProfile $employeeProfile, $id): JsonResponse
    {
        // Try to delete from date range records first
        $dateRangeRecord = DateRangeSalaryRecord::find($id);
        if ($dateRangeRecord && $dateRangeRecord->employee_profile_id === $employeeProfile->id) {
            $dateRangeRecord->delete();
            return response()->json(['ok' => true]);
        }

        // Try to delete from yearly records
        $yearlyRecord = YearlySalaryRecord::find($id);
        if ($yearlyRecord && $yearlyRecord->employee_profile_id === $employeeProfile->id) {
            $yearlyRecord->delete();
            return response()->json(['ok' => true]);
        }

        abort(404);
    }

    /** Sum of per-day rates stored on attendance (locked when each day was saved). */
    private function attendanceMinimumForYear(EmployeeProfile $employeeProfile, int $year, string $employmentStatusSnapshot): float
    {
        $base = (float) $employeeProfile->base_salary;

        $query = AttendanceRecord::query()
            ->where('employee_profile_id', $employeeProfile->id)
            ->whereYear('date', $year)
            ->where('present', true);

        if ($employmentStatusSnapshot !== '') {
            $query->where('employment_status_snapshot', $employmentStatusSnapshot);
        } else {
            $query->where(function ($q) {
                $q->whereNull('employment_status_snapshot')->orWhere('employment_status_snapshot', '');
            });
        }

        $rows = $query->get(['daily_rate']);

        $sum = $rows->sum(fn (AttendanceRecord $r) => (float) ($r->daily_rate ?? $base));

        return round($sum, 2);
    }

    /**
     * Combine yearly and date range records for display
     */
    private function combineRecords($yearlyRecords, $dateRangeRecords, $employeeProfileId): Collection
    {
        $allRecords = collect();

        // Add processed yearly records
        $processedYearly = $this->processDateRanges($yearlyRecords, $employeeProfileId);
        $allRecords = $allRecords->concat($processedYearly);

        // Add date range records with proper formatting
        foreach ($dateRangeRecords as $record) {
            $record->record_type = 'date_range';
            $allRecords->push($record);
        }

        return $allRecords->sortByDesc('start_date');
    }

    /**
     * Process date ranges for yearly salary records based on employment status changes
     */
    public function processDateRanges($records, $employeeProfileId): Collection
    {
        $groupedRecords = $records->groupBy('year');
        $processedRecords = collect();

        foreach ($groupedRecords as $year => $yearRecords) {
            $yearRecords = $yearRecords->sortBy('employment_status_snapshot');
            
            if ($yearRecords->count() === 1) {
                // Single status for the year - full year range
                $record = $yearRecords->first();
                $record->start_date = $this->getEmployeeStartDate($employeeProfileId, $year);
                $record->end_date = $this->getLastDayOfYear($year);
                $record->record_type = 'yearly';
                $processedRecords->push($record);
            } else {
                // Multiple statuses - split the year
                $dateRanges = $this->splitYearByStatus($yearRecords, $employeeProfileId, $year);
                $processedRecords = $processedRecords->concat($dateRanges);
            }
        }

        return $processedRecords->sortByDesc('start_date');
    }

    /**
     * Get employee start date for a specific year
     */
    private function getEmployeeStartDate($employeeProfileId, $year): string
    {
        // For now, just return beginning of year to avoid profile access issues
        return "{$year}-01-01";
    }

    /**
     * Get the last day of a given year
     */
    private function getLastDayOfYear(int $year): string
    {
        return "{$year}-12-31";
    }

    /**
     * Split year into equal periods based on number of status changes
     */
    private function splitYearByStatus(Collection $yearRecords, $employeeProfileId, int $year): Collection
    {
        $statusCount = $yearRecords->count();
        $monthsPerStatus = floor(12 / $statusCount);
        $remainingMonths = 12 % $statusCount;
        
        $processedRecords = collect();
        $currentMonth = 1;
        
        foreach ($yearRecords as $index => $record) {
            $monthsForThisStatus = $monthsPerStatus;
            
            // Distribute remaining months to earlier statuses
            if ($index < $remainingMonths) {
                $monthsForThisStatus++;
            }
            
            $startDate = new DateTime("{$year}-{$currentMonth}-01");
            $endDate = new DateTime("{$year}-{$currentMonth}-01");
            $endDate->modify('+' . ($monthsForThisStatus - 1) . ' months');
            $endDate->modify('last day of this month');
            
            $record->start_date = $startDate->format('Y-m-d');
            $record->end_date = $endDate->format('Y-m-d');
            $record->record_type = 'yearly';
            $processedRecords->push($record);
            
            $currentMonth += $monthsForThisStatus;
        }
        
        return $processedRecords;
    }

    /**
     * Calculate working days between two dates
     */
    private function calculateWorkingDays($startDate, $endDate): int
    {
        $start = new DateTime($startDate);
        $end = new DateTime($endDate);
        $workingDays = 0;
        
        while ($start <= $end) {
            if ($start->format('N') < 6) { // Not Saturday (6) or Sunday (7)
                $workingDays++;
            }
            $start->modify('+1 day');
        }
        
        return $workingDays;
    }

    /**
     * Calculate weekend days between two dates
     */
    private function calculateWeekendDays($startDate, $endDate): int
    {
        $start = new DateTime($startDate);
        $end = new DateTime($endDate);
        $weekendDays = 0;
        
        while ($start <= $end) {
            if ($start->format('N') >= 6) { // Saturday (6) or Sunday (7)
                $weekendDays++;
            }
            $start->modify('+1 day');
        }
        
        return $weekendDays;
    }
}
