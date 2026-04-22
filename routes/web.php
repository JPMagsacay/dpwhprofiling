<?php

use Illuminate\Support\Facades\Route;

// All routes serve the React SPA (except API routes which are in api.php)
Route::get('/{any?}', function () {
    return view('app');
})->where('any', '.*');