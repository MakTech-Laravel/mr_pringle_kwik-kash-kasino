import { Link, router, usePage } from '@inertiajs/react';
import {
    Bell,
    ChevronLeft,
    ChevronRight,
    Dices,
    Download,
    History,
    Landmark,
    LayoutGrid,
    LogOut,
    Menu,
    Settings,
    ClipboardList,
    Upload,
    Users,
    Wallet,
    Radio,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import BrandLogo from '@/components/casino/brand-logo';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { useCasinoOpen } from '@/hooks/use-casino-status';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { initialsOf } from '@/lib/format';
import { cn } from '@/lib/utils';
import { dashboard, logout } from '@/routes';
import {
    activity,
    cashIn,
    cashOut,
    gameHistory,
    house,
    ledger,
    notifications,
    overview,
    players,
    profile,
    sessions,
    wallets,
} from '@/routes/admin';
import { index as realtimeIndex } from '@/routes/admin/realtime';
import type { User } from '@/types';

type AdminNavItem = {
    title: string;
    href: string;
    icon: typeof LayoutGrid;
    badge?: number;
};

/** Pending counts are placeholder values; the backend phase supplies real ones. */
const control: AdminNavItem[] = [
    { title: 'Overview', href: overview().url, icon: LayoutGrid },
    { title: 'Players', href: players().url, icon: Users },
    { title: 'Cash-in requests', href: cashIn().url, icon: Download, badge: 8 },
    { title: 'Cash-out requests', href: cashOut().url, icon: Upload, badge: 5 },
    { title: 'Wallets & transactions', href: wallets().url, icon: Wallet },
    { title: 'House account', href: house().url, icon: Landmark },
    { title: 'Games & sessions', href: sessions().url, icon: Dices },
    { title: 'Game history', href: gameHistory().url, icon: History },
    { title: 'Activity logs', href: activity().url, icon: ClipboardList },
];

const account: AdminNavItem[] = [
    { title: 'Notifications', href: notifications().url, icon: Bell, badge: 4 },
    { title: 'Profile & settings', href: profile().url, icon: Settings },
    { title: 'Realtime test', href: realtimeIndex().url, icon: Radio },
];

const allItems = [...control, ...account];

function useCrumb(): string {
    const { currentUrl } = useCurrentUrl();
    const exact = allItems.find((i) => i.href === currentUrl);

    if (exact) {
        return exact.title === 'Overview' ? 'Operations overview' : exact.title;
    }

    if (currentUrl.startsWith(ledger().url)) {
        return 'Transaction ledger';
    }

    if (currentUrl.startsWith('/admin/sessions/')) {
        return 'Session monitor';
    }

    return 'Admin';
}

function NavList({
    collapsed = false,
    onNavigate,
}: {
    collapsed?: boolean;
    onNavigate?: () => void;
}) {
    const { currentUrl } = useCurrentUrl();

    const render = (item: AdminNavItem) => {
        const active =
            currentUrl === item.href ||
            (item.href !== overview().url &&
                currentUrl.startsWith(item.href + '/')) ||
            (item.href === wallets().url &&
                currentUrl.startsWith(ledger().url));

        return (
            <Link
                key={item.title}
                href={item.href}
                prefetch
                onClick={onNavigate}
                title={collapsed ? item.title : undefined}
                aria-current={active ? 'page' : undefined}
                className={cn(
                    'relative flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm transition-colors',
                    collapsed && 'justify-center px-0',
                    active
                        ? 'bg-crimson/20 font-medium text-ink before:absolute before:inset-y-2 before:-left-3 before:w-[3px] before:rounded-r before:bg-crimson-bright'
                        : 'text-ink-muted hover:bg-white/5 hover:text-ink',
                )}
            >
                <item.icon
                    className={cn('size-5 shrink-0', active && 'text-gold')}
                />
                {!collapsed && <span className="flex-1">{item.title}</span>}
                {!collapsed && !!item.badge && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-crimson px-1 text-[11px] font-semibold text-white">
                        {item.badge}
                    </span>
                )}
            </Link>
        );
    };

    return (
        <nav aria-label="Admin" className="flex flex-col gap-1 px-3">
            {!collapsed && (
                <p className="px-3 pt-1 pb-2 text-[10px] font-semibold tracking-[0.2em] text-ink-muted/70 uppercase">
                    Casino control
                </p>
            )}
            {control.map(render)}
            {!collapsed ? (
                <p className="px-3 pt-6 pb-2 text-[10px] font-semibold tracking-[0.2em] text-ink-muted/70 uppercase">
                    Account
                </p>
            ) : (
                <span className="my-3 h-px bg-border" />
            )}
            {account.map(render)}
        </nav>
    );
}

function signOut() {
    router.flushAll();
    router.post(logout());
}

