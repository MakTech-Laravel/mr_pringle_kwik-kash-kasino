<?php

use App\Enums\UserRole;
use App\Models\User;
use Laravel\Fortify\Features;

beforeEach(function () {
    $this->skipUnlessFortifyHas(Features::registration());
});

test('registration screen can be rendered', function () {
    $response = $this->get(route('register'));

    $response->assertOk();
});

test('new users can register with a username and password only', function () {
    $response = $this->post(route('register.store'), [
        'username' => 'New_Player',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));

    $user = User::where('username', 'new_player')->firstOrFail();
    expect($user->role)->toBe(UserRole::Player);
    expect($user->email)->toBeNull();
});

test('registration requires a unique username', function () {
    User::factory()->create(['username' => 'taken_name']);

    $this->post(route('register.store'), [
        'username' => 'Taken_Name',
        'password' => 'password',
        'password_confirmation' => 'password',
    ])->assertSessionHasErrors('username');

    $this->assertGuest();
});
