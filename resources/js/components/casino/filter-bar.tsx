import { Search } from 'lucide-react';
import type { ReactNode } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type Props = {
    search: string;
    onSearch: (value: string) => void;
    placeholder: string;
    children?: ReactNode;
    className?: string;
};

/** Search field plus filter controls in a bordered bar. */
export default function FilterBar({
    search,
    onSearch,
    placeholder,
    children,
    className,
}: Props) {
    return (
        <div
            className={cn(
                'kk-panel flex flex-col gap-3 p-3 sm:p-4 lg:flex-row lg:items-center',
                className,
            )}
        >
            <div className="relative flex-1">
                <Search
                    aria-hidden
                    className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-muted"
                />
                <Input
                    value={search}
                    onChange={(e) => onSearch(e.target.value)}
                    placeholder={placeholder}
                    aria-label={placeholder}
                    className="h-11 border-border bg-background pl-10 text-sm"
                />
            </div>
            {children && (
                <div className="flex flex-wrap items-center gap-2">
                    {children}
                </div>
            )}
        </div>
    );
}

type ChipProps = {
    active?: boolean;
    onClick: () => void;
    children: ReactNode;
};

/** Pill filter button (All games, Blackjack, …). */
export function FilterChip({ active, onClick, children }: ChipProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className={cn(
                'min-h-10 rounded-lg border px-4 text-xs font-medium transition-colors',
                active
                    ? 'border-crimson/60 bg-crimson/20 text-ink'
                    : 'border-border text-ink-muted hover:border-gold/30 hover:text-ink',
            )}
        >
            {children}
        </button>
    );
}
