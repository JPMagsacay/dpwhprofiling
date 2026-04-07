<?php
require_once __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';

$profile = \App\Models\EmployeeProfile::find(1);
$controller = new \App\Http\Controllers\Api\YearlySalaryController();

$response = $controller->index($profile);

header('Content-Type: application/json');
echo json_encode($response->getData(), JSON_PRETTY_PRINT);
