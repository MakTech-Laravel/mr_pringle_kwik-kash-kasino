<?php

use App\Enums\UserRole;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;

test('guests are redirected to login for player and admin pages', function (string $routeName) {
    $this->get(route($routeName))->assertRedirect(route('login'));
})->with(['dashboard', 'wallet.index', 'admin.overview', 'admin.players']);

test('players can open the player panel but not the admin console', function () {
    $player = User::factory()->create();

    $this->actingAs($player)->get(route('dashboard'))->assertOk();
    $this->actingAs($player)->get(route('admin.overview'))->assertForbidden();
    $this->actingAs($player)->get(route('admin.players'))->assertForbidden();
});

test('admins can open the admin console but not the player panel', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->get(route('admin.overview'))->assertOk();
    $this->actingAs($admin)->get(route('dashboard'))->assertRedirect(route('admin.overview'));
});

test('each role is redirected to its own home after login', function () {
    $player = User::factory()->create();
    $admin = User::factory()->admin()->create();

    $this->post(route('login.store'), ['username' => $player->username, 'password' => 'password'])
        ->assertRedirect(route('dashboard', absolute: false));
    $this->post(route('logout'));

    $this->post(route('login.store'), ['username' => $admin->username, 'password' => 'password'])
        ->assertRedirect(route('admin.overview', absolute: false));
});

test('the seeder creates exactly one player and one admin', function () {
    $this->seed(DatabaseSeeder::class);

    expect(User::count())->toBe(2);
    expect(User::where('username', 'user')->first()->role)->toBe(UserRole::Player);
    expect(User::where('username', 'admin')->first()->role)->toBe(UserRole::Admin);

    $this->post(route('login.store'), ['username' => 'user', 'password' => 'password'])
        ->assertRedirect(route('dashboard', absolute: false));
    $this->assertAuthenticated();
});

test('the root URL redirects guests to login permanently and users to their home', function () {
    $this->get('/')->assertStatus(301)->assertRedirect(route('login'));

    $this->actingAs(User::factory()->create())->get('/')->assertRedirect(route('dashboard'));
});

test('signed-in users are bounced away from the login page to their own home', function () {
    $this->actingAs(User::factory()->create())->get(route('login'))->assertRedirect(route('dashboard'));
    $this->actingAs(User::factory()->admin()->create())->get(route('login'))->assertRedirect(route('admin.overview'));
});

test('every player-only page redirects an admin back to the admin console', function (string $routeName) {
    $this->actingAs(User::factory()->admin()->create())
        ->get(route($routeName))
        ->assertRedirect(route('admin.overview'));
})->with([
    'dashboard',
    'lobby.index',
    'lobby.sessions',
    'wallet.index',
    'wallet.cash-in',
    'wallet.cash-out',
    'history',
    'transactions',
    'notifications',
    'player.profile',
    'player.account-settings',
]);

test('an admin must choose to join a table as host or as a player', function () {
    $admin = User::factory()->admin()->create();
    $table = ['game' => 'poker', 'session' => 'PKR-6402'];

    $this->actingAs($admin)->get(route('games.show', $table))->assertRedirect(route('admin.sessions'));
    $this->actingAs($admin)->get(route('games.show', $table + ['as' => 'dealer']))->assertRedirect(route('admin.sessions'));
    $this->actingAs($admin)->get(route('games.show', $table + ['as' => 'host']))->assertOk();
});

test('an admin cannot be host and player of the same session at once', function () {
    $admin = User::factory()->admin()->create();
    $table = ['game' => 'poker', 'session' => 'PKR-6402'];

    $this->actingAs($admin)->get(route('games.show', $table + ['as' => 'host']))->assertOk();
    $this->get(route('games.show', $table + ['as' => 'player']))->assertRedirect(route('admin.sessions'));

    $this->post(route('tables.leave', 'PKR-6402'))->assertRedirect(route('admin.sessions'));
    $this->get(route('games.show', $table + ['as' => 'player']))->assertOk();
    $this->get(route('games.show', $table + ['as' => 'host']))->assertRedirect(route('admin.sessions'));
});

test('a different session is not affected by a seat held elsewhere', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->get(route('games.show', ['game' => 'poker', 'session' => 'PKR-1', 'as' => 'host']))->assertOk();
    $this->get(route('games.show', ['game' => 'blackjack', 'session' => 'BJ-2', 'as' => 'player']))->assertOk();
});

test('every player page renders for a signed-in player', function (string $routeName) {
    $player = User::factory()->create();

    $this->actingAs($player)->get(route($routeName))->assertOk();
})->with([
    'lobby.index',
    'lobby.sessions',
    'wallet.index',
    'wallet.cash-in',
    'wallet.cash-out',
    'history',
    'transactions',
    'notifications',
    'player.profile',
    'player.account-settings',
]);

test('players can change their password from the account settings page', function () {
    $player = User::factory()->create();

    $this->actingAs($player)
        ->put(route('user-password.update'), [
            'current_password' => 'password',
            'password' => 'a-new-password-1',
            'password_confirmation' => 'a-new-password-1',
        ])
        ->assertSessionHasNoErrors();

    expect(password_verify('a-new-password-1', $player->refresh()->password))->toBeTrue();
});

test('game tables only accept known games and render for players', function () {
    $player = User::factory()->create();

    $this->actingAs($player)->get(route('games.show', ['game' => 'poker', 'session' => 'PKR-6402']))->assertOk();
    $this->actingAs($player)->get(route('games.show', ['game' => 'blackjack', 'session' => 'BJ-2048']))->assertOk();
    $this->actingAs($player)->get(route('games.show', ['game' => 'roulette', 'session' => 'RLT-1107']))->assertOk();
    $this->actingAs($player)->get('/games/bingo/XX-1')->assertNotFound();
});

test('every admin page renders for an admin and stays forbidden for players', function (string $routeName) {
    $this->actingAs(User::factory()->create())->get(route($routeName))->assertForbidden();
    $this->actingAs(User::factory()->admin()->create())->get(route($routeName))->assertOk();
})->with([
    'admin.overview',
    'admin.players',
    'admin.cash-in',
    'admin.cash-out',
    'admin.wallets',
    'admin.ledger',
    'admin.house',
    'admin.sessions',
    'admin.game-history',
    'admin.activity',
    'admin.notifications',
    'admin.profile',
]);

test('admins can open the session monitor', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->get(route('admin.sessions.show', 'PK-1189'))->assertOk();
});
