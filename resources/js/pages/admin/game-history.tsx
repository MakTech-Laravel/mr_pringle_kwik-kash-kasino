import { Head } from '@inertiajs/react';
import { ChevronRight, Download } from 'lucide-react';
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
import StatusPill from '@/components/casino/status-pill';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { formatSignedCredits } from '@/lib/format';
import { cn } from '@/lib/utils';
import { adminGameHistory } from '@/mocks/casino';

type Row = (typeof adminGameHistory)[number];

const gameName = {
    blackjack: 'Blackjack',
    poker: 'Poker',
    roulette: 'Roulette',
};

const results = [
    ['Marcus_V', 2400],
    ['LuckyLou', -500],
    ['RubyAce', 1200],
    ['RiverKing', -1100],
];

export default function GameHistory() {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [range, setRange] = useState('all');
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState<Row | null>(null);

    const rows = useMemo(
        () =>
            adminGameHistory.filter(
                (r) =>
                    `${r.id} ${gameName[r.game]}`
                        .toLowerCase()
                        .includes(search.toLowerCase()) &&
                    (status === 'all' || r.status === status),
            ),
        [search, status],
    );

    const columns: Column<Row>[] = [
        { key: 'id', header: 'Session', primary: true, cell: (r) => r.id },
        { key: 'game', header: 'Game', cell: (r) => gameName[r.game] },
        { key: 'pl', header: 'Players', cell: (r) => `${r.players} players` },
        { key: 'start', header: 'Start date', cell: (r) => r.start },
        { key: 'end', header: 'End date', cell: (r) => r.end },
        {
            key: 'status',
            header: 'Final status',
            cell: (r) => (
                <StatusPill
                    tone={r.status === 'completed' ? 'success' : 'danger'}
                    caps={false}
                >
                    {r.status === 'completed' ? 'Completed' : 'Cancelled'}
                </StatusPill>
            ),
        },
        {
            key: 'view',
            header: 'Action',
            action: true,
            cell: (r) => (
                <button
                    type="button"
                    onClick={() => setSelected(r)}
                    className="flex min-h-9 items-center gap-1 text-[11px] font-medium text-gold hover:text-gold-light"
                >
                    View results <ChevronRight className="size-3.5" />
                </button>
            ),
        },
    ];

    return (
        <>
            <Head title="Game history" />
            <div className="space-y-6">
                <PageHeader
                    title="Game history & results"
                    description="Completed game records remain available for operational review."
                    actions={
                        <ActionButton
                            look="outline"
                            className="h-10 px-4 text-xs"
                            onClick={() => toast('History export started')}
                        >
                            <Download /> Export history
                        </ActionButton>
                    }
                />
                <FilterBar
                    search={search}
                    onSearch={setSearch}
                    placeholder="Search session or player"
                >
                    <FilterSelect
                        value={status}
                        onChange={setStatus}
                        label="Status"
                        options={[
                            { value: 'all', label: 'All statuses' },
                            { value: 'completed', label: 'Completed' },
                            { value: 'cancelled', label: 'Cancelled' },
                        ]}
                    />
                    <DateRangeSelect value={range} onChange={setRange} />
                </FilterBar>
                <DataTable
                    columns={columns}
                    rows={rows}
                    rowKey={(r) => r.id}
                    empty="No sessions match your filters."
                    footer={
                        <PaginationBar
                            shown={rows.length}
                            total={1284}
                            pageSize={5}
                            page={page}
                            onPage={setPage}
                        />
                    }
                />
            </div>

            <Dialog
                open={!!selected}
                onOpenChange={(o) => !o && setSelected(null)}
            >
                <DialogContent className="max-w-[calc(100%-2rem)] border-gold/20 bg-surface sm:max-w-[480px]">
                    <DialogHeader>
                        <p className="kk-eyebrow">Session results</p>
                        <DialogTitle className="kk-title text-xl">
                            {selected?.id} ·{' '}
                            {selected && gameName[selected.game]}
                        </DialogTitle>
                        <DialogDescription>
                            Net result per player.
                        </DialogDescription>
                    </DialogHeader>
                    <ul className="divide-y divide-border">
                        {results
                            .slice(0, Math.min(selected?.players ?? 4, 4))
                            .map(([name, net]) => (
                                <li
                                    key={name}
                                    className="flex items-center justify-between py-3 text-xs"
                                >
                                    <span className="font-semibold text-ink">
                                        {name}
                                    </span>
                                    <span
                                        className={cn(
                                            'font-semibold',
                                            (net as number) > 0
                                                ? 'text-success-light'
                                                : 'text-danger-light',
                                        )}
                                    >
                                        {formatSignedCredits(net as number)}
                                    </span>
                                </li>
                            ))}
                    </ul>
                </DialogContent>
            </Dialog>
        </>
    );
}
