<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Models\Activity;

/**
 * One place that writes the admin audit trail (spatie/laravel-activitylog).
 * Never put passwords, tokens or reset links in the properties.
 */
class AdminAudit
{
    public const LOG = 'admin';

    /**
     * @param  array<string, scalar|null>  $properties
     */
    public static function record(User $admin, string $action, string $description, ?Model $subject = null, array $properties = []): void
    {
        $logger = activity(self::LOG)
            ->causedBy($admin)
            ->event($action)
            ->withProperties($properties);

        if ($subject !== null) {
            $logger->performedOn($subject);
        }

        $logger->log($description);
    }

    public static function query(): Builder
    {
        return Activity::query()->where('log_name', self::LOG);
    }
}
