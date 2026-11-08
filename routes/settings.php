<?php

use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SecurityController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
 * Form endpoints behind the account pages (the pages themselves live in
 * routes/web.php, one per role). They sit behind the same password
 * confirmation as the pages.
 */
Route::middleware(['auth', 'password.confirm'])->prefix('account')->group(function () {
    Route::patch('profile', [ProfileController::class, 'update'])->name('profile.update');

    Route::put('password', [SecurityController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');
});

Route::get('.well-known/passkey-endpoints', function (Request $request) {
    $account = $request->user()?->isAdmin() ? route('admin.profile') : route('player.account-settings');

    return response()->json(['enroll' => $account, 'manage' => $account]);
})->name('well-known.passkeys');
