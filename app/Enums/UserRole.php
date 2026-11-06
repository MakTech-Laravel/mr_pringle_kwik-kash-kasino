<?php

namespace App\Enums;

/**
 * The only two persistent roles. Hosting a game is a per-session Admin duty, not a role.
 */
enum UserRole: string
{
    case Player = 'player';
    case Admin = 'admin';

    /**
     * Named route a user of this role lands on after signing in.
     */
    public function homeRouteName(): string
    {
        return match ($this) {
            self::Admin => 'admin.overview',
            self::Player => 'dashboard',
        };
    }
}
