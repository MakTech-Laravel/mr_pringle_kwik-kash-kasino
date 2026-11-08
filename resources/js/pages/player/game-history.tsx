import { Head } from '@inertiajs/react';
import { ChevronRight, SlidersHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';
import GameArt from '@/components/casino/game-art';
import PageHeader from '@/components/casino/page-header';
import StatusPill from '@/components/casino/status-pill';
import { FilterChip } from '@/components/casino/filter-bar';
import { formatCredits, formatSignedCredits } from '@/lib/format';
import { cn } from '@/lib/utils';
import { gameHistory } from '@/mocks/casino';
import type { GameKind } from '@/types/casino';

const filters: { id: GameKind | 'all'; label: string }[] = [
    { id: 'all', label: 'All games' },
    { id: 'blackjack', label: 'Blackjack' },
    { id: 'poker', label: 'Poker' },
    { id: 'roulette', label: 'Roulette' },
];

const gameName: Record<GameKind, string> = {
    blackjack: 'Blackjack',
    poker: 'Poker',
    roulette: 'Roulette',
};

export default function GameHistory() {
    const [game, setGame] = useState<GameKind | 'all'>('all');
    const rows = useMemo(
        () => gameHistory.filter((h) => game === 'all' || h.game === game),
        [game],
    );

    return (
        <>
            <Head title="Game history" />
            <div className="space-y-6">
                <PageHeader
                    eyebrow="Player record"
                    title="Game history"
                    description="Review your recent sessions and net results."
                />
                <div className="kk-panel flex flex-wrap items-center gap-2 p-3 sm:p-4">
                    {filters.map((f) => (
                        <FilterChip
                            key={f.id}
                            active={game === f.id}
                            onClick={() => setGame(f.id)}
                        >
                            {f.label}
                        </FilterChip>
                    ))}
                    <span className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border px-4 text-xs text-ink-muted">
                        <SlidersHorizontal className="size-3.5" /> Last 30 days
                    </span>
                </div>

                {rows.length === 0 ? (
                    <div className="kk-panel p-10 text-center text-sm text-ink-muted">
                        No games in this category yet.
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {rows.map((h) => (
                            <li
                                key={h.id}
                                className="kk-panel grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-3 p-4 md:grid-cols-[auto_1.4fr_1fr_1fr_1fr_auto] md:px-5"
                            >
                                <GameArt
                                    game={h.game}
                                    className="size-12 rounded-lg [&>div:last-child]:scale-[0.35]"
                                />
                                <div className="min-w-0">
                                    <p className="text-[11px] text-ink-muted">
                                        {gameName[h.game]}
                                    </p>
                                    <p className="text-sm font-semibold text-ink">
                                        {h.session}
                                    </p>
                                    <p className="text-[11px] text-ink-muted/80">
                                        {h.date}
                                    </p>
                                </div>
                                <ChevronRight className="size-4 text-ink-muted md:order-last" />
                                <div className="col-span-3 grid grid-cols-3 gap-3 md:contents">
                                    <div>
                                        <p className="text-[10px] text-ink-muted">
                                            Bet amount
                                        </p>
                                        <p className="mt-1 text-xs font-semibold text-ink">
                                            {formatCredits(h.bet)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-ink-muted">
                                            Result
                                        </p>
                                        <StatusPill
                                            tone={
                                                h.result === 'won'
                                                    ? 'success'
                                                    : 'danger'
                                            }
                                            dot={false}
                                            className="mt-1"
                                        >
                                            {h.result}
                                        </StatusPill>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-ink-muted">
                                            Net result
                                        </p>
                                        <p
                                            className={cn(
                                                'mt-1 text-xs font-semibold',
                                                h.net > 0
                                                    ? 'text-success-light'
                                                    : 'text-danger-light',
                                            )}
                                        >
                                            {formatSignedCredits(h.net)}
                                        </p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </>
    );
}
