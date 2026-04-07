<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Columns already added in earlier migrations
        // Schema::table('yearly_salary_records', function (Blueprint $table) {
        //     $table->date('separation_date_snapshot')->nullable()->after('end_date');
        //     $table->string('separation_cause_snapshot')->nullable()->after('separation_date_snapshot');
        // });

        // Schema::table('date_range_salary_records', function (Blueprint $table) {
        //     $table->date('separation_date_snapshot')->nullable()->after('branch_snapshot');
        //     $table->string('separation_cause_snapshot')->nullable()->after('separation_date_snapshot');
        // });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('yearly_salary_records', function (Blueprint $table) {
            $table->dropColumn(['separation_date_snapshot', 'separation_cause_snapshot']);
        });

        Schema::table('date_range_salary_records', function (Blueprint $table) {
            $table->dropColumn(['separation_date_snapshot', 'separation_cause_snapshot']);
        });
    }
};
