import { Head } from '@inertiajs/react';
import { Eye, Lock } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
    DateRangeSelect,
    FilterSelect,
} from '@/components/casino/admin-filters';
import DataTable, { type Column } from '@/components/casino/data-table';
import FilterBar from '@/components/casino/filter-bar';
import PageHeader from '@/components/casino/page-header';
import PaginationBar from '@/components/casino/pagination-bar';
import PlayerCell from '@/components/casino/player-cell';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { AdminActivity } from '@/types/casino';

const PAGE_SIZE = 10;

export default function Activity({
    activities,
}: {
    activities: AdminActivity[];
}) {
    const [search, setSearch] = useState('');
    const [action, setAction] = useState('all');
    const [range, setRange] = useState('all');
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState<AdminActivity | null>(null);

    const actions = [...new Set(activities.map((a) => a.action))];
    const rows = useMemo(
        () =>
            activities.filter(
                (a) =>
                    `${a.id} ${a.action} ${a.record}`
                        .toLowerCase()
                        .includes(search.toLowerCase()) &&
                    (action === 'all' || a.action === action),
            ),
        [activities, search, action],
    );

    const columns: Column<AdminActivity>[] = [
        { key: 'id', header: 'Activity ID', primary: true, cell: (a) => a.id },
        {
            key: 'admin',
            header: 'Admin',
            cell: (a) => <PlayerCell name={a.admin} />,
        },
        { key: 'action', header: 'Action type', cell: (a) => a.action },
        { key: 'record', header: 'Related record', cell: (a) => a.record },
        { key: 'date', header: 'Date & time', cell: (a) => a.date },
        {
            key: 'details',
            header: 'Details',
            action: true,
            cell: (a) => (
                <button
                    type="button"
                    aria-label={`View details of ${a.id}`}
                    onClick={() => setSelected(a)}
                    className="flex size-10 items-center justify-center rounded-lg text-ink-muted hover:bg-white/5 hover:text-ink"
                >
                    <Eye className="size-4" />
                </button>
            ),
        },
    ];

    return (
        <>
            <Head title="Admin activity logs" />
            <div className="space-y-6">
                <PageHeader
                    title="Admin activity logs"
                    description="Immutable audit history attributed to the acting administrator."
                    actions={
                        <span className="inline-flex h-9 items-center gap-2 rounded-full border border-border px-4 text-[11px] text-ink-muted">
                            <Lock className="size-3.5" /> Read-only log
                        </span>
                    }
                />
                <FilterBar
                    search={search}
                    onSearch={setSearch}
                    placeholder="Search activity or related record"
                >
                    <FilterSelect
                        value={action}
                        onChange={setAction}
                        label="Action type"
                        options={[
                            { value: 'all', label: 'All actions' },
                            ...actions.map((a) => ({ value: a, label: a })),
                        ]}
                    />
                    <DateRangeSelect value={range} onChange={setRange} />
                </FilterBar>
                <DataTable
                    columns={columns}
                    rows={rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)}
                    rowKey={(a) => a.id}
                    empty="No activity matches your filters."
                    footer={
                        <PaginationBar
                            shown={Math.min(rows.length, page * PAGE_SIZE)}
                            total={rows.length}
                            pageSize={PAGE_SIZE}
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
                <DialogContent className="max-w-[calc(100%-2rem)] border-gold/20 bg-surface sm:max-w-[460px]">
                    <DialogHeader>
                        <p className="kk-eyebrow">Audit entry</p>
                        <DialogTitle className="kk-title text-xl">
                            {selected?.id}
                        </DialogTitle>
                        <DialogDescription>
                            Read-only record. Entries cannot be edited or
                            deleted.
                        </DialogDescription>
                    </DialogHeader>
                    {selected && (
                        <dl className="grid grid-cols-2 gap-4 text-xs">
                            {[
                                ['Admin', selected.admin],
                                ['Action', selected.action],
                                ['Related record', selected.record],
                                ['Date & time', selected.date],
                            ].map(([k, v]) => (
                                <div key={k}>
                                    <dt className="text-ink-muted">{k}</dt>
                                    <dd className="mt-1 font-semibold text-ink">
                                        {v}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
