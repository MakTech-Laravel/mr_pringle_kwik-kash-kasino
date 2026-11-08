import { Head, Link } from '@inertiajs/react';
import { Download, Eye, Users, Upload, Wallet } from 'lucide-react';
import { useMemo, useState } from 'react';
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
import StatCard from '@/components/casino/stat-card';
import { formatNumber } from '@/lib/format';
import { adminPlayers } from '@/mocks/casino';
import { ledger } from '@/routes/admin';
import type { PlayerSummary } from '@/types/casino';

export default function Wallets() {
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

    const columns: Column<PlayerSummary>[] = [
        {
            key: 'player',
            header: 'Player',
            primary: true,
            cell: (p) => <PlayerCell name={p.username} subtitle={p.code} />,
        },
        {
            key: 'bal',
            header: 'Current balance',
            cell: (p) => (
                <span className="font-semibold text-ink">
                    {formatNumber(p.balance)} cr
                </span>
            ),
        },
        {
            key: 'in',
            header: 'Total cash-in',
            cell: (p) => `${formatNumber(p.totalCashIn)} cr`,
        },
        {
            key: 'out',
            header: 'Total cash-out',
            cell: (p) => `${formatNumber(p.totalCashOut)} cr`,
        },
        {
            key: 'last',
            header: 'Last transaction',
            cell: (p) => p.lastActivity,
        },
        {
            key: 'view',
            header: '',
            action: true,
            cell: (p) => (
                <button
                    type="button"
                    aria-label={`View wallet of ${p.username}`}
                    onClick={() => setSelectedId(p.id)}
                    className="flex size-10 items-center justify-center rounded-lg text-ink-muted hover:bg-white/5 hover:text-ink"
                >
                    <Eye className="size-4" />
                </button>
            ),
        },
    ];

    return (
        <>
            <Head title="Wallets & balances" />
            <div className="space-y-6">
                <PageHeader
                    title="Wallets & balances"
                    description="Central oversight of every player's virtual credit balance."
                    actions={
                        <ActionButton
                            asChild
                            look="outline"
                            className="h-10 px-4 text-xs"
                        >
                            <Link href={ledger()}>View full ledger</Link>
                        </ActionButton>
                    }
                />
                <section
                    aria-label="Wallet totals"
                    className="grid grid-cols-2 gap-3 lg:grid-cols-4"
                >
                    <StatCard
                        label="Player wallet credits"
                        value="2.46M"
                        note="Current available balance"
                        icon={Wallet}
                    />
                    <StatCard
                        label="Active wallets"
                        value="1,284"
                        note="146 active today"
                        icon={Users}
                        tone="success"
                    />
                    <StatCard
                        label="Total cash-in"
                        value="4.82M"
                        note="All-time credits"
                        icon={Download}
                        tone="success"
                    />
                    <StatCard
                        label="Total cash-out"
                        value="1.64M"
                        note="All-time credits"
                        icon={Upload}
                        tone="danger"
                    />
                </section>
                <FilterBar
                    search={search}
                    onSearch={setSearch}
                    placeholder="Search wallet owner or player ID"
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
                    empty="No wallets match your filters."
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
                player={players.find((p) => p.id === selectedId) ?? null}
                onClose={() => setSelectedId(null)}
                onToggleSuspend={(id) =>
                    setPlayers((list) =>
                        list.map((p) =>
                            p.id === id
                                ? {
                                      ...p,
                                      status:
                                          p.status === 'suspended'
                                              ? 'active'
                                              : 'suspended',
                                  }
                                : p,
                        ),
                    )
                }
            />
        </>
    );
}
