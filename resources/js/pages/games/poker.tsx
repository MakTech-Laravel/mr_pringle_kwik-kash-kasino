import { Head } from '@inertiajs/react';
import CasinoClosed from '@/components/casino/casino-closed';
import GameShell from '@/components/games/game-shell';
import PokerTable from '@/components/games/poker-table';
import { useGameSession } from '@/hooks/games/use-game-session';
import { usePoker } from '@/hooks/games/use-poker';
import { demoWallet } from '@/mocks/casino';

export default function Poker({
    sessionId,
    mode,
}: {
    sessionId: string;
    mode: 'host' | 'player';
}) {
    const { session, casinoOpen, user, isHost } = useGameSession(
        'poker',
        sessionId,
        mode,
    );
    const game = usePoker({
        human: !isHost,
        username: isHost ? 'Seat 1' : user.username,
        balance: demoWallet.balance,
    });

    if (!casinoOpen) {
        return <CasinoClosed />;
    }

    const { phase } = game.state;
    const label = game.myTurn
        ? 'Your turn'
        : phase === 'waiting'
          ? 'Waiting for host'
          : phase === 'showdown'
            ? 'Hand complete'
            : 'Hand in progress';

    return (
        <>
            <Head title="Multiplayer Poker" />
            <GameShell
                session={session}
                title="Multiplayer Poker"
                statusLabel={label}
                statusTone={phase === 'waiting' ? 'danger' : 'success'}
                isHost={isHost}
                adminPlayer={user.role === 'admin'}
                footnote="Demo table for 2–6 players: opponents are scripted and the showdown winner is not evaluated. Poker variant, rules and settlement are host-configured and server-side."
            >
                <PokerTable game={game} isHost={isHost} />
            </GameShell>
        </>
    );
}
