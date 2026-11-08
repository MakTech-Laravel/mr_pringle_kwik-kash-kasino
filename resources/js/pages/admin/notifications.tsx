import { Head } from '@inertiajs/react';
import { Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import ActionButton from '@/components/casino/action-button';
import NotificationList from '@/components/casino/notification-list';
import PageHeader from '@/components/casino/page-header';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { adminNotifications } from '@/mocks/casino';

export default function Notifications() {
    const [items, setItems] = useState(adminNotifications);
    const [tab, setTab] = useState('all');
    const unread = items.filter((n) => n.unread).length;

    const visible = items.filter((n) =>
        tab === 'all'
            ? true
            : tab === 'unread'
              ? n.unread
              : tab === 'requests'
                ? n.kind === 'request'
                : n.kind === 'game',
    );

    const read = (id: string) =>
        setItems((list) =>
            list.map((n) => (n.id === id ? { ...n, unread: false } : n)),
        );

    return (
        <>
            <Head title="Notification center" />
            <div className="space-y-6">
                <PageHeader
                    title="Notification center"
                    description="Operational updates and items requiring your attention."
                    actions={
                        <ActionButton
                            look="outline"
                            className="h-10 px-4 text-xs"
                            disabled={unread === 0}
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
                <Tabs value={tab} onValueChange={setTab}>
                    <TabsList className="h-auto w-full justify-start gap-6 overflow-x-auto rounded-none border-b border-border bg-transparent p-0">
                        {[
                            ['all', `All ${items.length}`],
                            ['unread', `Unread ${unread}`],
                            ['requests', 'Requests'],
                            ['games', 'Games'],
                        ].map(([value, label]) => (
                            <TabsTrigger
                                key={value}
                                value={value}
                                className="rounded-none border-0 border-b-2 border-transparent px-0 pb-3 text-xs text-ink-muted data-[state=active]:border-crimson-bright data-[state=active]:bg-transparent data-[state=active]:text-ink data-[state=active]:shadow-none"
                            >
                                {label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
                <NotificationList
                    items={visible}
                    onRead={read}
                    variant="admin"
                    empty="Nothing here right now."
                />
            </div>
        </>
    );
}
