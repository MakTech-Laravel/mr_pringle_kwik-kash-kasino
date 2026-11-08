<?php

namespace App\Models;

use App\Enums\AppealStatus;
use Database\Factories\PasswordAppealFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * A "forgot password" appeal. Accounts have no email on file, so a player
 * submits one here, proves they control it, and an admin follows up by hand.
 *
 * @property int $id
 * @property int|null $user_id
 * @property string $username
 * @property string $email
 * @property string|null $message
 * @property AppealStatus $status
 * @property string|null $verification_code_hash
 * @property Carbon|null $verification_expires_at
 * @property int $verification_attempts
 * @property Carbon|null $email_verified_at
 * @property string|null $reset_token_hash
 * @property Carbon|null $reset_expires_at
 * @property Carbon|null $reset_used_at
 * @property Carbon|null $reviewed_at
 * @property Carbon|null $created_at
 */
#[Fillable(['user_id', 'username', 'email', 'message', 'ip_address'])]
#[Hidden(['verification_code_hash', 'reset_token_hash'])]
class PasswordAppeal extends Model
{
    /** @use HasFactory<PasswordAppealFactory> */
    use HasFactory;

    public const CODE_TTL_MINUTES = 15;

    public const MAX_CODE_ATTEMPTS = 5;

    public const RESET_TTL_HOURS = 24;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => AppealStatus::class,
            'verification_expires_at' => 'datetime',
            'email_verified_at' => 'datetime',
            'reset_expires_at' => 'datetime',
            'reset_used_at' => 'datetime',
            'reviewed_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Create a fresh 6-digit code, store only its hash, and return the plain code.
     */
    public function issueVerificationCode(): string
    {
        $code = str_pad((string) random_int(0, 999_999), 6, '0', STR_PAD_LEFT);

        $this->forceFill([
            'verification_code_hash' => Hash::make($code),
            'verification_expires_at' => now()->addMinutes(self::CODE_TTL_MINUTES),
            'verification_attempts' => 0,
        ])->save();

        return $code;
    }

    public function codeMatches(string $code): bool
    {
        return $this->verification_code_hash !== null
            && $this->verification_expires_at?->isFuture() === true
            && Hash::check($code, $this->verification_code_hash);
    }

    /**
     * Create a one-time reset link token. Only a hash is persisted, so the
     * plain token exists solely in the response that shows it to the admin.
     */
    public function issueResetToken(): string
    {
        $token = Str::random(48);

        $this->forceFill([
            'reset_token_hash' => hash('sha256', $token),
            'reset_expires_at' => now()->addHours(self::RESET_TTL_HOURS),
            'reset_used_at' => null,
        ])->save();

        return $token;
    }

    public function resetLinkIsUsable(): bool
    {
        return $this->reset_token_hash !== null
            && $this->reset_used_at === null
            && $this->reset_expires_at?->isFuture() === true;
    }

    public static function findByResetToken(string $token): ?self
    {
        return self::query()->where('reset_token_hash', hash('sha256', $token))->first();
    }
}
