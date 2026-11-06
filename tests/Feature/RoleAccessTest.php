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

test('admins can open the admin console and the player view', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->get(route('admin.overview'))->assertOk();
    $this->actingAs($admin)->get(route('dashboard'))->assertOk();
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

test('the demo seeder creates exactly one player and one admin', function () {
    $this->seed(DatabaseSeeder::class);

    expect(User::count())->toBe(2);
    expect(User::where('username', 'demo_player')->first()->role)->toBe(UserRole::Player);
    expect(User::where('username', 'demo_admin')->first()->role)->toBe(UserRole::Admin);

    $this->post(route('login.store'), ['username' => 'demo_player', 'password' => '@user'])
        ->assertRedirect(route('dashboard', absolute: false));
    $this->assertAuthenticated();
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
