import { createInertiaApp } from '@inertiajs/react';
import AppToaster from '@/components/app-toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import AdminLayout from '@/layouts/admin-layout';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import PlayerLayout from '@/layouts/player-layout';
import SettingsLayout from '@/layouts/settings/layout';

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
            case name.startsWith('settings/'):
                // Security and profile settings sit inside the role's own shell.
                return [
                    (page.props as { auth?: { user?: { role?: string } } }).auth
                        ?.user?.role === 'admin'
                        ? AdminLayout
                        : PlayerLayout,
                    SettingsLayout,
                ];
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
