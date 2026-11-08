import { useCasinoOpen } from '@/hooks/use-casino-status';
import { demoCasino, demoWallet, playerNotifications } from '@/mocks/casino';

/**
 * Data the player shell (top bar + sidebar) needs. DEMO source: swap this
 * hook's body for shared Inertia props when the wallet API exists.
 */
export function usePlayerShell() {
    const casinoOpen = useCasinoOpen();

    return {
        balance: demoWallet.balance,
        unread: playerNotifications.filter((n) => n.unread).length,
        casinoOpen,
        liveTables: demoCasino.liveTables,
    };
}
