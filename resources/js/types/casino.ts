/**
 * Domain types for the Kwik Kash Kasino UI.
 *
 * Everything here describes DEMO data shapes. The real Laravel API / Reverb
 * integration should satisfy these interfaces so the mock sources in
 * `@/mocks` can be replaced without touching visual components.
 */

export type GameKind = 'blackjack' | 'poker' | 'roulette';

export type SessionStatus =
    | 'waiting-players'
    | 'waiting-host'
    | 'betting'
    | 'in-progress'
    | 'full'
    | 'active'
    | 'completed'
    | 'cancelled';

export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export type PlayerAccountStatus = 'active' | 'suspended' | 'inactive';

export type TransactionType = 'cash-in' | 'cash-out' | 'win' | 'bet' | 'refund';

export type GameSession = {
    id: string;
    game: GameKind;
    title: string;
    hostName: string;
    /** username of the admin hosting this session (hosts cannot play in it) */
    hostUsername: string;
    seated: number;
    capacity: number;
    status: SessionStatus;
    startedAt?: string;
    minStake?: number;
    maxStake?: number;
};

export type WalletTransaction = {
    id: string;
    type: TransactionType;
    label: string;
    amount: number;
    previousBalance: number;
    newBalance: number;
    date: string;
    status: RequestStatus;
};

export type GameHistoryEntry = {
    id: string;
    game: GameKind;
    session: string;
    date: string;
    bet: number;
    result: 'won' | 'lost';
    net: number;
};

export type AppNotification = {
    id: string;
    title: string;
    body: string;
    time: string;
    unread: boolean;
    kind: 'wallet' | 'game' | 'request' | 'player' | 'system';
};

export type PlayerSummary = {
    id: string;
    username: string;
    code: string;
    registered: string;
    balance: number;
    status: PlayerAccountStatus;
    lastActivity: string;
    totalCashIn: number;
    totalCashOut: number;
    winnings: number;
};

export type CashRequest = {
    id: string;
    direction: 'cash-in' | 'cash-out';
    player: string;
    credits: number;
    submitted: string;
    status: RequestStatus;
};

export type LedgerEntry = {
    id: string;
    player: string;
    type: string;
    amount: number;
    previous: number;
    updated: number;
    date: string;
    status: 'completed';
};

export type AdminActivity = {
    id: string;
    admin: string;
    action: string;
    record: string;
    date: string;
};

/** Playing card used by all card-game demos. */
export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';
export type Rank =
    | 'A'
    | '2'
    | '3'
    | '4'
    | '5'
    | '6'
    | '7'
    | '8'
    | '9'
    | '10'
    | 'J'
    | 'Q'
    | 'K';
export type PlayingCardData = { rank: Rank; suit: Suit };
