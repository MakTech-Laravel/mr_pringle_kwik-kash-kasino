import {
    AlertTriangle,
    ChevronRight,
    Dices,
    Download,
    Upload,
    UserPlus,
    Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AppNotification } from '@/types/casino';

const icons = {
    wallet: Wallet,
    game: Dices,
    request: Download,
    player: UserPlus,
    system: AlertTriangle,
};

type Props = {
    items: AppNotification[];
    /** Marks one item read (player: "Mark as read" button; admin: row click). */
    onRead: (id: string) => void;
    variant?: 'player' | 'admin';
    empty?: string;
};

/** Shared notification feed for the player panel and the admin center. */
export default function NotificationList({
    items,
    onRead,
    variant = 'player',
    empty = 'You are all caught up.',
}: Props) {
    if (items.length === 0) {
        return (
            <div className="kk-panel p-10 text-center text-sm text-ink-muted">
                {empty}
            </div>
        );
    }

    return (
        <ul className="kk-panel divide-y divide-border overflow-hidden">
            {items.map((n) => {
                const Icon =
                    n.kind === 'request' && n.title.includes('cash-out')
                        ? Upload
                        : icons[n.kind];

                return (
                    <li
                        key={n.id}
                        className={cn(
                            'flex items-center gap-3 p-4 sm:gap-4 sm:px-6 sm:py-5',
                            n.unread && 'bg-crimson/[0.07]',
                        )}
                    >
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-gold/25 bg-gold/5 text-gold">
                            <Icon className="size-[18px]" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-ink">
                                {n.title}
                            </p>
                            <p className="mt-0.5 text-xs text-ink-muted">
                                {n.body}
                            </p>
                            <p className="mt-1 text-[11px] text-ink-muted/70">
                                {n.time}
                            </p>
                        </div>
                        {n.unread && (
                            <span
                                aria-label="Unread"
                                className="size-2 shrink-0 rounded-full bg-crimson-bright"
                            />
                        )}
                        {variant === 'player' ? (
                            n.unread && (
                                <button
                                    type="button"
                                    onClick={() => onRead(n.id)}
                                    className="min-h-11 shrink-0 px-1 text-[11px] font-medium text-gold hover:text-gold-light"
                                >
                                    Mark as read
                                </button>
                            )
                        ) : (
                            <button
                                type="button"
                                onClick={() => onRead(n.id)}
                                aria-label={`Open ${n.title}`}
                                className="flex size-11 shrink-0 items-center justify-center text-ink-muted hover:text-ink"
                            >
                                <ChevronRight className="size-4" />
                            </button>
                        )}
                    </li>
                );
            })}
        </ul>
    );
}
