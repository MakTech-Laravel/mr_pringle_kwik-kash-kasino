import { Head, Link } from '@inertiajs/react';
import { ChevronRight, Clock, Users } from 'lucide-react';
import ActionButton from '@/components/casino/action-button';
import CasinoClosed from '@/components/casino/casino-closed';
import GameArt from '@/components/casino/game-art';
import PageHeader from '@/components/casino/page-header';
import StatusPill from '@/components/casino/status-pill';
import { useCasinoOpen } from '@/hooks/use-casino-status';
import { gameMeta } from '@/mocks/casino';
import { sessions } from '@/routes/lobby';
import type { GameKind } from '@/types/casino';

const order: GameKind[] = ['blackjack', 'poker', 'roulette'];

export default function Lobby() {
    const open = useCasinoOpen();

    if (!open) {
        return (
            <>
                <Head title="Casino closed" />
                <CasinoClosed />
            </>
        );
    }

    return (
        <>
            <Head title="Casino lobby" />
            <div className="space-y-6 lg:space-y-8">
                <PageHeader
                    eyebrow="Casino lobby"
                    title="Choose your game"
                    description="Explore available casino sessions."
                    actions={
                        <StatusPill tone="success">Casino open</StatusPill>
                    }
                />
                <div className="space-y-5">
                    {order.map((game, index) => {
                        const meta = gameMeta[game];

                        return (
                            <article
                                key={game}
                                className="kk-panel relative grid overflow-hidden md:grid-cols-[1fr_1.1fr]"
                            >
                                <div className="relative">
                                    <GameArt
                                        game={game}
                                        className="h-44 md:h-full md:min-h-[270px]"
                                    />
                                    <span className="absolute bottom-3 left-3 rounded border border-border bg-black/40 px-2 py-1 text-[9px] font-semibold tracking-[0.2em] text-ink-muted uppercase">
                                        Live table
                                    </span>
                                </div>
                                <div className="relative flex flex-col justify-center p-5 sm:p-8">
                                    <span
                                        aria-hidden
                                        className="absolute top-4 right-6 font-display text-5xl text-white/[0.05]"
                                    >
                                        0{index + 1}
                                    </span>
                                    <StatusPill
                                        tone={
                                            game === 'poker'
                                                ? 'success'
                                                : 'warning'
                                        }
                                        className="self-start"
                                    >
                                        {meta.sessions} session
                                        {meta.sessions > 1 ? 's' : ''} available
                                    </StatusPill>
                                    <h2 className="kk-title mt-3 text-3xl text-ink">
                                        {meta.name}
                                    </h2>
                                    <p className="mt-3 text-sm text-ink-muted">
                                        {meta.blurb}
                                    </p>
                                    <p className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink-muted">
                                        <span className="flex items-center gap-1.5">
                                            <Users className="size-3.5" />
                                            {meta.tag}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Clock className="size-3.5" />
                                            Sessions running now
                                        </span>
                                    </p>
                                    <ActionButton
                                        asChild
                                        className="mt-6 h-11 self-start px-6"
                                    >
                                        <Link
                                            href={sessions({ query: { game } })}
                                        >
                                            View sessions <ChevronRight />
                                        </Link>
                                    </ActionButton>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
