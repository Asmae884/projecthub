<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ProjectHubSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'email' => 'test@example.com',
                'password' => Hash::make('password'),
            ]
        );

        $project = Project::firstOrCreate(
            ['name' => 'Projet de lancement'],
            [
                'user_id' => $user->id,
                'description' => 'Projet de démo pour ProjectHub.',
                'start_date' => now()->subDays(5)->toDateString(),
                'end_date' => now()->addDays(10)->toDateString(),
                'status' => 'active',
            ]
        );

        Task::firstOrCreate(
            ['title' => 'Préparer la maquette'],
            [
                'project_id' => $project->id,
                'description' => 'Créer la structure initiale du tableau de bord.',
                'status' => 'in_progress',
                'priority' => 'high',
                'due_date' => now()->addDays(2)->toDateString(),
                'created_by' => $user->id,
                'assigned_to' => $user->id,
            ]
        );

        Task::firstOrCreate(
            ['title' => 'Valider l’authentification'],
            [
                'project_id' => $project->id,
                'description' => 'Tester l’inscription et la connexion.',
                'status' => 'pending',
                'priority' => 'medium',
                'due_date' => now()->addDays(4)->toDateString(),
                'created_by' => $user->id,
                'assigned_to' => $user->id,
            ]
        );
    }
}
