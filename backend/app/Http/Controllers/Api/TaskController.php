<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\Project;
use App\Models\User;  
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TaskController extends Controller
{
    public function index(Request $request, Project $project)
    {
        $this->authorizeProjectAccess($project, $request->user());

        $query = $project->tasks()->with(['assignee', 'creator']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $tasks = $query->paginate(10);
        return response()->json($tasks);
    }

    public function store(Request $request, Project $project)
    {
        $this->authorizeProjectAccess($project, $request->user());

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'in:pending,in_progress,completed',
            'priority' => 'in:low,medium,high',
            'due_date' => 'nullable|date',
            'assigned_to' => 'nullable|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $task = Task::create([
            'project_id' => $project->id,
            'title' => $request->title,
            'description' => $request->description,
            'status' => $request->status ?? 'pending',
            'priority' => $request->priority ?? 'medium',
            'due_date' => $request->due_date,
            'created_by' => $request->user()->id,
            'assigned_to' => $request->assigned_to,
        ]);

        return response()->json($task, 201);
    }

    public function show(Project $project, Task $task, Request $request)
    {
        $this->authorizeProjectAccess($project, $request->user());

        if ($task->project_id !== $project->id) {
            abort(404, 'Task not found in this project');
        }

        $task->load(['assignee', 'creator', 'project']);
        return response()->json($task);
    }

public function update(Request $request, Project $project, Task $task)
{
    $this->authorizeProjectAccess($project, $request->user());

    if ($task->project_id !== $project->id) {
        abort(404, 'Task not found in this project');
    }

    $validator = Validator::make($request->all(), [
        'title' => 'sometimes|required|string|max:255',  // ← CHANGÉ: required → sometimes
        'description' => 'nullable|string',
        'status' => 'in:pending,in_progress,completed',
        'priority' => 'in:low,medium,high',
        'due_date' => 'nullable|date',
        'assigned_to' => 'nullable|exists:users,id',
    ]);

    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 422);
    }

    // Vérifier que l'utilisateur assigné est membre du projet
    if ($request->has('assigned_to') && $request->assigned_to !== null) {
        $isMember = $project->members()->where('user_id', $request->assigned_to)->exists();
        if (!$isMember) {
            return response()->json([
                'errors' => ['assigned_to' => ['Cet utilisateur n\'est pas membre du projet']]
            ], 422);
        }
    }

    if ($request->has('status') && $request->status === 'completed' && $task->status !== 'completed') {
        $task->completed_at = now();
    }

    $task->update($request->all());
    return response()->json($task);
}

    public function updateStatus(Request $request, Project $project, Task $task)
    {
        $this->authorizeProjectAccess($project, $request->user());

        if ($task->project_id !== $project->id) {
            abort(404, 'Task not found in this project');
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,in_progress,completed',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $task->status = $request->status;
        $task->completed_at = $request->status === 'completed' ? now() : null;
        $task->save();

        return response()->json($task);
    }

    public function destroy(Project $project, Task $task, Request $request)
    {
        $this->authorizeProjectAccess($project, $request->user());

        if ($task->project_id !== $project->id) {
            abort(404, 'Task not found in this project');
        }

        $task->delete();
        return response()->json(['message' => 'Task deleted successfully']);
    }

    // CORRECTION ICI : Le type hint doit être App\Models\User
    private function authorizeProjectAccess(Project $project, User $user)
    {
        if ($project->user_id !== $user->id && !$project->members()->where('user_id', $user->id)->exists()) {
            abort(403, 'Unauthorized access to this project');
        }
    }
}