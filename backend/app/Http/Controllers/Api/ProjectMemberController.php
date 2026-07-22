<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProjectMemberController extends Controller
{
    public function index(Project $project, Request $request)
    {
        $this->authorizeProjectAccess($project, $request->user());

        $members = $project->members()->withPivot('id' , 'role', 'joined_at')->get();
        return response()->json($members);
    }

    public function getMembersList(Project $project, Request $request)
    {
    $this->authorizeProjectAccess($project, $request->user());
    
    $members = $project->members()->get();
    return response()->json($members);
    }

    public function store(Request $request, Project $project)
    {
        $this->authorizeProjectAdmin($project, $request->user());

        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'role' => 'in:admin,member',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Vérifier si l'utilisateur est déjà membre
        $existingMember = ProjectMember::where('project_id', $project->id)
            ->where('user_id', $request->user_id)
            ->first();

        if ($existingMember) {
            return response()->json(['message' => 'User is already a member'], 409);
        }

        $member = ProjectMember::create([
            'project_id' => $project->id,
            'user_id' => $request->user_id,
            'role' => $request->role ?? 'member',
        ]);

        return response()->json($member, 201);
    }

    public function update(Request $request, Project $project, ProjectMember $projectMember)
    {
        $this->authorizeProjectAdmin($project, $request->user());

        if ($projectMember->project_id !== $project->id) {
            abort(404, 'Member not found in this project');
        }

        $validator = Validator::make($request->all(), [
            'role' => 'required|in:admin,member',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $projectMember->update(['role' => $request->role]);
        return response()->json($projectMember);
    }

    public function destroy(Project $project, ProjectMember $projectMember, Request $request)
    {
        $this->authorizeProjectAdmin($project, $request->user());

        if ($projectMember->project_id !== $project->id) {
            abort(404, 'Member not found in this project');
        }

        // Ne pas permettre la suppression du créateur
        if ($projectMember->user_id === $project->user_id) {
            return response()->json(['message' => 'Cannot remove the project creator'], 403);
        }

        $projectMember->delete();
        return response()->json(['message' => 'Member removed successfully']);
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
