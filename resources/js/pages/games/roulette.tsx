import { Head } from '@inertiajs/react';
import CasinoClosed from '@/components/casino/casino-closed';
import GameShell from '@/components/games/game-shell';
import RouletteTable from '@/components/games/roulette-table';
import { useGameSession } from '@/hooks/games/use-game-session';
import { useRoulette } from '@/hooks/games/use-roulette';
import { demoWallet } from '@/mocks/casino';

export default function Roulette({ sessionId }: { sessionId: string }) {
    const { session, casinoOpen, isHost } = useGameSession(
        'roulette',
        sessionId,
    );
    const game = useRoulette({
        startingBalance: demoWallet.balance,
        autoHost: !isHost,
    });

    if (!casinoOpen) {
        return <CasinoClosed />;
    }

    const { phase, countdown } = game.state;
    const label =
        phase === 'betting'
            ? `Bets close in ${countdown}s`
            : phase === 'waiting-host'
              ? 'Waiting for host'
              : phase === 'spinning'
                ? 'No more bets'
                : 'Round complete';

    return (
        <>
            <Head title="Classic Roulette" />
            <GameShell
                session={session}
                title="Classic Roulette"
                statusLabel={label}
                statusTone={phase === 'waiting-host' ? 'danger' : 'success'}
                isHost={isHost}
                footnote="Demo table: the winning number follows a fixed script in your browser. Real outcomes, variant and payouts are decided and settled on the server."
            >
                <RouletteTable game={game} isHost={isHost} />
            </GameShell>
        </>
    );
}
