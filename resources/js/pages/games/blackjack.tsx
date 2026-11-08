import { Head } from '@inertiajs/react';
import CasinoClosed from '@/components/casino/casino-closed';
import BlackjackTable from '@/components/games/blackjack-table';
import GameShell from '@/components/games/game-shell';
import { useBlackjack } from '@/hooks/games/use-blackjack';
import { useGameSession } from '@/hooks/games/use-game-session';
import { playerWallet } from '@/mocks/casino';

export default function Blackjack({
    sessionId,
    mode,
}: {
    sessionId: string;
    mode: 'host' | 'player';
}) {
    const { session, casinoOpen, user, isHost } = useGameSession(
        'blackjack',
        sessionId,
        mode,
    );
    const game = useBlackjack({
        startingBalance: playerWallet.balance,
        autoHost: !isHost,
    });

    if (!casinoOpen) {
        return <CasinoClosed />;
    }

    const phase = game.state.phase;
    const label =
        phase === 'betting'
            ? 'Betting open'
            : phase === 'waiting-host'
              ? 'Waiting for host'
              : phase === 'settled'
                ? 'Round complete'
                : 'Round in progress';

    return (
        <>
            <Head title="Classic Blackjack" />
            <GameShell
                session={session}
                title="Classic Blackjack"
                statusLabel={label}
                statusTone={phase === 'waiting-host' ? 'danger' : 'success'}
                isHost={isHost}
                adminPlayer={user.role === 'admin'}
                footnote="Cards, payouts and balance changes on this table are not recorded yet. Rules and settlement run on the server."
            >
                <BlackjackTable
                    game={game}
                    username={user.username}
                    isHost={isHost}
                />
            </GameShell>
        </>
    );
}
