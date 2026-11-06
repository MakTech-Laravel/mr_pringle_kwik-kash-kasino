import ActionButton from '@/components/casino/action-button';
import StatusPill from '@/components/casino/status-pill';
import { ActionTray, TrayStat } from '@/components/games/game-shell';
import {
    CHIPS,
    OUTSIDE,
    RED_NUMBERS,
    WHEEL_ORDER,
    sumBets,
    type BetKey,
    type useRoulette,
} from '@/hooks/games/use-roulette';
import { formatCredits, formatSignedCredits } from '@/lib/format';
import { cn } from '@/lib/utils';

type Game = ReturnType<typeof useRoulette>;

const SLICE = 360 / WHEEL_ORDER.length;
const wheelGradient = `conic-gradient(from 0deg, ${WHEEL_ORDER.map((n, i) => {
    const color =
        n === 0 ? '#1f7a52' : RED_NUMBERS.has(n) ? '#8e1f26' : '#15110f';

    return `${color} ${i * SLICE}deg ${(i + 1) * SLICE}deg`;
}).join(', ')})`;

function colorOf(n: number): 'green' | 'red' | 'black' {
    return n === 0 ? 'green' : RED_NUMBERS.has(n) ? 'red' : 'black';
}

type Props = { game: Game; isHost: boolean };

