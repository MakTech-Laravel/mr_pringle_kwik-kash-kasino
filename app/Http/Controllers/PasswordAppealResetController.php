<?php

namespace App\Http\Controllers;

use App\Concerns\PasswordValidationRules;
use App\Enums\AppealStatus;
use App\Models\PasswordAppeal;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Landing page for the one-time link an admin hands to a player who lost
 * their password. The link is single-use and expires after 24 hours.
 */
class PasswordAppealResetController extends Controller
{
    use PasswordValidationRules;

    public function show(string $token): Response
    {
        $appeal = PasswordAppeal::findByResetToken($token);
        $usable = $appeal?->resetLinkIsUsable() && $appeal->user !== null;

        return Inertia::render('auth/reset-with-link', [
            'token' => $token,
            'username' => $usable ? $appeal->username : null,
            'valid' => (bool) $usable,
        ]);
    }

    public function update(Request $request, string $token): RedirectResponse
    {
        $appeal = PasswordAppeal::findByResetToken($token);

        if (! $appeal?->resetLinkIsUsable() || $appeal->user === null) {
            return redirect()->route('password-appeal.reset', $token);
        }

        $data = $request->validate(['password' => $this->passwordRules()]);

        $appeal->user->forceFill([
            'password' => $data['password'],
            'remember_token' => null,
        ])->save();

        $appeal->forceFill([
            'reset_used_at' => now(),
            'status' => AppealStatus::Resolved,
        ])->save();

        return redirect()->route('login')->with('status', 'Your password was changed. You can sign in now.');
    }
}
