import { Head } from '@inertiajs/react';
import { ClipboardList, Coins, Download, Upload } from 'lucide-react';
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
import StatCard from '@/components/casino/stat-card';
import StatusPill from '@/components/casino/status-pill';
import { formatNumber, formatSignedCredits } from '@/lib/format';
import { cn } from '@/lib/utils';
import { ledgerEntries } from '@/mocks/casino';
import type { LedgerEntry } from '@/types/casino';

export default function Ledger() {
    const [search, setSearch] = useState('');
    const [type, setType] = useState('all');
    const [range, setRange] = useState('all');
    const [page, setPage] = useState(1);

    const rows = useMemo(
        () =>
            ledgerEntries.filter(
                (e) =>
                    `${e.id} ${e.player}`
                        .toLowerCase()
                        .includes(search.toLowerCase()) &&
                    (type === 'all' || e.type === type),
            ),
        [search, type],
    );

    const columns: Column<LedgerEntry>[] = [
        { key: 'id', header: 'Transaction', primary: true, cell: (e) => e.id },
        { key: 'player', header: 'Player', cell: (e) => e.player },
        { key: 'type', header: 'Type', cell: (e) => e.type },
        {
            key: 'amount',
            header: 'Amount',
            cell: (e) => (
                <span
                    className={cn(
                        'font-semibold',
                        e.amount > 0
                            ? 'text-success-light'
                            : 'text-danger-light',
                    )}
                >
                    {formatSignedCredits(e.amount).replace(' CR', ' cr')}
                </span>
            ),
        },
        {
            key: 'prev',
            header: 'Previous',
            cell: (e) => `${formatNumber(e.previous)} cr`,
        },
        {
            key: 'upd',
            header: 'Updated',
            cell: (e) => `${formatNumber(e.updated)} cr`,
        },
        { key: 'date', header: 'Date & time', cell: (e) => e.date },
        {
            key: 'status',
            header: 'Status',
            cell: () => (
                <StatusPill tone="success" caps={false}>
                    Completed
                </StatusPill>
            ),
        },
    ];

    return (
        <>
            <Head title="Transaction ledger" />
            <div className="space-y-6">
                <PageHeader
                    title="Transaction ledger"
                    description="Completed transactions are permanent and read-only."
                    actions={
                        <ActionButton
                            look="outline"
                            className="h-10 px-4 text-xs"
                            onClick={() =>
                                toast('Ledger export started (demo)')
                            }
                        >
                            <Download /> Export ledger
                        </ActionButton>
                    }
                />
                <section
                    aria-label="Ledger totals"
                    className="grid grid-cols-2 gap-3 lg:grid-cols-4"
                >
                    <StatCard
                        label="Total transactions"
                        value="38,491"
                        note="+286 this week"
                        icon={ClipboardList}
                    />
                    <StatCard
                        label="Total cash-in"
                        value="4.82M"
                        note="Virtual credits"
                        icon={Download}
                        tone="success"
                    />
                    <StatCard
                        label="Total cash-out"
                        value="1.64M"
                        note="Virtual credits"
                        icon={Upload}
                        tone="danger"
                    />
                    <StatCard
                        label="Game winnings"
                        value="3.18M"
                        note="Settled credits"
                        icon={Coins}
                    />
                </section>
                <FilterBar
                    search={search}
                    onSearch={setSearch}
                    placeholder="Search transaction or player"
                >
                    <FilterSelect
                        value={type}
                        onChange={setType}
                        label="Type"
                        options={[
                            { value: 'all', label: 'All types' },
                            { value: 'Cash-in', label: 'Cash-in' },
                            { value: 'Cash-out', label: 'Cash-out' },
                            { value: 'Game winnings', label: 'Game winnings' },
                            { value: 'Game stake', label: 'Game stake' },
                        ]}
                    />
                    <DateRangeSelect value={range} onChange={setRange} />
                </FilterBar>
                <DataTable
                    columns={columns}
                    rows={rows}
                    rowKey={(e) => e.id}
                    empty="No transactions match your filters."
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
        </>
    );
}
