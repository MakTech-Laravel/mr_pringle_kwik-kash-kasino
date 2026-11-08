import { cn } from '@/lib/utils';

type Props = {
    open: boolean;
    liveTables: number;
    className?: string;
};

/** Sidebar card: "CASINO OPEN · 3 live tables". */
export default function CasinoStatusCard({
    open,
    liveTables,
    className,
}: Props) {
    return (
        <div
            className={cn(
                'rounded-lg border p-4',
                open
                    ? 'border-success/30 bg-success/5'
                    : 'border-crimson/40 bg-crimson/10',
                className,
            )}
        >
            <p
                className={cn(
                    'flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] uppercase',
                    open ? 'text-success-light' : 'text-danger-light',
                )}
            >
                <span aria-hidden className="size-2 rounded-full bg-current" />
                {open ? 'Casino open' : 'Casino closed'}
            </p>
            <p className="mt-2 text-sm font-semibold text-ink">
                {open ? `${liveTables} live tables` : 'Tables paused'}
            </p>
            <p className="mt-1 text-[11px] text-ink-muted">
                {open ? 'View offline experience' : 'Next event not announced'}
            </p>
        </div>
    );
}
