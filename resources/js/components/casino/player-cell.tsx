import { initialsOf } from '@/lib/format';

type Props = { name: string; subtitle?: string };

/** Avatar + username (+ optional player code) used in admin tables. */
export default function PlayerCell({ name, subtitle }: Props) {
    return (
        <span className="flex min-w-0 items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-crimson/15 text-[10px] font-semibold text-gold">
                {initialsOf(name)}
            </span>
            <span className="min-w-0 leading-tight">
                <span className="block truncate text-xs font-semibold text-ink">
                    {name}
                </span>
                {subtitle && (
                    <span className="block text-[10px] text-ink-muted/70">
                        {subtitle}
                    </span>
                )}
            </span>
        </span>
    );
}
