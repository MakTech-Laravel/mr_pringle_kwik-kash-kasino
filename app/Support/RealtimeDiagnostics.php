<?php

namespace App\Support;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Str;
use Throwable;

/**
 * Read-only deployment checks for the realtime console. Never exposes secrets.
 */
class RealtimeDiagnostics
{
    /**
     * The effective broadcasting target, without the secret.
     *
     * @return array<string, mixed>
     */
    public function broadcasting(): array
    {
        $connection = (string) config('broadcasting.default');
        $options = (array) config("broadcasting.connections.{$connection}.options", []);
        $key = (string) config("broadcasting.connections.{$connection}.key", '');

        return [
            'connection' => $connection,
            'host' => $options['host'] ?? null,
            'port' => $options['port'] ?? null,
            'scheme' => $options['scheme'] ?? null,
            'app_id' => config("broadcasting.connections.{$connection}.app_id"),
            'app_key_preview' => $key === '' ? null : Str::limit($key, 11, '...'),
            'has_secret' => (string) config("broadcasting.connections.{$connection}.secret", '') !== '',
        ];
    }

    /**
     * Which subsystems run on Redis, plus a live round trip when any do.
     *
     * @return array<string, mixed>
     */
    public function redis(): array
    {
        $usage = [
            'cache' => config('cache.default') === 'redis',
            'session' => config('session.driver') === 'redis',
            'queue' => config('queue.default') === 'redis',
        ];

        $result = [
            'client' => config('database.redis.client'),
            'extension_loaded' => extension_loaded('redis'),
            'host' => config('database.redis.default.host'),
            'port' => config('database.redis.default.port'),
            'usage' => $usage,
            'ok' => false,
            'latency_ms' => null,
            'error' => null,
        ];

        try {
            $startedAt = hrtime(true);

            $pong = Redis::connection('default')->ping();
            $probe = 'realtime-console:'.Str::random(8);
            Cache::store('redis')->put($probe, 'ok', 10);
            $roundTrip = Cache::store('redis')->pull($probe);

            $result['latency_ms'] = round((hrtime(true) - $startedAt) / 1_000_000, 1);
            $result['ok'] = $roundTrip === 'ok' && $pong !== false;
        } catch (Throwable $e) {
            $result['error'] = Str::limit($e->getMessage(), 200);
        }

        return $result;
    }
}
