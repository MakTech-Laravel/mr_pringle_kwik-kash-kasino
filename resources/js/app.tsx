import { createInertiaApp } from '@inertiajs/react';
import AppToaster from '@/components/app-toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import AdminLayout from '@/layouts/admin-layout';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import PlayerLayout from '@/layouts/player-layout';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

void createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name, page) => {
        switch (true) {
            case name.startsWith('auth/'):
                return AuthLayout;
            case name.startsWith('admin/'):
                return AdminLayout;
            case name.startsWith('games/'):
                // Admins sit at tables from inside the admin console.
                return (page.props as { auth?: { user?: { role?: string } } })
                    .auth?.user?.role === 'admin'
                    ? AdminLayout
                    : PlayerLayout;
            case name.startsWith('player/'):
                return PlayerLayout;
            default:
                return AppLayout;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                {app}
                <AppToaster />
            </TooltipProvider>
        );
    },
    progress: {
        color: '#D6AD50',
    },
});
