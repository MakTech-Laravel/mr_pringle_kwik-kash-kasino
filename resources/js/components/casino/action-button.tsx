import type { ComponentProps } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Props = Omit<ComponentProps<typeof Button>, 'variant'> & {
    /** Kwik Kash button styles layered on the stock shadcn Button. */
    look?: 'primary' | 'outline' | 'danger' | 'ghost';
};

const looks = {
    primary:
        'bg-crimson text-white hover:bg-crimson-bright shadow-[0_6px_18px_rgb(169_39_44/0.35)]',
    outline:
        'border border-gold/40 bg-transparent text-ink hover:bg-gold/10 hover:text-ink',
    danger: 'border border-crimson/50 bg-crimson/10 text-danger-light hover:bg-crimson/20',
    ghost: 'bg-transparent text-ink-muted hover:bg-white/5 hover:text-ink',
} as const;

/**
 * Thin wrapper so brand styling never edits the generated shadcn Button, and
 * survives `shadcn add --overwrite`.
 */
export default function ActionButton({
    look = 'primary',
    className,
    ...props
}: Props) {
    return (
        <Button
            variant="ghost"
            className={cn('font-semibold', looks[look], className)}
            {...props}
        />
    );
}
