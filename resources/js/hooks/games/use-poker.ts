import { useEffect, useReducer, useRef, useState } from 'react';
import { toast } from 'sonner';
import { createDeck } from '@/lib/cards';
import { formatSignedCredits } from '@/lib/format';
import type { PlayingCardData } from '@/types/casino';

/*
 * DEMO poker state machine (2–6 players, host seated separately).
 * Simplified betting (50 ante, no blinds). Showdown winners follow a fixed
 * script: there is NO hand evaluation in the browser. The real engine, hand
 * ranking and settlement are server-side.
 */

export type PokerPhase =
    | 'waiting'
    | 'preflop'
    | 'flop'
    | 'turn'
    | 'river'
    | 'showdown';

export type PokerPlayer = {
    id: string;
    name: string;
    stack: number;
    bet: number;
    folded: boolean;
    allIn: boolean;
    acted: boolean;
    human: boolean;
    cards: PlayingCardData[];
};

type State = {
    phase: PokerPhase;
    hand: number;
    players: PokerPlayer[];
    community: PlayingCardData[];
    pot: number;
    currentBet: number;
    turn: number;
    winnerId: string | null;
    winnerLabel: string;
    startStack: number;
};

type Kind = 'fold' | 'check' | 'call' | 'raise' | 'allin';

type Action =
    | { type: 'start' }
    | { type: 'act'; kind: Kind; raiseTo?: number }
    | { type: 'skip' };

export const ANTE = 50;
export const MIN_RAISE = 250;
export const TURN_SECONDS = 18;

const LABELS = ['Pair of Kings', 'Flush', 'Straight', 'Two pair', 'Full house'];

const SEAT_LIST: Omit<
    PokerPlayer,
    'bet' | 'folded' | 'allIn' | 'acted' | 'cards'
>[] = [
    { id: 'me', name: 'You', stack: 12500, human: true },
    { id: 'cardqueen', name: 'CardQueen', stack: 10100, human: false },
    { id: 'luckymike', name: 'LuckyMike', stack: 6450, human: false },
    { id: 'riverace', name: 'RiverAce', stack: 8200, human: false },
    { id: 'tablefox', name: 'TableFox', stack: 4800, human: false },
];

export function makePlayers(human: boolean, myName: string, balance: number) {
    return SEAT_LIST.map((s, i) => ({
        ...s,
        name: i === 0 ? myName : s.name,
        stack: i === 0 ? balance : s.stack,
        human: i === 0 ? human : false,
        bet: 0,
        folded: false,
        allIn: false,
        acted: false,
        cards: [],
    }));
}

function makeInitial(human: boolean, myName: string, balance: number): State {
    return {
        phase: 'waiting',
        hand: 0,
        players: makePlayers(human, myName, balance),
        community: [],
        pot: 0,
        currentBet: 0,
        turn: -1,
        winnerId: null,
        winnerLabel: '',
        startStack: balance,
    };
}

const live = (p: PokerPlayer) => !p.folded;
const canAct = (p: PokerPlayer) => !p.folded && !p.allIn;

const order: PokerPhase[] = ['preflop', 'flop', 'turn', 'river', 'showdown'];

function visibleCommunity(phase: PokerPhase): number {
    return { waiting: 0, preflop: 0, flop: 3, turn: 4, river: 5, showdown: 5 }[
        phase
    ];
}

function firstToAct(players: PokerPlayer[]): number {
    return players.findIndex(canAct);
}

function nextTurn(
    players: PokerPlayer[],
    from: number,
    currentBet: number,
): number {
    for (let step = 1; step <= players.length; step++) {
        const i = (from + step) % players.length;
        const p = players[i];

        if (canAct(p) && (!p.acted || p.bet < currentBet)) {
            return i;
        }
    }

    return -1;
}

