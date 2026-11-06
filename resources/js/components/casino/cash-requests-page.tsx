import { Head } from '@inertiajs/react';
import { AlertTriangle, Check, ClipboardList, Download, X } from 'lucide-react';
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
import RequestReviewDialog from '@/components/casino/request-review-dialog';
import RequestStatusPill from '@/components/casino/request-status';
import StatCard from '@/components/casino/stat-card';
import { formatNumber } from '@/lib/format';
import type { CashRequest } from '@/types/casino';

type Props = {
    direction: 'cash-in' | 'cash-out';
    initial: CashRequest[];
    stats: {
        total: string;
        pendingNote: string;
        approved: string;
        approvedNote: string;
        rejected: string;
        rejectedNote: string;
    };
};

const copy = {
    'cash-in': {
        title: 'Cash-in requests',
        description: 'Approve requests to credit virtual player wallets.',
    },
    'cash-out': {
        title: 'Cash-out requests',
        description:
            'Validate available balances before removing virtual credits.',
    },
};

/** Shared admin queue for cash-in and cash-out requests (review dialog included). */
export default function CashRequestsPage({ direction, initial, stats }: Props) {
    const [rows, setRows] = useState(initial);
    const [selected, setSelected] = useState<CashRequest | null>(null);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [range, setRange] = useState('all');
    const [page, setPage] = useState(1);

    const filtered = useMemo(
        () =>
            rows.filter(
                (r) =>
                    `${r.id} ${r.player}`
                        .toLowerCase()
                        .includes(search.toLowerCase()) &&
                    (status === 'all' || r.status === status),
            ),
        [rows, search, status],
    );

    const decide = (id: string, decision: 'approved' | 'rejected') => {
        setRows((list) =>
            list.map((r) => (r.id === id ? { ...r, status: decision } : r)),
        );
        setSelected(null);
        toast.success(`${id} ${decision} (demo)`, {
            description: 'Recorded in this browser session only.',
        });
    };

    const columns: Column<CashRequest>[] = [
        { key: 'id', header: 'Request ID', primary: true, cell: (r) => r.id },
        {
            key: 'player',
            header: 'Player',
            cell: (r) => <PlayerCell name={r.player} />,
        },
        {
            key: 'credits',
            header: 'Requested credits',
            cell: (r) => (
                <span className="font-semibold text-ink">
                    {formatNumber(r.credits)} cr
                </span>
            ),
        },
        { key: 'submitted', header: 'Submitted', cell: (r) => r.submitted },
        {
            key: 'status',
            header: 'Status',
            cell: (r) => <RequestStatusPill status={r.status} caps={false} />,
        },
        {
            key: 'action',
            header: 'Action',
            action: true,
            cell: (r) =>
                r.status === 'pending' ? (
                    <ActionButton
                        look="outline"
                        className="h-9 px-3 text-[11px]"
                        onClick={() => setSelected(r)}
                    >
                        Review request
                    </ActionButton>
                ) : (
                    <button
                        type="button"
                        onClick={() => setSelected(r)}
                        className="min-h-9 text-[11px] font-medium text-gold hover:text-gold-light"
                    >
                        View details
                    </button>
                ),
        },
    ];

    const pending = rows.filter((r) => r.status === 'pending').length;

    return (
        <>
            <Head title={copy[direction].title} />
            <div className="space-y-6">
                <PageHeader
                    title={copy[direction].title}
                    description={copy[direction].description}
                    actions={
                        <ActionButton
                            look="outline"
                            className="h-10 px-4 text-xs"
                            onClick={() => toast('Export started (demo)')}
                        >
                            <Download /> Export
                        </ActionButton>
                    }
                />
                <section
                    aria-label="Request totals"
                    className="grid grid-cols-2 gap-3 lg:grid-cols-4"
                >
                    <StatCard
                        label="Total requests"
                        value={stats.total}
                        note="All time"
                        icon={ClipboardList}
                    />
                    <StatCard
                        label="Pending review"
                        value={String(pending)}
                        note={stats.pendingNote}
                        icon={AlertTriangle}
                    />
                    <StatCard
                        label="Approved"
                        value={stats.approved}
                        note={stats.approvedNote}
                        icon={Check}
                        tone="success"
                    />
                    <StatCard
                        label="Rejected"
                        value={stats.rejected}
                        note={stats.rejectedNote}
                        icon={X}
                        tone="danger"
                    />
                </section>
                <FilterBar
                    search={search}
                    onSearch={setSearch}
                    placeholder="Search player or request ID"
                >
                    <FilterSelect
                        value={status}
                        onChange={setStatus}
                        label="Status"
                        options={[
                            { value: 'all', label: 'All statuses' },
                            { value: 'pending', label: 'Pending' },
                            { value: 'approved', label: 'Approved' },
                            { value: 'rejected', label: 'Rejected' },
                        ]}
                    />
                    <DateRangeSelect value={range} onChange={setRange} />
                </FilterBar>
                <DataTable
                    columns={columns}
                    rows={filtered}
                    rowKey={(r) => r.id}
                    empty="No requests match your filters."
                    footer={
                        <PaginationBar
                            shown={filtered.length}
                            total={2847}
                            pageSize={5}
                            page={page}
                            onPage={setPage}
                        />
                    }
                />
            </div>
            <RequestReviewDialog
                request={selected}
                onClose={() => setSelected(null)}
                onDecide={decide}
            />
        </>
    );
}
