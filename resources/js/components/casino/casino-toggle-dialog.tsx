import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    clearCasinoChange,
    setCasinoOpen,
    usePendingCasinoChange,
} from '@/hooks/use-casino-status';
import { CASINO_TOAST_ID, casinoToastText } from '@/hooks/use-realtime-feed';
import { update } from '@/routes/admin/casino-status';

/**
 * The one confirm dialog behind every casino on/off control (header pill,
 * overview switch). Saves on the server, which tells every browser.
 */
export default function CasinoToggleDialog() {
    const pending = usePendingCasinoChange();

    const confirm = () => {
        if (pending === null) {
            return;
        }

        const open = pending;

        router.put(
            update().url,
            { open },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setCasinoOpen(open);
                    toast[open ? 'success' : 'warning'](casinoToastText(open), {
                        id: CASINO_TOAST_ID,
                    });
                },
                onError: () =>
                    toast.error('Could not change the casino status'),
            },
        );
    };

    return (
        <AlertDialog
            open={pending !== null}
            onOpenChange={(open) => !open && clearCasinoChange()}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {pending ? 'Open the casino?' : 'Close the casino?'}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {pending
                            ? 'Players will be able to join hosted sessions again.'
                            : 'Players will see the "Casino closed" screen and cannot join new sessions. The change applies to everyone right away.'}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={confirm}>
                        Confirm
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
