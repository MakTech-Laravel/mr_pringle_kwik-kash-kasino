<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use Laravel\Fortify\Features;

test('the old settings pages are gone', function () {
    $this->actingAs(User::factory()->create());

    $this->get('/settings/profile')->assertNotFound();
    $this->get('/settings/security')->assertNotFound();
    $this->get('/settings/appearance')->assertNotFound();
});

test('account pages ask for the password before they open', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('player.account-settings'))
        ->assertRedirect(route('password.confirm'));

    $this->actingAs(User::factory()->admin()->create())
        ->get(route('admin.profile'))
        ->assertRedirect(route('password.confirm'));
});

test('a player sees two-factor and passkey management on their account page', function () {
    $this->skipUnlessFortifyHas(Features::twoFactorAuthentication());

    $this->actingAs(User::factory()->create())
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get(route('player.account-settings'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('player/account-settings')
            ->where('canManageTwoFactor', true)
            ->where('twoFactorEnabled', false)
            ->where('canManagePasskeys', true)
            ->where('passkeys', []));
});

test('an admin sees two-factor and passkey management on their profile page', function () {
    $this->actingAs(User::factory()->admin()->create())
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get(route('admin.profile'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/profile')
            ->has('passwordRules')
            ->where('canManageTwoFactor', true));
});

test('the account pages stay inside the role of the user', function () {
    $this->actingAs(User::factory()->admin()->create())
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get(route('player.account-settings'))
        ->assertRedirect(route('admin.overview'));

    $this->actingAs(User::factory()->create())
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get(route('admin.profile'))
        ->assertForbidden();
});

test('profile information can be updated', function () {
    $user = User::factory()->admin()->create();

    $this->actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->patch(route('profile.update'), ['name' => 'Test User', 'username' => 'test_user'])
        ->assertSessionHasNoErrors();

    expect($user->refresh()->name)->toBe('Test User')->and($user->username)->toBe('test_user');
});

test('the password can be changed only with the current one', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->put(route('user-password.update'), [
            'current_password' => 'wrong-password',
            'password' => 'new-password-1',
            'password_confirmation' => 'new-password-1',
        ])
        ->assertSessionHasErrors('current_password');

    $this->actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->put(route('user-password.update'), [
            'current_password' => 'password',
            'password' => 'new-password-1',
            'password_confirmation' => 'new-password-1',
        ])
        ->assertSessionHasNoErrors();

    expect(Hash::check('new-password-1', $user->refresh()->password))->toBeTrue();
});

test('there is no way to delete an account', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->delete('/settings/profile', ['password' => 'password'])
        ->assertNotFound();

    expect($user->fresh())->not->toBeNull();
});
