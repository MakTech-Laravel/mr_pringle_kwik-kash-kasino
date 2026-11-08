import type { GameSession, SessionStatus } from '@/types/casino';
import type { PillTone } from '@/components/casino/status-pill';

/**
 * Hosting is a per-session Admin duty. An admin may open Player View but must
 * never be seated as a player in a session they host.
 */
export function canJoinAsPlayer(
    session: GameSession,
    user: { username: string },
): boolean {
    return (
        session.hostUsername !== user.username &&
        session.status !== 'full' &&
        session.status !== 'in-progress' &&
        session.seated < session.capacity
    );
}

export function joinBlockedReason(
    session: GameSession,
    user: { username: string },
): string | null {
    if (session.hostUsername === user.username) {
        return 'You are hosting this session';
    }

    if (session.seated >= session.capacity || session.status === 'full') {
        return 'Session full';
    }

    if (session.status === 'in-progress') {
        return 'In progress';
    }

    return null;
}

export const statusLabel: Record<SessionStatus, string> = {
    'waiting-players': 'Waiting for players',
    'waiting-host': 'Waiting for host',
    betting: 'Betting',
    'in-progress': 'In progress',
    full: 'Full',
    active: 'Active',
    completed: 'Completed',
    cancelled: 'Cancelled',
};

export const statusTone: Record<SessionStatus, PillTone> = {
    'waiting-players': 'success',
    'waiting-host': 'danger',
    betting: 'success',
    'in-progress': 'neutral',
    full: 'neutral',
    active: 'success',
    completed: 'success',
    cancelled: 'danger',
};
