<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

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
        $this->call([
            UserSeeder::class,
        ]);
    }
}
