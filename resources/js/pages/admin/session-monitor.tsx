import { Head, Link } from '@inertiajs/react';
import { AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import ActionButton from '@/components/casino/action-button';
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatNumber, initialsOf } from '@/lib/format';
import { statusLabel, statusTone } from '@/lib/sessions';
import { adminSessions } from '@/mocks/casino';
import { show as showGame } from '@/routes/games';
import type { GameKind } from '@/types/casino';

const participants = [
    { name: 'Marcus_V', seat: 1, balance: 12480 },
    { name: 'RubyAce', seat: 2, balance: 8200 },
    { name: 'LuckyLou', seat: 3, balance: 16050 },
    { name: 'RiverKing', seat: 4, balance: 6425 },
    { name: 'Velvet7', seat: 5, balance: 1890 },
    { name: 'NeonNina', seat: 6, balance: 9800 },
];

/** Seat anchors around the oval (desktop), following the Figma monitor. */
const anchors = [
    'left-1/2 top-0 -translate-x-1/2',
    'right-[6%] top-[24%]',
    'right-[3%] bottom-[12%]',
    'left-1/2 bottom-0 -translate-x-1/2',
    'left-[3%] bottom-[12%]',
    'left-[6%] top-[24%]',
];

const gameName: Record<GameKind, string> = {
    blackjack: 'Blackjack',
    poker: 'Poker',
    roulette: 'Roulette',
};

