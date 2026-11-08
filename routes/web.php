<?php

use App\Http\Controllers\Admin\RealtimeController;
use App\Http\Controllers\Admin\SessionMonitorController;
use App\Http\Controllers\GameTableController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

/*
 * Player panel. Admins may also open the player view; hosting restrictions
 * are enforced per session, not per route.
 */
Route::middleware(['auth'])->group(function () {
    Route::inertia('dashboard', 'player/dashboard')->name('dashboard');

    Route::inertia('lobby', 'player/lobby')->name('lobby.index');
    Route::inertia('lobby/sessions', 'player/sessions')->name('lobby.sessions');

    Route::get('games/{game}/{session}', [GameTableController::class, 'show'])
        ->where('game', 'poker|blackjack|roulette')
        ->name('games.show');

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

    Route::controller(RealtimeController::class)->prefix('realtime')->name('realtime.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('health', 'health')->name('health');
        Route::post('ping', 'ping')->name('ping');
        Route::post('private', 'privateTest')->name('private');
    });
});

require __DIR__.'/settings.php';
