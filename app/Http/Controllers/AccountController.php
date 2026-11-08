<?php

namespace App\Http\Controllers;

use App\Http\Requests\Settings\TwoFactorAuthenticationRequest;
use App\Support\AccountSecurity;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Account pages: one per role, both behind password confirmation because they
 * manage the password, two-factor authentication and passkeys.
 */
class AccountController extends Controller
{
    public function player(TwoFactorAuthenticationRequest $request): Response
    {
        return Inertia::render('player/account-settings', AccountSecurity::props($request));
    }

    public function admin(TwoFactorAuthenticationRequest $request): Response
    {
        return Inertia::render('admin/profile', AccountSecurity::props($request));
    }
}
