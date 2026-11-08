<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

/**
 * Small key/value store for site-wide switches that admins change at runtime.
 *
 * @property string $key
 * @property mixed $value
 */
#[Fillable(['key', 'value'])]
class Setting extends Model
{
    public const CASINO_OPEN = 'casino.open';

    public $incrementing = false;

    protected $primaryKey = 'key';

    protected $keyType = 'string';

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return ['value' => 'json'];
    }

    public static function read(string $key, mixed $default = null): mixed
    {
        $setting = static::query()->find($key);

        return $setting === null ? $default : $setting->value;
    }

    public static function write(string $key, mixed $value): void
    {
        static::query()->updateOrCreate(['key' => $key], ['value' => $value]);
    }

    /**
     * Whether players may currently join sessions. The casino is open until an admin closes it.
     */
    public static function casinoIsOpen(): bool
    {
        return (bool) static::read(self::CASINO_OPEN, true);
    }
}
