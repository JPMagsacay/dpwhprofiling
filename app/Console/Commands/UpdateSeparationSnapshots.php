<?php

namespace App\Console\Commands;

use App\Models\DateRangeSalaryRecord;
use App\Models\EmployeeProfile;
use App\Models\YearlySalaryRecord;
use Illuminate\Console\Command;

class UpdateSeparationSnapshots extends Command
{
    protected $signature = 'update:separation-snapshots';
    protected $description = 'Update separation date and cause snapshots for existing salary records';

    public function handle()
    {
        $this->info('Updating separation snapshots for yearly salary records...');
        
        $yearlyRecords = YearlySalaryRecord::with('employeeProfile')->get();
        $yearlyUpdated = 0;
        
        foreach ($yearlyRecords as $record) {
            if ($record->employeeProfile) {
                $record->separation_date_snapshot = $record->employeeProfile->separation_date;
                $record->separation_cause_snapshot = $record->employeeProfile->separation_cause ?? '';
                $record->save();
                $yearlyUpdated++;
            }
        }
        
        $this->info("Updated {$yearlyUpdated} yearly salary records");
        
        $this->info('Updating separation snapshots for date range salary records...');
        
        $dateRangeRecords = DateRangeSalaryRecord::with('employeeProfile')->get();
        $dateRangeUpdated = 0;
        
        foreach ($dateRangeRecords as $record) {
            if ($record->employeeProfile) {
                $record->separation_date_snapshot = $record->employeeProfile->separation_date;
                $record->separation_cause_snapshot = $record->employeeProfile->separation_cause ?? '';
                $record->save();
                $dateRangeUpdated++;
            }
        }
        
        $this->info("Updated {$dateRangeUpdated} date range salary records");
        
        $this->info('Separation snapshots update completed!');
        
        return 0;
    }
}
