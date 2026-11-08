import { router } from '@inertiajs/react';
import { LogOut, Shield, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import ActionButton from '@/components/casino/action-button';
import StatusPill, { type PillTone } from '@/components/casino/status-pill';
import { leave } from '@/routes/tables';
import type { GameSession } from '@/types/casino';

type Props = {
    session: GameSession;
    title: string;
    statusLabel: string;
    statusTone: PillTone;
    /** Viewer hosts this session (admin): cannot take a seat. */
    isHost: boolean;
    /** Viewer is an admin sitting as a player: show who they are and a way out. */
    adminPlayer?: boolean;
    children: ReactNode;
    footnote: string;
};

/** Common header + footnote for every game table page. */
export default function GameShell({
    session,
    title,
    statusLabel,
    statusTone,
    isHost,
    adminPlayer = false,
    children,
    footnote,
}: Props) {
    return (
        <div className="space-y-5">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="kk-eyebrow mb-2">Live table · {session.id}</p>
                    <h1 className="kk-title text-2xl text-ink sm:text-3xl">
                        {title}
                    </h1>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-ink-muted">
                    <StatusPill tone={statusTone}>{statusLabel}</StatusPill>
                    <span className="flex items-center gap-1.5">
                        <Users className="size-3.5" />
                        Hosted by {session.hostName}
                    </span>
                </div>
            </header>

            {isHost && (
                <div
                    role="status"
                    className="flex flex-col gap-3 rounded-lg border border-gold/30 bg-gold/5 p-4 text-xs text-ink sm:flex-row sm:items-center"
                >
                    <Shield className="size-4 shrink-0 text-gold" />
                    <p className="flex-1">
                        You are hosting this session, so you view it with host
                        controls and cannot take a player seat.
                    </p>
                    <LeaveButton session={session.id} />
                </div>
            )}

            {adminPlayer && !isHost && (
                <div
                    role="status"
                    className="flex flex-col gap-3 rounded-lg border border-gold/30 bg-gold/5 p-4 text-xs text-ink sm:flex-row sm:items-center"
                >
                    <Shield className="size-4 shrink-0 text-gold" />
                    <p className="flex-1">
                        You joined this session as a player. You cannot host it
                        while you hold a seat.
                    </p>
                    <LeaveButton session={session.id} />
                </div>
            )}

            {children}

            <p className="text-center text-[11px] text-ink-muted/70">
                {footnote}
            </p>
        </div>
    );
}

function LeaveButton({ session }: { session: string }) {
    return (
        <ActionButton
            look="outline"
            className="h-9 px-4 text-xs"
            onClick={() => router.post(leave.url(session))}
        >
            <LogOut /> Leave table
        </ActionButton>
    );
}

/** Bar that holds the action controls under a table. */
export function ActionTray({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={
                'kk-panel flex flex-col gap-4 p-4 max-lg:sticky max-lg:bottom-[78px] max-lg:z-30 max-lg:bg-surface sm:flex-row sm:items-center sm:justify-between sm:px-6 ' +
                (className ?? '')
            }
        >
            {children}
        </div>
    );
}

export function TrayStat({
    label,
    value,
}: {
    label: string;
    value: ReactNode;
}) {
    return (
        <div>
            <p className="text-[10px] tracking-[0.14em] text-ink-muted uppercase">
                {label}
            </p>
            <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
        </div>
    );
}
