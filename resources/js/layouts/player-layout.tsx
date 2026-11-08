import { Link, router, usePage } from '@inertiajs/react';
import {
    Bell,
    ChevronDown,
    CreditCard,
    History,
    Home,
    Layers,
    LogOut,
    Menu,
    ReceiptText,
    Shield,
    Spade,
    User as UserIcon,
    Wallet,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import BrandLogo from '@/components/casino/brand-logo';
import CasinoStatusCard from '@/components/casino/casino-status-card';
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
import { useCurrentUrl } from '@/hooks/use-current-url';
import { usePlayerShell } from '@/hooks/use-player-shell';
import { formatNumber, initialsOf } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
    dashboard,
    history,
    logout,
    notifications,
    transactions,
} from '@/routes';
import { overview as adminOverview } from '@/routes/admin';
import { index as lobbyIndex } from '@/routes/lobby';
import { accountSettings, profile } from '@/routes/player';
import { index as walletIndex } from '@/routes/wallet';
import type { User } from '@/types';

type NavEntry = {
    title: string;
    href: string;
    icon: typeof Home;
    badge?: number;
    /** Extra path prefixes that also mark this item active. */
    matches?: string[];
};

function buildNav(unread: number): NavEntry[] {
    return [
        { title: 'Dashboard', href: dashboard().url, icon: Home },
        {
            title: 'Casino Lobby',
            href: lobbyIndex().url,
            icon: Spade,
            matches: ['/lobby', '/games'],
        },
        {
            title: 'My Wallet',
            href: walletIndex().url,
            icon: Wallet,
            matches: ['/wallet'],
        },
        { title: 'Game History', href: history().url, icon: History },
        { title: 'Transactions', href: transactions().url, icon: ReceiptText },
        {
            title: 'Notifications',
            href: notifications().url,
            icon: Bell,
            badge: unread,
        },
        {
            title: 'Profile & Settings',
            href: profile().url,
            icon: UserIcon,
            matches: ['/profile'],
        },
    ];
}

function useActive() {
    const { currentUrl } = useCurrentUrl();

    return (item: NavEntry) =>
        currentUrl === item.href ||
        (item.matches ?? []).some((m) => currentUrl.startsWith(m));
}

