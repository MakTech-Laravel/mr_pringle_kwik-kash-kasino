import { useCasinoOpen } from '@/hooks/use-casino-status';
import {
    casinoSummary,
    playerWallet,
    playerNotifications,
} from '@/mocks/casino';

/**
 * Data the player shell (top bar + sidebar) needs. Source: swap this
 * hook's body for shared Inertia props when the wallet API exists.
 */
export function usePlayerShell() {
    const casinoOpen = useCasinoOpen();

    return {
        balance: playerWallet.balance,
        unread: playerNotifications.filter((n) => n.unread).length,
        casinoOpen,
        liveTables: casinoSummary.liveTables,
    };
}