export default function AdminLayout({ children }: { children: ReactNode }) {
    const { auth } = usePage<{ auth: { user: User } }>().props;
    const casinoOpen = useCasinoOpen();
    const crumb = useCrumb();
    const [collapsed, setCollapsed] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div className="min-h-svh bg-background">
            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-gold/15 bg-surface transition-[width] duration-200 lg:flex',
                    collapsed ? 'w-[76px]' : 'w-[255px]',
                )}
            >
                <div
                    className={cn(
                        'flex h-[82px] items-center border-b border-border',
                        collapsed ? 'justify-center' : 'justify-between px-5',
                    )}
                >
                    <Link href={overview()}>
                        <BrandLogo compact={collapsed} />
                    </Link>
                    {!collapsed && (
                        <button
                            type="button"
                            aria-label="Collapse sidebar"
                            onClick={() => setCollapsed(true)}
                            className="rounded-md p-1.5 text-ink-muted hover:bg-white/5"
                        >
                            <ChevronLeft className="size-4" />
                        </button>
                    )}
                </div>
                {collapsed && (
                    <button
                        type="button"
                        aria-label="Expand sidebar"
                        onClick={() => setCollapsed(false)}
                        className="mx-auto mt-3 rounded-md p-1.5 text-ink-muted hover:bg-white/5"
                    >
                        <ChevronRight className="size-4" />
                    </button>
                )}
                <div className="flex-1 overflow-y-auto py-5">
                    <NavList collapsed={collapsed} />
                </div>
                <div className="border-t border-border p-3">
                    <button
                        type="button"
                        onClick={signOut}
                        className={cn(
                            'flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm text-ink-muted hover:bg-white/5 hover:text-ink',
                            collapsed && 'justify-center px-0',
                        )}
                    >
                        <LogOut className="size-5" />
                        {!collapsed && 'Sign out'}
                    </button>
                    {!collapsed && (
                        <p className="mt-2 px-3 text-[10px] tracking-wider text-ink-muted/60 uppercase">
                            Admin console · v1.4
                        </p>
                    )}
                </div>
            </aside>

            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                <SheetContent
                    side="left"
                    className="w-[300px] border-gold/15 bg-surface p-0"
                >
                    <SheetHeader className="border-b border-border p-5">
                        <SheetTitle className="sr-only">Admin menu</SheetTitle>
                        <SheetDescription className="sr-only">
                            Admin console navigation
                        </SheetDescription>
                        <BrandLogo />
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto py-4">
                        <NavList onNavigate={() => setMenuOpen(false)} />
                    </div>
                    <div className="border-t border-border p-3">
                        <button
                            type="button"
                            onClick={signOut}
                            className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm text-ink-muted hover:bg-white/5"
                        >
                            <LogOut className="size-5" /> Sign out
                        </button>
                    </div>
                </SheetContent>
            </Sheet>

            <div
                className={cn(
                    'transition-[padding] duration-200',
                    collapsed ? 'lg:pl-[76px]' : 'lg:pl-[255px]',
                )}
            >
                <header className="sticky top-0 z-30 flex h-[68px] items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur sm:px-6 lg:px-8">
                    <button
                        type="button"
                        onClick={() => setMenuOpen(true)}
                        aria-label="Open menu"
                        className="flex size-11 items-center justify-center rounded-lg text-ink-muted hover:bg-white/5 lg:hidden"
                    >
                        <Menu className="size-5" />
                    </button>
                    <nav
                        aria-label="Breadcrumb"
                        className="flex min-w-0 items-center gap-2 text-sm"
                    >
                        <span className="hidden text-ink-muted sm:inline">
                            Admin
                        </span>
                        <ChevronRight className="hidden size-3.5 text-ink-muted sm:block" />
                        <span className="truncate font-medium text-ink">
                            {crumb}
                        </span>
                    </nav>
                    <div className="ml-auto flex items-center gap-2 sm:gap-3">
                        <span
                            className={cn(
                                'hidden items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium sm:inline-flex',
                                casinoOpen
                                    ? 'border-success/30 text-success-light'
                                    : 'border-crimson/40 text-danger-light',
                            )}
                        >
                            <span
                                aria-hidden
                                className="size-2 rounded-full bg-current"
                            />
                            {casinoOpen ? 'Casino online' : 'Casino offline'}
                        </span>
                        <Link
                            href={notifications()}
                            aria-label="Notifications, 4 unread"
                            className="relative flex size-11 items-center justify-center rounded-lg text-ink-muted hover:bg-white/5"
                        >
                            <Bell className="size-5" />
                            <span className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-crimson text-[9px] font-semibold text-white">
                                4
                            </span>
                        </Link>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    type="button"
                                    className="flex min-h-11 items-center gap-3 rounded-lg px-1.5 outline-none hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-gold/60"
                                >
                                    <span className="flex size-10 items-center justify-center rounded-full border border-gold/50 bg-crimson/20 text-xs font-semibold text-gold">
                                        {initialsOf(auth.user.username)}
                                    </span>
                                    <span className="hidden text-left sm:block">
                                        <span className="block text-sm font-semibold text-ink">
                                            {auth.user.name}
                                        </span>
                                        <span className="block text-[10px] text-ink-muted">
                                            Administrator
                                        </span>
                                    </span>
                                    <ChevronRight className="hidden size-4 text-ink-muted sm:block" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel className="font-normal">
                                    <span className="block text-sm font-semibold">
                                        {auth.user.name}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        @{auth.user.username}
                                    </span>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link
                                        href={profile()}
                                        className="cursor-pointer"
                                    >
                                        <Settings /> Profile & settings
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link
                                        href={dashboard()}
                                        className="cursor-pointer"
                                    >
                                        <Users /> Open player view
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="cursor-pointer"
                                    onSelect={signOut}
                                >
                                    <LogOut /> Sign out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>
                <main className="mx-auto w-full max-w-[1560px] px-4 pt-6 pb-12 sm:px-6 lg:px-8 lg:pt-9">
                    {children}
                </main>
            </div>
        </div>
    );
}
