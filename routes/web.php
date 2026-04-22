<?php

use Illuminate\Support\Facades\Route;

// Serve React SPA - check for dev server first, then fall back to built files
Route::get('/{any?}', function () {
    // Development: Vite dev server is running
    $devServer = 'http://localhost:5173';
    try {
        $context = stream_context_create(['http' => ['timeout' => 1]]);
        $devIndex = @file_get_contents($devServer . '/index.html', false, $context);
        if ($devIndex !== false) {
            // Replace script src to use dev server
            $devIndex = str_replace('src="/resources/js/', 'src="' . $devServer . '/resources/js/', $devIndex);
            return response($devIndex)->header('Content-Type', 'text/html');
        }
    } catch (Exception $e) {
        // Dev server not running, use built files
    }

    // Production: Serve built files from public/dist
    $indexPath = public_path('dist/index.html');
    if (file_exists($indexPath)) {
        return response()->file($indexPath);
    }

    // Fallback message if neither exists
    return response('<h1>Application not built</h1><p>Run <code>npm run build</code> or start the dev server with <code>npm run frontend</code></p>', 500);
})->where('any', '.*');