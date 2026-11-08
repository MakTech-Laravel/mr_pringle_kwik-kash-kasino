import { useCallback, useEffect, useReducer, useRef } from 'react';
import { useGameWallet } from '@/hooks/games/use-game-wallet';

/*
 * Roulette. Winning numbers come from a fixed script so the table is
 * deterministic; the browser NEVER decides real outcomes. Payouts are
 * simplified (35:1 straight, 1:1 outside).
 */

export const RED_NUMBERS = new Set([
    1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
]);

export const CHIPS = [50, 100, 250, 500] as const;

/** European single-zero wheel order, clockwise from the 0 pocket. */
export const WHEEL_ORDER = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5,
    24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
];

export type OutsideBet = 'low' | 'even' | 'red' | 'black' | 'odd' | 'high';
export type BetKey = `n:${number}` | `o:${OutsideBet}`;

export const OUTSIDE: { id: OutsideBet; label: string }[] = [
    { id: 'low', label: '1–18' },
    { id: 'even', label: 'EVEN' },
    { id: 'red', label: 'RED' },
    { id: 'black', label: 'BLACK' },
    { id: 'odd', label: 'ODD' },
    { id: 'high', label: '19–36' },
];

const SCRIPT = [17, 32, 5, 0, 23, 14, 8, 29, 11, 36, 2, 21];
export const BETTING_SECONDS = 24;

export type RoulettePhase = 'waiting-host' | 'betting' | 'spinning' | 'result';

type State = {
    phase: RoulettePhase;
    round: number;
    countdown: number;
    chip: number;
    staged: Partial<Record<BetKey, number>>;
    placed: Partial<Record<BetKey, number>>;
    winning: number | null;
    history: number[];
    /** Accumulated wheel rotation in degrees, for the spin animation. */
    rotation: number;
    payout: number;
};

type Action =
    | { type: 'open' }
    | { type: 'chip'; value: number }
    | { type: 'stage'; key: BetKey }
    | { type: 'clear' }
    | { type: 'commit' }
    | { type: 'tick' }
    | { type: 'spin' }
    | { type: 'result' }
    | { type: 'next' };

const initial: State = {
    phase: 'waiting-host',
    round: 0,
    countdown: BETTING_SECONDS,
    chip: 250,
    staged: {},
    placed: {},
    winning: null,
    history: [17, 4, 22, 9, 30],
    rotation: 0,
    payout: 0,
};

export function wins(key: BetKey, n: number): boolean {
    if (key.startsWith('n:')) {
        return Number(key.slice(2)) === n;
    }

    if (n === 0) {
        return false;
    }

    switch (key.slice(2) as OutsideBet) {
        case 'low':
            return n <= 18;
        case 'high':
            return n >= 19;
        case 'even':
            return n % 2 === 0;
        case 'odd':
            return n % 2 === 1;
        case 'red':
            return RED_NUMBERS.has(n);
        case 'black':
            return !RED_NUMBERS.has(n);
    }
}

function multiplier(key: BetKey): number {
    return key.startsWith('n:') ? 36 : 2;
}

