import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type PillTone = 'success' | 'warning' | 'danger' | 'neutral' | 'gold';

const tones: Record<PillTone, string> = {
    success: 'border-success/30 bg-success/10 text-success-light',
    warning: 'border-gold/30 bg-gold/10 text-gold',
    danger: 'border-crimson/40 bg-crimson/15 text-danger-light',
    neutral: 'border-border bg-white/5 text-ink-muted',
    gold: 'border-gold/40 bg-gold/10 text-gold-light',
};

type Props = {
    tone?: PillTone;
    children: ReactNode;
    /** Uppercase letter-spaced style used for table/status chips. */
    caps?: boolean;
    dot?: boolean;
    className?: string;
};

/** Rounded status chip with optional leading dot (Pending, Active, Waiting…). */
export default function StatusPill({
    tone = 'neutral',
    children,
    caps = true,
    dot = true,
    className,
}: Props) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] leading-none font-semibold whitespace-nowrap',
                caps && 'tracking-[0.14em] uppercase',
                tones[tone],
                className,
            )}
        >
            {dot && (
                <span
                    aria-hidden
                    className="size-1.5 rounded-full bg-current"
                />
            )}
            {children}
        </span>
    );
}
