import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
    label: string;
    value: string;
    note?: string;
    icon?: LucideIcon;
    /** Icon chip colour. */
    tone?: 'gold' | 'success' | 'danger';
    valueClassName?: string;
    className?: string;
};

const iconTone = {
    gold: 'bg-gold/10 text-gold',
    success: 'bg-success/15 text-success-light',
    danger: 'bg-crimson/20 text-danger-light',
};

/** KPI tile used by the admin overview and the wallet summaries. */
export default function StatCard({
    label,
    value,
    note,
    icon: Icon,
    tone = 'gold',
    valueClassName,
    className,
}: Props) {
    return (
        <div className={cn('kk-panel flex gap-3 p-4 sm:p-5', className)}>
            {Icon && (
                <span
                    className={cn(
                        'flex size-9 shrink-0 items-center justify-center rounded-lg',
                        iconTone[tone],
                    )}
                >
                    <Icon className="size-[18px]" />
                </span>
            )}
            <div className="min-w-0">
                <p className="truncate text-[10px] font-medium tracking-[0.1em] text-ink-muted uppercase">
                    {label}
                </p>
                <p
                    className={cn(
                        'mt-1.5 text-2xl font-semibold text-ink',
                        valueClassName,
                    )}
                >
                    {value}
                </p>
                {note && (
                    <p className="mt-1 truncate text-[11px] text-ink-muted/80">
                        {note}
                    </p>
                )}
            </div>
        </div>
    );
}