function award(state: State, players: PokerPlayer[], pot: number): State {
    const contenders = players.filter(live);
    const winner = contenders[(state.hand - 1) % contenders.length];
    const label =
        contenders.length === 1
            ? 'Everyone else folded'
            : LABELS[(state.hand - 1) % LABELS.length];

    return {
        ...state,
        phase: 'showdown',
        pot: 0,
        players: players.map((p) =>
            p.id === winner.id
                ? { ...p, stack: p.stack + pot, bet: 0 }
                : { ...p, bet: 0 },
        ),
        turn: -1,
        winnerId: winner.id,
        winnerLabel: label,
        currentBet: 0,
    };
}

function endStreet(state: State, players: PokerPlayer[]): State {
    const pot = state.pot + players.reduce((s, p) => s + p.bet, 0);
    const reset = players.map((p) => ({ ...p, bet: 0, acted: false }));
    const idx = order.indexOf(state.phase);
    const next = order[idx + 1];

    if (
        reset.filter(live).length === 1 ||
        next === 'showdown' ||
        reset.filter(canAct).length <= 1
    ) {
        return award({ ...state, phase: 'showdown' }, reset, pot);
    }

    return {
        ...state,
        phase: next,
        pot,
        players: reset,
        currentBet: 0,
        turn: firstToAct(reset),
    };
}

function afterAction(
    state: State,
    players: PokerPlayer[],
    actor: number,
    currentBet: number,
): State {
    if (players.filter(live).length === 1) {
        const pot = state.pot + players.reduce((s, p) => s + p.bet, 0);

        return award(
            state,
            players.map((p) => ({ ...p, bet: 0 })),
            pot,
        );
    }

    const turn = nextTurn(players, actor, currentBet);

    if (turn === -1) {
        return endStreet({ ...state, currentBet }, players);
    }

    return { ...state, players, currentBet, turn };
}

function reducer(state: State, action: Action): State {
    if (action.type === 'start') {
        if (state.phase !== 'waiting' && state.phase !== 'showdown') {
            return state;
        }

        const hand = state.hand + 1;
        const deck = createDeck(900 + hand);
        const players = state.players.map((p, i) => ({
            ...p,
            stack: p.stack - ANTE,
            bet: 0,
            folded: false,
            allIn: false,
            acted: false,
            cards: [deck[i * 2], deck[i * 2 + 1]],
        }));

        return {
            ...state,
            phase: 'preflop',
            hand,
            players,
            community: deck.slice(20, 25),
            pot: ANTE * players.length,
            currentBet: 0,
            turn: 0,
            winnerId: null,
            winnerLabel: '',
            startStack: state.players[0].stack,
        };
    }

    if (action.type === 'skip') {
        if (state.phase === 'waiting' || state.phase === 'showdown') {
            return state;
        }

        const pot = state.pot + state.players.reduce((s, p) => s + p.bet, 0);

        return award(
            state,
            state.players.map((p) => ({ ...p, bet: 0 })),
            pot,
        );
    }

    if (
        state.phase === 'waiting' ||
        state.phase === 'showdown' ||
        state.turn < 0
    ) {
        return state;
    }

    const i = state.turn;
    const me = state.players[i];
    const toCall = state.currentBet - me.bet;
    let currentBet = state.currentBet;
    const players = state.players.map((p) => ({ ...p }));
    const p = players[i];

    switch (action.kind) {
        case 'fold':
            p.folded = true;
            p.acted = true;
            break;
        case 'check':
            if (toCall > 0) {
                return state;
            }

            p.acted = true;
            break;
        case 'call': {
            const amount = Math.min(toCall, p.stack);
            p.stack -= amount;
            p.bet += amount;
            p.allIn = p.stack === 0;
            p.acted = true;
            break;
        }
        case 'raise':
        case 'allin': {
            const target =
                action.kind === 'allin'
                    ? p.bet + p.stack
                    : Math.max(action.raiseTo ?? 0, currentBet + MIN_RAISE);
            const amount = Math.min(target - p.bet, p.stack);
            p.stack -= amount;
            p.bet += amount;
            p.allIn = p.stack === 0;
            p.acted = true;

            if (p.bet > currentBet) {
                currentBet = p.bet;
                players.forEach((o, oi) => {
                    if (oi !== i && canAct(o)) {
                        o.acted = false;
                    }
                });
            }

            break;
        }
    }

    return afterAction(state, players, i, currentBet);
}

