<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     *
     * DEMO ONLY: these credentials exist for local development and client demos.
     * Never run this seeder against production.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Demo Player',
            'username' => 'demo_player',
            'password' => Hash::make('@user'),
        ]);

        User::factory()->admin()->create([
            'name' => 'Demo Admin',
            'username' => 'demo_admin',
            'password' => Hash::make('@admin'),
        ]);
    }
}
