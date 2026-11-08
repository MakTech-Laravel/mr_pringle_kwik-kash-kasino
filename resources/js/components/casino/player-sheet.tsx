import { Download, Upload } from 'lucide-react';
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
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatNumber, formatSignedCredits, initialsOf } from '@/lib/format';
import { cn } from '@/lib/utils';
import { gameHistory, playerRecentTx } from '@/mocks/casino';
import type { PlayerSummary } from '@/types/casino';

type Props = {
    player: PlayerSummary | null;
    onClose: () => void;
    onToggleSuspend: (id: string) => void;
    /** Show the "View full profile" action (players page only). */
    showProfileAction?: boolean;
};

/** Right-hand drawer with a player's wallet, tabs and account actions. */
export default function PlayerSheet({
    player,
    onClose,
    onToggleSuspend,
    showProfileAction = false,
}: Props) {
    const [confirm, setConfirm] = useState(false);
    const suspended = player?.status === 'suspended';

    return (
        <>
            <Sheet open={!!player} onOpenChange={(o) => !o && onClose()}>
                <SheetContent
                    side="right"
                    className="w-full overflow-y-auto border-border bg-surface p-0 sm:max-w-[450px]"
                >
                    {player && (
                        <>
                            <SheetHeader className="p-5 pb-3">
                                <p className="kk-eyebrow">Player details</p>
                                <SheetTitle className="kk-title text-2xl text-ink">
                                    {player.username}
                                </SheetTitle>
                                <SheetDescription className="sr-only">
                                    Wallet, transactions and games for{' '}
                                    {player.username}
                                </SheetDescription>
                            </SheetHeader>
                            <div className="space-y-5 px-5 pb-6">
                                <div className="flex items-center gap-4 rounded-xl border border-border bg-surface-2 p-4">
                                    <span className="flex size-14 items-center justify-center rounded-full border border-gold/50 bg-crimson/20 font-display text-lg text-gold">
                                        {initialsOf(player.username)}
                                    </span>
                                    <div>
                                        <p className="kk-title text-lg text-ink">
                                            {player.username}
                                        </p>
                                        <p className="text-[11px] text-ink-muted">
                                            {player.code} · Registered{' '}
                                            {player.registered}
                                        </p>
                                        <StatusPill
                                            tone={
                                                suspended
                                                    ? 'danger'
                                                    : player.status === 'active'
                                                      ? 'success'
                                                      : 'neutral'
                                            }
                                            caps={false}
                                            className="mt-2"
                                        >
                                            {player.status
                                                .charAt(0)
                                                .toUpperCase() +
                                                player.status.slice(1)}
                                        </StatusPill>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-gold/25 bg-gradient-to-br from-gold/10 to-transparent p-4">
                                    <p className="text-[11px] text-ink-muted">
                                        Available wallet balance
                                    </p>
                                    <p className="mt-1 font-display text-4xl text-gold">
                                        {formatNumber(player.balance)}{' '}
                                        <span className="font-sans text-xs text-ink">
                                            credits
                                        </span>
                                    </p>
                                </div>

                                <Tabs defaultValue="overview">
                                    <TabsList className="h-auto w-full justify-start gap-5 rounded-none border-b border-border bg-transparent p-0">
                                        {[
                                            'overview',
                                            'transactions',
                                            'games',
                                        ].map((t) => (
                                            <TabsTrigger
                                                key={t}
                                                value={t}
                                                className="rounded-none border-0 border-b-2 border-transparent px-0 pb-2.5 text-xs text-ink-muted capitalize data-[state=active]:border-crimson-bright data-[state=active]:bg-transparent data-[state=active]:text-ink data-[state=active]:shadow-none"
                                            >
                                                {t}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>
                                    <TabsContent
                                        value="overview"
                                        className="mt-4 space-y-5"
                                    >
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                [
                                                    'Total cash-in',
                                                    `${formatNumber(player.totalCashIn)} cr`,
                                                ],
                                                [
                                                    'Total cash-out',
                                                    `${formatNumber(player.totalCashOut)} cr`,
                                                ],
                                                [
                                                    'Game winnings',
                                                    `${formatNumber(player.winnings)} cr`,
                                                ],
                                                [
                                                    'Last activity',
                                                    player.lastActivity,
                                                ],
                                            ].map(([label, value]) => (
                                                <div
                                                    key={label}
                                                    className="rounded-lg border border-border p-3"
                                                >
                                                    <p className="text-[10px] text-ink-muted">
                                                        {label}
                                                    </p>
                                                    <p className="mt-1 text-xs font-semibold text-ink">
                                                        {value}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                        <div>
                                            <h3 className="kk-title text-base text-ink">
                                                Recent transactions
                                            </h3>
                                            <Transactions />
                                        </div>
                                    </TabsContent>
                                    <TabsContent
                                        value="transactions"
                                        className="mt-4"
                                    >
                                        <Transactions />
                                    </TabsContent>
                                    <TabsContent value="games" className="mt-4">
                                        <ul className="divide-y divide-border">
                                            {gameHistory.map((g) => (
                                                <li
                                                    key={g.id}
                                                    className="flex items-center justify-between py-3 text-xs"
                                                >
                                                    <span>
                                                        <span className="block font-semibold text-ink capitalize">
                                                            {g.game}
                                                        </span>
                                                        <span className="text-ink-muted">
                                                            {g.session} ·{' '}
                                                            {g.date}
                                                        </span>
                                                    </span>
                                                    <span
                                                        className={cn(
                                                            'font-semibold',
                                                            g.net > 0
                                                                ? 'text-success-light'
                                                                : 'text-danger-light',
                                                        )}
                                                    >
                                                        {formatSignedCredits(
                                                            g.net,
                                                        )}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </TabsContent>
                                </Tabs>

                                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                                    <ActionButton
                                        look="danger"
                                        className="h-10 px-4 text-xs"
                                        onClick={() => setConfirm(true)}
                                    >
                                        {suspended
                                            ? 'Reactivate account'
                                            : 'Suspend account'}
                                    </ActionButton>
                                    {showProfileAction && (
                                        <ActionButton
                                            className="h-10 px-4 text-xs"
                                            onClick={() =>
                                                toast('Full player profile', {
                                                    description:
                                                        'Detailed profile page arrives with the backend phase.',
                                                })
                                            }
                                        >
                                            View full profile
                                        </ActionButton>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>

            <AlertDialog open={confirm} onOpenChange={setConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {suspended ? 'Reactivate' : 'Suspend'}{' '}
                            {player?.username}?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {suspended
                                ? 'The player will be able to sign in and join sessions again.'
                                : 'The player will be blocked from signing in and joining sessions. This is recorded in the activity log.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (player) {
                                    onToggleSuspend(player.id);
                                    toast.success(
                                        suspended
                                            ? 'Account reactivated'
                                            : 'Account suspended',
                                    );
                                }
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

function Transactions() {
    return (
        <ul className="divide-y divide-border">
            {playerRecentTx.map((t) => (
                <li key={t.id} className="flex items-center gap-3 py-3">
                    <span
                        className={cn(
                            'flex size-9 items-center justify-center rounded-lg',
                            t.amount > 0
                                ? 'bg-success/15 text-success-light'
                                : 'bg-crimson/20 text-danger-light',
                        )}
                    >
                        {t.amount > 0 ? (
                            <Download className="size-4" />
                        ) : (
                            <Upload className="size-4" />
                        )}
                    </span>
                    <span className="flex-1">
                        <span className="block text-xs font-semibold text-ink">
                            {t.label}
                        </span>
                        <span className="text-[11px] text-ink-muted">
                            {t.when}
                        </span>
                    </span>
                    <span className="text-xs font-semibold text-ink">
                        {formatSignedCredits(t.amount).replace(' CR', ' cr')}
                    </span>
                </li>
            ))}
        </ul>
    );
}
