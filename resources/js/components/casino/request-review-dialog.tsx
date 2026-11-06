import { AlertTriangle, Check, X } from 'lucide-react';
import ActionButton from '@/components/casino/action-button';
import RequestStatusPill from '@/components/casino/request-status';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { formatNumber } from '@/lib/format';
import type { CashRequest } from '@/types/casino';

type Props = {
    request: CashRequest | null;
    onClose: () => void;
    onDecide: (id: string, decision: 'approved' | 'rejected') => void;
};

const warning = {
    'cash-in':
        "Approval immediately credits the player's virtual wallet. This does not process real money.",
    'cash-out':
        "Approval removes credits from the player's wallet. Hand over the in-game currency manually.",
};

/** Review (pending) or details (decided) dialog for cash requests. */
export default function RequestReviewDialog({
    request,
    onClose,
    onDecide,
}: Props) {
    const pending = request?.status === 'pending';

    return (
        <Dialog open={!!request} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-[calc(100%-2rem)] gap-0 border-gold/20 bg-surface p-0 sm:max-w-[548px]">
                {request && (
                    <>
                        <DialogHeader className="border-b border-border p-6 text-left">
                            <p className="kk-eyebrow">Request review</p>
                            <DialogTitle className="kk-title text-xl text-ink">
                                {request.id} · {request.player}
                            </DialogTitle>
                            <DialogDescription className="sr-only">
                                Review this {request.direction} request.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-5 p-6">
                            <div className="rounded-lg border border-gold/20 bg-gold/5 p-5 text-center">
                                <p className="text-[11px] text-ink-muted">
                                    Requested virtual credits
                                </p>
                                <p className="mt-2 font-display text-4xl text-gold">
                                    {formatNumber(request.credits)}{' '}
                                    <span className="text-xl">CR</span>
                                </p>
                            </div>
                            <dl className="grid grid-cols-2 gap-4 text-xs">
                                <div>
                                    <dt className="text-ink-muted">Player</dt>
                                    <dd className="mt-1 font-semibold text-ink">
                                        {request.player}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-ink-muted">
                                        Submitted
                                    </dt>
                                    <dd className="mt-1 font-semibold text-ink">
                                        {request.submitted}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-ink-muted">
                                        Available balance
                                    </dt>
                                    <dd className="mt-1 font-semibold text-ink">
                                        —
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-ink-muted">Status</dt>
                                    <dd className="mt-1">
                                        <RequestStatusPill
                                            status={request.status}
                                            caps={false}
                                        />
                                    </dd>
                                </div>
                            </dl>
                            <p className="flex items-start gap-3 rounded-lg border border-gold/20 bg-gold/5 p-3 text-[11px] text-ink-muted">
                                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-gold" />
                                {warning[request.direction]}
                            </p>
                        </div>
                        <DialogFooter className="flex-row flex-wrap justify-between gap-3 border-t border-border p-6 sm:justify-between">
                            {pending ? (
                                <>
                                    <ActionButton
                                        look="danger"
                                        className="h-10 px-4 text-xs"
                                        onClick={() =>
                                            onDecide(request.id, 'rejected')
                                        }
                                    >
                                        <X /> Reject
                                    </ActionButton>
                                    <div className="flex gap-2">
                                        <ActionButton
                                            look="outline"
                                            className="h-10 px-4 text-xs"
                                            onClick={onClose}
                                        >
                                            Cancel
                                        </ActionButton>
                                        <ActionButton
                                            className="h-10 px-4 text-xs"
                                            onClick={() =>
                                                onDecide(request.id, 'approved')
                                            }
                                        >
                                            <Check /> Approve request
                                        </ActionButton>
                                    </div>
                                </>
                            ) : (
                                <ActionButton
                                    className="ml-auto h-10 px-5 text-xs"
                                    onClick={onClose}
                                >
                                    Close details
                                </ActionButton>
                            )}
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
