import { Head } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import DataTable, { type Column } from '@/components/casino/data-table';
import FilterBar from '@/components/casino/filter-bar';
import PageHeader from '@/components/casino/page-header';
import RequestStatusPill from '@/components/casino/request-status';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { formatCredits, formatSignedCredits } from '@/lib/format';
import { cn } from '@/lib/utils';
import { walletTransactions } from '@/mocks/casino';
import type { WalletTransaction } from '@/types/casino';

export default function Transactions() {
    const [search, setSearch] = useState('');
    const [type, setType] = useState('all');
    const [status, setStatus] = useState('all');

    const rows = useMemo(
        () =>
            walletTransactions.filter(
                (t) =>
                    t.id.toLowerCase().includes(search.toLowerCase()) &&
                    (type === 'all' || t.type === type) &&
                    (status === 'all' || t.status === status),
            ),
        [search, type, status],
    );

    const columns: Column<WalletTransaction>[] = [
        {
            key: 'id',
            header: 'Transaction ID',
            primary: true,
            cell: (t) => t.id,
        },
        { key: 'type', header: 'Type', cell: (t) => t.label },
        {
            key: 'amount',
            header: 'Amount',
            cell: (t) => (
                <span
                    className={cn(
                        'font-semibold',
                        t.amount > 0 ? 'text-success-light' : 'text-ink',
                    )}
                >
                    {formatSignedCredits(t.amount)}
                </span>
            ),
        },
        {
            key: 'prev',
            header: 'Previous',
            cell: (t) => formatCredits(t.previousBalance),
        },
        {
            key: 'new',
            header: 'New balance',
            cell: (t) => formatCredits(t.newBalance),
        },
        { key: 'date', header: 'Date', cell: (t) => t.date },
        {
            key: 'status',
            header: 'Status',
            cell: (t) => <RequestStatusPill status={t.status} />,
        },
    ];

    return (
        <>
            <Head title="Transactions" />
            <div className="space-y-6">
                <PageHeader
                    eyebrow="Account activity"
                    title="Transaction history"
                    description="A record of all illustrative credit movement on your account."
                />
                <FilterBar
                    search={search}
                    onSearch={setSearch}
                    placeholder="Search transaction ID"
                >
                    <Select value={type} onValueChange={setType}>
                        <SelectTrigger
                            aria-label="Transaction type"
                            className="h-11 w-full min-w-44 border-border sm:w-auto"
                        >
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                All transaction types
                            </SelectItem>
                            <SelectItem value="cash-in">Cash-in</SelectItem>
                            <SelectItem value="cash-out">Cash-out</SelectItem>
                            <SelectItem value="win">Win</SelectItem>
                            <SelectItem value="bet">Bet</SelectItem>
                            <SelectItem value="refund">Refund</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger
                            aria-label="Status"
                            className="h-11 w-full min-w-36 border-border sm:w-auto"
                        >
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All statuses</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                        </SelectContent>
                    </Select>
                </FilterBar>
                <DataTable
                    columns={columns}
                    rows={rows}
                    rowKey={(t) => t.id}
                    empty="No transactions match your filters."
                />
            </div>
        </>
    );
}
