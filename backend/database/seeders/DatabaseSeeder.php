<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Project;
use App\Models\Task;
use App\Models\ProjectMember;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Créer ou récupérer l'utilisateur admin
        $admin = User::firstOrCreate(
            ['email' => 'admin@projecthub.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
            ]
        );

        // 2. Créer des utilisateurs de test (seulement s'ils n'existent pas)
        $users = collect();
        for ($i = 1; $i <= 5; $i++) {
            $user = User::firstOrCreate(
                ['email' => "user$i@projecthub.com"],
                [
                    'name' => "User $i",
                    'password' => Hash::make('password'),
                ]
            );
            $users->push($user);
        }

        // 3. Vérifier s'il y a déjà des projets
        if (Project::count() > 0) {
            $this->command->info('📊 Des projets existent déjà, aucun nouveau projet créé.');
            $this->command->info("👤 Admin: admin@projecthub.com / password");
            $this->command->info("📊 Projets existants: " . Project::count());
            $this->command->info("📋 Tâches existantes: " . Task::count());
            return;
        }

        // 4. Créer des projets (5 projets)
        $projects = collect();
        for ($i = 1; $i <= 5; $i++) {
            $project = Project::create([
                'user_id' => $admin->id,
                'name' => "Projet $i",
                'description' => "Description du projet $i",
                'start_date' => now()->subDays(rand(1, 30)),
                'end_date' => rand(0, 1) ? now()->addDays(rand(1, 60)) : null,
                'status' => ['active', 'completed', 'paused'][rand(0, 2)],
            ]);
            $projects->push($project);

            // Ajouter des membres aux projets
            $randomUsers = $users->random(rand(1, 3));
            foreach ($randomUsers as $user) {
                ProjectMember::firstOrCreate([
                    'project_id' => $project->id,
                    'user_id' => $user->id,
                ], [
                    'role' => rand(0, 1) ? 'admin' : 'member',
                ]);
            }

            // Créer des tâches pour chaque projet (5-15 tâches)
            $numTasks = rand(5, 15);
            for ($j = 1; $j <= $numTasks; $j++) {
                Task::create([
                    'project_id' => $project->id,
                    'title' => "Tâche $j du projet $i",
                    'description' => "Description de la tâche $j",
                    'status' => ['pending', 'in_progress', 'completed'][rand(0, 2)],
                    'priority' => ['low', 'medium', 'high'][rand(0, 2)],
                    'due_date' => rand(0, 1) ? now()->addDays(rand(1, 30)) : null,
                    'created_by' => $admin->id,
                    'assigned_to' => $users->random()->id,
                    'completed_at' => rand(0, 1) ? now() : null,
                ]);
            }
        }

        $this->command->info(' Base de données remplie avec succès !');
        $this->command->info(" Admin: admin@projecthub.com / password");
        $this->command->info("Users: user1@projecthub.com à user5@projecthub.com / password");
        $this->command->info("Projets créés: " . $projects->count());
        $this->command->info(" Tâches créées: " . Task::count());
    }
}

