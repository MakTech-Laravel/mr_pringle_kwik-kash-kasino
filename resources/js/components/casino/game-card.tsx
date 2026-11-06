import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import GameArt from '@/components/casino/game-art';
import StatusPill from '@/components/casino/status-pill';
import ActionButton from '@/components/casino/action-button';
import { gameMeta } from '@/mocks/casino';
import { sessions as lobbySessions } from '@/routes/lobby';
import type { GameKind } from '@/types/casino';

type Props = {
    game: GameKind;
    disabled?: boolean;
};

/** Dashboard tile: art, availability pill, blurb and "View game". */
export default function GameCard({ game, disabled = false }: Props) {
    const meta = gameMeta[game];
    const label =
        game === 'poker' ? `${meta.sessions} sessions` : 'Available now';

    return (
        <article className="kk-panel flex flex-col overflow-hidden">
            <div className="relative">
                <GameArt game={game} className="h-40" />
                <span className="absolute bottom-3 left-3 rounded border border-border bg-black/40 px-2 py-1 text-[9px] font-semibold tracking-[0.2em] text-ink-muted uppercase">
                    Live table
                </span>
            </div>
            <div className="flex flex-1 flex-col p-5">
                <StatusPill
                    tone={game === 'poker' ? 'success' : 'warning'}
                    className="self-start"
                >
                    {label}
                </StatusPill>
                <h3 className="kk-title mt-3 text-2xl text-ink">{meta.name}</h3>
                <p className="mt-2 min-h-10 text-sm text-ink-muted">
                    {meta.blurb}
                </p>
                <ActionButton
                    asChild
                    look="outline"
                    className="mt-5 w-full justify-between"
                    disabled={disabled}
                >
                    <Link href={lobbySessions({ query: { game } })}>
                        View game <ChevronRight />
                    </Link>
                </ActionButton>
            </div>
        </article>
    );
}
