import { Head, Link } from '@inertiajs/react';
import { ChevronRight, Dices, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import ActionButton from '@/components/casino/action-button';
import JoinSessionMenu from '@/components/casino/join-session-menu';
import DataTable, { type Column } from '@/components/casino/data-table';
import PageHeader from '@/components/casino/page-header';
import StatusPill from '@/components/casino/status-pill';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { statusLabel, statusTone } from '@/lib/sessions';
import { adminSessions } from '@/mocks/casino';
import { show } from '@/routes/admin/sessions';
import type { GameKind, GameSession } from '@/types/casino';

const gameName: Record<GameKind, string> = {
    blackjack: 'Blackjack',
    poker: 'Poker',
    roulette: 'Roulette',
};
const gameIcon: Record<GameKind, string> = {
    blackjack: '♠',
    poker: '◆',
    roulette: 'R',
};
const prefix: Record<GameKind, string> = {
    blackjack: 'BJ',
    poker: 'PK',
    roulette: 'RL',
};

export default function Sessions() {
    const [sessions, setSessions] = useState<GameSession[]>(adminSessions);
    const [open, setOpen] = useState(false);
    const [game, setGame] = useState<GameKind>('poker');
    const [name, setName] = useState('');
    const [availability, setAvailability] = useState('waiting-players');

    const create = (draft: boolean) => {
        if (!name.trim()) {
            toast.error('Give the session a name first');

            return;
        }

        const number = 1191 + sessions.length;
        const capacity = game === 'roulette' ? 10 : 6;

        setSessions((list) => [
            {
                id: `${prefix[game]}-${number}`,
                game,
                title: name.trim(),
                hostName: 'James Dalton',
                hostUsername: 'admin',
                seated: 0,
                capacity,
                status: draft
                    ? 'waiting-host'
                    : (availability as GameSession['status']),
            },
            ...list,
        ]);
        toast.success(draft ? 'Draft saved' : 'Session created');
        setName('');
        setOpen(false);
    };

    const columns: Column<GameSession>[] = [
        { key: 'id', header: 'Session', primary: true, cell: (s) => s.id },
        { key: 'game', header: 'Game', cell: (s) => gameName[s.game] },
        { key: 'name', header: 'Session name', cell: (s) => s.title },
        {
            key: 'pl',
            header: 'Players',
            cell: (s) => `${s.seated} / ${s.capacity}`,
        },
        {
            key: 'status',
            header: 'Status',
            cell: (s) => (
                <StatusPill tone={statusTone[s.status]} caps={false}>
                    {statusLabel[s.status]}
                </StatusPill>
            ),
        },
        { key: 'started', header: 'Started', cell: (s) => s.startedAt ?? '—' },
        {
            key: 'manage',
            header: 'Action',
            action: true,
            cell: (s) => (
                <div className="flex items-center gap-2">
                    <ActionButton
                        asChild
                        look="outline"
                        className="h-8 px-3 text-[11px]"
                    >
                        <Link href={show(s.id)}>Manage</Link>
                    </ActionButton>
                    <JoinSessionMenu session={s} />
                </div>
            ),
        },
    ];

    return (
        <>
            <Head title="Games & sessions" />
            <div className="space-y-6">
                <PageHeader
                    title="Games & sessions"
                    description="Create and supervise all host-controlled casino sessions."
                    actions={
                        <ActionButton
                            className="h-10 px-5"
                            onClick={() => setOpen(true)}
                        >
                            <Plus /> Create session
                        </ActionButton>
                    }
                />

                <section
                    aria-label="Games"
                    className="grid gap-4 md:grid-cols-3"
                >
                    {(['blackjack', 'poker', 'roulette'] as GameKind[]).map(
                        (g) => {
                            const list = sessions.filter(
                                (s) => s.game === g && s.status === 'active',
                            );
                            const players = list.reduce(
                                (n, s) => n + s.seated,
                                0,
                            );
                            const first = sessions.find((s) => s.game === g);

                            return (
                                <article
                                    key={g}
                                    className="kk-panel p-5 sm:p-6"
                                >
                                    <div className="flex items-start justify-between">
                                        <span className="flex size-12 items-center justify-center rounded-full border border-gold/30 bg-surface-3 font-display text-lg text-gold">
                                            {gameIcon[g]}
                                        </span>
                                        <StatusPill tone="success" caps={false}>
                                            Active
                                        </StatusPill>
                                    </div>
                                    <h2 className="kk-title mt-5 text-xl text-ink">
                                        {gameName[g]}
                                    </h2>
                                    <p className="mt-1 text-[11px] text-ink-muted">
                                        {list.length} active session
                                        {list.length === 1 ? '' : 's'} ·{' '}
                                        {players} players seated
                                    </p>
                                    <dl className="mt-5 grid grid-cols-2 gap-4 border-y border-border py-4">
                                        <div>
                                            <dt className="text-[10px] text-ink-muted">
                                                Active sessions
                                            </dt>
                                            <dd className="mt-1 text-xl font-semibold text-ink">
                                                {list.length}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-[10px] text-ink-muted">
                                                Players
                                            </dt>
                                            <dd className="mt-1 text-xl font-semibold text-ink">
                                                {players}
                                            </dd>
                                        </div>
                                    </dl>
                                    <div className="mt-4 flex gap-2">
                                        {first ? (
                                            <ActionButton
                                                asChild
                                                look="outline"
                                                className="h-10 flex-1 text-xs"
                                            >
                                                <Link href={show(first.id)}>
                                                    Manage
                                                </Link>
                                            </ActionButton>
                                        ) : (
                                            <ActionButton
                                                look="outline"
                                                className="h-10 flex-1 text-xs"
                                                disabled
                                            >
                                                Manage
                                            </ActionButton>
                                        )}
                                        <ActionButton
                                            look="outline"
                                            className="size-10 px-0"
                                            aria-label={`Create ${gameName[g]} session`}
                                            onClick={() => {
                                                setGame(g);
                                                setOpen(true);
                                            }}
                                        >
                                            <Plus />
                                        </ActionButton>
                                    </div>
                                </article>
                            );
                        },
                    )}
                </section>

                <section aria-labelledby="all-sessions">
                    <div className="mb-3 flex items-end justify-between">
                        <div>
                            <h2
                                id="all-sessions"
                                className="kk-title text-lg text-ink"
                            >
                                All sessions
                            </h2>
                            <p className="text-[11px] text-ink-muted">
                                Live and recently created sessions
                            </p>
                        </div>
                        <ActionButton
                            look="outline"
                            className="h-9 px-3 text-[11px]"
                        >
                            All games <ChevronRight />
                        </ActionButton>
                    </div>
                    <DataTable
                        columns={columns}
                        rows={sessions}
                        rowKey={(s) => s.id}
                    />
                </section>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-[calc(100%-2rem)] gap-0 border-gold/20 bg-surface p-0 sm:max-w-[648px]">
                    <DialogHeader className="border-b border-border p-6 text-left">
                        <p className="kk-eyebrow">New hosted game</p>
                        <DialogTitle className="kk-title text-xl text-ink">
                            Create game session
                        </DialogTitle>
                        <DialogDescription className="sr-only">
                            Configure a new hosted session.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 p-6 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label>Game type</Label>
                            <Select
                                value={game}
                                onValueChange={(v) => setGame(v as GameKind)}
                            >
                                <SelectTrigger className="h-11 w-full border-border">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="poker">Poker</SelectItem>
                                    <SelectItem value="blackjack">
                                        Blackjack
                                    </SelectItem>
                                    <SelectItem value="roulette">
                                        Roulette
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="session-name">Session name</Label>
                            <Input
                                id="session-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. High Roller Room"
                                className="h-11 border-border"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="min-stake">Minimum stake</Label>
                            <Input
                                id="min-stake"
                                placeholder="Confirm game rules"
                                className="h-11 border-border"
                                disabled
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="max-stake">Maximum stake</Label>
                            <Input
                                id="max-stake"
                                placeholder="Confirm game rules"
                                className="h-11 border-border"
                                disabled
                            />
                        </div>
                        <div className="grid gap-2 sm:col-span-2">
                            <Label>Availability</Label>
                            <Select
                                value={availability}
                                onValueChange={setAvailability}
                            >
                                <SelectTrigger className="h-11 w-full border-border">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="waiting-players">
                                        Waiting for players
                                    </SelectItem>
                                    <SelectItem value="active">
                                        Active now
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <p className="flex items-start gap-3 rounded-lg border border-gold/20 bg-gold/5 p-3 text-[11px] text-ink-muted sm:col-span-2">
                            <Dices className="mt-0.5 size-4 shrink-0 text-gold" />
                            Only confirmed session settings will become active.
                            Players cannot create or start sessions. Stakes stay
                            disabled until game rules are confirmed.
                        </p>
                    </div>
                    <DialogFooter className="flex-row justify-end gap-2 border-t border-border p-6">
                        <ActionButton
                            look="outline"
                            className="h-10 px-4 text-xs"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </ActionButton>
                        <ActionButton
                            look="outline"
                            className="h-10 px-4 text-xs"
                            onClick={() => create(true)}
                        >
                            Save draft
                        </ActionButton>
                        <ActionButton
                            className="h-10 px-4 text-xs"
                            onClick={() => create(false)}
                        >
                            Create session
                        </ActionButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
