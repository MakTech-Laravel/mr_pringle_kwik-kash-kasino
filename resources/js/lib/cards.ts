import type { PlayingCardData, Rank, Suit } from '@/types/casino';

const suits: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
const ranks: Rank[] = [
    'A',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    'J',
    'Q',
    'K',
];

/**
 * small deterministic PRNG so the same seed always deals the same
 * cards. Real games must deal server-side with a secure RNG.
 */
export function seededRandom(seed: number): () => number {
    let a = seed >>> 0;

    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export function createDeck(seed: number): PlayingCardData[] {
    const deck = suits.flatMap((suit) => ranks.map((rank) => ({ rank, suit })));
    const random = seededRandom(seed);

    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    return deck;
}

/** Blackjack hand total with soft aces. */
export function blackjackValue(cards: PlayingCardData[]): {
    total: number;
    soft: boolean;
} {
    let total = 0;
    let aces = 0;

    for (const { rank } of cards) {
        if (rank === 'A') {
            aces++;
            total += 11;
        } else if (['K', 'Q', 'J'].includes(rank)) {
            total += 10;
        } else {
            total += Number(rank);
        }
    }

    while (total > 21 && aces > 0) {
        total -= 10;
        aces--;
    }

    return { total, soft: aces > 0 };
}

export function isBlackjack(cards: PlayingCardData[]): boolean {
    return cards.length === 2 && blackjackValue(cards).total === 21;
}

export function cardPoints(card: PlayingCardData): number {
    return blackjackValue([card]).total;
}
