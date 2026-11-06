import { useCallback, useEffect, useReducer, useRef } from 'react';
import { useDemoWallet } from '@/hooks/games/use-demo-wallet';
import {
    blackjackValue,
    cardPoints,
    createDeck,
    isBlackjack,
} from '@/lib/cards';
import type { PlayingCardData } from '@/types/casino';

/*
 * DEMO blackjack state machine. Deterministic (seeded by round), rules are
 * illustrative (3:2 natural, dealer stands on 17). Nothing here is
 * authoritative; the server will own dealing, rules and settlement.
 */

export type BlackjackPhase =
    | 'waiting-host'
    | 'betting'
    | 'player-turn'
    | 'dealer-turn'
    | 'settled';

export type HandResult = 'blackjack' | 'win' | 'push' | 'lose' | 'bust';

export type BlackjackHand = {
    cards: PlayingCardData[];
    bet: number;
    done: boolean;
    doubled: boolean;
    result?: HandResult;
    /** Credits returned to the wallet (stake included). */
    payout?: number;
};

type State = {
    phase: BlackjackPhase;
    round: number;
    deck: PlayingCardData[];
    dealer: PlayingCardData[];
    hands: BlackjackHand[];
    active: number;
    bet: number;
};

type Action =
    | { type: 'open' }
    | { type: 'setBet'; bet: number }
    | { type: 'deal' }
    | { type: 'hit' }
    | { type: 'stand' }
    | { type: 'double' }
    | { type: 'split' }
    | { type: 'dealerStep' }
    | { type: 'next' };

export const MIN_BET = 50;
export const BET_STEP = 50;

const initial: State = {
    phase: 'waiting-host',
    round: 1,
    deck: [],
    dealer: [],
    hands: [],
    active: 0,
    bet: 500,
};

function advance(state: State): State {
    const next = state.hands.findIndex((h) => !h.done);

    if (next === -1) {
        return { ...state, phase: 'dealer-turn' };
    }

    return { ...state, active: next, phase: 'player-turn' };
}

function settle(state: State): State {
    const dealerValue = blackjackValue(state.dealer).total;
    const dealerBlackjack = isBlackjack(state.dealer);

    const hands = state.hands.map((hand) => {
        const total = blackjackValue(hand.cards).total;
        const natural =
            state.hands.length === 1 &&
            isBlackjack(hand.cards) &&
            !hand.doubled;
        let result: HandResult;
        let payout = 0;

        if (total > 21) {
            result = 'bust';
        } else if (natural && !dealerBlackjack) {
            result = 'blackjack';
            payout = hand.bet * 2.5;
        } else if (dealerValue > 21 || total > dealerValue) {
            result = 'win';
            payout = hand.bet * 2;
        } else if (total === dealerValue) {
            result = 'push';
            payout = hand.bet;
        } else {
            result = 'lose';
        }

        return { ...hand, result, payout };
    });

    return { ...state, hands, phase: 'settled' };
}

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case 'open':
            return state.phase === 'waiting-host'
                ? { ...state, phase: 'betting' }
                : state;
        case 'setBet':
            return state.phase === 'betting'
                ? { ...state, bet: Math.max(MIN_BET, action.bet) }
                : state;
        case 'deal': {
            if (state.phase !== 'betting') {
                return state;
            }

            const [p1, d1, p2, d2, ...deck] = createDeck(100 + state.round);
            const hand: BlackjackHand = {
                cards: [p1, p2],
                bet: state.bet,
                done: isBlackjack([p1, p2]),
                doubled: false,
            };

            return advance({
                ...state,
                deck,
                dealer: [d1, d2],
                hands: [hand],
                active: 0,
            });
        }
        case 'hit': {
            if (state.phase !== 'player-turn') {
                return state;
            }

            const [card, ...deck] = state.deck;
            const hands = state.hands.map((h, i) => {
                if (i !== state.active) {
                    return h;
                }

                const cards = [...h.cards, card];
                const total = blackjackValue(cards).total;

                return { ...h, cards, done: total >= 21 };
            });

            return advance({ ...state, deck, hands });
        }
        case 'stand': {
            if (state.phase !== 'player-turn') {
                return state;
            }

            const hands = state.hands.map((h, i) =>
                i === state.active ? { ...h, done: true } : h,
            );

            return advance({ ...state, hands });
        }
        case 'double': {
            if (state.phase !== 'player-turn') {
                return state;
            }

            const [card, ...deck] = state.deck;
            const hands = state.hands.map((h, i) =>
                i === state.active
                    ? {
                          ...h,
                          cards: [...h.cards, card],
                          bet: h.bet * 2,
                          doubled: true,
                          done: true,
                      }
                    : h,
            );

            return advance({ ...state, deck, hands });
        }
        case 'split': {
            if (state.phase !== 'player-turn') {
                return state;
            }

            const hand = state.hands[state.active];
            const [c1, c2] = hand.cards;
            const [n1, n2, ...deck] = state.deck;
            const left: BlackjackHand = {
                cards: [c1, n1],
                bet: hand.bet,
                done: false,
                doubled: false,
            };
            const right: BlackjackHand = {
                cards: [c2, n2],
                bet: hand.bet,
                done: false,
                doubled: false,
            };
            const hands = [
                ...state.hands.slice(0, state.active),
                left,
                right,
                ...state.hands.slice(state.active + 1),
            ];

            return advance({ ...state, deck, hands });
        }
        case 'dealerStep': {
            if (state.phase !== 'dealer-turn') {
                return state;
            }

            const everyHandBusted = state.hands.every(
                (h) => blackjackValue(h.cards).total > 21,
            );

            if (everyHandBusted || blackjackValue(state.dealer).total >= 17) {
                return settle(state);
            }

            const [card, ...deck] = state.deck;

            return { ...state, deck, dealer: [...state.dealer, card] };
        }
        case 'next':
            return state.phase === 'settled'
                ? {
                      ...initial,
                      phase: 'betting',
                      round: state.round + 1,
                      bet: state.bet,
                  }
                : state;
        default:
            return state;
    }
}