/** Deterministic bot choice so the demo replays the same way. */
function botChoice(state: State): { kind: Kind; raiseTo?: number } {
    const p = state.players[state.turn];
    const toCall = state.currentBet - p.bet;
    const roll =
        (state.hand * 31 + state.turn * 17 + order.indexOf(state.phase) * 13) %
        10;

    if (toCall > 0) {
        if (roll === 0 && toCall > p.stack * 0.2) {
            return { kind: 'fold' };
        }

        return { kind: 'call' };
    }

    if (roll === 3 && p.stack > MIN_RAISE * 2) {
        return { kind: 'raise', raiseTo: state.currentBet + MIN_RAISE };
    }

    return { kind: 'check' };
}

type Options = { human: boolean; username: string; balance: number };

export function usePoker({ human, username, balance }: Options) {
    const [state, dispatch] = useReducer(reducer, undefined, () =>
        makeInitial(human, username, balance),
    );
    const [secondsLeft, setSecondsLeft] = useState(TURN_SECONDS);
    const announced = useRef(0);

    const turnPlayer = state.turn >= 0 ? state.players[state.turn] : null;
    const myTurn = !!turnPlayer?.human;

    useEffect(() => {
        if (turnPlayer && !turnPlayer.human) {
            const id = setTimeout(
                () => dispatch({ type: 'act', ...botChoice(state) }),
                900,
            );

            return () => clearTimeout(id);
        }
    }, [state, turnPlayer]);

    useEffect(() => {
        if (state.phase === 'waiting' && human) {
            const id = setTimeout(() => dispatch({ type: 'start' }), 1500);

            return () => clearTimeout(id);
        }
    }, [state.phase, human]);

    useEffect(() => {
        if (!myTurn) {
            return;
        }

        setSecondsLeft(TURN_SECONDS);
        const id = setInterval(
            () => setSecondsLeft((s) => Math.max(0, s - 1)),
            1000,
        );

        return () => clearInterval(id);
    }, [myTurn, state.phase, state.turn, state.hand, setSecondsLeft]);

    useEffect(() => {
        if (myTurn && secondsLeft === 0) {
            const toCall = state.currentBet - state.players[state.turn].bet;
            dispatch({ type: 'act', kind: toCall > 0 ? 'fold' : 'check' });
        }
    }, [myTurn, secondsLeft, state]);

    useEffect(() => {
        if (
            state.phase === 'showdown' &&
            announced.current !== state.hand &&
            human
        ) {
            announced.current = state.hand;
            const net = state.players[0].stack - state.startStack;
            const t = setTimeout(
                () =>
                    toast(
                        `${net >= 0 ? 'You won' : 'You lost'} ${formatSignedCredits(net)}`,
                        { description: 'Demo wallet only, not saved' },
                    ),
                0,
            );

            return () => clearTimeout(t);
        }
    }, [state.phase, state.hand, state.players, state.startStack, human]);

    const me = state.players[0];
    const toCall = Math.max(0, state.currentBet - me.bet);

    return {
        state,
        me,
        toCall,
        myTurn,
        secondsLeft,
        actions: {
            fold: () => dispatch({ type: 'act', kind: 'fold' }),
            check: () => dispatch({ type: 'act', kind: 'check' }),
            call: () => dispatch({ type: 'act', kind: 'call' }),
            raise: (raiseTo: number) =>
                dispatch({ type: 'act', kind: 'raise', raiseTo }),
            allIn: () => dispatch({ type: 'act', kind: 'allin' }),
            start: () => dispatch({ type: 'start' }),
            skip: () => dispatch({ type: 'skip' }),
        },
        visible: visibleCommunity(state.phase),
    };
}
