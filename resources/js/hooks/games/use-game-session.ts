import { usePage } from '@inertiajs/react';
import { useCasinoOpen } from '@/hooks/use-casino-status';
import { adminSessions, gameSessions } from '@/mocks/casino';
import type { Auth } from '@/types';
import type { GameKind, GameSession } from '@/types/casino';

/**
 * Resolves the table's session (DEMO sources) and the viewer's relationship
 * to it. Seam: replace the lookup with the session payload from the API.
 */
export function useGameSession(game: GameKind, sessionId: string) {
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
        hostUsername: 'demo_admin',
        seated: 1,
        capacity: 6,
        status: 'active',
    };

    return {
        session,
        casinoOpen,
        user: auth.user,
        /** Hosting admins view the table with host controls and never take a seat. */
        isHost: session.hostUsername === auth.user.username,
    };
}