export function sumBets(bets: Partial<Record<BetKey, number>>): number {
    return Object.values(bets).reduce<number>((s, v) => s + (v ?? 0), 0);
}

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case 'open':
            return state.phase === 'waiting-host'
                ? { ...state, phase: 'betting', countdown: BETTING_SECONDS }
                : state;
        case 'chip':
            return { ...state, chip: action.value };
        case 'stage':
            return state.phase === 'betting'
                ? {
                      ...state,
                      staged: {
                          ...state.staged,
                          [action.key]:
                              (state.staged[action.key] ?? 0) + state.chip,
                      },
                  }
                : state;
        case 'clear':
            return { ...state, staged: {} };
        case 'commit': {
            const placed = { ...state.placed };

            for (const [k, v] of Object.entries(state.staged)) {
                placed[k as BetKey] = (placed[k as BetKey] ?? 0) + (v ?? 0);
            }

            return { ...state, placed, staged: {} };
        }
        case 'tick':
            return state.phase === 'betting'
                ? { ...state, countdown: Math.max(0, state.countdown - 1) }
                : state;
        case 'spin': {
            if (state.phase !== 'betting') {
                return state;
            }

            const winning = SCRIPT[state.round % SCRIPT.length];
            const placed = { ...state.placed };

            for (const [k, v] of Object.entries(state.staged)) {
                placed[k as BetKey] = (placed[k as BetKey] ?? 0) + (v ?? 0);
            }

            const payout = Object.entries(placed).reduce(
                (s, [k, v]) =>
                    wins(k as BetKey, winning)
                        ? s + (v ?? 0) * multiplier(k as BetKey)
                        : s,
                0,
            );

            return {
                ...state,
                phase: 'spinning',
                placed,
                staged: {},
                winning,
                payout,
                rotation:
                    (state.round + 1) * 1800 -
                    ((WHEEL_ORDER.indexOf(winning) + 0.5) * 360) / 37,
            };
        }
        case 'result':
            return state.phase === 'spinning'
                ? {
                      ...state,
                      phase: 'result',
                      history: [
                          state.winning as number,
                          ...state.history,
                      ].slice(0, 8),
                  }
                : state;
        case 'next':
            return state.phase === 'result'
                ? {
                      ...state,
                      phase: 'betting',
                      round: state.round + 1,
                      countdown: BETTING_SECONDS,
                      placed: {},
                      staged: {},
                      winning: null,
                      payout: 0,
                  }
                : state;
        default:
            return state;
    }
}

type Options = { startingBalance: number; autoHost: boolean };

export function useRoulette({ startingBalance, autoHost }: Options) {
    const [state, dispatch] = useReducer(reducer, initial);
    const wallet = useGameWallet(startingBalance);
    const { apply, announce, balance } = wallet;
    const settled = useRef(-1);
    const stagedTotal = sumBets(state.staged);
    const placedTotal = sumBets(state.placed);

    useEffect(() => {
        if (autoHost && state.phase === 'waiting-host') {
            const id = setTimeout(() => dispatch({ type: 'open' }), 1200);

            return () => clearTimeout(id);
        }
    }, [autoHost, state.phase]);

    useEffect(() => {
        if (state.phase !== 'betting') {
            return;
        }

        const id = setInterval(() => dispatch({ type: 'tick' }), 1000);

        return () => clearInterval(id);
    }, [state.phase]);

    useEffect(() => {
        if (autoHost && state.phase === 'betting' && state.countdown === 0) {
            if (stagedTotal > 0 && stagedTotal <= balance) {
                apply(-stagedTotal);
            }

            dispatch({ type: 'spin' });
        }
    }, [autoHost, state.phase, state.countdown, stagedTotal, balance, apply]);

    useEffect(() => {
        if (state.phase === 'spinning') {
            const id = setTimeout(() => dispatch({ type: 'result' }), 4200);

            return () => clearTimeout(id);
        }
    }, [state.phase]);

    useEffect(() => {
        if (state.phase === 'result' && settled.current !== state.round) {
            settled.current = state.round;

            if (state.payout > 0) {
                apply(state.payout);
            }

            const net = state.payout - sumBets(state.placed);

            if (sumBets(state.placed) > 0) {
                announce(net > 0 ? 'You won' : 'No win', net);
            }
        }
    }, [state.phase, state.round, state.payout, state.placed, apply, announce]);

    const actions = {
        open: useCallback(() => dispatch({ type: 'open' }), []),
        chip: useCallback(
            (value: number) => dispatch({ type: 'chip', value }),
            [],
        ),
        stage: (key: BetKey) => {
            if (stagedTotal + state.chip <= wallet.balance) {
                dispatch({ type: 'stage', key });
            }
        },
        clear: () => dispatch({ type: 'clear' }),
        /** Commits staged bets and deducts them from the table wallet. */
        place: () => {
            if (stagedTotal === 0 || stagedTotal > wallet.balance) {
                return;
            }

            apply(-stagedTotal);
            dispatch({ type: 'commit' });
        },
        spin: () => {
            if (stagedTotal > 0 && stagedTotal <= wallet.balance) {
                apply(-stagedTotal);
            }

            dispatch({ type: 'spin' });
        },
        next: () => dispatch({ type: 'next' }),
    };

    return {
        state,
        balance: wallet.balance,
        stagedTotal,
        placedTotal,
        actions,
    };
}
