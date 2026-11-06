import { Head, Link, usePage } from '@inertiajs/react';
import {
    Activity,
    CalendarDays,
    Check,
    ChevronRight,
    Dices,
    Download,
    Landmark,
    Plus,
    Upload,
    UserPlus,
    Users,
    Wallet,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import ActionButton from '@/components/casino/action-button';
import StatCard from '@/components/casino/stat-card';
import StatusPill from '@/components/casino/status-pill';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { setCasinoOpen, useCasinoOpen } from '@/hooks/use-casino-status';
import { cn } from '@/lib/utils';
import { adminOverview } from '@/mocks/casino';
import {
    activity,
    cashIn,
    cashOut,
    ledger,
    players,
    sessions,
} from '@/routes/admin';
import type { Auth } from '@/types';

const icons = {
    users: Users,
    activity: Activity,
    wallet: Wallet,
    landmark: Landmark,
    download: Download,
    upload: Upload,
    dice: Dices,
    userplus: UserPlus,
};

const kpiTone: Record<string, 'gold' | 'success' | 'danger'> = {
    active: 'success',
    cashout: 'danger',
    sessions: 'success',
};

const games = [
    { letter: 'B', name: 'Blackjack' },
    { letter: 'P', name: 'Poker' },
    { letter: 'R', name: 'Roulette' },
];

const quickActions = [
    {
        title: 'Review cash-in',
        note: '8 pending requests',
        icon: Download,
        href: cashIn().url,
    },
    {
        title: 'Review cash-out',
        note: '5 pending requests',
        icon: Upload,
        href: cashOut().url,
    },
    {
        title: 'Manage players',
        note: '1,284 accounts',
        icon: Users,
        href: players().url,
    },
    {
        title: 'Create session',
        note: '3 games available',
        icon: Dices,
        href: sessions().url,
    },
];

export default function Overview() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const casinoOpen = useCasinoOpen();
    const [confirm, setConfirm] = useState<boolean | null>(null);
    const firstName = auth.user.name.split(' ')[0];
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
    const maxBar = Math.max(...adminOverview.movement.map((m) => m.in));

    return (
        <>
            <Head title="Operations overview" />

            <div className="space-y-6">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <p className="kk-eyebrow mb-3">{today}</p>
                        <h1 className="kk-title text-3xl text-ink sm:text-4xl">
                            Welcome back, {firstName}.
                        </h1>
                        <p className="mt-2 text-sm text-ink-muted">
                            Here&apos;s what&apos;s happening across the casino
                            right now.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm text-ink">
                            <CalendarDays className="size-4 text-ink-muted" />
                            {new Date().toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                            })}
                        </span>
                        <ActionButton asChild className="h-10 px-5">
                            <Link href={sessions()}>
                                <Plus /> Create session
                            </Link>
                        </ActionButton>
                    </div>
                </header>

                <section
                    aria-label="Key figures"
                    className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-7"
                >
                    {adminOverview.kpis.map((kpi) => (
                        <StatCard
                            key={kpi.id}
                            label={kpi.label}
                            value={kpi.value}
                            note={kpi.note}
                            icon={icons[kpi.icon]}
                            tone={kpiTone[kpi.id] ?? 'gold'}
                            className="flex-col"
                        />
                    ))}
                </section>

                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                    <div className="space-y-5">
                        <section
                            className="kk-panel p-5 sm:p-6"
                            aria-labelledby="movement-heading"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2
                                        id="movement-heading"
                                        className="kk-title text-lg text-ink"
                                    >
                                        Credit movement
                                    </h2>
                                    <p className="mt-1 text-[11px] text-ink-muted">
                                        Illustrative data · Last 7 days
                                    </p>
                                </div>
                                <Link
                                    href={ledger()}
                                    className="flex items-center gap-1 text-xs font-medium text-gold hover:text-gold-light"
                                >
                                    View ledger{' '}
                                    <ChevronRight className="size-3.5" />
                                </Link>
                            </div>
                            <div className="mt-3 flex justify-end gap-4 text-[11px] text-ink-muted">
                                <span className="flex items-center gap-1.5">
                                    <span className="h-0.5 w-3 bg-gold" />{' '}
                                    Credits in
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="h-0.5 w-3 bg-crimson" />{' '}
                                    Credits out
                                </span>
                            </div>
                            <div
                                className="mt-4 flex h-52 items-end justify-around gap-2 border-b border-border"
                                role="img"
                                aria-label="Bar chart of credits in and out for the last 7 days"
                            >
                                {adminOverview.movement.map((m, index) => (
                                    <div
                                        key={index}
                                        className="flex flex-1 flex-col items-center gap-2"
                                    >
                                        <div className="flex h-44 items-end gap-1">
                                            <span
                                                className="w-2.5 rounded-t-sm bg-gold sm:w-3.5"
                                                style={{
                                                    height: `${(m.in / maxBar) * 100}%`,
                                                }}
                                            />
                                            <span
                                                className="w-2.5 rounded-t-sm bg-crimson sm:w-3.5"
                                                style={{
                                                    height: `${(m.out / maxBar) * 100}%`,
                                                }}
                                            />
                                        </div>
                                        <span className="pb-2 text-[10px] text-ink-muted">
                                            {m.day}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section
                            className="kk-panel"
                            aria-labelledby="recent-heading"
                        >
                            <div className="flex items-start justify-between p-5 pb-3 sm:p-6 sm:pb-3">
                                <div>
                                    <h2
                                        id="recent-heading"
                                        className="kk-title text-lg text-ink"
                                    >
                                        Recent activity
                                    </h2>
                                    <p className="mt-1 text-[11px] text-ink-muted">
                                        Latest platform events
                                    </p>
                                </div>
                                <Link
                                    href={activity()}
                                    className="flex items-center gap-1 text-xs font-medium text-gold hover:text-gold-light"
                                >
                                    View all{' '}
                                    <ChevronRight className="size-3.5" />
                                </Link>
                            </div>
                            <ul>
                                {adminOverview.recent.map((item) => {
                                    const Icon = icons[item.icon];

                                    return (
                                        <li
                                            key={item.id}
                                            className="flex items-center gap-4 border-t border-border px-5 py-4 sm:px-6"
                                        >
                                            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold">
                                                <Icon className="size-[18px]" />
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-semibold text-ink">
                                                    {item.title}
                                                </p>
                                                <p className="truncate text-[11px] text-ink-muted">
                                                    {item.body}
                                                </p>
                                            </div>
                                            <span className="text-[11px] text-ink-muted">
                                                {item.when}
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </section>

                        <section
                            className="kk-panel p-5 sm:p-6"
                            aria-labelledby="quick-heading"
                        >
                            <h2
                                id="quick-heading"
                                className="kk-title text-lg text-ink"
                            >
                                Quick actions
                            </h2>
                            <p className="mt-1 text-[11px] text-ink-muted">
                                Common operational tasks
                            </p>
                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                {quickActions.map((action) => (
                                    <Link
                                        key={action.title}
                                        href={action.href}
                                        className="flex min-h-16 items-center gap-3 rounded-lg border border-border bg-surface-3/60 p-3 transition-colors hover:border-gold/40"
                                    >
                                        <span className="flex size-10 items-center justify-center rounded-lg bg-gold/10 text-gold">
                                            <action.icon className="size-[18px]" />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block text-xs font-semibold text-ink">
                                                {action.title}
                                            </span>
                                            <span className="block text-[11px] text-ink-muted">
                                                {action.note}
                                            </span>
                                        </span>
                                        <ChevronRight className="size-4 text-ink-muted" />
                                    </Link>
                                ))}
                            </div>
                        </section>
                    </div>

                    <section
                        className="kk-panel h-fit p-5 sm:p-6"
                        aria-labelledby="ops-heading"
                    >
                        <h2
                            id="ops-heading"
                            className="kk-title text-lg text-ink"
                        >
                            Casino operations
                        </h2>
                        <p className="mt-1 text-[11px] text-ink-muted">
                            Live availability
                        </p>
                        <div
                            className={cn(
                                'mt-5 flex items-center gap-3 rounded-lg border p-4',
                                casinoOpen
                                    ? 'border-success/30 bg-success/5'
                                    : 'border-crimson/40 bg-crimson/10',
                            )}
                        >
                            <span
                                className={cn(
                                    'flex size-10 items-center justify-center rounded-lg',
                                    casinoOpen
                                        ? 'bg-success/15 text-success-light'
                                        : 'bg-crimson/20 text-danger-light',
                                )}
                            >
                                <Check className="size-5" />
                            </span>
                            <div className="flex-1">
                                <p className="text-[10px] tracking-[0.12em] text-ink-muted uppercase">
                                    Casino status
                                </p>
                                <p className="text-sm font-semibold text-ink">
                                    {casinoOpen
                                        ? 'Open for play'
                                        : 'Closed for play'}
                                </p>
                            </div>
                            <Switch
                                checked={casinoOpen}
                                onCheckedChange={(next) => setConfirm(next)}
                                aria-label="Casino open for play"
                                className="data-[state=checked]:bg-success"
                            />
                        </div>
                        <ul className="mt-2">
                            {games.map((game) => (
                                <li
                                    key={game.name}
                                    className="flex items-center gap-3 border-b border-border py-4 last:border-b-0"
                                >
                                    <span className="flex size-9 items-center justify-center rounded-full border border-border bg-surface-3 font-display text-xs text-gold">
                                        {game.letter}
                                    </span>
                                    <span className="flex-1 text-sm font-semibold text-ink">
                                        {game.name}
                                    </span>
                                    <StatusPill
                                        tone={casinoOpen ? 'success' : 'danger'}
                                        caps={false}
                                    >
                                        {casinoOpen ? 'Online' : 'Offline'}
                                    </StatusPill>
                                    <span className="hidden text-[11px] text-ink-muted sm:inline">
                                        1 active
                                    </span>
                                    <Link
                                        href={sessions()}
                                        aria-label={`Manage ${game.name}`}
                                        className="text-ink-muted hover:text-ink"
                                    >
                                        <ChevronRight className="size-4" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>
            </div>

            <AlertDialog
                open={confirm !== null}
                onOpenChange={(open) => !open && setConfirm(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {confirm ? 'Open the casino?' : 'Close the casino?'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {confirm
                                ? 'Players will be able to join hosted sessions again.'
                                : 'Players will see the "Casino closed" screen and cannot join new sessions. Demo only: this resets when you reload.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                setCasinoOpen(Boolean(confirm));
                                toast.success(
                                    confirm
                                        ? 'Casino is now open'
                                        : 'Casino is now closed',
                                );
                            }}
                        >
                            Confirm
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
