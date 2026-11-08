<?php

use App\Events\CasinoStatusChanged;
use App\Events\UserNotified;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Support\Facades\Event;
use Inertia\Testing\AssertableInertia as Assert;

test('the casino is open until an admin closes it', function () {
    expect(Setting::casinoIsOpen())->toBeTrue();

    $this->actingAs(User::factory()->create())
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page->where('casinoOpen', true));
});

test('an admin closes and reopens the casino and everyone is told', function () {
    Event::fake([CasinoStatusChanged::class]);
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->put(route('admin.casino-status.update'), ['open' => false])->assertRedirect();

    expect(Setting::casinoIsOpen())->toBeFalse();
    Event::assertDispatched(CasinoStatusChanged::class, fn (CasinoStatusChanged $event) => $event->open === false);

    $this->actingAs(User::factory()->create())
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page->where('casinoOpen', false));

    $this->actingAs($admin)->put(route('admin.casino-status.update'), ['open' => true]);

    expect(Setting::casinoIsOpen())->toBeTrue();
});

test('players cannot switch the casino', function () {
    $this->actingAs(User::factory()->create())
        ->put(route('admin.casino-status.update'), ['open' => false])
        ->assertForbidden();

    expect(Setting::casinoIsOpen())->toBeTrue();
});

test('the casino switch needs a boolean', function () {
    $this->actingAs(User::factory()->admin()->create())
        ->put(route('admin.casino-status.update'), ['open' => 'maybe'])
        ->assertSessionHasErrors('open');
});

test('a user notification goes only to that user\'s private channel', function () {
    $user = User::factory()->create();
    $event = UserNotified::to($user, 'Cash-in approved', '500 credits added', 'success');

    expect($event->broadcastOn()[0]->name)->toBe('private-App.Models.User.'.$user->id)
        ->and($event->broadcastAs())->toBe('notification')
        ->and($event->broadcastWith())->toBe([
            'title' => 'Cash-in approved',
            'body' => '500 credits added',
            'type' => 'success',
        ]);
});