export default function SessionMonitor({ sessionId }: { sessionId: string }) {
    const session = adminSessions.find((s) => s.id === sessionId) ?? {
        ...adminSessions[1],
        id: sessionId,
    };
    const [title, setTitle] = useState(session.title);
    const [completed, setCompleted] = useState(session.status === 'completed');
    const [settings, setSettings] = useState(false);
    const [confirm, setConfirm] = useState(false);
    const seated = participants.slice(0, Math.min(session.seated, 6));
    const status = completed ? 'completed' : session.status;

    return (
        <>
            <Head title={`${gameName[session.game]} session`} />
            <div className="space-y-5">
                <header className="kk-panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div className="flex items-center gap-4">
                        <span className="flex size-12 items-center justify-center rounded-full border border-gold/30 bg-surface-3 font-display text-xl text-gold">
                            {session.game === 'poker'
                                ? '◆'
                                : session.game === 'blackjack'
                                  ? '♠'
                                  : 'R'}
                        </span>
                        <div>
                            <p className="kk-eyebrow mb-1">
                                {session.id} · {statusLabel[status]} session
                            </p>
                            <h1 className="kk-title text-2xl text-ink">
                                {title}
                            </h1>
                            <p className="mt-1 text-[11px] text-ink-muted">
                                {session.startedAt
                                    ? `Started ${session.startedAt.toLowerCase()} · `
                                    : ''}
                                Hosted by {session.hostName}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <StatusPill tone={statusTone[status]} caps={false}>
                            {statusLabel[status]}
                        </StatusPill>
                        <ActionButton
                            look="outline"
                            className="h-10 px-4 text-xs"
                            onClick={() => setSettings(true)}
                        >
                            Session settings
                        </ActionButton>
                        <ActionButton
                            look="danger"
                            className="h-10 px-4 text-xs"
                            disabled={completed}
                            onClick={() => setConfirm(true)}
                        >
                            Complete session
                        </ActionButton>
                    </div>
                </header>

                <section
                    aria-label="Session stats"
                    className="kk-panel grid grid-cols-2 divide-border lg:grid-cols-4 lg:divide-x"
                >
                    {[
                        ['Players', `${session.seated} / ${session.capacity}`],
                        ['Session balance', '18,500 cr'],
                        [
                            'Current state',
                            completed ? 'Completed' : 'In progress',
                        ],
                        ['Elapsed time', completed ? '—' : '00:47:18'],
                    ].map(([label, value], i) => (
                        <div
                            key={label}
                            className={
                                'p-5 ' +
                                (i < 2
                                    ? 'border-b border-border lg:border-b-0'
                                    : '')
                            }
                        >
                            <p className="text-[10px] tracking-[0.1em] text-ink-muted uppercase">
                                {label}
                            </p>
                            <p className="mt-2 text-lg font-semibold text-ink">
                                {value}
                            </p>
                        </div>
                    ))}
                </section>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)]">
                    <section className="kk-panel p-5 sm:p-6">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <h2 className="kk-title text-lg text-ink">
                                    Live {gameName[session.game].toLowerCase()}{' '}
                                    table
                                </h2>
                                <p className="text-[11px] text-ink-muted">
                                    {session.game === 'poker'
                                        ? '2–6 players · '
                                        : ''}
                                    Seat status and balances
                                </p>
                            </div>
                            <ActionButton asChild className="h-10 px-4 text-xs">
                                <Link
                                    href={showGame(
                                        {
                                            game: session.game,
                                            session: session.id,
                                        },
                                        { query: { as: 'host' } },
                                    )}
                                >
                                    Open host controls
                                </Link>
                            </ActionButton>
                        </div>

                        <div className="relative mx-auto mt-6 hidden h-[420px] max-w-[900px] lg:block">
                            <div className="kk-felt absolute inset-x-[6%] inset-y-[9%] flex flex-col items-center justify-center rounded-[999px] border-[12px] border-[#3a1f1c]">
                                <span className="flex size-12 items-center justify-center rounded-full border border-gold/60 font-display text-xl text-gold">
                                    K
                                </span>
                                <p className="mt-2 font-display text-[11px] tracking-[0.3em] text-ink/40">
                                    KWIK KASH
                                </p>
                                <p className="text-[9px] tracking-[0.2em] text-gold/60">
                                    {gameName[session.game].toUpperCase()} ·{' '}
                                    {session.id}
                                </p>
                            </div>
                            {seated.map((p, i) => (
                                <div
                                    key={p.name}
                                    className={`absolute z-10 flex items-center gap-2.5 rounded-full border border-border bg-surface/95 px-3 py-2 shadow-lg ${anchors[i]}`}
                                >
                                    <span className="flex size-8 items-center justify-center rounded-full border border-gold/50 bg-crimson/20 text-[10px] font-semibold text-gold">
                                        {initialsOf(p.name)}
                                    </span>
                                    <span className="leading-tight">
                                        <span className="block text-[11px] font-semibold text-ink">
                                            {p.name}
                                        </span>
                                        <span className="block text-[10px] text-ink-muted">
                                            {formatNumber(p.balance)} cr
                                        </span>
                                    </span>
                                </div>
                            ))}
                        </div>
                        <p className="mt-5 flex items-start gap-3 rounded-lg border border-gold/20 bg-gold/5 p-3 text-[11px] text-ink-muted">
                            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-gold" />
                            This monitoring view intentionally avoids
                            unconfirmed game mechanics. Session controls adapt
                            when final game rules are configured.
                        </p>
                    </section>

                    <section
                        className="kk-panel p-5 sm:p-6"
                        aria-labelledby="participants"
                    >
                        <h2
                            id="participants"
                            className="kk-title text-lg text-ink"
                        >
                            Participants
                        </h2>
                        <p className="mt-1 text-[11px] text-ink-muted">
                            {seated.length} currently seated
                        </p>
                        <ul className="mt-3">
                            {seated.map((p) => (
                                <li
                                    key={p.name}
                                    className="flex items-center gap-3 border-b border-border py-3.5 last:border-b-0"
                                >
                                    <span className="flex size-10 items-center justify-center rounded-full border border-gold/30 bg-crimson/15 text-xs font-semibold text-gold">
                                        {initialsOf(p.name)}
                                    </span>
                                    <span className="flex-1">
                                        <span className="block text-xs font-semibold text-ink">
                                            {p.name}
                                        </span>
                                        <span className="text-[10px] text-ink-muted">
                                            Seat {p.seat} · Active
                                        </span>
                                    </span>
                                    <span className="text-xs font-semibold text-gold">
                                        {formatNumber(p.balance)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>
            </div>

            <Dialog open={settings} onOpenChange={setSettings}>
                <DialogContent className="max-w-[calc(100%-2rem)] border-gold/20 bg-surface sm:max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle className="kk-title text-xl">
                            Session settings
                        </DialogTitle>
                        <DialogDescription>
                            Rename the session. Stakes and rules unlock once
                            game rules are confirmed.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-2">
                        <Label htmlFor="rename">Session name</Label>
                        <Input
                            id="rename"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="h-11 border-border"
                        />
                    </div>
                    <DialogFooter>
                        <ActionButton
                            className="h-10 px-5 text-xs"
                            onClick={() => {
                                setSettings(false);
                                toast.success('Settings saved');
                            }}
                        >
                            Save
                        </ActionButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={confirm} onOpenChange={setConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Complete this session?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Players are returned to the lobby and the session
                            moves to Game history.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                setCompleted(true);
                                toast.success(`${session.id} completed`);
                            }}
                        >
                            Complete session
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
