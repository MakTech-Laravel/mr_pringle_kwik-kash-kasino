<?php

use App\Http\Controllers\Admin\PasswordAppealController as AdminPasswordAppealController;
use App\Http\Controllers\Admin\RealtimeController;
use App\Http\Controllers\Admin\SessionMonitorController;
use App\Http\Controllers\GameTableController;
use App\Http\Controllers\PasswordAppealController;
use App\Http\Controllers\PasswordAppealResetController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
 * There is no public landing page: guests are sent to the login screen
 * permanently, signed-in users to the home of their role.
 */
Route::get('/', function (Request $request) {
    return $request->user()
        ? redirect()->route($request->user()->role->homeRouteName())
        : redirect()->route('login', status: 301);
})->name('home');

/*
 * Forgotten password. There is no self-service reset and no email on accounts:
 * players file an appeal (email proven by a one-time code) and an admin hands
 * back a one-time link or a temporary password.
 */
Route::prefix('password-appeal')->name('password-appeal.')->group(function () {
    Route::get('/', [PasswordAppealController::class, 'create'])->name('create');
    Route::post('/', [PasswordAppealController::class, 'store'])->middleware('throttle:password-appeal')->name('store');
    Route::post('verify', [PasswordAppealController::class, 'verify'])->middleware('throttle:password-appeal-code')->name('verify');
    Route::post('resend', [PasswordAppealController::class, 'resend'])->middleware('throttle:password-appeal')->name('resend');
    Route::post('cancel', [PasswordAppealController::class, 'cancel'])->name('cancel');
    Route::get('sent', [PasswordAppealController::class, 'sent'])->name('sent');
    Route::get('reset/{token}', [PasswordAppealResetController::class, 'show'])->name('reset');
    Route::post('reset/{token}', [PasswordAppealResetController::class, 'update'])->middleware('throttle:password-appeal-code')->name('reset.update');
});

/*
 * Player panel. Admins are redirected to the admin console and take part in
 * tables per session (as host or as a player) instead.
 */
Route::middleware(['auth', 'player'])->group(function () {
    Route::inertia('dashboard', 'player/dashboard')->name('dashboard');

    Route::inertia('lobby', 'player/lobby')->name('lobby.index');
    Route::inertia('lobby/sessions', 'player/sessions')->name('lobby.sessions');

    Route::inertia('wallet', 'player/wallet')->name('wallet.index');
    Route::inertia('wallet/cash-in', 'player/cash-in')->name('wallet.cash-in');
    Route::inertia('wallet/cash-out', 'player/cash-out')->name('wallet.cash-out');

    Route::inertia('history', 'player/game-history')->name('history');
    Route::inertia('transactions', 'player/transactions')->name('transactions');
    Route::inertia('notifications', 'player/notifications')->name('notifications');
    Route::inertia('profile', 'player/profile')->name('player.profile');
    Route::inertia('profile/settings', 'player/account-settings')->name('player.account-settings');
});

/*
 * Game tables are shared: players sit as players, admins pick host or player.
 */
Route::middleware(['auth'])->group(function () {
    Route::get('games/{game}/{session}', [GameTableController::class, 'show'])
        ->where('game', 'poker|blackjack|roulette')
        ->name('games.show');
    Route::post('tables/{session}/leave', [GameTableController::class, 'leave'])->name('tables.leave');
});

/*
 * Admin console. Role-gated by the `admin` middleware alias.
 */
Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::inertia('/', 'admin/overview')->name('overview');
    Route::inertia('players', 'admin/players')->name('players');
    Route::inertia('cash-in', 'admin/cash-in')->name('cash-in');
    Route::inertia('cash-out', 'admin/cash-out')->name('cash-out');
    Route::inertia('wallets', 'admin/wallets')->name('wallets');
    Route::inertia('ledger', 'admin/ledger')->name('ledger');
    Route::inertia('house', 'admin/house')->name('house');
    Route::inertia('sessions', 'admin/sessions')->name('sessions');
    Route::get('sessions/{session}', [SessionMonitorController::class, 'show'])->name('sessions.show');
    Route::inertia('game-history', 'admin/game-history')->name('game-history');
    Route::inertia('activity', 'admin/activity')->name('activity');
    Route::inertia('notifications', 'admin/notifications')->name('notifications');
    Route::inertia('profile', 'admin/profile')->name('profile');

    Route::controller(AdminPasswordAppealController::class)->prefix('password-appeals')->name('password-appeals.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('{appeal}/link', 'link')->name('link');
        Route::post('{appeal}/temporary-password', 'temporaryPassword')->name('temporary-password');
        Route::post('{appeal}/resolve', 'resolve')->name('resolve');
        Route::post('{appeal}/reject', 'reject')->name('reject');
    });

    Route::controller(RealtimeController::class)->prefix('realtime')->name('realtime.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('health', 'health')->name('health');
        Route::post('ping', 'ping')->name('ping');
        Route::post('private', 'privateTest')->name('private');
    });
});

require __DIR__.'/settings.php';
