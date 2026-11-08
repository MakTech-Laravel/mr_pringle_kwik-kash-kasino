import { Head, Link } from '@inertiajs/react';
import { ChevronRight, Plus } from 'lucide-react';
import ActionButton from '@/components/casino/action-button';
import BalanceCard from '@/components/casino/balance-card';
import PageHeader from '@/components/casino/page-header';
import RequestStatusPill from '@/components/casino/request-status';
import { formatNumber, formatSignedCredits } from '@/lib/format';
import { cn } from '@/lib/utils';
import { playerWallet, walletTransactions } from '@/mocks/casino';
import { transactions } from '@/routes';
import { cashIn, cashOut } from '@/routes/wallet';

const stats = [
    {
        label: 'Pending cash-in',
        value: `${formatNumber(playerWallet.pendingCashIn)} CR`,
        note: '1 request under review',
    },
    {
        label: 'Pending cash-out',
        value: `${formatNumber(playerWallet.pendingCashOut)} CR`,
        note: 'No active requests',
    },
    {
        label: 'Total deposits',
        value: `${formatNumber(playerWallet.totalDeposits)} CR`,
    },
    {
        label: 'Total cash-outs',
        value: `${formatNumber(playerWallet.totalCashOuts)} CR`,
    },
    {
        label: 'Total winnings',
        value: `${formatNumber(playerWallet.totalWinnings)} CR`,
        tone: 'text-success-light',
    },
    {
        label: 'Total losses',
        value: `−${formatNumber(playerWallet.totalLosses)} CR`,
        tone: 'text-danger-light',
    },
];

export default function Wallet() {
    return (
        <>
            <Head title="My wallet" />
            <div className="space-y-6 lg:space-y-8">
                <PageHeader
                    eyebrow="My wallet"
                    title="Your credits"
                    description="Manage your virtual credits and review wallet activity."
                />

                <BalanceCard
                    label="Available balance"
                    balance={playerWallet.balance}
                    caption="Virtual community credits · Not real currency"
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
                                    Request cash-out <ChevronRight />
                                </Link>
                            </ActionButton>
                        </>
                    }
                />

                <section
                    aria-label="Wallet summary"
                    className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4"
                >
                    {stats.map((s) => (
                        <div key={s.label} className="kk-panel p-4 sm:p-5">
                            <p className="text-[11px] text-ink-muted">
                                {s.label}
                            </p>
                            <p
                                className={cn(
                                    'mt-3 text-lg font-semibold text-ink sm:text-xl',
                                    s.tone,
                                )}
                            >
                                {s.value}
                            </p>
                            {s.note && (
                                <p className="mt-1.5 text-[10px] text-ink-muted/80">
                                    {s.note}
                                </p>
                            )}
                        </div>
                    ))}
                </section>

                <section className="kk-panel" aria-labelledby="recent-tx">
                    <div className="flex items-start justify-between p-5">
                        <div>
                            <p className="kk-eyebrow mb-2">Latest activity</p>
                            <h2
                                id="recent-tx"
                                className="kk-title text-xl text-ink"
                            >
                                Recent transactions
                            </h2>
                        </div>
                        <Link
                            href={transactions()}
                            className="text-xs text-ink-muted hover:text-ink"
                        >
                            View all
                        </Link>
                    </div>
                    <ul>
                        {walletTransactions.slice(0, 4).map((tx) => (
                            <li
                                key={tx.id}
                                className="flex items-center gap-3 border-t border-border px-5 py-4"
                            >
                                <span
                                    className={cn(
                                        'flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                                        tx.amount > 0
                                            ? 'bg-success/15 text-success-light'
                                            : 'bg-crimson/20 text-danger-light',
                                    )}
                                >
                                    {tx.label.charAt(0)}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-ink">
                                        {tx.label}
                                    </p>
                                    <p className="truncate text-[11px] text-ink-muted">
                                        {tx.id} · {tx.date}
                                    </p>
                                </div>
                                <span
                                    className={cn(
                                        'text-xs font-semibold',
                                        tx.amount > 0
                                            ? 'text-success-light'
                                            : 'text-ink',
                                    )}
                                >
                                    {formatSignedCredits(tx.amount)}
                                </span>
                                <span className="hidden sm:block">
                                    <RequestStatusPill status={tx.status} />
                                </span>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
        </>
    );
}
