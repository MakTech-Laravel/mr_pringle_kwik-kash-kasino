<?php

namespace Database\Factories;

use App\Enums\AppealStatus;
use App\Models\PasswordAppeal;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PasswordAppeal>
 */
class PasswordAppealFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'username' => fake()->unique()->userName(),
            'email' => fake()->unique()->safeEmail(),
            'message' => fake()->sentence(),
            'status' => AppealStatus::Pending,
            'email_verified_at' => now(),
        ];
    }

    public function unverified(): static
    {
        return $this->state(['status' => AppealStatus::Unverified, 'email_verified_at' => null]);
    }
}
