<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\YearlySalaryController;
use App\Models\EmployeeProfile;

Route::get('/test-salary/{id}', function ($id) {
    $profile = EmployeeProfile::find($id);
    $controller = new YearlySalaryController();
    $result = $controller->index($profile);
    
    echo json_encode($result->getData(), JSON_PRETTY_PRINT);
});
