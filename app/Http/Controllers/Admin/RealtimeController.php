<?php

namespace App\Http\Controllers\Admin;

use App\Events\RealtimePrivateTestEvent;
use App\Events\ReverbPingEvent;
use App\Http\Controllers\Controller;
use App\Support\RealtimeDiagnostics;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

/**
 * Admin-only console for verifying Backend -> Reverb -> Browser delivery over
 * a public channel and an authenticated private channel, plus Redis health.
 */
class RealtimeController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/realtime');
    }

    /**
     * Dispatch a public broadcast. A failure here means the Laravel -> Reverb
     * HTTP leg is broken, which is reported separately from browser delivery.
     */
    public function ping(Request $request): JsonResponse
    {
        $request->validate(['message' => ['nullable', 'string', 'max:120']]);

        $event = new ReverbPingEvent(
            message: (string) $request->input('message', 'Hello from Kwik Kash'),
            triggeredAt: now()->toIso8601String(),
        );

        return $this->dispatch($event, ReverbPingEvent::CHANNEL, 'ping');
    }

    /**
     * Dispatch a private broadcast to the signed-in user's own channel.
     */
    public function privateTest(Request $request): JsonResponse
    {
        $event = new RealtimePrivateTestEvent(
            userId: $request->user()->id,
            message: 'Private signal at '.now()->toIso8601String(),
            triggeredAt: now()->toIso8601String(),
        );

        return $this->dispatch($event, 'private-'.RealtimePrivateTestEvent::channelFor($request->user()), 'realtime.test');
    }

    /**
     * Effective broadcasting target and Redis status (no secrets).
     */
    public function health(RealtimeDiagnostics $diagnostics): JsonResponse
    {
        return response()->json([
            'broadcasting' => $diagnostics->broadcasting(),
            'redis' => $diagnostics->redis(),
        ]);
    }

    private function dispatch(object $event, string $channel, string $name): JsonResponse
    {
        try {
            broadcast($event);
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'dispatched' => false,
                'message' => 'Laravel could not reach the Reverb server: '.$e->getMessage(),
            ], 502);
        }

        return response()->json([
            'dispatched' => true,
            'channel' => $channel,
            'event' => $name,
            'payload' => $event->broadcastWith(),
        ]);
    }
}