function SidebarNav({
    items,
    onNavigate,
}: {
    items: NavEntry[];
    onNavigate?: () => void;
}) {
    const isActive = useActive();

    return (
        <nav aria-label="Player" className="flex flex-col gap-1.5 px-3.5">
            {items.map((item) => {
                const active = isActive(item);

                return (
                    <Link
                        key={item.title}
                        href={item.href}
                        prefetch
                        onClick={onNavigate}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                            'relative flex min-h-11 items-center gap-3.5 rounded-lg px-3.5 text-[15px] transition-colors',
                            active
                                ? 'bg-gradient-to-r from-crimson/35 to-crimson/5 font-medium text-ink before:absolute before:inset-y-1 before:left-0 before:w-0.5 before:rounded-full before:bg-crimson-bright'
                                : 'text-ink-muted hover:bg-white/5 hover:text-ink',
                        )}
                    >
                        <item.icon
                            className={cn(
                                'size-5',
                                active ? 'text-gold' : 'text-ink-muted',
                            )}
                        />
                        <span className="flex-1">{item.title}</span>
                        {!!item.badge && (
                            <span className="flex size-5 items-center justify-center rounded-full bg-crimson text-[11px] font-semibold text-white">
                                {item.badge}
                            </span>
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}

function UserMenu({ user }: { user: User }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className="flex min-h-11 items-center gap-3 rounded-lg px-2 text-left outline-none hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-gold/60"
                >
                    <span className="relative flex size-10 items-center justify-center rounded-full border border-gold/50 bg-crimson/20 text-xs font-semibold text-gold">
                        {initialsOf(user.username)}
                        <span
                            aria-hidden
                            className="absolute right-0 bottom-0 size-2.5 rounded-full border-2 border-surface bg-success"
                        />
                    </span>
                    <span className="hidden min-w-0 sm:block">
                        <span className="block truncate text-sm font-semibold text-ink">
                            {user.username}
                        </span>
                        <span className="block text-[10px] tracking-wider text-ink-muted">
                            {user.playerCode}
                        </span>
                    </span>
                    <ChevronDown className="hidden size-4 text-ink-muted sm:block" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                    <span className="block text-sm font-semibold">
                        {user.username}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {user.playerCode}
                    </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href={profile()} className="cursor-pointer">
                        <UserIcon /> Profile
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href={accountSettings()} className="cursor-pointer">
                        <CreditCard /> Account settings
                    </Link>
                </DropdownMenuItem>
                {user.role === 'admin' && (
                    <DropdownMenuItem asChild>
                        <Link href={adminOverview()} className="cursor-pointer">
                            <Shield /> Back to admin console
                        </Link>
                    </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="cursor-pointer"
                    onSelect={() => {
                        router.flushAll();
                        router.post(logout());
                    }}
                    data-test="logout-button"
                >
                    <LogOut /> Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function TopBar({ onMenu }: { onMenu: () => void }) {
    const { auth } = usePage<{ auth: { user: User } }>().props;
    const shell = usePlayerShell();

    return (
        <header className="sticky top-0 z-30 flex h-[68px] items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur sm:px-6 lg:h-[77px] lg:px-10">
            <button
                type="button"
                onClick={onMenu}
                aria-label="Open menu"
                className="flex size-11 items-center justify-center rounded-lg text-ink-muted hover:bg-white/5 lg:hidden"
            >
                <Menu className="size-5" />
            </button>
            <Link href={dashboard()} className="lg:hidden">
                <BrandLogo compact />
            </Link>

            <div className="ml-auto flex items-center gap-3 sm:gap-5">
                <div className="text-right">
                    <p className="hidden text-[10px] font-semibold tracking-[0.2em] text-ink-muted uppercase sm:block">
                        Available balance
                    </p>
                    <p className="text-base font-semibold text-gold sm:text-lg">
                        {formatNumber(shell.balance)}{' '}
                        <span className="text-[10px] font-semibold text-ink-muted">
                            CR
                        </span>
                    </p>
                </div>
                <span
                    aria-hidden
                    className="hidden h-8 w-px bg-border sm:block"
                />
                <Link
                    href={notifications()}
                    aria-label={`Notifications, ${shell.unread} unread`}
                    className="relative flex size-11 items-center justify-center rounded-lg text-ink-muted hover:bg-white/5 hover:text-ink"
                >
                    <Bell className="size-5" />
                    {shell.unread > 0 && (
                        <span className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-crimson text-[9px] font-semibold text-white">
                            {shell.unread}
                        </span>
                    )}
                </Link>
                <UserMenu user={auth.user} />
            </div>
        </header>
    );
}

const tabs = [
    {
        title: 'Home',
        icon: Home,
        href: () => dashboard().url,
        match: ['/dashboard'],
    },
    {
        title: 'Lobby',
        icon: Layers,
        href: () => lobbyIndex().url,
        match: ['/lobby', '/games'],
    },
    {
        title: 'Wallet',
        icon: Wallet,
        href: () => walletIndex().url,
        match: ['/wallet'],
    },
    {
        title: 'History',
        icon: History,
        href: () => history().url,
        match: ['/history', '/transactions'],
    },
];

function MobileTabBar({ onMore }: { onMore: () => void }) {
    const { currentUrl } = useCurrentUrl();

    return (
        <nav
            aria-label="Primary"
            className="kk-safe-bottom fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-gold/20 bg-surface/95 px-1 pt-1.5 backdrop-blur lg:hidden"
        >
            {tabs.map((tab) => {
                const active = tab.match.some((m) => currentUrl.startsWith(m));

                return (
                    <Link
                        key={tab.title}
                        href={tab.href()}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                            'flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg text-[10px] font-medium',
                            active ? 'text-gold' : 'text-ink-muted',
                        )}
                    >
                        <tab.icon className="size-5" />
                        {tab.title}
                    </Link>
                );
            })}
            <button
                type="button"
                onClick={onMore}
                className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg text-[10px] font-medium text-ink-muted"
            >
                <Menu className="size-5" />
                More
            </button>
        </nav>
    );
}

export default function PlayerLayout({ children }: { children: ReactNode }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const shell = usePlayerShell();
    const nav = buildNav(shell.unread);
    const { component } = usePage();
    const wide = component.startsWith('games/');

    return (
        <div className="min-h-svh bg-background">
            <aside className="fixed inset-y-0 left-0 z-40 hidden w-[253px] flex-col border-r border-gold/15 bg-surface lg:flex">
                <div className="flex h-[98px] items-center border-b border-border px-6">
                    <Link href={dashboard()}>
                        <BrandLogo />
                    </Link>
                </div>
                <div className="flex-1 overflow-y-auto py-6">
                    <SidebarNav items={nav} />
                </div>
                <div className="space-y-4 p-4">
                    <CasinoStatusCard
                        open={shell.casinoOpen}
                        liveTables={shell.liveTables}
                    />
                </div>
                <div className="flex items-center gap-3 border-t border-border px-6 py-4 text-[11px] leading-tight text-ink-muted">
                    <Shield className="size-4" />
                    <span>
                        Private community
                        <br />
                        Virtual credits only
                    </span>
                </div>
            </aside>

            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                <SheetContent
                    side="left"
                    className="w-[300px] border-gold/15 bg-surface p-0"
                >
                    <SheetHeader className="border-b border-border p-5">
                        <SheetTitle className="sr-only">Menu</SheetTitle>
                        <SheetDescription className="sr-only">
                            Player navigation
                        </SheetDescription>
                        <BrandLogo />
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto py-4">
                        <SidebarNav
                            items={nav}
                            onNavigate={() => setMenuOpen(false)}
                        />
                    </div>
                    <div className="p-4">
                        <CasinoStatusCard
                            open={shell.casinoOpen}
                            liveTables={shell.liveTables}
                        />
                    </div>
                </SheetContent>
            </Sheet>

            <div className="lg:pl-[253px]">
                <TopBar onMenu={() => setMenuOpen(true)} />
                <main
                    className={cn(
                        'mx-auto w-full px-4 pt-6 pb-28 sm:px-6 lg:px-10 lg:pt-10 lg:pb-14',
                        wide ? 'max-w-[1380px]' : 'max-w-[1260px]',
                    )}
                >
                    {children}
                </main>
                <footer className="hidden items-center justify-between border-t border-border px-10 py-5 text-[10px] tracking-wider text-ink-muted/70 lg:flex">
                    <span className="uppercase">
                        Kwik Kash Kasino · Player panel
                    </span>
                    <span>
                        Virtual credits only. No real money is involved.
                    </span>
                </footer>
            </div>

            <MobileTabBar onMore={() => setMenuOpen(true)} />
        </div>
    );
}
