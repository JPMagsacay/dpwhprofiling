<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('date_range_salary_records', function (Blueprint $table) {
            $table->string('designation_snapshot')->nullable();
            $table->string('employment_status_snapshot')->nullable();
            $table->string('station_place_of_assignment_snapshot')->nullable();
            $table->string('branch_snapshot')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('date_range_salary_records', function (Blueprint $table) {
            $table->dropColumn([
                'designation_snapshot',
                'employment_status_snapshot',
                'station_place_of_assignment_snapshot',
                'branch_snapshot',
            ]);
        });
    }
};
