import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, Shield, User } from 'lucide-react';
import ActionButton from '@/components/casino/action-button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { joinBlockedReason } from '@/lib/sessions';
import { show as showTable } from '@/routes/games';
import type { Auth } from '@/types';
import type { GameSession } from '@/types/casino';

/**
 * Admin per-session entry: sit as the host (table with host controls) or as a
 * player. The server refuses holding both seats in the same session.
 */
export default function JoinSessionMenu({ session }: { session: GameSession }) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const playerBlocked = joinBlockedReason(session, auth.user);
    const closed =
        session.status === 'completed' || session.status === 'cancelled';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <ActionButton
                    look="outline"
                    className="h-8 px-3 text-[11px]"
                    disabled={closed}
                >
                    Join <ChevronDown />
                </ActionButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-56 border-border bg-surface"
            >
                <DropdownMenuItem asChild>
                    <Link
                        href={showTable(
                            { game: session.game, session: session.id },
                            { query: { as: 'host' } },
                        )}
                    >
                        <Shield /> Join as host
                    </Link>
                </DropdownMenuItem>
                {playerBlocked ? (
                    <DropdownMenuItem disabled>
                        <User /> Join as player ({playerBlocked})
                    </DropdownMenuItem>
                ) : (
                    <DropdownMenuItem asChild>
                        <Link
                            href={showTable(
                                { game: session.game, session: session.id },
                                { query: { as: 'player' } },
                            )}
                        >
                            <User /> Join as player
                        </Link>
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
