<?php

namespace App\Http\Controllers\Admin;

use App\Enums\AppealStatus;
use App\Http\Controllers\Controller;
use App\Models\PasswordAppeal;
use App\Support\AdminAudit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin review of verified password appeals: hand the player a one-time reset
 * link or a temporary password, or close the appeal.
 */
class PasswordAppealController extends Controller
{
    public function index(): Response
    {
        $appeals = PasswordAppeal::query()
            ->with('user:id,username,role')
            ->where('status', '!=', AppealStatus::Unverified)
            ->latest()
            ->limit(100)
            ->get()
            ->map(fn (PasswordAppeal $appeal) => [
                'id' => $appeal->id,
                'username' => $appeal->username,
                'email' => $appeal->email,
                'message' => $appeal->message,
                'status' => $appeal->status->value,
                'accountFound' => $appeal->user !== null,
                'accountIsAdmin' => (bool) $appeal->user?->isAdmin(),
                'submittedAt' => $appeal->created_at?->toIso8601String(),
                'linkExpiresAt' => $appeal->resetLinkIsUsable() ? $appeal->reset_expires_at?->toIso8601String() : null,
            ]);

        return Inertia::render('admin/password-appeals', ['appeals' => $appeals]);
    }

    /**
     * Create a one-time reset link. The plain link is returned once and never stored.
     */
    public function link(Request $request, PasswordAppeal $appeal): JsonResponse
    {
        abort_unless($this->canAct($appeal), 422, 'This appeal is closed or has no matching account.');

        $token = $appeal->issueResetToken();
        $this->markReviewed($request, $appeal, 'appeal.link', 'Reset link created');

        return response()->json([
            'url' => route('password-appeal.reset', $token),
            'expiresAt' => $appeal->reset_expires_at?->toIso8601String(),
            'hours' => PasswordAppeal::RESET_TTL_HOURS,
        ]);
    }

    /**
     * Set a random temporary password for the account. Shown once.
     */
    public function temporaryPassword(Request $request, PasswordAppeal $appeal): JsonResponse
    {
        abort_unless($this->canAct($appeal), 422, 'This appeal is closed or has no matching account.');

        $password = Str::password(14, symbols: false);

        $appeal->user->forceFill(['password' => $password, 'remember_token' => null])->save();
        $appeal->forceFill(['status' => AppealStatus::Resolved, 'reset_token_hash' => null])->save();
        $this->markReviewed($request, $appeal, 'appeal.temporary-password', 'Temporary password set');

        return response()->json(['password' => $password]);
    }

    public function resolve(Request $request, PasswordAppeal $appeal): RedirectResponse
    {
        return $this->close($request, $appeal, AppealStatus::Resolved);
    }

    public function reject(Request $request, PasswordAppeal $appeal): RedirectResponse
    {
        return $this->close($request, $appeal, AppealStatus::Rejected);
    }

    private function close(Request $request, PasswordAppeal $appeal, AppealStatus $status): RedirectResponse
    {
        abort_if($appeal->status === AppealStatus::Unverified, 422);

        $appeal->forceFill(['status' => $status, 'reset_token_hash' => null])->save();
        $this->markReviewed($request, $appeal, 'appeal.'.$status->value, 'Appeal '.$status->value);

        return back();
    }

    private function canAct(PasswordAppeal $appeal): bool
    {
        return $appeal->status === AppealStatus::Pending
            && $appeal->user !== null
            && ! $appeal->user->isAdmin();
    }

    private function markReviewed(Request $request, PasswordAppeal $appeal, string $action, string $description): void
    {
        $appeal->forceFill(['reviewed_by' => $request->user()->id, 'reviewed_at' => now()])->save();

        AdminAudit::record($request->user(), $action, $description.': @'.$appeal->username, $appeal, ['username' => $appeal->username]);
    }
}
