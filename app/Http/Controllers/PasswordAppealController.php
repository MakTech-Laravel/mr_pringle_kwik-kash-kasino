<?php

namespace App\Http\Controllers;

use App\Enums\AppealStatus;
use App\Mail\PasswordAppealCode;
use App\Models\PasswordAppeal;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

/**
 * Public "I forgot my password" appeal. There is no self-service reset:
 * accounts have no email on file, so the player gives one here, proves they
 * control it with a one-time code, and an admin follows up by hand.
 */
class PasswordAppealController extends Controller
{
    private const SESSION_KEY = 'password_appeal_id';

    public function create(Request $request): Response|RedirectResponse
    {
        $appeal = $this->pendingVerification($request);

        return Inertia::render('auth/password-appeal', [
            'step' => $appeal ? 'verify' : 'form',
            'email' => $appeal?->email,
            'username' => $appeal?->username,
        ]);
    }

    /**
     * Step 1: record the appeal and email a verification code.
     */
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'username' => ['required', 'string', 'min:3', 'max:30', 'regex:/^[A-Za-z0-9_]+$/'],
            'email' => ['required', 'string', 'email:rfc', 'max:255'],
            'message' => ['nullable', 'string', 'max:500'],
        ]);

        $username = strtolower($data['username']);

        // Re-submitting replaces any earlier unverified attempt for this pair.
        PasswordAppeal::query()
            ->where('status', AppealStatus::Unverified)
            ->where('username', $username)
            ->where('email', $data['email'])
            ->delete();

        $appeal = PasswordAppeal::create([
            // Never reveal whether the username exists; admins see the match.
            'user_id' => User::where('username', $username)->value('id'),
            'username' => $username,
            'email' => $data['email'],
            'message' => $data['message'] ?? null,
            'ip_address' => $request->ip(),
        ]);

        $this->sendCode($appeal);
        $request->session()->put(self::SESSION_KEY, $appeal->id);

        return redirect()->route('password-appeal.create');
    }

    /**
     * Step 2: confirm the code. Only a verified appeal reaches the admins.
     */
    public function verify(Request $request): RedirectResponse
    {
        $request->validate(['code' => ['required', 'digits:6']]);

        $appeal = $this->pendingVerification($request);

        if (! $appeal) {
            return redirect()->route('password-appeal.create');
        }

        if ($appeal->verification_attempts >= PasswordAppeal::MAX_CODE_ATTEMPTS) {
            $this->abandon($request, $appeal);

            throw ValidationException::withMessages([
                'code' => 'Too many wrong codes. Start the appeal again.',
            ]);
        }

        if (! $appeal->codeMatches((string) $request->input('code'))) {
            $appeal->increment('verification_attempts');

            throw ValidationException::withMessages([
                'code' => 'That code is wrong or has expired.',
            ]);
        }

        $appeal->forceFill([
            'status' => AppealStatus::Pending,
            'email_verified_at' => now(),
            'verification_code_hash' => null,
            'verification_expires_at' => null,
        ])->save();

        $request->session()->forget(self::SESSION_KEY);

        return redirect()->route('password-appeal.sent');
    }

    public function resend(Request $request): RedirectResponse
    {
        $appeal = $this->pendingVerification($request);

        if ($appeal) {
            $this->sendCode($appeal);
        }

        return redirect()->route('password-appeal.create');
    }

    public function sent(): Response
    {
        return Inertia::render('auth/password-appeal', ['step' => 'sent']);
    }

    /**
     * Start over: drop the unverified appeal and return to the form.
     */
    public function cancel(Request $request): RedirectResponse
    {
        $appeal = $this->pendingVerification($request);

        if ($appeal) {
            $this->abandon($request, $appeal);
        }

        return redirect()->route('password-appeal.create');
    }

    private function pendingVerification(Request $request): ?PasswordAppeal
    {
        $id = $request->session()->get(self::SESSION_KEY);

        return $id
            ? PasswordAppeal::query()->where('status', AppealStatus::Unverified)->find($id)
            : null;
    }

    private function sendCode(PasswordAppeal $appeal): void
    {
        $code = $appeal->issueVerificationCode();

        try {
            Mail::to($appeal->email)->send(
                new PasswordAppealCode($appeal->username, $code, PasswordAppeal::CODE_TTL_MINUTES),
            );
        } catch (Throwable $e) {
            report($e);

            throw ValidationException::withMessages([
                'email' => 'We could not send the verification code right now. Please try again shortly.',
            ]);
        }
    }

    private function abandon(Request $request, PasswordAppeal $appeal): void
    {
        $appeal->delete();
        $request->session()->forget(self::SESSION_KEY);
    }
}
