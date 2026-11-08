import { useSyncExternalStore } from 'react';

/**
 * DEMO STATE: casino open/closed switch shared between the admin console and
 * the player panel inside one browser tab. In-memory only (never persisted).
 * Replace with an Inertia prop + Reverb channel in the backend phase.
 */
let casinoOpen = true;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
    listeners.add(listener);

    return () => {
        listeners.delete(listener);
    };
}

export function setCasinoOpen(next: boolean): void {
    casinoOpen = next;
    listeners.forEach((listener) => listener());
}

export function useCasinoOpen(): boolean {
    return useSyncExternalStore(
        subscribe,
        () => casinoOpen,
        () => true,
    );
}
