<?php

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;

test('only admins can open the administrators page', function () {
    $this->get(route('admin.administrators.index'))->assertRedirect(route('login'));
    $this->actingAs(User::factory()->create())->get(route('admin.administrators.index'))->assertForbidden();

    $admin = User::factory()->admin()->create(['username' => 'boss']);
    User::factory()->create(['username' => 'justaplayer']);

    $this->actingAs($admin)
        ->get(route('admin.administrators.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/administrators')
            ->has('administrators', 1)
            ->where('administrators.0.username', 'boss')
            ->where('administrators.0.isYou', true));
});

test('an admin adds another administrator after confirming their own password', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->post(route('admin.administrators.store'), [
            'name' => 'Second Admin',
            'username' => 'Second_Admin',
            'password' => 'a-long-secret-1',
            'password_confirmation' => 'a-long-secret-1',
            'admin_password' => 'wrong',
        ])
        ->assertSessionHasErrors('admin_password');

    expect(User::count())->toBe(1);

    $this->actingAs($admin)
        ->post(route('admin.administrators.store'), [
            'name' => 'Second Admin',
            'username' => 'Second_Admin',
            'password' => 'a-long-secret-1',
            'password_confirmation' => 'a-long-secret-1',
            'admin_password' => 'password',
        ])
        ->assertSessionHasNoErrors();

    $created = User::where('username', 'second_admin')->sole();

    expect($created->role)->toBe(UserRole::Admin)
        ->and(Hash::check('a-long-secret-1', $created->password))->toBeTrue();
});

test('players cannot manage administrators', function () {
    $player = User::factory()->create();
    $admin = User::factory()->admin()->create();

    $this->actingAs($player)->post(route('admin.administrators.store'), [])->assertForbidden();
    $this->actingAs($player)->delete(route('admin.administrators.destroy', $admin), [])->assertForbidden();
});

test('an administrator can be renamed and given a new password', function () {
    $admin = User::factory()->admin()->create();
    $other = User::factory()->admin()->create(['username' => 'other']);

    $this->actingAs($admin)
        ->patch(route('admin.administrators.update', $other), [
            'name' => 'Renamed',
            'username' => 'renamed_admin',
            'password' => 'another-secret-22',
            'password_confirmation' => 'another-secret-22',
            'admin_password' => 'password',
        ])
        ->assertSessionHasNoErrors();

    $other->refresh();

    expect($other->name)->toBe('Renamed')
        ->and($other->username)->toBe('renamed_admin')
        ->and(Hash::check('another-secret-22', $other->password))->toBeTrue();
});

test('leaving the password blank keeps the old one', function () {
    $admin = User::factory()->admin()->create();
    $other = User::factory()->admin()->create(['username' => 'plain_other']);
    $before = $other->password;

    $this->actingAs($admin)
        ->patch(route('admin.administrators.update', $other), [
            'name' => 'Renamed',
            'username' => $other->username,
            'admin_password' => 'password',
        ])
        ->assertSessionHasNoErrors();

    expect($other->refresh()->password)->toBe($before);
});

test('only administrator accounts can be edited here', function () {
    $admin = User::factory()->admin()->create();
    $player = User::factory()->create();

    $this->actingAs($admin)
        ->patch(route('admin.administrators.update', $player), [
            'name' => 'Nope',
            'username' => 'nope',
            'admin_password' => 'password',
        ])
        ->assertNotFound();

    $this->actingAs($admin)
        ->delete(route('admin.administrators.destroy', $player), ['admin_password' => 'password'])
        ->assertNotFound();
});

test('an administrator can be removed with the password', function () {
    $admin = User::factory()->admin()->create();
    $other = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->delete(route('admin.administrators.destroy', $other), ['admin_password' => 'wrong'])
        ->assertSessionHasErrors('admin_password');

    expect($other->fresh())->not->toBeNull();

    $this->actingAs($admin)
        ->delete(route('admin.administrators.destroy', $other), ['admin_password' => 'password'])
        ->assertSessionHasNoErrors();

    expect($other->fresh())->toBeNull();
});

test('you cannot remove yourself or the last administrator', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->delete(route('admin.administrators.destroy', $admin), ['admin_password' => 'password'])
        ->assertStatus(422);

    expect($admin->fresh())->not->toBeNull();
});
