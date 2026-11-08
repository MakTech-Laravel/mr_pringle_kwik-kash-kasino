<?php

use App\Events\RealtimePrivateTestEvent;
use App\Events\ReverbPingEvent;
use App\Models\User;
use Illuminate\Support\Facades\Event;

function useReverbConfig(): void
{
    config([
        'broadcasting.default' => 'reverb',
        'broadcasting.connections.reverb.key' => 'test-key',
        'broadcasting.connections.reverb.secret' => 'test-secret',
        'broadcasting.connections.reverb.app_id' => '1',
        'broadcasting.connections.reverb.options.host' => '127.0.0.1',
        'broadcasting.connections.reverb.options.port' => 1,
        'broadcasting.connections.reverb.options.scheme' => 'http',
        'broadcasting.connections.reverb.options.useTLS' => false,
    ]);
}

test('the realtime console is admin only', function () {
    $this->get(route('admin.realtime.index'))->assertRedirect(route('login'));

    $this->actingAs(User::factory()->create())
        ->get(route('admin.realtime.index'))
        ->assertForbidden();

    $this->actingAs(User::factory()->admin()->create())
        ->get(route('admin.realtime.index'))
        ->assertOk();
});

test('realtime actions are forbidden to players and guests', function () {
    $this->postJson(route('admin.realtime.ping'))->assertUnauthorized();

    $player = User::factory()->create();

    $this->actingAs($player)->postJson(route('admin.realtime.ping'))->assertForbidden();
    $this->actingAs($player)->postJson(route('admin.realtime.private'))->assertForbidden();
    $this->actingAs($player)->getJson(route('admin.realtime.health'))->assertForbidden();
});

test('an admin dispatches a public ping event', function () {
    Event::fake([ReverbPingEvent::class]);

    $this->actingAs(User::factory()->admin()->create())
        ->postJson(route('admin.realtime.ping'), ['message' => 'hello'])
        ->assertOk()
        ->assertJson([
            'dispatched' => true,
            'channel' => 'reverb-ping',
            'event' => 'ping',
            'payload' => ['message' => 'hello'],
        ]);

    Event::assertDispatched(
        ReverbPingEvent::class,
        fn (ReverbPingEvent $event) => $event->message === 'hello',
    );
});

test('an admin dispatches a private event only to their own channel', function () {
    Event::fake([RealtimePrivateTestEvent::class]);
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->postJson(route('admin.realtime.private'))
        ->assertOk()
        ->assertJsonPath('channel', 'private-App.Models.User.'.$admin->id);

    Event::assertDispatched(
        RealtimePrivateTestEvent::class,
        fn (RealtimePrivateTestEvent $event) => $event->userId === $admin->id
            && $event->broadcastOn()[0]->name === 'private-App.Models.User.'.$admin->id,
    );
});

test('a broadcast failure is reported as a 502 instead of crashing', function () {
    useReverbConfig();

    $this->actingAs(User::factory()->admin()->create())
        ->postJson(route('admin.realtime.ping'))
        ->assertStatus(502)
        ->assertJson(['dispatched' => false]);
});

test('the health check reports broadcasting and redis without leaking secrets', function () {
    useReverbConfig();
    config(['database.redis.default.host' => '127.0.0.1', 'database.redis.default.port' => 1]);

    $response = $this->actingAs(User::factory()->admin()->create())
        ->getJson(route('admin.realtime.health'))
        ->assertOk()
        ->assertJsonPath('broadcasting.connection', 'reverb')
        ->assertJsonPath('broadcasting.host', '127.0.0.1')
        ->assertJsonPath('broadcasting.has_secret', true)
        ->assertJsonPath('redis.ok', false)
        ->assertJsonStructure(['redis' => ['client', 'usage' => ['cache', 'session', 'queue'], 'error']]);

    expect($response->getContent())->not->toContain('test-secret');
});

test('users can authorise only their own private channel', function () {
    useReverbConfig();
    // Channels register on the default broadcaster at boot, so re-register them
    // on the freshly selected reverb driver.
    require base_path('routes/channels.php');
    $user = User::factory()->create();
    $other = User::factory()->create();

    $this->actingAs($user)
        ->postJson('/broadcasting/auth', [
            'socket_id' => '123.456',
            'channel_name' => 'private-App.Models.User.'.$user->id,
        ])
        ->assertOk()
        ->assertJsonStructure(['auth']);

    $this->actingAs($user)
        ->postJson('/broadcasting/auth', [
            'socket_id' => '123.456',
            'channel_name' => 'private-App.Models.User.'.$other->id,
        ])
        ->assertForbidden();

});

test('guests cannot authorise a private channel', function () {
    useReverbConfig();
    require base_path('routes/channels.php');

    $this->postJson('/broadcasting/auth', [
        'socket_id' => '123.456',
        'channel_name' => 'private-App.Models.User.1',
    ])->assertForbidden();
});
