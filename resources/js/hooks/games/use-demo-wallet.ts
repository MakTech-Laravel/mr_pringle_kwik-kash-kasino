import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { formatSignedCredits } from '@/lib/format';

/**
 * DEMO wallet for game tables. Lives only in component state: it never
 * touches the real wallet or ledger. Real settlement is server-side.
 */
export function useDemoWallet(initial: number) {
    const [balance, setBalance] = useState(initial);

    const apply = useCallback((delta: number, label?: string) => {
        setBalance((b) => b + delta);

        if (label) {
            toast(`${label} ${formatSignedCredits(delta)}`, {
                description: 'Demo wallet only, not saved',
            });
        }
    }, []);

    const announce = useCallback((label: string, net: number) => {
        toast(`${label} ${formatSignedCredits(net)}`, {
            description: 'Demo wallet only, not saved',
        });
    }, []);

    return { balance, apply, announce };
}
