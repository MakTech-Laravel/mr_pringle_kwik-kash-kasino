<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;

/**
 * A private notification for one user; the browser shows it as a toast.
 */
class UserNotified implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets;

    /**
     * @param  'success'|'info'|'warning'|'error'  $type
     */
    public function __construct(
        public readonly int $userId,
        public readonly string $title,
        public readonly ?string $body = null,
        public readonly string $type = 'info',
    ) {}

    public static function to(User $user, string $title, ?string $body = null, string $type = 'info'): static
    {
        return new static($user->id, $title, $body, $type);
    }

    /**
     * @return array<int, PrivateChannel>
     */
    public function broadcastOn(): array
    {
        return [new PrivateChannel(RealtimePrivateTestEvent::channelFor($this->userId))];
    }

    public function broadcastAs(): string
    {
        return 'notification';
    }

    /**
     * @return array<string, string|null>
     */
    public function broadcastWith(): array
    {
        return ['title' => $this->title, 'body' => $this->body, 'type' => $this->type];
    }
}
