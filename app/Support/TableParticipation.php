<?php

namespace App\Support;

use Illuminate\Contracts\Session\Session;

/**
 * Remembers which capacity a signed-in user holds at a table, so an admin can
 * join a session as host OR as a player but never as both at once.
 */
class TableParticipation
{
    public const HOST = 'host';

    public const PLAYER = 'player';

    private const KEY = 'table_participation';

    public function __construct(private readonly Session $session) {}

    public function current(string $sessionId): ?string
    {
        return $this->session->get(self::KEY.'.'.$sessionId);
    }

    /**
     * Join in the given capacity. Returns false when the user already holds
     * the opposite capacity at this table.
     */
    public function join(string $sessionId, string $capacity): bool
    {
        $current = $this->current($sessionId);

        if ($current !== null && $current !== $capacity) {
            return false;
        }

        $this->session->put(self::KEY.'.'.$sessionId, $capacity);

        return true;
    }

    public function leave(string $sessionId): void
    {
        $this->session->forget(self::KEY.'.'.$sessionId);
    }
}
