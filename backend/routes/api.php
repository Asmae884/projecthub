<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\ProjectMemberController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\DocumentController;


Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/projects/{project}/members/list', [ProjectMemberController::class, 'getMembersList']);  
    Route::apiResource('projects', ProjectController::class);
    Route::get('/projects/{project}/members', [ProjectMemberController::class, 'index']);
    Route::post('/projects/{project}/members', [ProjectMemberController::class, 'store']);
    Route::put('/projects/{project}/members/{projectMember}', [ProjectMemberController::class, 'update']);
    Route::delete('/projects/{project}/members/{projectMember}', [ProjectMemberController::class, 'destroy']);
    Route::get('/projects/{project}/tasks', [TaskController::class, 'index']);
    Route::post('/projects/{project}/tasks', [TaskController::class, 'store']);
    Route::get('/projects/{project}/tasks/{task}', [TaskController::class, 'show']);
    Route::put('/projects/{project}/tasks/{task}', [TaskController::class, 'update']);
    Route::patch('/projects/{project}/tasks/{task}/status', [TaskController::class, 'updateStatus']);
    Route::delete('/projects/{project}/tasks/{task}', [TaskController::class, 'destroy']);
    Route::get('/projects/{project}/members', [ProjectMemberController::class, 'index']);
    Route::post('/projects/{project}/members', [ProjectMemberController::class, 'store']);
    Route::delete('/projects/{project}/members/{projectMember}', [ProjectMemberController::class, 'destroy']);
    Route::post('/documents/upload', [DocumentController::class, 'upload']);
    Route::get('/documents/{document}/status', [DocumentController::class, 'status']);
    Route::get('/projects/{project}/generated-tasks', [DocumentController::class, 'getGeneratedTasks']);
    Route::patch('/generated-tasks/{generatedTask}/validate', [DocumentController::class, 'validateTask']);
    Route::delete('/generated-tasks/{generatedTask}/reject', [DocumentController::class, 'rejectTask']);
});