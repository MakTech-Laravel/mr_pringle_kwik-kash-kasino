<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreAdministratorRequest;
use App\Http\Requests\Admin\UpdateAdministratorRequest;
use App\Models\User;
use App\Support\AdminAudit;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admins add, edit and remove other administrator accounts. Every change asks
 * for the acting admin's own password again.
 */
class AdministratorController extends Controller
{
    public function index(Request $request): Response
    {
        $administrators = User::query()
            ->where('role', UserRole::Admin)
            ->withCount('passkeys')
            ->orderBy('created_at')
            ->get()
            ->map(fn (User $admin) => [
                'id' => $admin->id,
                'name' => $admin->name,
                'username' => $admin->username,
                'createdAt' => $admin->created_at?->toIso8601String(),
                'twoFactorEnabled' => $admin->hasEnabledTwoFactorAuthentication(),
                'passkeys' => $admin->passkeys_count,
                'isYou' => $admin->is($request->user()),
            ]);

        return Inertia::render('admin/administrators', ['administrators' => $administrators]);
    }

    public function store(StoreAdministratorRequest $request): RedirectResponse
    {
        $admin = new User($request->safe()->only(['name', 'username', 'password']));
        $admin->role = UserRole::Admin;
        $admin->save();

        AdminAudit::record($request->user(), 'administrator.add', 'Administrator added: @'.$admin->username, $admin);

        Inertia::flash('toast', ['type' => 'success', 'message' => __(':name is now an administrator.', ['name' => $admin->username])]);

        return back();
    }

    public function update(UpdateAdministratorRequest $request, User $administrator): RedirectResponse
    {
        $this->ensureAdministrator($administrator);

        $administrator->fill($request->safe()->only(['name', 'username']));

        if ($request->filled('password')) {
            $administrator->password = $request->string('password')->toString();
        }

        $administrator->save();

        AdminAudit::record($request->user(), 'administrator.update', 'Administrator updated: @'.$administrator->username, $administrator, ['password_changed' => $request->filled('password')]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Administrator updated.')]);

        return back();
    }

    public function destroy(Request $request, User $administrator): RedirectResponse
    {
        $this->ensureAdministrator($administrator);

        $request->validate(['admin_password' => ['required', 'string', 'current_password']]);

        abort_if($administrator->is($request->user()), 422, 'You cannot remove your own administrator account.');

        DB::transaction(function () use ($administrator): void {
            $remaining = User::query()->where('role', UserRole::Admin)->lockForUpdate()->count();

            abort_if($remaining <= 1, 422, 'The last administrator cannot be removed.');

            $administrator->delete();
        });

        AdminAudit::record($request->user(), 'administrator.remove', 'Administrator removed: @'.$administrator->username);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Administrator removed.')]);

        return back();
    }

    private function ensureAdministrator(User $user): void
    {
        abort_unless($user->isAdmin(), 404);
    }
}
