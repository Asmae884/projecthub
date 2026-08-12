<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
    
        $admin = User::firstOrCreate(
            ['email' => 'admin@projecthub.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'email_verified_at' => now(), 
            ]
        );

        $this->command->info(' Admin créé avec succès !');
        $this->command->info(' Email: admin@projecthub.com');
        $this->command->info(' Mot de passe: password');
        $this->command->info('');
        $this->command->info(' Les utilisateurs, projets et tâches seront créés manuellement via l\'interface.');
    }
}