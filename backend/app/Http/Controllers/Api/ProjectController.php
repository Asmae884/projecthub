<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\User;  
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        $projects = Project::with(['creator', 'members'])
            ->where('user_id', $request->user()->id)
            ->orWhereHas('members', function ($query) use ($request) {
                $query->where('user_id', $request->user()->id);
            })
            ->paginate(10);

        return response()->json($projects);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date',
            'status' => 'in:active,completed,paused',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $project = Project::create([
            'user_id' => $request->user()->id,
            'name' => $request->name,
            'description' => $request->description,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'status' => $request->status ?? 'active',
        ]);

        ProjectMember::create([
            'project_id' => $project->id,
            'user_id' => $request->user()->id,
            'role' => 'admin',
        ]);

        return response()->json($project, 201);
    }

    public function show(Project $project, Request $request)
    {
        $this->authorizeProjectAccess($project, $request->user());

        $project->load(['creator', 'members', 'tasks.assignee']);
        return response()->json($project);
    }

    public function update(Request $request, Project $project)
    {
        $this->authorizeProjectAdmin($project, $request->user());

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date',
            'status' => 'in:active,completed,paused',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $project->update($request->all());
        return response()->json($project);
    }

    public function destroy(Project $project, Request $request)
    {
        $this->authorizeProjectAdmin($project, $request->user());
        $project->delete();
        return response()->json(['message' => 'Project deleted successfully']);
    }

    private function authorizeProjectAccess(Project $project, User $user)
    {
        if ($project->user_id !== $user->id && !$project->members()->where('user_id', $user->id)->exists()) {
            abort(403, 'Unauthorized access to this project');
        }
    }

    private function authorizeProjectAdmin(Project $project, User $user)
    {
        $isCreator = $project->user_id === $user->id;
        $isAdmin = $project->members()
            ->where('user_id', $user->id)
            ->where('role', 'admin')
            ->exists();

        if (!$isCreator && !$isAdmin) {
            abort(403, 'You need admin privileges for this action');
        }
    }
}