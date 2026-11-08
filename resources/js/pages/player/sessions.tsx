import { Head, Link, usePage } from '@inertiajs/react';
import { Shield } from 'lucide-react';
import { useMemo, useState } from 'react';
import ActionButton from '@/components/casino/action-button';
import CasinoClosed from '@/components/casino/casino-closed';
import DataTable, { type Column } from '@/components/casino/data-table';
import FilterBar, { FilterChip } from '@/components/casino/filter-bar';
import PageHeader from '@/components/casino/page-header';
import StatusPill from '@/components/casino/status-pill';
import { useCasinoOpen } from '@/hooks/use-casino-status';
import {
    canJoinAsPlayer,
    joinBlockedReason,
    statusLabel,
    statusTone,
} from '@/lib/sessions';
import { gameSessions } from '@/mocks/casino';
import { show as showGame } from '@/routes/games';
import { index as lobbyIndex } from '@/routes/lobby';
import type { Auth } from '@/types';
import type { GameKind, GameSession } from '@/types/casino';

const filters: { id: GameKind | 'all'; label: string }[] = [
    { id: 'all', label: 'All games' },
    { id: 'blackjack', label: 'Blackjack' },
    { id: 'poker', label: 'Poker' },
    { id: 'roulette', label: 'Roulette' },
];

const gameLabel: Record<GameKind, string> = {
    blackjack: 'Blackjack',
    poker: 'Multiplayer Poker',
    roulette: 'Roulette',
};

export default function Sessions() {
    const open = useCasinoOpen();
    const page = usePage<{ auth: Auth }>();
    const { auth } = page.props;
    const initial = new URLSearchParams(page.url.split('?')[1] ?? '').get(
        'game',
    );
    const [game, setGame] = useState<GameKind | 'all'>(
        filters.some((f) => f.id === initial) ? (initial as GameKind) : 'all',
    );
    const [search, setSearch] = useState('');

    const rows = useMemo(
        () =>
            gameSessions.filter(
                (s) =>
                    (game === 'all' || s.game === game) &&
                    `${s.id} ${s.hostName} ${s.title}`
                        .toLowerCase()
                        .includes(search.toLowerCase()),
            ),
        [game, search],
    );

    if (!open) {
        return (
            <>
                <Head title="Casino closed" />
                <CasinoClosed />
            </>
        );
    }

    const columns: Column<GameSession>[] = [
        { key: 'id', header: 'Session', primary: true, cell: (s) => s.id },
        {
            key: 'game',
            header: 'Game & host',
            cell: (s) => (
                <span className="block">
                    <span className="block font-semibold text-ink">
                        {gameLabel[s.game]}
                    </span>
                    <span className="block text-[11px] text-ink-muted/80">
                        {s.hostName}
                    </span>
                </span>
            ),
        },
        {
            key: 'players',
            header: 'Players',
            cell: (s) => `${s.seated} / ${s.capacity}`,
        },
        {
            key: 'seats',
            header: 'Available',
            cell: (s) =>
                s.seated >= s.capacity
                    ? 'Full'
                    : `${s.capacity - s.seated} seats`,
        },
        {
            key: 'status',
            header: 'Status',
            wide: true,
            cell: (s) => (
                <StatusPill tone={statusTone[s.status]}>
                    {statusLabel[s.status]}
                </StatusPill>
            ),
        },
        {
            key: 'join',
            header: '',
            action: true,
            cell: (s) => {
                const blocked = joinBlockedReason(s, auth.user);

                return canJoinAsPlayer(s, auth.user) ? (
                    <ActionButton asChild className="h-9 px-4 text-xs">
                        <Link href={showGame({ game: s.game, session: s.id })}>
                            Join game
                        </Link>
                    </ActionButton>
                ) : (
                    <ActionButton
                        disabled
                        className="h-9 px-4 text-xs"
                        title={blocked ?? undefined}
                    >
                        {blocked === 'Session full'
                            ? 'Session full'
                            : (blocked ?? 'Unavailable')}
                    </ActionButton>
                );
            },
        },
    ];

    return (
        <>
            <Head title="Game sessions" />
            <div className="space-y-6">
                <PageHeader
                    eyebrow="Live tables"
                    title="Game sessions"
                    description="Find an open seat and join a host-led session."
                    actions={
                        <ActionButton
                            asChild
                            look="outline"
                            className="h-11 px-5"
                        >
                            <Link href={lobbyIndex()}>Back to lobby</Link>
                        </ActionButton>
                    }
                />
                <FilterBar
                    search={search}
                    onSearch={setSearch}
                    placeholder="Search session ID or host"
                >
                    {filters.map((f) => (
                        <FilterChip
                            key={f.id}
                            active={game === f.id}
                            onClick={() => setGame(f.id)}
                        >
                            {f.label}
                        </FilterChip>
                    ))}
                </FilterBar>
                <DataTable
                    columns={columns}
                    rows={rows}
                    rowKey={(s) => s.id}
                    empty="No sessions match your filters."
                />
                <p className="flex items-center justify-center gap-2 text-center text-[11px] text-ink-muted/80">
                    <Shield className="size-3.5" />
                    Players may join hosted sessions but cannot create or
                    configure tables.
                </p>
            </div>
        </>
    );
}
