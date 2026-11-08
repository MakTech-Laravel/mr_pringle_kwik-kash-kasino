<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered player (username + password only).
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        $input['username'] = strtolower(trim($input['username'] ?? ''));

        Validator::make($input, [
            'username' => $this->usernameRules(),
            'password' => $this->passwordRules(),
        ])->validate();

        return User::create([
            'name' => $input['username'],
            'username' => $input['username'],
            'password' => $input['password'],
        ]);
    }
}
