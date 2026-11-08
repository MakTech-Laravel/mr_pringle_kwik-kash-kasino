import { usePage } from '@inertiajs/react';
import { useCasinoOpen } from '@/hooks/use-casino-status';
import { adminSessions, gameSessions } from '@/mocks/casino';
import type { Auth } from '@/types';
import type { GameKind, GameSession } from '@/types/casino';

export type TableMode = 'host' | 'player';

/**
 * Resolves the table's session and the viewer's capacity at it. The server
 * decides `mode` (players always sit; an admin joins as host or as a player,
 * never both). Seam: replace the lookup with the session payload from the API.
 */
export function useGameSession(
    game: GameKind,
    sessionId: string,
    mode: TableMode,
) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const casinoOpen = useCasinoOpen();

    const found =
        [...gameSessions, ...adminSessions].find((s) => s.id === sessionId) ??
        null;

    const session: GameSession = found ?? {
        id: sessionId,
        game,
        title: 'Hosted table',
        hostName: 'Casino Host',
        hostUsername: 'admin',
        seated: 1,
        capacity: 6,
        status: 'active',
    };

    return {
        session,
        casinoOpen,
        user: auth.user,
        mode,
        /** Hosting admins see host controls and never take a seat. */
        isHost: mode === 'host',
    };
}
