<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request)
    {
        // Récupérer tous les utilisateurs sauf l'utilisateur connecté
        $users = User::where('id', '!=', $request->user()->id)->get();
        return response()->json($users);
    }
}