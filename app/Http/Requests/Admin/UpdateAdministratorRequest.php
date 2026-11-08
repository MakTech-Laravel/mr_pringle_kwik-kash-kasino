<?php

namespace App\Http\Requests\Admin;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class UpdateAdministratorRequest extends FormRequest
{
    use PasswordValidationRules, ProfileValidationRules;

    protected function prepareForValidation(): void
    {
        $this->merge(['username' => strtolower(trim((string) $this->input('username')))]);
    }

    /**
     * The new password is optional: leave it blank to keep the current one.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            ...$this->profileRules($this->route('administrator')->id),
            'password' => ['nullable', 'string', Password::default(), 'confirmed'],
            'admin_password' => ['required', 'string', 'current_password'],
        ];
    }
}