type Options = {
    startingBalance: number;
    /** Player view: a simulated host opens betting automatically. */
    autoHost: boolean;
};

export function useBlackjack({ startingBalance, autoHost }: Options) {
    const [state, dispatch] = useReducer(reducer, initial);
    const wallet = useDemoWallet(startingBalance);
    const settledRound = useRef(0);

    useEffect(() => {
        if (autoHost && state.phase === 'waiting-host') {
            const id = setTimeout(() => dispatch({ type: 'open' }), 1200);

            return () => clearTimeout(id);
        }
    }, [autoHost, state.phase]);

    useEffect(() => {
        if (state.phase === 'dealer-turn') {
            const id = setTimeout(() => dispatch({ type: 'dealerStep' }), 750);

            return () => clearTimeout(id);
        }
    }, [state.phase, state.dealer.length]);

    const { apply, announce } = wallet;

    useEffect(() => {
        if (state.phase === 'settled' && settledRound.current !== state.round) {
            settledRound.current = state.round;
            const returned = state.hands.reduce(
                (s, h) => s + (h.payout ?? 0),
                0,
            );
            const staked = state.hands.reduce((s, h) => s + h.bet, 0);

            if (returned > 0) {
                apply(returned);
            }

            const net = returned - staked;
            announce(net > 0 ? 'You won' : net < 0 ? 'You lost' : 'Push', net);
        }
    }, [state.phase, state.round, state.hands, apply, announce]);

    const hand = state.hands[state.active];
    const canAct = state.phase === 'player-turn' && !!hand;
    const canDouble =
        canAct && hand.cards.length === 2 && wallet.balance >= hand.bet;
    const canSplit =
        canAct &&
        state.hands.length === 1 &&
        hand.cards.length === 2 &&
        cardPoints(hand.cards[0]) === cardPoints(hand.cards[1]) &&
        wallet.balance >= hand.bet;

    const actions = {
        open: useCallback(() => dispatch({ type: 'open' }), []),
        setBet: useCallback(
            (bet: number) => dispatch({ type: 'setBet', bet }),
            [],
        ),
        deal: () => {
            if (state.bet > wallet.balance) {
                return;
            }

            wallet.apply(-state.bet);
            dispatch({ type: 'deal' });
        },
        hit: () => dispatch({ type: 'hit' }),
        stand: () => dispatch({ type: 'stand' }),
        double: () => {
            wallet.apply(-hand.bet);
            dispatch({ type: 'double' });
        },
        split: () => {
            wallet.apply(-hand.bet);
            dispatch({ type: 'split' });
        },
        next: () => dispatch({ type: 'next' }),
    };

    return {
        state,
        balance: wallet.balance,
        actions,
        canAct,
        canDouble,
        canSplit,
        holeHidden: state.phase === 'player-turn',
    };
}