export default function RouletteTable({ game, isHost }: Props) {
    const { state, balance, actions } = game;
    const total = (key: BetKey) =>
        (state.staged[key] ?? 0) + (state.placed[key] ?? 0);
    const canBet = state.phase === 'betting';
    const placedTotal = sumBets(state.placed);
    const net = state.payout - placedTotal;

    const status =
        state.phase === 'waiting-host'
            ? {
                  title: 'Waiting for host',
                  sub: 'The host will open betting shortly.',
              }
            : state.phase === 'betting'
              ? {
                    title: 'Place your bets',
                    sub: 'Select a number or an outside option.',
                }
              : state.phase === 'spinning'
                ? { title: 'No more bets', sub: 'The wheel is spinning…' }
                : {
                      title: `${state.winning} · ${colorOf(state.winning ?? 0)}`,
                      sub:
                          placedTotal === 0
                              ? 'You had no bets this round.'
                              : net > 0
                                ? `You won ${formatSignedCredits(net)}`
                                : `No win ${formatSignedCredits(net)}`,
                  };

    const cell = (n: number) => {
        const key = `n:${n}` as BetKey;
        const amount = total(key);
        const color = colorOf(n);

        return (
            <button
                key={n}
                type="button"
                disabled={!canBet}
                onClick={() => actions.stage(key)}
                aria-label={`Bet on ${n}`}
                className={cn(
                    'relative flex h-12 items-center justify-center rounded-sm border border-white/15 text-xs font-bold text-ink transition-colors sm:h-14 lg:h-12',
                    color === 'red' && 'bg-[#8e1f26] hover:bg-[#a52630]',
                    color === 'black' && 'bg-[#15110f] hover:bg-[#241c19]',
                    color === 'green' && 'bg-[#1f7a52] hover:bg-[#268a5d]',
                    state.winning === n &&
                        state.phase === 'result' &&
                        'ring-2 ring-gold',
                    !canBet && 'cursor-not-allowed opacity-90',
                )}
            >
                {n}
                {amount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 rounded-full bg-gold px-1.5 py-0.5 text-[9px] font-bold text-black">
                        {amount}
                    </span>
                )}
            </button>
        );
    };

    const rows = [1, 13, 25].map((start) =>
        Array.from({ length: 12 }, (_, i) => start + i),
    );
    const colRows = Array.from({ length: 12 }, (_, r) => [
        3 * r + 1,
        3 * r + 2,
        3 * r + 3,
    ]);
    const winColor = state.winning !== null ? colorOf(state.winning) : null;

    return (
        <div className="space-y-4">
            <section
                aria-label="Roulette table"
                className="kk-panel grid gap-6 bg-[radial-gradient(ellipse_at_20%_30%,rgb(110_25_30/0.35),transparent_60%)] p-4 sm:p-6 lg:grid-cols-[minmax(260px,0.8fr)_1.4fr] lg:p-8"
            >
                <div className="flex flex-col items-center justify-center">
                    <div className="relative size-60 sm:size-72">
                        <span
                            aria-hidden
                            className="absolute -top-2 left-1/2 z-10 -translate-x-1/2 border-x-[9px] border-t-[16px] border-x-transparent border-t-gold"
                        />
                        <div
                            aria-hidden
                            className="size-full rounded-full border-[10px] border-[#6a4524] shadow-[0_0_40px_rgb(0_0_0/0.5)]"
                            style={{
                                background: wheelGradient,
                                transform: `rotate(${state.rotation}deg)`,
                                transition:
                                    state.phase === 'spinning'
                                        ? 'transform 4s cubic-bezier(0.12, 0.6, 0.15, 1)'
                                        : 'none',
                            }}
                        />
                        <div className="absolute inset-[22%] flex flex-col items-center justify-center rounded-full border-[5px] border-gold bg-[#2a1b16] shadow-inner">
                            <span className="font-display text-4xl font-semibold text-gold-light">
                                {state.phase === 'spinning'
                                    ? '…'
                                    : (state.winning ?? state.history[0])}
                            </span>
                            <span className="text-[8px] tracking-[0.2em] text-ink-muted uppercase">
                                {state.winning !== null &&
                                state.phase === 'result'
                                    ? winColor
                                    : 'Last number'}
                            </span>
                        </div>
                    </div>
                    <h2
                        className="kk-title mt-6 text-xl text-ink"
                        role="status"
                    >
                        {status.title}
                    </h2>
                    <p className="mt-1 text-center text-xs text-ink-muted">
                        {status.sub}
                    </p>
                    <ul
                        aria-label="Recent results"
                        className="mt-4 flex flex-wrap justify-center gap-1.5"
                    >
                        {state.history.map((n, i) => (
                            <li
                                key={i}
                                className={cn(
                                    'flex size-7 items-center justify-center rounded-full text-[10px] font-bold text-ink',
                                    colorOf(n) === 'red' && 'bg-[#8e1f26]',
                                    colorOf(n) === 'black' &&
                                        'bg-[#15110f] ring-1 ring-white/20',
                                    colorOf(n) === 'green' && 'bg-[#1f7a52]',
                                )}
                            >
                                {n}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="min-w-0 space-y-2">
                    <button
                        type="button"
                        disabled={!canBet}
                        onClick={() => actions.stage('n:0')}
                        aria-label="Bet on 0"
                        className="relative flex h-11 w-full items-center justify-center rounded-sm border border-white/15 bg-[#1f7a52] text-xs font-bold text-ink hover:bg-[#268a5d]"
                    >
                        0
                        {total('n:0') > 0 && (
                            <span className="absolute -top-1.5 right-2 rounded-full bg-gold px-1.5 py-0.5 text-[9px] font-bold text-black">
                                {total('n:0')}
                            </span>
                        )}
                    </button>

                    <div className="hidden gap-1 lg:grid lg:grid-cols-12">
                        {rows.flat().map(cell)}
                    </div>
                    <div className="grid grid-cols-3 gap-1 lg:hidden">
                        {colRows.flat().map(cell)}
                    </div>

                    <div className="grid grid-cols-3 gap-1 pt-1 lg:grid-cols-6">
                        {OUTSIDE.map((o) => {
                            const key = `o:${o.id}` as BetKey;
                            const amount = total(key);

                            return (
                                <button
                                    key={o.id}
                                    type="button"
                                    disabled={!canBet}
                                    onClick={() => actions.stage(key)}
                                    className={cn(
                                        'relative h-11 rounded-sm border text-[11px] font-semibold tracking-wider text-ink',
                                        o.id === 'red'
                                            ? 'border-white/15 bg-[#8e1f26]'
                                            : o.id === 'black'
                                              ? 'border-white/15 bg-[#15110f]'
                                              : 'border-success/30 bg-[#123b2b]',
                                    )}
                                >
                                    {o.label}
                                    {amount > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 rounded-full bg-gold px-1.5 py-0.5 text-[9px] font-bold text-black">
                                            {amount}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            <ActionTray>
                <div className="grid grid-cols-3 gap-3 sm:flex sm:flex-wrap sm:items-center sm:gap-x-8 sm:gap-y-3">
                    <TrayStat
                        label="Balance (demo)"
                        value={formatCredits(balance)}
                    />
                    <TrayStat
                        label="Selected bets"
                        value={
                            game.stagedTotal + placedTotal > 0
                                ? `${formatCredits(game.stagedTotal)}${placedTotal ? ` + ${formatCredits(placedTotal)} placed` : ''}`
                                : 'None'
                        }
                    />
                    {state.phase === 'betting' && (
                        <TrayStat
                            label="Bets close in"
                            value={`${state.countdown}s`}
                        />
                    )}
                </div>

                {isHost ? (
                    <div className="flex flex-wrap items-center gap-3">
                        <StatusPill tone="gold">
                            Host controls (demo)
                        </StatusPill>
                        {state.phase === 'waiting-host' && (
                            <ActionButton
                                className="h-11 px-6"
                                onClick={actions.open}
                            >
                                Open betting
                            </ActionButton>
                        )}
                        {state.phase === 'betting' && (
                            <ActionButton
                                className="h-11 px-6"
                                onClick={actions.spin}
                            >
                                Close bets &amp; spin
                            </ActionButton>
                        )}
                        {state.phase === 'result' && (
                            <ActionButton
                                className="h-11 px-6"
                                onClick={actions.next}
                            >
                                Start next round
                            </ActionButton>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-wrap items-center gap-3">
                        <div
                            role="group"
                            aria-label="Chip value"
                            className="flex gap-2"
                        >
                            {CHIPS.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => actions.chip(c)}
                                    aria-pressed={state.chip === c}
                                    aria-label={`${c} credit chip`}
                                    className={cn(
                                        'flex size-11 items-center justify-center rounded-full border-2 border-dashed text-[11px] font-semibold sm:size-12',
                                        state.chip === c
                                            ? 'border-gold bg-gold/20 text-gold-light'
                                            : 'border-gold/40 text-gold/80 hover:border-gold',
                                    )}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                        {state.phase === 'result' ? (
                            <ActionButton
                                className="h-12 px-6"
                                onClick={actions.next}
                            >
                                Next round
                            </ActionButton>
                        ) : (
                            <>
                                <ActionButton
                                    look="ghost"
                                    className="h-12 px-4"
                                    disabled={game.stagedTotal === 0}
                                    onClick={actions.clear}
                                >
                                    Clear
                                </ActionButton>
                                <ActionButton
                                    className="h-12 px-6"
                                    disabled={!canBet || game.stagedTotal === 0}
                                    onClick={actions.place}
                                >
                                    Place {game.stagedTotal} CR
                                </ActionButton>
                            </>
                        )}
                    </div>
                )}
            </ActionTray>
        </div>
    );
}
