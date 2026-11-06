import { cn } from '@/lib/utils';

type Props = {
    className?: string;
    /** Show only the K monogram (collapsed sidebar, mobile bars). */
    compact?: boolean;
};

/** Kwik Kash Kasino lockup: gold-framed K + wordmark. */
export default function BrandLogo({ className, compact = false }: Props) {
    return (
        <div className={cn('flex items-center gap-3', className)}>
            <span
                aria-hidden
                className="flex size-10 shrink-0 items-center justify-center border border-gold/70 bg-surface-2 font-display text-lg font-semibold text-gold"
            >
                K
            </span>
            {!compact && (
                <span className="leading-none">
                    <span className="block font-display text-[15px] font-semibold tracking-[0.12em] text-ink">
                        KWIK KASH
                    </span>
                    <span className="mt-1.5 block text-[10px] font-semibold tracking-[0.4em] text-gold">
                        KASINO
                    </span>
                </span>
            )}
            <span className="sr-only">Kwik Kash Kasino</span>
        </div>
    );
}
