import PlayingCard from '@/components/games/playing-card';
import { cn } from '@/lib/utils';
import type { GameKind } from '@/types/casino';

const backgrounds: Record<GameKind, string> = {
    blackjack: 'bg-[radial-gradient(ellipse_at_50%_40%,#7a2328,#3d1316_70%)]',
    poker: 'bg-[radial-gradient(ellipse_at_50%_40%,#1a6a4d,#0c3b2a_70%)]',
    roulette: 'bg-[radial-gradient(ellipse_at_50%_40%,#3a2a2e,#1c1416_70%)]',
};

type Props = {
    game: GameKind;
    className?: string;
};

/** Illustrated tile for each game, used by lobby and dashboard cards. */
export default function GameArt({ game, className }: Props) {
    return (
        <div
            className={cn(
                'relative flex items-center justify-center overflow-hidden',
                backgrounds[game],
                className,
            )}
        >
            {/* faint crossing table lines, as in the Figma art */}
            <div
                aria-hidden
                className="absolute inset-0 opacity-40 [background:linear-gradient(25deg,transparent_47%,rgb(214_173_80/0.35)_49%,transparent_51%),linear-gradient(-25deg,transparent_47%,rgb(214_173_80/0.35)_49%,transparent_51%)]"
            />
            {game === 'roulette' ? (
                <div className="relative flex size-24 items-center justify-center rounded-full border-[5px] border-gold shadow-[0_0_30px_rgb(214_173_80/0.25)] sm:size-28">
                    <span className="flex size-12 items-center justify-center rounded-full border border-gold font-display text-lg font-semibold text-gold-light">
                        17
                    </span>
                </div>
            ) : (
                <div className="relative flex items-center">
                    <PlayingCard
                        faceDown
                        size="lg"
                        className="-rotate-[10deg]"
                    />
                    <PlayingCard
                        size="lg"
                        card={
                            game === 'blackjack'
                                ? { rank: 'A', suit: 'spades' }
                                : { rank: 'K', suit: 'diamonds' }
                        }
                        className="-ml-6 rotate-[5deg]"
                    />
                </div>
            )}
        </div>
    );
}
