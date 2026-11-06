import { cn } from '@/lib/utils';
import type { PlayingCardData, Suit } from '@/types/casino';

const suitGlyph: Record<Suit, string> = {
    spades: '♠',
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
};

type Props = {
    card?: PlayingCardData;
    /** Face-down card (gold-framed back as in the Figma tables). */
    faceDown?: boolean;
    /** Empty slot outline (community card not dealt yet). */
    empty?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
};

const sizes = {
    sm: 'h-[52px] w-[38px] rounded-[5px] text-sm',
    md: 'h-[78px] w-14 rounded-md text-xl',
    lg: 'h-[100px] w-[72px] rounded-lg text-2xl',
};

/** Single playing card: face-up, face-down or empty slot. */
export default function PlayingCard({
    card,
    faceDown = false,
    empty = false,
    size = 'md',
    className,
}: Props) {
    if (empty || (!card && !faceDown)) {
        return (
            <div
                aria-hidden
                className={cn(
                    'border border-dashed border-gold/30 bg-black/10',
                    sizes[size],
                    className,
                )}
            />
        );
    }

    if (faceDown || !card) {
        return (
            <div
                role="img"
                aria-label="Face-down card"
                className={cn(
                    'flex items-center justify-center border-2 border-gold bg-[#2b1013] font-display text-[0.55em] font-semibold tracking-wider text-gold shadow-lg shadow-black/40',
                    sizes[size],
                    className,
                )}
            >
                KK
            </div>
        );
    }

    const red = card.suit === 'hearts' || card.suit === 'diamonds';

    return (
        <div
            role="img"
            aria-label={`${card.rank} of ${card.suit}`}
            className={cn(
                'relative flex flex-col justify-between bg-[#efe9de] p-1.5 font-display font-bold shadow-lg shadow-black/40',
                red ? 'text-[#c8222d]' : 'text-[#16120f]',
                sizes[size],
                className,
            )}
        >
            <span className="flex flex-col items-start leading-none">
                <span>{card.rank}</span>
                <span className="text-[0.7em]">{suitGlyph[card.suit]}</span>
            </span>
            <span className="self-end text-[1.3em] leading-none">
                {suitGlyph[card.suit]}
            </span>
        </div>
    );
}
