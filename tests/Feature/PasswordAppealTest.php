<?php

use App\Enums\AppealStatus;
use App\Mail\PasswordAppealCode;
use App\Models\PasswordAppeal;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Inertia\Testing\AssertableInertia as Assert;

function fileAppeal(object $test, string $username = 'lostplayer', string $email = 'lost@example.com'): string
{
    $code = null;

    $test->post(route('password-appeal.store'), [
        'username' => $username,
        'email' => $email,
        'message' => 'It is really me',
    ])->assertRedirect(route('password-appeal.create'));

    Mail::assertSent(PasswordAppealCode::class, function (PasswordAppealCode $mail) use (&$code) {
        $code = $mail->code;

        return true;
    });

    return $code;
}

test('there is no email password reset route', function () {
    expect(Route::has('password.request'))->toBeFalse();
    expect(Route::has('password.email'))->toBeFalse();
    expect(Route::has('password.reset'))->toBeFalse();
});

test('the appeal form renders for guests', function () {
    $this->get(route('password-appeal.create'))
        ->assertInertia(fn (Assert $page) => $page->component('auth/password-appeal')->where('step', 'form'));
});

test('filing an appeal emails a code and moves to the verify step', function () {
    Mail::fake();
    User::factory()->create(['username' => 'lostplayer']);

    fileAppeal($this);

    $appeal = PasswordAppeal::sole();

    expect($appeal->status)->toBe(AppealStatus::Unverified)
        ->and($appeal->user_id)->not->toBeNull()
        ->and($appeal->verification_code_hash)->not->toBeNull();

    $this->get(route('password-appeal.create'))
        ->assertInertia(fn (Assert $page) => $page->where('step', 'verify')->where('email', 'lost@example.com'));
});

test('an unknown username gets the same flow so accounts cannot be probed', function () {
    Mail::fake();

    fileAppeal($this, 'nobodyhere');

    expect(PasswordAppeal::sole()->user_id)->toBeNull();
});

test('appeal input is validated', function () {
    Mail::fake();

    $this->post(route('password-appeal.store'), ['username' => 'a b', 'email' => 'nope'])
        ->assertSessionHasErrors(['username', 'email']);

    Mail::assertNothingSent();
});

test('a correct code verifies the email and exposes the appeal to admins', function () {
    Mail::fake();
    User::factory()->create(['username' => 'lostplayer']);
    $code = fileAppeal($this);

    $this->post(route('password-appeal.verify'), ['code' => $code])
        ->assertRedirect(route('password-appeal.sent'));

    $appeal = PasswordAppeal::sole();

    expect($appeal->status)->toBe(AppealStatus::Pending)
        ->and($appeal->email_verified_at)->not->toBeNull()
        ->and($appeal->verification_code_hash)->toBeNull();
});

test('a wrong code is refused and counted, and too many attempts abandon the appeal', function () {
    Mail::fake();
    $code = fileAppeal($this);
    $wrong = $code === '000000' ? '111111' : '000000';

    foreach (range(1, PasswordAppeal::MAX_CODE_ATTEMPTS) as $ignored) {
        $this->post(route('password-appeal.verify'), ['code' => $wrong])->assertSessionHasErrors('code');
    }

    expect(PasswordAppeal::sole()->verification_attempts)->toBe(PasswordAppeal::MAX_CODE_ATTEMPTS);

    $this->post(route('password-appeal.verify'), ['code' => $code])->assertSessionHasErrors('code');

    expect(PasswordAppeal::count())->toBe(0);
});

test('an expired code is refused', function () {
    Mail::fake();
    $code = fileAppeal($this);

    $this->travel(PasswordAppeal::CODE_TTL_MINUTES + 1)->minutes();

    $this->post(route('password-appeal.verify'), ['code' => $code])->assertSessionHasErrors('code');
    expect(PasswordAppeal::sole()->status)->toBe(AppealStatus::Unverified);
});

test('only three codes per email per hour can be requested', function () {
    Mail::fake();

    foreach (range(1, 3) as $i) {
        $this->post(route('password-appeal.store'), ['username' => "player{$i}", 'email' => 'spam@example.com'])
            ->assertRedirect();
    }

    $this->post(route('password-appeal.store'), ['username' => 'player9', 'email' => 'spam@example.com'])
        ->assertStatus(429);
});

