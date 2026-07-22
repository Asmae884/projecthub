<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;

class MemberController extends Controller
{
    public function index(Project $project)
    {
        return response()->json($project->members()->withPivot('role')->get());
    }

    public function store(Request $request, Project $project)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'role' => 'required|in:admin,member',
        ]);

        $user = User::where('email', $request->email)->first();

        if ($project->members()->where('user_id', $user->id)->exists()) {
            return response()->json(['message' => 'Déjà membre'], 409);
        }

        $project->members()->attach($user->id, ['role' => $request->role, 'joined_at' => now()]);

        return response()->json(['message' => 'Membre ajouté'], 201);
    }

    public function destroy(Project $project, User $user)
    {
        $project->members()->detach($user->id);

        return response()->json(['message' => 'Membre retiré']);
    }
}
