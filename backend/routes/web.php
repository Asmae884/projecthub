<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/migrate', function () {
    try {
        \Artisan::call('migrate', ['--force' => true]);
        return 'Migration réussie !';
    } catch (\Exception $e) {
        return 'Erreur : ' . $e->getMessage();
    }
});