test('only admins can review appeals and unverified ones stay hidden', function () {
    PasswordAppeal::factory()->create(['username' => 'visible']);
    PasswordAppeal::factory()->unverified()->create(['username' => 'hidden']);

    $this->get(route('admin.password-appeals.index'))->assertRedirect(route('login'));
    $this->actingAs(User::factory()->create())->get(route('admin.password-appeals.index'))->assertForbidden();

    $this->actingAs(User::factory()->admin()->create())
        ->get(route('admin.password-appeals.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/password-appeals')
            ->has('appeals', 1)
            ->where('appeals.0.username', 'visible')
            ->where('pendingAppeals', 1));
});

test('an admin generates a one-time link that lets the player set a new password', function () {
    $player = User::factory()->create(['username' => 'lostplayer']);
    $appeal = PasswordAppeal::factory()->create(['username' => 'lostplayer', 'user_id' => $player->id]);
    $admin = User::factory()->admin()->create();

    $url = $this->actingAs($admin)
        ->postJson(route('admin.password-appeals.link', $appeal))
        ->assertOk()
        ->json('url');

    $token = basename(parse_url($url, PHP_URL_PATH));
    $appeal->refresh();

    expect($appeal->reset_token_hash)->not->toBe($token)->and($appeal->reviewed_by)->toBe($admin->id);

    auth()->logout();

    $this->get(route('password-appeal.reset', $token))
        ->assertInertia(fn (Assert $page) => $page->component('auth/reset-with-link')->where('valid', true)->where('username', 'lostplayer'));

    $this->post(route('password-appeal.reset.update', $token), [
        'password' => 'brand-new-secret-1',
        'password_confirmation' => 'brand-new-secret-1',
    ])->assertRedirect(route('login'));

    expect(Hash::check('brand-new-secret-1', $player->refresh()->password))->toBeTrue()
        ->and($appeal->refresh()->status)->toBe(AppealStatus::Resolved);

    // The link works exactly once.
    $this->get(route('password-appeal.reset', $token))
        ->assertInertia(fn (Assert $page) => $page->where('valid', false));
    $this->post(route('password-appeal.reset.update', $token), [
        'password' => 'another-secret-22',
        'password_confirmation' => 'another-secret-22',
    ])->assertRedirect(route('password-appeal.reset', $token));
    expect(Hash::check('brand-new-secret-1', $player->refresh()->password))->toBeTrue();
});

test('an expired reset link is rejected', function () {
    $player = User::factory()->create();
    $appeal = PasswordAppeal::factory()->create(['user_id' => $player->id]);
    $token = $appeal->issueResetToken();

    $this->travel(PasswordAppeal::RESET_TTL_HOURS + 1)->hours();

    $this->get(route('password-appeal.reset', $token))
        ->assertInertia(fn (Assert $page) => $page->where('valid', false));
});

test('an admin can set a temporary password instead', function () {
    $player = User::factory()->create();
    $appeal = PasswordAppeal::factory()->create(['user_id' => $player->id]);

    $password = $this->actingAs(User::factory()->admin()->create())
        ->postJson(route('admin.password-appeals.temporary-password', $appeal))
        ->assertOk()
        ->json('password');

    expect(Hash::check($password, $player->refresh()->password))->toBeTrue()
        ->and($appeal->refresh()->status)->toBe(AppealStatus::Resolved);
});

test('appeals without a matching account or for admins cannot be acted on', function () {
    $admin = User::factory()->admin()->create();
    $orphan = PasswordAppeal::factory()->create(['user_id' => null]);
    $adminAppeal = PasswordAppeal::factory()->create(['user_id' => User::factory()->admin()->create()->id]);

    foreach ([$orphan, $adminAppeal] as $appeal) {
        $this->actingAs($admin)->postJson(route('admin.password-appeals.link', $appeal))->assertStatus(422);
        $this->actingAs($admin)->postJson(route('admin.password-appeals.temporary-password', $appeal))->assertStatus(422);
    }
});

test('players cannot hit the admin appeal actions', function () {
    $appeal = PasswordAppeal::factory()->create(['user_id' => User::factory()->create()->id]);

    $this->actingAs(User::factory()->create())
        ->postJson(route('admin.password-appeals.link', $appeal))
        ->assertForbidden();
});

test('an admin can reject or resolve an appeal', function () {
    $admin = User::factory()->admin()->create();
    $one = PasswordAppeal::factory()->create();
    $two = PasswordAppeal::factory()->create();

    $this->actingAs($admin)->post(route('admin.password-appeals.reject', $one))->assertRedirect();
    $this->actingAs($admin)->post(route('admin.password-appeals.resolve', $two))->assertRedirect();

    expect($one->refresh()->status)->toBe(AppealStatus::Rejected)
        ->and($two->refresh()->status)->toBe(AppealStatus::Resolved);
});
