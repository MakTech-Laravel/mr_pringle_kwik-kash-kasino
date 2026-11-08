import { usePage } from '@inertiajs/react';
import { useEffect, useSyncExternalStore } from 'react';

/**
 * The casino open/closed switch. The server owns the value (shared Inertia
 * prop `casinoOpen`, pushed live over the `casino` channel); this tiny store
 * lets every component in the tab read it and react at once.
 */
let casinoOpen = true;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
    listeners.add(listener);

    return () => {
        listeners.delete(listener);
    };
}

function emit() {
    listeners.forEach((listener) => listener());
}

export function setCasinoOpen(next: boolean): void {
    if (next === casinoOpen) {
        return;
    }

    casinoOpen = next;
    emit();
}

export function useCasinoOpen(): boolean {
    return useSyncExternalStore(
        subscribe,
        () => casinoOpen,
        () => true,
    );
}

/** Keeps the store in step with the server value on every page visit. */
export function useCasinoSync(): void {
    const { casinoOpen: serverValue } = usePage<{ casinoOpen?: boolean }>()
        .props;

    useEffect(() => {
        if (typeof serverValue === 'boolean') {
            setCasinoOpen(serverValue);
        }
    }, [serverValue]);
}

/* The admin confirm dialog: any control can ask for a change, one dialog confirms it. */
let pending: boolean | null = null;

export function requestCasinoChange(next: boolean): void {
    pending = next;
    emit();
}

export function clearCasinoChange(): void {
    pending = null;
    emit();
}

export function usePendingCasinoChange(): boolean | null {
    return useSyncExternalStore(
        subscribe,
        () => pending,
        () => null,
    );
}
