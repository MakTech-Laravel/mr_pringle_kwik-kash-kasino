import { Head } from '@inertiajs/react';
import { Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import ActionButton from '@/components/casino/action-button';
import NotificationList from '@/components/casino/notification-list';
import PageHeader from '@/components/casino/page-header';
import { playerNotifications } from '@/mocks/casino';

export default function Notifications() {
    const [items, setItems] = useState(playerNotifications);
    const unread = items.filter((n) => n.unread).length;

    const markRead = (id: string) =>
        setItems((list) =>
            list.map((n) => (n.id === id ? { ...n, unread: false } : n)),
        );

    return (
        <>
            <Head title="Notifications" />
            <div className="space-y-6">
                <PageHeader
                    eyebrow="Player updates"
                    title="Notifications"
                    description="Stay informed about requests, sessions, and wallet updates."
                    actions={
                        <ActionButton
                            look="ghost"
                            disabled={unread === 0}
                            className="h-10 px-3 text-xs"
                            onClick={() => {
                                setItems((list) =>
                                    list.map((n) => ({ ...n, unread: false })),
                                );
                                toast.success(
                                    'All notifications marked as read',
                                );
                            }}
                        >
                            <Check /> Mark all as read
                        </ActionButton>
                    }
                />
                <NotificationList items={items} onRead={markRead} />
            </div>
        </>
    );
}
