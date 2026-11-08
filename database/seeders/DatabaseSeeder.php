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
     * Seeds the starter administrator and player accounts.
     * Change their passwords before the site goes public.
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
        ]);
    }
}
