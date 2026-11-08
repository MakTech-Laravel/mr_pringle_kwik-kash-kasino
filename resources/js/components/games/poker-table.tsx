import { Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import ActionButton from '@/components/casino/action-button';
import StatusPill from '@/components/casino/status-pill';
import { ActionTray, TrayStat } from '@/components/games/game-shell';
import PlayingCard from '@/components/games/playing-card';
import {
    MIN_RAISE,
    type PokerPlayer,
    type usePoker,
} from '@/hooks/games/use-poker';
import { formatCredits, formatNumber, initialsOf } from '@/lib/format';
import { cn } from '@/lib/utils';

type Game = ReturnType<typeof usePoker>;

function Seat({
    player,
    active,
    winner,
    showCards,
}: {
    player: PokerPlayer;
    active: boolean;
    winner: boolean;
    showCards: boolean;
}) {
    return (
        <div className="relative flex flex-col items-center">
            {player.bet > 0 && (
                <span className="absolute -top-5 z-10 rounded bg-crimson px-1.5 py-0.5 text-[9px] font-semibold text-white">
                    BET {formatNumber(player.bet)}
                </span>
            )}
            <div
                className={cn(
                    'flex min-w-[132px] items-center gap-2.5 rounded-full border bg-surface/95 px-3 py-2 shadow-lg shadow-black/40 transition-colors',
                    active
                        ? 'border-gold ring-2 ring-gold/40'
                        : 'border-border',
                    winner && 'border-success ring-2 ring-success/40',
                    player.folded && 'opacity-45',
                )}
            >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-gold/50 bg-crimson/20 text-[10px] font-semibold text-gold">
                    {initialsOf(player.name)}
                </span>
                <span className="min-w-0 leading-tight">
                    <span className="block truncate text-[11px] font-semibold text-ink">
                        {player.name}
                    </span>
                    <span className="block text-[10px] text-ink-muted">
                        {player.folded
                            ? 'Folded'
                            : player.allIn
                              ? 'All in'
                              : `${formatNumber(player.stack)} CR`}
                    </span>
                </span>
            </div>
            {!player.human && player.cards.length > 0 && !player.folded && (
                <div className="mt-1.5 flex gap-0.5">
                    {player.cards.map((c, i) => (
                        <PlayingCard
                            key={i}
                            size="sm"
                            card={c}
                            faceDown={!showCards}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

/** Seat anchor positions around the oval (desktop). Index = player index. */
const anchors = [
    'left-1/2 bottom-0 -translate-x-1/2',
    'right-[6%] bottom-0',
    'right-[9%] top-0',
    'left-[9%] top-0',
    'left-0 top-1/2 -translate-y-1/2',
];

export default function PokerTable({
    game,
    isHost,
}: {
    game: Game;
    isHost: boolean;
}) {
    const { state, me } = game;
    const [raiseExtra, setRaiseExtra] = useState(0);
    const showdown = state.phase === 'showdown';
    const raiseTo = state.currentBet + MIN_RAISE + raiseExtra;
    const maxRaise = me.bet + me.stack;
    const winner = state.players.find((p) => p.id === state.winnerId);
    const community = state.community.slice(0, game.visible);
    const net = me.stack - state.startStack;

    return (
        <div className="space-y-4">
            <section
                aria-label="Poker table"
                className="relative overflow-hidden rounded-xl border border-border bg-[radial-gradient(ellipse_at_50%_40%,rgb(60_20_20/0.35),transparent_70%)] px-3 py-6 sm:px-6"
            >
                {/* Desktop: seats around an oval table */}
                <div className="relative mx-auto hidden h-[470px] max-w-[1000px] lg:block">
                    <div className="kk-felt absolute inset-x-[10%] inset-y-[16%] flex items-center justify-center rounded-[999px] border-[14px] border-[#4a2b1c] shadow-[0_20px_50px_rgb(0_0_0/0.5)]">
                        <div
                            aria-hidden
                            className="absolute inset-3 rounded-[999px] border border-gold/20"
                        />
                        <TableCenter game={game} community={community} />
                    </div>
                    {state.players.map((p, i) => (
                        <div
                            key={p.id}
                            className={cn('absolute z-10', anchors[i])}
                        >
                            <Seat
                                player={p}
                                active={state.turn === i}
                                winner={state.winnerId === p.id}
                                showCards={showdown}
                            />
                        </div>
                    ))}
                    <div className="absolute top-1/2 right-0 z-10 -translate-y-1/2">
                        <div className="flex items-center gap-2 rounded-full border border-dashed border-border bg-surface/60 px-4 py-2.5 text-[11px] text-ink-muted">
                            <Plus className="size-3.5" /> Empty seat
                        </div>
                    </div>
                </div>

                {/* Mobile and tablet: compact felt + seat grid */}
                <div className="space-y-4 lg:hidden">
                    <div className="grid grid-cols-2 justify-items-center gap-x-2 gap-y-6 pt-4 sm:grid-cols-4">
                        {state.players.slice(1).map((p, i) => (
                            <Seat
                                key={p.id}
                                player={p}
                                active={state.turn === i + 1}
                                winner={state.winnerId === p.id}
                                showCards={showdown}
                            />
                        ))}
                    </div>
                    <div className="kk-felt relative rounded-[48px] border-[8px] border-[#4a2b1c] px-3 py-8">
                        <TableCenter game={game} community={community} />
                    </div>
                    <div className="flex justify-center">
                        <Seat
                            player={me}
                            active={state.turn === 0}
                            winner={state.winnerId === me.id}
                            showCards
                        />
                    </div>
                </div>

                {!isHost && me.cards.length > 0 && (
                    <div
                        className="relative z-20 mt-4 hidden justify-center gap-1 lg:flex"
                        aria-label="Your cards"
                    >
                        {me.cards.map((c, i) => (
                            <PlayingCard key={i} card={c} size="md" />
                        ))}
                    </div>
                )}
                {!isHost && me.cards.length > 0 && (
                    <div
                        className="mt-4 flex justify-center gap-1 lg:hidden"
                        aria-label="Your cards"
                    >
                        {me.cards.map((c, i) => (
                            <PlayingCard key={i} card={c} size="md" />
                        ))}
                    </div>
                )}
            </section>

            {showdown && winner && (
                <div
                    role="status"
                    className="rounded-lg border border-gold/30 bg-gold/5 p-4 text-center text-sm text-ink"
                >
                    <span className="font-semibold text-gold">
                        {winner.human ? 'You win' : `${winner.name} wins`}
                    </span>{' '}
                    with {state.winnerLabel} (demo result).
                    {!isHost && (
                        <span className="ml-2 text-ink-muted">
                            Your net: {net >= 0 ? '+' : '−'}
                            {formatNumber(Math.abs(net))} CR
                        </span>
                    )}
                </div>
            )}

            <ActionTray>
                <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
                    <TrayStat
                        label="Your balance (demo)"
                        value={formatCredits(me.stack)}
                    />
                    <TrayStat
                        label={
                            game.myTurn
                                ? 'Your turn'
                                : state.phase === 'waiting'
                                  ? 'Waiting'
                                  : showdown
                                    ? 'Hand over'
                                    : 'Table turn'
                        }
                        value={
                            game.myTurn
                                ? `Choose an action · ${game.secondsLeft}s`
                                : state.phase === 'waiting'
                                  ? 'Host is starting the hand…'
                                  : showdown
                                    ? 'Showdown'
                                    : `${state.players[state.turn]?.name ?? ''} is thinking…`
                        }
                    />
                </div>

                {isHost ? (
                    <div className="flex flex-wrap items-center gap-3">
                        <StatusPill tone="gold">
                            Host controls (demo)
                        </StatusPill>
                        {(state.phase === 'waiting' || showdown) && (
                            <ActionButton
                                className="h-11 px-6"
                                onClick={game.actions.start}
                            >
                                Start hand
                            </ActionButton>
                        )}
                        {!showdown && state.phase !== 'waiting' && (
                            <ActionButton
                                look="outline"
                                className="h-11 px-6"
                                onClick={game.actions.skip}
                            >
                                Skip to showdown
                            </ActionButton>
                        )}
                    </div>
                ) : showdown ? (
                    <ActionButton
                        className="h-12 px-8"
                        onClick={game.actions.start}
                    >
                        Next hand
                    </ActionButton>
                ) : (
                    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
                        <ActionButton
                            look="outline"
                            className="h-12 px-6"
                            disabled={!game.myTurn}
                            onClick={game.actions.fold}
                        >
                            Fold
                        </ActionButton>
                        {game.toCall > 0 ? (
                            <ActionButton
                                look="outline"
                                className="h-12 px-6"
                                disabled={!game.myTurn}
                                onClick={game.actions.call}
                            >
                                Call {formatNumber(game.toCall)}
                            </ActionButton>
                        ) : (
                            <ActionButton
                                look="outline"
                                className="h-12 px-6"
                                disabled={!game.myTurn}
                                onClick={game.actions.check}
                            >
                                Check
                            </ActionButton>
                        )}
                        <div className="col-span-2 flex items-center justify-center rounded-lg border border-border sm:col-span-1">
                            <button
                                type="button"
                                aria-label="Lower raise"
                                disabled={!game.myTurn || raiseExtra <= 0}
                                onClick={() =>
                                    setRaiseExtra((r) => r - MIN_RAISE)
                                }
                                className="flex size-12 items-center justify-center text-ink-muted hover:text-ink disabled:opacity-40"
                            >
                                <Minus className="size-4" />
                            </button>
                            <ActionButton
                                className="h-12 min-w-36 rounded-none px-4"
                                disabled={!game.myTurn || raiseTo > maxRaise}
                                onClick={() => {
                                    game.actions.raise(raiseTo);
                                    setRaiseExtra(0);
                                }}
                            >
                                Raise to {formatNumber(raiseTo)}
                            </ActionButton>
                            <button
                                type="button"
                                aria-label="Raise more"
                                disabled={
                                    !game.myTurn ||
                                    raiseTo + MIN_RAISE > maxRaise
                                }
                                onClick={() =>
                                    setRaiseExtra((r) => r + MIN_RAISE)
                                }
                                className="flex size-12 items-center justify-center text-ink-muted hover:text-ink disabled:opacity-40"
                            >
                                <Plus className="size-4" />
                            </button>
                        </div>
                        <ActionButton
                            look="danger"
                            className="col-span-2 h-12 px-6 sm:col-span-1"
                            disabled={!game.myTurn}
                            onClick={game.actions.allIn}
                        >
                            All-in
                        </ActionButton>
                    </div>
                )}
            </ActionTray>
        </div>
    );
}

function TableCenter({
    game,
    community,
}: {
    game: Game;
    community: Game['state']['community'];
}) {
    const { state } = game;
    const pot = state.pot + state.players.reduce((s, p) => s + p.bet, 0);

    return (
        <div className="flex flex-col items-center justify-center gap-3">
            <div className="text-center">
                <p className="text-[9px] tracking-[0.2em] text-ink-muted uppercase">
                    Current pot
                </p>
                <p className="font-display text-xl font-semibold text-gold">
                    {formatNumber(pot)} CR
                </p>
            </div>
            <div className="flex gap-1.5">
                {Array.from({ length: 5 }, (_, i) => (
                    <PlayingCard
                        key={i}
                        size="md"
                        card={community[i]}
                        empty={!community[i]}
                        faceDown={false}
                        className={
                            community[i]
                                ? 'animate-in duration-300 zoom-in-90 fade-in'
                                : 'opacity-60'
                        }
                    />
                ))}
            </div>
            <p
                aria-hidden
                className="font-display text-[11px] tracking-[0.3em] text-ink/20 uppercase"
            >
                Kwik Kash Poker
            </p>
        </div>
    );
}
