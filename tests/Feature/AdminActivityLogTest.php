<?php

use App\Models\PasswordAppeal;
use App\Models\User;
use App\Support\AdminAudit;
use Inertia\Testing\AssertableInertia as Assert;

test('the activity log is admin only', function () {
    $this->get(route('admin.activity'))->assertRedirect(route('login'));
    $this->actingAs(User::factory()->create())->get(route('admin.activity'))->assertForbidden();
});

test('closing the casino is written to the log with the acting admin', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->put(route('admin.casino-status.update'), ['open' => false]);

    $entry = AdminAudit::query()->sole();

    expect($entry->event)->toBe('casino.close')
        ->and($entry->causer_id)->toBe($admin->id);

    $this->actingAs($admin)
        ->get(route('admin.activity'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/activity')
            ->has('activities', 1)
            ->where('activities.0.action', 'casino.close')
            ->where('activities.0.admin', $admin->name));
});

test('administrator changes are logged without passwords', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->post(route('admin.administrators.store'), [
        'name' => 'Second',
        'username' => 'second_admin',
        'password' => 'a-long-secret-1',
        'password_confirmation' => 'a-long-secret-1',
        'admin_password' => 'password',
    ]);

    $entry = AdminAudit::query()->where('event', 'administrator.add')->sole();

    expect($entry->description)->toContain('second_admin')
        ->and(json_encode($entry->properties))->not->toContain('a-long-secret-1');
});

test('appeal actions are logged', function () {
    $admin = User::factory()->admin()->create();
    $appeal = PasswordAppeal::factory()->create(['user_id' => User::factory()->create()->id]);

    $this->actingAs($admin)->postJson(route('admin.password-appeals.link', $appeal))->assertOk();
    $this->actingAs($admin)->post(route('admin.password-appeals.reject', $appeal));

    expect(AdminAudit::query()->pluck('event')->all())->toContain('appeal.link', 'appeal.rejected');
});
