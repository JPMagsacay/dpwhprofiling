<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class YearlySalaryRecord extends Model
{
    protected $fillable = [
        'employee_profile_id',
        'year',
        'salary',
        'start_date',
        'end_date',
        'separation_date_snapshot',
        'separation_cause_snapshot',
    ];

    protected $casts = [
        'year' => 'integer',
        'salary' => 'decimal:2',
        'start_date' => 'date',
        'end_date' => 'date',
        'separation_date_snapshot' => 'date',
    ];

    public function employeeProfile(): BelongsTo
    {
        return $this->belongsTo(EmployeeProfile::class);
    }
}

