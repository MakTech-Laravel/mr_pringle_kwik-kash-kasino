import type { ReactNode } from 'react';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';

type Props = {
    label?: string;
    balance: number;
    caption?: string;
    actions?: ReactNode;
    footer?: ReactNode;
    className?: string;
};

/** Gold-framed hero showing the available credit balance. */
export default function BalanceCard({
    label = 'Your available balance',
    balance,
    caption,
    actions,
    footer,
    className,
}: Props) {
    return (
        <section
            aria-label="Balance"
            className={cn('kk-hero p-5 sm:p-8', className)}
        >
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-[11px] font-semibold tracking-[0.2em] text-ink-muted uppercase">
                        {label}
                    </p>
                    <p className="mt-3 flex items-baseline gap-3 font-display text-5xl font-medium text-gold sm:text-6xl">
                        {formatNumber(balance)}
                        <span className="font-sans text-sm font-semibold tracking-[0.15em] text-ink uppercase">
                            Credits
                        </span>
                    </p>
                    {caption && (
                        <p className="mt-3 text-xs text-ink-muted/80">
                            {caption}
                        </p>
                    )}
                </div>
                {actions && (
                    <div className="flex flex-wrap items-center gap-3">
                        {actions}
                    </div>
                )}
            </div>
            {footer && (
                <div className="mt-6 flex flex-wrap gap-x-10 gap-y-3 border-t border-border pt-5 text-sm">
                    {footer}
                </div>
            )}
        </section>
    );
}
