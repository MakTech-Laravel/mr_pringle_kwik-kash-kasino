<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;

/**
 * Public announcement that the casino was opened or closed, so every open
 * browser updates at once.
 */
class CasinoStatusChanged implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets;

    public const CHANNEL = 'casino';

    public function __construct(public readonly bool $open) {}

    /**
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        return [new Channel(self::CHANNEL)];
    }

    public function broadcastAs(): string
    {
        return 'casino.status';
    }

    /**
     * @return array<string, bool>
     */
    public function broadcastWith(): array
    {
        return ['open' => $this->open];
    }
}
