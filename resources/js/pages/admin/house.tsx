import { Head } from '@inertiajs/react';
import { Landmark } from 'lucide-react';
import HouseBalanceChart from '@/components/casino/house-balance-chart';
import DataTable, { type Column } from '@/components/casino/data-table';
import { formatNumber, formatSignedCredits } from '@/lib/format';
import { cn } from '@/lib/utils';
import { houseChart, houseTransactions } from '@/mocks/casino';

type Row = (typeof houseTransactions)[number];

const movement = [
    ['Credits received', '+624,850 cr', 'bg-success'],
    ['Winnings paid', '−512,200 cr', 'bg-crimson'],
    ['Cash-out transfers', '−26,200 cr', 'bg-crimson'],
] as const;

export default function House() {
    const columns: Column<Row>[] = [
        { key: 'id', header: 'Transaction', primary: true, cell: (r) => r.id },
        { key: 'type', header: 'Type', cell: (r) => r.type },
        { key: 'rel', header: 'Related to', cell: (r) => r.related },
        {
            key: 'amt',
            header: 'Amount',
            cell: (r) => (
                <span
                    className={cn(
                        'font-semibold',
                        r.amount > 0
                            ? 'text-success-light'
                            : 'text-danger-light',
                    )}
                >
                    {formatSignedCredits(r.amount).replace(' CR', ' cr')}
                </span>
            ),
        },
        {
            key: 'prev',
            header: 'Previous balance',
            cell: (r) => `${r.previous} cr`,
        },
        {
            key: 'upd',
            header: 'Updated balance',
            cell: (r) => `${r.updated} cr`,
        },
        { key: 'date', header: 'Date', cell: (r) => r.date },
    ];

    return (
        <>
            <Head title="House account" />
            <div className="space-y-5">
                <section className="kk-hero relative flex items-center justify-between gap-4 p-6 sm:p-9">
                    <div>
                        <p className="kk-eyebrow mb-4">
                            House account · Operating ledger
                        </p>
                        <p className="font-display text-5xl text-gold sm:text-6xl">
                            {formatNumber(847250)}{' '}
                            <span className="font-sans text-sm text-ink">
                                credits
                            </span>
                        </p>
                        <p className="mt-3 text-xs text-ink-muted">
                            Current available house balance
                        </p>
                    </div>
                    <div className="hidden size-24 shrink-0 flex-col items-center justify-center rounded-full border border-gold/30 text-gold sm:flex">
                        <Landmark className="size-7" />
                        <span className="mt-1 text-[9px] tracking-[0.2em]">
                            HOUSE
                        </span>
                    </div>
                </section>

                <section
                    aria-label="House totals"
                    className="kk-panel grid divide-border md:grid-cols-3 md:divide-x"
                >
                    {[
                        [
                            'Total credits received',
                            '4,280,400 cr',
                            'From stakes and settlements',
                            '',
                        ],
                        [
                            'Paid as winnings',
                            '3,184,200 cr',
                            'Across completed sessions',
                            '',
                        ],
                        [
                            'Net this month',
                            '+86,450 cr',
                            'This month',
                            'text-success-light',
                        ],
                    ].map(([label, value, note, tone]) => (
                        <div
                            key={label}
                            className="border-b border-border p-5 last:border-b-0 md:border-b-0"
                        >
                            <p className="text-[11px] text-ink-muted">
                                {label}
                            </p>
                            <p
                                className={cn(
                                    'mt-2 text-xl font-semibold text-ink',
                                    tone,
                                )}
                            >
                                {value}
                            </p>
                            <p className="mt-1 text-[10px] text-ink-muted/70">
                                {note}
                            </p>
                        </div>
                    ))}
                </section>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                    <section className="kk-panel p-5 sm:p-6">
                        <h2 className="kk-title text-lg text-ink">
                            House balance activity
                        </h2>
                        <p className="mt-1 mb-4 text-[11px] text-ink-muted">
                            March 1–18
                        </p>
                        <HouseBalanceChart values={houseChart} />
                        <div className="mt-2 flex justify-between text-[10px] text-ink-muted/70">
                            <span>MAR 1</span>
                            <span>MAR 6</span>
                            <span>MAR 12</span>
                            <span>MAR 18</span>
                        </div>
                    </section>
                    <section className="kk-panel p-5 sm:p-6">
                        <h2 className="kk-title text-lg text-ink">
                            Account movement
                        </h2>
                        <p className="mt-1 mb-4 text-[11px] text-ink-muted">
                            This month
                        </p>
                        <ul>
                            {movement.map(([label, value, dot]) => (
                                <li
                                    key={label}
                                    className="flex items-center justify-between border-b border-border py-4 text-xs"
                                >
                                    <span className="flex items-center gap-2.5 text-ink-muted">
                                        <span
                                            className={cn(
                                                'size-2 rounded-full',
                                                dot,
                                            )}
                                        />
                                        {label}
                                    </span>
                                    <span className="font-semibold text-ink">
                                        {value}
                                    </span>
                                </li>
                            ))}
                            <li className="flex items-center justify-between py-4 text-xs">
                                <span className="text-ink-muted">
                                    Net movement
                                </span>
                                <span className="font-semibold text-gold">
                                    +86,450 cr
                                </span>
                            </li>
                        </ul>
                    </section>
                </div>

                <section aria-labelledby="house-tx">
                    <h2 id="house-tx" className="kk-title text-lg text-ink">
                        Recent house transactions
                    </h2>
                    <p className="mt-1 mb-3 text-[11px] text-ink-muted">
                        How the house balance has changed
                    </p>
                    <DataTable
                        columns={columns}
                        rows={houseTransactions}
                        rowKey={(r) => r.id}
                    />
                </section>
            </div>
        </>
    );
}
