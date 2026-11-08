import { Minus, Plus } from 'lucide-react';
import ActionButton from '@/components/casino/action-button';
import StatusPill from '@/components/casino/status-pill';
import { ActionTray, TrayStat } from '@/components/games/game-shell';
import PlayingCard from '@/components/games/playing-card';
import {
    BET_STEP,
    MIN_BET,
    type HandResult,
    type useBlackjack,
} from '@/hooks/games/use-blackjack';
import { blackjackValue } from '@/lib/cards';
import { formatCredits, formatSignedCredits } from '@/lib/format';
import { cn } from '@/lib/utils';

type Game = ReturnType<typeof useBlackjack>;

const resultLabel: Record<HandResult, string> = {
    blackjack: 'Blackjack! 3:2',
    win: 'You win',
    push: 'Push',
    lose: 'Dealer wins',
    bust: 'Bust',
};

type Props = {
    game: Game;
    username: string;
    /** Host view: no player controls, host controls instead. */
    isHost: boolean;
};

export default function BlackjackTable({ game, username, isHost }: Props) {
    const { state, balance, actions } = game;
    const dealerCards = state.dealer;
    const dealerTotal = blackjackValue(
        game.holeHidden ? dealerCards.slice(0, 1) : dealerCards,
    ).total;
    const returned = state.hands.reduce((s, h) => s + (h.payout ?? 0), 0);
    const staked = state.hands.reduce((s, h) => s + h.bet, 0);
    const net = returned - staked;

    return (
        <div className="space-y-4">
            <section
                aria-label="Blackjack table"
                className="kk-felt relative min-h-[420px] overflow-hidden rounded-xl border-[6px] border-[#4a2b1c] p-4 sm:min-h-[480px] sm:border-[8px] sm:p-6"
            >
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-2 rounded-lg border border-gold/25 sm:inset-3"
                />

                <div className="relative flex flex-col items-center">
                    <p className="text-[10px] tracking-[0.3em] text-ink-muted uppercase">
                        Dealer
                        {dealerCards.length > 0 && ` · ${dealerTotal}`}
                    </p>
                    <div className="mt-3 flex min-h-[78px] gap-2">
                        {dealerCards.length === 0 ? (
                            <PlayingCard empty />
                        ) : (
                            dealerCards.map((card, i) => (
                                <PlayingCard
                                    key={i}
                                    card={card}
                                    faceDown={game.holeHidden && i === 1}
                                    className="animate-in duration-300 fade-in slide-in-from-top-4"
                                />
                            ))
                        )}
                    </div>
                </div>

                <div
                    aria-hidden
                    className="relative my-6 text-center font-display text-ink/15 select-none sm:my-10"
                >
                    <p className="text-xl tracking-[0.15em] sm:text-2xl">
                        KWIK KASH
                    </p>
                    <p className="text-4xl tracking-[0.2em] sm:text-6xl">
                        BLACKJACK
                    </p>
                    <p className="mt-2 text-[9px] tracking-[0.3em]">
                        HOSTED TABLE
                    </p>
                </div>

                <div className="relative grid grid-cols-[1fr_auto_1fr] items-end gap-3">
                    <div className="hidden sm:block">
                        <div className="flex size-20 items-center justify-center rounded-full border border-gold/30 text-[9px] tracking-wider text-gold/60 uppercase">
                            Open seat
                        </div>
                    </div>
                    <div className="col-span-3 flex flex-col items-center sm:col-span-1">
                        <div className="flex min-h-[78px] flex-wrap justify-center gap-4">
                            {state.hands.length === 0 ? (
                                <PlayingCard empty />
                            ) : (
                                state.hands.map((hand, hi) => (
                                    <div
                                        key={hi}
                                        className={cn(
                                            'flex flex-col items-center rounded-lg p-1.5',
                                            state.hands.length > 1 &&
                                                hi === state.active &&
                                                state.phase === 'player-turn' &&
                                                'ring-1 ring-gold',
                                        )}
                                    >
                                        <div className="flex">
                                            {hand.cards.map((card, ci) => (
                                                <PlayingCard
                                                    key={ci}
                                                    card={card}
                                                    className={cn(
                                                        ci > 0 && '-ml-5',
                                                        'animate-in duration-300 fade-in slide-in-from-bottom-4',
                                                    )}
                                                />
                                            ))}
                                        </div>
                                        <p className="mt-2 text-[11px] text-ink">
                                            {blackjackValue(hand.cards).total}
                                            {hand.result && (
                                                <span className="ml-2 font-semibold text-gold">
                                                    {resultLabel[hand.result]}
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-[10px] text-ink-muted">
                                            Bet {formatCredits(hand.bet)}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                        <p className="mt-3 text-[11px] text-ink">
                            {isHost ? 'Table view' : username}{' '}
                            {state.phase === 'betting' && (
                                <span className="font-semibold tracking-[0.14em] text-gold uppercase">
                                    Place your bet
                                </span>
                            )}
                        </p>
                    </div>
                    <div className="hidden flex-col items-center sm:flex">
                        <span className="flex size-9 items-center justify-center rounded-full border border-gold/50 bg-surface-2 text-[10px] font-semibold text-gold">
                            LM
                        </span>
                        <p className="mt-1.5 text-[10px] text-ink">LuckyMike</p>
                        <p className="text-[10px] text-ink-muted">Bet: 250</p>
                    </div>
                </div>

                {state.phase === 'waiting-host' && (
                    <div className="absolute inset-x-0 top-1/2 flex justify-center">
                        <StatusPill tone="danger">
                            Waiting for host to open betting
                        </StatusPill>
                    </div>
                )}
            </section>

            <ActionTray>
                <TrayStat
                    label="Available balance"
                    value={formatCredits(balance)}
                />

                {isHost ? (
                    <HostControls game={game} />
                ) : state.phase === 'betting' ? (
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center rounded-lg border border-border">
                            <button
                                type="button"
                                aria-label="Decrease bet"
                                disabled={state.bet <= MIN_BET}
                                onClick={() =>
                                    actions.setBet(state.bet - BET_STEP)
                                }
                                className="flex size-12 items-center justify-center text-ink-muted hover:text-ink disabled:opacity-40"
                            >
                                <Minus className="size-4" />
                            </button>
                            <div className="min-w-24 text-center">
                                <p className="text-[9px] tracking-wider text-ink-muted uppercase">
                                    Your bet
                                </p>
                                <p className="text-sm font-semibold text-ink">
                                    {formatCredits(state.bet)}
                                </p>
                            </div>
                            <button
                                type="button"
                                aria-label="Increase bet"
                                disabled={state.bet + BET_STEP > balance}
                                onClick={() =>
                                    actions.setBet(state.bet + BET_STEP)
                                }
                                className="flex size-12 items-center justify-center text-ink-muted hover:text-ink disabled:opacity-40"
                            >
                                <Plus className="size-4" />
                            </button>
                        </div>
                        <ActionButton
                            className="h-12 px-8"
                            disabled={state.bet > balance}
                            onClick={actions.deal}
                        >
                            Place bet
                        </ActionButton>
                    </div>
                ) : state.phase === 'player-turn' ? (
                    <div className="grid grid-cols-2 gap-2 sm:flex">
                        <ActionButton
                            className="h-12 px-6"
                            onClick={actions.hit}
                        >
                            Hit
                        </ActionButton>
                        <ActionButton
                            look="outline"
                            className="h-12 px-6"
                            onClick={actions.stand}
                        >
                            Stand
                        </ActionButton>
                        <ActionButton
                            look="outline"
                            className="h-12 px-6"
                            disabled={!game.canDouble}
                            onClick={actions.double}
                        >
                            Double down
                        </ActionButton>
                        <ActionButton
                            look="outline"
                            className="h-12 px-6"
                            disabled={!game.canSplit}
                            onClick={actions.split}
                        >
                            Split
                        </ActionButton>
                    </div>
                ) : state.phase === 'settled' ? (
                    <div className="flex flex-wrap items-center gap-4">
                        <p
                            role="status"
                            className={cn(
                                'text-sm font-semibold',
                                net > 0
                                    ? 'text-success-light'
                                    : net < 0
                                      ? 'text-danger-light'
                                      : 'text-ink',
                            )}
                        >
                            {net > 0
                                ? 'You won '
                                : net < 0
                                  ? 'You lost '
                                  : 'Push '}
                            {formatSignedCredits(net)}
                        </p>
                        <ActionButton
                            className="h-12 px-8"
                            onClick={actions.next}
                        >
                            Next round
                        </ActionButton>
                    </div>
                ) : (
                    <p className="text-xs text-ink-muted">
                        {state.phase === 'dealer-turn'
                            ? 'Dealer is playing…'
                            : 'Waiting for the host to open betting…'}
                    </p>
                )}
            </ActionTray>
        </div>
    );
}

function HostControls({ game }: { game: Game }) {
    const { state, actions } = game;

    return (
        <div className="flex flex-wrap items-center gap-3">
            <StatusPill tone="gold">Host controls</StatusPill>
            {state.phase === 'waiting-host' && (
                <ActionButton className="h-11 px-6" onClick={actions.open}>
                    Open betting
                </ActionButton>
            )}
            {state.phase === 'betting' && (
                <>
                    <ActionButton
                        look="outline"
                        className="h-11 px-6"
                        onClick={actions.deal}
                    >
                        Deal round
                    </ActionButton>
                </>
            )}
            {state.phase === 'settled' && (
                <ActionButton className="h-11 px-6" onClick={actions.next}>
                    Start next round
                </ActionButton>
            )}
            {(state.phase === 'player-turn' ||
                state.phase === 'dealer-turn') && (
                <ActionButton
                    look="outline"
                    className="h-11 px-6"
                    onClick={actions.stand}
                >
                    Advance hand
                </ActionButton>
            )}
        </div>
    );
}
