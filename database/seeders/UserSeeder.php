<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $password = Hash::make('password');

        $users = [
            [
                'name' => 'Admin',
                'username' => 'admin',
                'password' => $password,
                'role' => UserRole::Admin,
            ],
            [
                'name' => 'User',
                'username' => 'user',
                'password' => $password,
                'role' => UserRole::Player,
            ],
        ];

        foreach ($users as $user) {
            User::create($user);
        }
    }
}
