import { Head } from '@inertiajs/react';
import { Download, MoreHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import ActionButton from '@/components/casino/action-button';
import {
    DateRangeSelect,
    FilterSelect,
} from '@/components/casino/admin-filters';
import DataTable, { type Column } from '@/components/casino/data-table';
import FilterBar from '@/components/casino/filter-bar';
import PageHeader from '@/components/casino/page-header';
import PaginationBar from '@/components/casino/pagination-bar';
import PlayerCell from '@/components/casino/player-cell';
import PlayerSheet from '@/components/casino/player-sheet';
import StatusPill from '@/components/casino/status-pill';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatNumber } from '@/lib/format';
import { adminPlayers } from '@/mocks/casino';
import type { PlayerSummary } from '@/types/casino';

const tone = {
    active: 'success',
    suspended: 'danger',
    inactive: 'neutral',
} as const;

export default function Players() {
    const [players, setPlayers] = useState(adminPlayers);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [range, setRange] = useState('all');
    const [page, setPage] = useState(1);

    const rows = useMemo(
        () =>
            players.filter(
                (p) =>
                    `${p.username} ${p.code}`
                        .toLowerCase()
                        .includes(search.toLowerCase()) &&
                    (status === 'all' || p.status === status),
            ),
        [players, search, status],
    );
    const selected = players.find((p) => p.id === selectedId) ?? null;
    const suspendedCount =
        23 + players.filter((p) => p.status === 'suspended').length - 1;

    const toggleSuspend = (id: string) =>
        setPlayers((list) =>
            list.map((p) =>
                p.id === id
                    ? {
                          ...p,
                          status:
                              p.status === 'suspended' ? 'active' : 'suspended',
                      }
                    : p,
            ),
        );

    const columns: Column<PlayerSummary>[] = [
        {
            key: 'player',
            header: 'Player',
            primary: true,
            cell: (p) => <PlayerCell name={p.username} subtitle={p.code} />,
        },
        { key: 'reg', header: 'Registered', cell: (p) => p.registered },
        {
            key: 'bal',
            header: 'Wallet balance',
            cell: (p) => (
                <span className="font-semibold text-ink">
                    {formatNumber(p.balance)} cr
                </span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            cell: (p) => (
                <StatusPill tone={tone[p.status]} caps={false}>
                    {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                </StatusPill>
            ),
        },
        { key: 'last', header: 'Last activity', cell: (p) => p.lastActivity },
        {
            key: 'menu',
            header: '',
            action: true,
            cell: (p) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            aria-label={`Actions for ${p.username}`}
                            className="flex size-10 items-center justify-center rounded-lg text-ink-muted hover:bg-white/5 hover:text-ink"
                        >
                            <MoreHorizontal className="size-4" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => setSelectedId(p.id)}>
                            View details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onSelect={() => {
                                toggleSuspend(p.id);
                                toast.success(
                                    p.status === 'suspended'
                                        ? 'Account reactivated (demo)'
                                        : 'Account suspended (demo)',
                                );
                            }}
                        >
                            {p.status === 'suspended'
                                ? 'Reactivate'
                                : 'Suspend'}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    return (
        <>
            <Head title="Player management" />
            <div className="space-y-6">
                <PageHeader
                    title="Player management"
                    description="Review account status, wallet balances, and player activity."
                    actions={
                        <ActionButton
                            look="outline"
                            className="h-10 px-4 text-xs"
                            onClick={() => toast('CSV export started (demo)')}
                        >
                            <Download /> Export CSV
                        </ActionButton>
                    }
                />
                <section
                    aria-label="Player totals"
                    className="kk-panel grid grid-cols-2 divide-border lg:grid-cols-4 lg:divide-x"
                >
                    {[
                        ['Total players', '1,284', '+18 this month'],
                        ['Active', '1,108', '86.3% of players'],
                        ['Suspended', String(suspendedCount), 'Manual review'],
                        ['Inactive', '153', 'No activity in 30d'],
                    ].map(([label, value, note], i) => (
                        <div
                            key={label}
                            className={
                                'p-5 ' +
                                (i < 2
                                    ? 'border-b border-border lg:border-b-0'
                                    : '')
                            }
                        >
                            <p className="text-[10px] tracking-[0.12em] text-ink-muted uppercase">
                                {label}
                            </p>
                            <p className="mt-2 text-2xl font-semibold text-ink">
                                {value}
                            </p>
                            <p className="mt-1 text-[11px] text-ink-muted/80">
                                {note}
                            </p>
                        </div>
                    ))}
                </section>
                <FilterBar
                    search={search}
                    onSearch={setSearch}
                    placeholder="Search by player or ID"
                >
                    <FilterSelect
                        value={status}
                        onChange={setStatus}
                        label="Status"
                        options={[
                            { value: 'all', label: 'All statuses' },
                            { value: 'active', label: 'Active' },
                            { value: 'suspended', label: 'Suspended' },
                            { value: 'inactive', label: 'Inactive' },
                        ]}
                    />
                    <DateRangeSelect value={range} onChange={setRange} />
                </FilterBar>
                <DataTable
                    columns={columns}
                    rows={rows}
                    rowKey={(p) => p.id}
                    empty="No players match your filters."
                    footer={
                        <PaginationBar
                            shown={rows.length}
                            total={1284}
                            pageSize={6}
                            page={page}
                            onPage={setPage}
                        />
                    }
                />
            </div>
            <PlayerSheet
                player={selected}
                onClose={() => setSelectedId(null)}
                onToggleSuspend={toggleSuspend}
                showProfileAction
            />
        </>
    );
}
