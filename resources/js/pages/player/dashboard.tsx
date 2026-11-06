import { Head, Link, usePage } from '@inertiajs/react';
import { ChevronRight, Plus, Users } from 'lucide-react';
import ActionButton from '@/components/casino/action-button';
import BalanceCard from '@/components/casino/balance-card';
import GameCard from '@/components/casino/game-card';
import StatusPill from '@/components/casino/status-pill';
import { useCasinoOpen } from '@/hooks/use-casino-status';
import { formatNumber, formatSignedCredits } from '@/lib/format';
import {
    canJoinAsPlayer,
    joinBlockedReason,
    statusLabel,
    statusTone,
} from '@/lib/sessions';
import { cn } from '@/lib/utils';
import {
    demoCasino,
    demoWallet,
    gameSessions,
    recentActivity,
} from '@/mocks/casino';
import { history } from '@/routes';
import { show as showGame } from '@/routes/games';
import { index as lobbyIndex, sessions as lobbySessions } from '@/routes/lobby';
import { cashIn, cashOut } from '@/routes/wallet';
import type { Auth } from '@/types';

const sessionBadge = { poker: 'K♦', blackjack: 'A♠', roulette: 'R' } as const;

export default function Dashboard() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const casinoOpen = useCasinoOpen();
    const sessions = gameSessions
        .filter((s) => s.game !== 'roulette')
        .slice(0, 2);

    return (
        <>
            <Head title="Dashboard" />

            <div className="space-y-8 lg:space-y-10">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                        <p className="kk-eyebrow mb-3">Player dashboard</p>
                        <h1 className="kk-title text-[26px] leading-tight text-ink sm:text-4xl lg:text-[44px]">
                            Welcome back,{' '}
                            <span className="[overflow-wrap:anywhere] text-gold">
                                {auth.user.username}.
                            </span>
                        </h1>
                        <p className="mt-3 text-sm text-ink-muted">
                            {casinoOpen
                                ? 'The tables are open. Ready for your next game?'
                                : 'The casino is closed for now. Your wallet and history stay available.'}
                        </p>
                    </div>
                    <div
                        className={cn(
                            'inline-flex shrink-0 items-center gap-3 self-start rounded-lg border px-4 py-2.5 text-xs',
                            casinoOpen
                                ? 'border-success/30 bg-success/5'
                                : 'border-crimson/40 bg-crimson/10',
                        )}
                    >
                        <span
                            className={cn(
                                'flex items-center gap-2 font-semibold tracking-[0.14em] uppercase',
                                casinoOpen
                                    ? 'text-success-light'
                                    : 'text-danger-light',
                            )}
                        >
                            <span
                                aria-hidden
                                className="size-2 rounded-full bg-current"
                            />
                            {casinoOpen ? 'Casino open' : 'Casino closed'}
                        </span>
                        {casinoOpen && (
                            <span className="border-l border-border pl-3 text-ink-muted">
                                {demoCasino.liveTables} tables live
                            </span>
                        )}
                    </div>
                </header>

                <BalanceCard
                    balance={demoWallet.balance}
                    caption="Illustrative balance · Last updated just now"
                    actions={
                        <>
                            <ActionButton asChild className="h-11 px-5">
                                <Link href={cashIn()}>
                                    Request credits <Plus />
                                </Link>
                            </ActionButton>
                            <ActionButton
                                asChild
                                look="outline"
                                className="h-11 px-5"
                            >
                                <Link href={cashOut()}>
                                    Cash out <ChevronRight />
                                </Link>
                            </ActionButton>
                        </>
                    }
                    footer={
                        <>
                            <p className="text-ink-muted">
                                <span className="text-[11px] font-semibold tracking-[0.12em] uppercase">
                                    Pending cash-in
                                </span>{' '}
                                <span className="ml-2 font-semibold text-ink">
                                    {formatNumber(demoWallet.pendingCashIn)} CR
                                </span>
                            </p>
                            <p className="text-ink-muted">
                                <span className="text-[11px] font-semibold tracking-[0.12em] uppercase">
                                    Pending cash-out
                                </span>{' '}
                                <span className="ml-2 font-semibold text-ink">
                                    {formatNumber(demoWallet.pendingCashOut)} CR
                                </span>
                            </p>
                        </>
                    }
                />

                <section aria-labelledby="floor-heading">
                    <div className="mb-5 flex items-end justify-between gap-4">
                        <div>
                            <p className="kk-eyebrow mb-2">The casino floor</p>
                            <h2
                                id="floor-heading"
                                className="kk-title text-2xl text-ink"
                            >
                                Choose your game
                            </h2>
                        </div>
                        <Link
                            href={lobbyIndex()}
                            className="flex items-center gap-1 text-xs text-ink-muted hover:text-ink"
                        >
                            View all games <ChevronRight className="size-3.5" />
                        </Link>
                    </div>
                    <div className="grid gap-5 md:grid-cols-3">
                        <GameCard game="blackjack" disabled={!casinoOpen} />
                        <GameCard game="poker" disabled={!casinoOpen} />
                        <GameCard game="roulette" disabled={!casinoOpen} />
                    </div>
                </section>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
                    <section
                        className="kk-panel"
                        aria-labelledby="sessions-heading"
                    >
                        <div className="flex items-start justify-between border-b border-border p-5">
                            <div>
                                <p className="kk-eyebrow mb-2">Live now</p>
                                <h2
                                    id="sessions-heading"
                                    className="kk-title text-xl text-ink"
                                >
                                    Active sessions
                                </h2>
                            </div>
                            <Link
                                href={lobbySessions()}
                                className="text-xs text-ink-muted hover:text-ink"
                            >
                                See all
                            </Link>
                        </div>
                        <ul>
                            {sessions.map((session) => {
                                const blocked = joinBlockedReason(
                                    session,
                                    auth.user,
                                );
                                const joinable =
                                    casinoOpen &&
                                    canJoinAsPlayer(session, auth.user);

                                return (
                                    <li
                                        key={session.id}
                                        className="flex flex-wrap items-center gap-3 border-b border-border p-4 last:border-b-0 sm:gap-4 sm:px-5"
                                    >
                                        <span
                                            className={cn(
                                                'flex size-11 shrink-0 items-center justify-center rounded-lg border font-display text-sm font-semibold',
                                                session.game === 'poker'
                                                    ? 'border-success/40 bg-success/10 text-ink'
                                                    : 'border-crimson/40 bg-crimson/15 text-ink',
                                            )}
                                        >
                                            {sessionBadge[session.game]}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-ink">
                                                {session.title}
                                            </p>
                                            <p className="truncate text-[11px] text-ink-muted">
                                                Hosted by {session.hostName}
                                            </p>
                                        </div>
                                        <span className="hidden items-center gap-1.5 text-[11px] text-ink-muted sm:flex">
                                            <Users className="size-3.5" />
                                            {session.seated} /{' '}
                                            {session.capacity} players
                                        </span>
                                        <StatusPill
                                            tone={statusTone[session.status]}
                                        >
                                            {statusLabel[session.status]}
                                        </StatusPill>
                                        {joinable ? (
                                            <ActionButton
                                                asChild
                                                className="h-9 px-4 text-xs"
                                            >
                                                <Link
                                                    href={showGame({
                                                        game: session.game,
                                                        session: session.id,
                                                    })}
                                                >
                                                    Join table
                                                </Link>
                                            </ActionButton>
                                        ) : (
                                            <ActionButton
                                                disabled
                                                className="h-9 px-4 text-xs"
                                                title={
                                                    blocked ?? 'Casino closed'
                                                }
                                            >
                                                {blocked ?? 'Unavailable'}
                                            </ActionButton>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </section>

                    <section
                        className="kk-panel"
                        aria-labelledby="activity-heading"
                    >
                        <div className="flex items-start justify-between border-b border-border p-5">
                            <div>
                                <p className="kk-eyebrow mb-2">Recent</p>
                                <h2
                                    id="activity-heading"
                                    className="kk-title text-xl text-ink"
                                >
                                    Player activity
                                </h2>
                            </div>
                            <Link
                                href={history()}
                                className="text-xs text-ink-muted hover:text-ink"
                            >
                                History
                            </Link>
                        </div>
                        <ul>
                            {recentActivity.map((item) => (
                                <li
                                    key={item.id}
                                    className="flex items-center gap-3 border-b border-border p-4 last:border-b-0 sm:px-5"
                                >
                                    <span
                                        className={cn(
                                            'flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                                            item.amount > 0
                                                ? 'bg-success/15 text-success-light'
                                                : 'bg-crimson/20 text-danger-light',
                                        )}
                                    >
                                        {item.letter}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-ink">
                                            {item.title}
                                        </p>
                                        <p className="text-[11px] text-ink-muted">
                                            {item.when}
                                        </p>
                                    </div>
                                    <span
                                        className={cn(
                                            'text-sm font-semibold',
                                            item.amount > 0
                                                ? 'text-success-light'
                                                : 'text-danger-light',
                                        )}
                                    >
                                        {formatSignedCredits(item.amount)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>
            </div>
        </>
    );
}
