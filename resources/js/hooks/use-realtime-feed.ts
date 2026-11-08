import { useEffect } from 'react';
import { toast } from 'sonner';
import { setCasinoOpen } from '@/hooks/use-casino-status';
import { getEcho } from '@/lib/echo';
import type { FlashToast } from '@/types/ui';

type Notification = {
    title: string;
    body?: string | null;
    type?: FlashToast['type'];
};

export const CASINO_TOAST_ID = 'casino-status';

export function casinoToastText(open: boolean): string {
    return open ? 'The casino is now open' : 'The casino is now closed';
}

/**
 * Turns live signals into toasts for the signed-in user:
 * - private `App.Models.User.{id}`: `.notification` and the `.realtime.test` diagnostic
 * - public `casino`: opened/closed (also updates every open page at once)
 * - public `reverb-ping`: the diagnostic ping
 * Listeners are removed one by one so the realtime test page keeps its own.
 */
export function useRealtimeFeed(userId: number): void {
    useEffect(() => {
        const echo = getEcho();

        if (!echo) {
            return;
        }

        const onCasino = (event: { open: boolean }) => {
            setCasinoOpen(event.open);
            toast[event.open ? 'success' : 'warning'](
                casinoToastText(event.open),
                { id: CASINO_TOAST_ID },
            );
        };
        const onPing = (event: { message?: string }) => {
            toast.info('Public signal', { description: event.message });
        };
        const onNotification = (event: Notification) => {
            toast[event.type ?? 'info'](event.title, {
                description: event.body ?? undefined,
            });
        };
        const onPrivateTest = (event: { message?: string }) => {
            toast.info('Private signal', { description: event.message });
        };

        const casino = echo.channel('casino');
        const ping = echo.channel('reverb-ping');
        const own = echo.private(`App.Models.User.${userId}`);

        casino.listen('.casino.status', onCasino);
        ping.listen('.ping', onPing);
        own.listen('.notification', onNotification);
        own.listen('.realtime.test', onPrivateTest);

        return () => {
            casino.stopListening('.casino.status', onCasino);
            ping.stopListening('.ping', onPing);
            own.stopListening('.notification', onNotification);
            own.stopListening('.realtime.test', onPrivateTest);
        };
    }, [userId]);
}
