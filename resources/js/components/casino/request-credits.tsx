import { Link } from '@inertiajs/react';
import { Check, ChevronRight, Shield } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import ActionButton from '@/components/casino/action-button';
import PageHeader from '@/components/casino/page-header';
import StatusPill from '@/components/casino/status-pill';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';
import { index as walletIndex } from '@/routes/wallet';

type Mode = 'cash-in' | 'cash-out';

type Props = {
    mode: Mode;
    /** Current available balance, used for cash-out validation. */
    balance: number;
};

const copy = {
    'cash-in': {
        title: 'Request Credits',
        description: 'Add virtual credits to your player wallet.',
        submit: 'Submit request',
        steps: [
            [
                'Submit your request',
                'Enter the virtual credit amount you need.',
            ],
            [
                'Administrator review',
                'Your request remains pending during review.',
            ],
            ['Wallet update', 'Approved requests update your balance.'],
        ],
        doneTitle: 'Your cash-in request is pending.',
        ref: 'REQ-IN-05241',
    },
    'cash-out': {
        title: 'Request Cash-out',
        description: 'Ask an administrator to remove credits from your wallet.',
        submit: 'Submit cash-out request',
        steps: [
            [
                'Submit your request',
                'Enter the virtual credits you want to cash out.',
            ],
            [
                'Administrator review',
                'Your credits are held while the request is reviewed.',
            ],
            [
                'Admin hands over in game',
                'Approved credits are paid out manually in-game.',
            ],
        ],
        doneTitle: 'Your cash-out request is pending.',
        ref: 'REQ-OUT-02318',
    },
} as const;

const quick = [500, 1000, 2500, 5000];

/**
 * Cash-in / cash-out request flow. DEMO: nothing is saved; the
 * submit handler is the seam for a real Laravel endpoint.
 */
export default function RequestCredits({ mode, balance }: Props) {
    const c = copy[mode];
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [submitted, setSubmitted] = useState<number | null>(null);

    const value = Number(amount);
    const tooMuch = mode === 'cash-out' && value > balance;
    const valid = Number.isInteger(value) && value > 0 && !tooMuch;
    const error = tooMuch
        ? `You can request at most ${formatNumber(balance)} credits.`
        : amount !== '' && !valid
          ? 'Enter a whole number of credits greater than 0.'
          : null;

    if (submitted !== null) {
        return (
            <section
                aria-live="polite"
                className="mx-auto flex max-w-xl flex-col items-center py-8 text-center sm:py-14"
            >
                <span className="flex size-16 items-center justify-center rounded-full border border-success/40 bg-success/10 text-success-light">
                    <Check className="size-7" />
                </span>
                <p className="kk-eyebrow mt-8">Request submitted</p>
                <h1 className="kk-title mt-3 text-2xl text-ink sm:text-4xl">
                    {c.doneTitle}
                </h1>
                <p className="mt-4 max-w-md text-sm text-ink-muted">
                    An administrator will review your request before your
                    credits change. We&apos;ll notify you when its status
                    changes.
                </p>
                <dl className="kk-panel mt-8 w-full divide-y divide-border text-sm">
                    <div className="flex items-center justify-between px-5 py-4">
                        <dt className="text-ink-muted">Amount</dt>
                        <dd className="font-semibold text-ink">
                            {formatNumber(submitted)} Credits
                        </dd>
                    </div>
                    <div className="flex items-center justify-between px-5 py-4">
                        <dt className="text-ink-muted">Status</dt>
                        <dd>
                            <StatusPill tone="warning">
                                Pending review
                            </StatusPill>
                        </dd>
                    </div>
                    <div className="flex items-center justify-between px-5 py-4">
                        <dt className="text-ink-muted">Reference</dt>
                        <dd className="font-semibold text-ink">{c.ref}</dd>
                    </div>
                </dl>
                <p className="mt-4 text-[11px] text-ink-muted/70">
                    Demo preview: this request is not saved.
                </p>
                <ActionButton asChild className="mt-6 h-11 px-8">
                    <Link href={walletIndex()}>Return to wallet</Link>
                </ActionButton>
            </section>
        );
    }

    return (
        <div className="space-y-8">
            <PageHeader
                eyebrow="My wallet"
                title={c.title}
                description={c.description}
            />
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)]">
                <form
                    noValidate
                    onSubmit={(e) => {
                        e.preventDefault();

                        if (!valid) {
                            return;
                        }

                        setSubmitted(value);
                        toast.success('Request submitted (demo)');
                    }}
                    className="kk-panel space-y-6 p-5 sm:p-7"
                >
                    <div className="flex items-center justify-between rounded-lg border border-gold/25 bg-gold/5 px-4 py-4 text-xs">
                        <span className="text-ink-muted">
                            Current available balance
                        </span>
                        <span className="text-sm font-semibold text-gold">
                            {formatNumber(balance)} Credits
                        </span>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amount">Credit amount</Label>
                        <div className="relative">
                            <Input
                                id="amount"
                                inputMode="numeric"
                                autoComplete="off"
                                placeholder="Enter amount"
                                value={amount}
                                aria-invalid={!!error}
                                aria-describedby="amount-error"
                                onChange={(e) =>
                                    setAmount(e.target.value.replace(/\D/g, ''))
                                }
                                className="h-14 border-border bg-background pr-12 text-base"
                            />
                            <span className="absolute top-1/2 right-4 -translate-y-1/2 text-[10px] font-semibold text-gold">
                                CR
                            </span>
                        </div>
                        <p
                            id="amount-error"
                            role="alert"
                            className="min-h-4 text-xs text-danger-light"
                        >
                            {error}
                        </p>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                            {quick.map((q) => (
                                <button
                                    key={q}
                                    type="button"
                                    onClick={() => setAmount(String(q))}
                                    className={cn(
                                        'min-h-11 rounded-lg border text-xs transition-colors',
                                        value === q
                                            ? 'border-gold/60 bg-gold/10 text-gold'
                                            : 'border-border text-ink-muted hover:border-gold/30 hover:text-ink',
                                    )}
                                >
                                    {formatNumber(q)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="note">Request note</Label>
                            <span className="text-[10px] text-ink-muted">
                                Optional
                            </span>
                        </div>
                        <Textarea
                            id="note"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Add a short note for the reviewer"
                            className="min-h-24 border-border bg-background"
                        />
                    </div>

                    <ActionButton
                        type="submit"
                        disabled={!valid}
                        className="h-12 w-full"
                    >
                        {c.submit} <ChevronRight />
                    </ActionButton>
                </form>

                <aside className="kk-panel h-fit space-y-5 p-5 sm:p-7">
                    <Shield className="size-6 text-gold" />
                    <h2 className="kk-title text-xl text-ink">
                        How requests work
                    </h2>
                    <ol className="space-y-5">
                        {c.steps.map(([title, body], i) => (
                            <li key={title} className="flex gap-3">
                                <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-gold/50 text-[11px] text-gold">
                                    {i + 1}
                                </span>
                                <span>
                                    <span className="block text-sm font-semibold text-ink">
                                        {title}
                                    </span>
                                    <span className="block text-xs text-ink-muted">
                                        {body}
                                    </span>
                                </span>
                            </li>
                        ))}
                    </ol>
                    <p className="border-t border-border pt-4 text-[11px] text-ink-muted/80">
                        No real-money payment information is collected.
                    </p>
                </aside>
            </div>
        </div>
    );
}
