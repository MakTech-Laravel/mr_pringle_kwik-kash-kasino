import { Head, Link, usePage } from '@inertiajs/react';
import { ChevronRight, Shield } from 'lucide-react';
import ActionButton from '@/components/casino/action-button';
import PageHeader from '@/components/casino/page-header';
import StatusPill from '@/components/casino/status-pill';
import { initialsOf } from '@/lib/format';
import { accountSettings } from '@/routes/player';
import type { Auth } from '@/types';

export default function Profile() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const user = auth.user;
    const since = new Date(user.created_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });

    const rows: [string, React.ReactNode][] = [
        [
            'Username',
            <span key="u" className="font-semibold text-ink">
                {user.username}
            </span>,
        ],
        [
            'Unique player ID',
            <span key="i" className="font-semibold text-ink">
                {user.playerCode}
            </span>,
        ],
        [
            'Member since',
            <span key="m" className="font-semibold text-ink">
                {since}
            </span>,
        ],
        [
            'Account status',
            <StatusPill key="s" tone="success">
                Active
            </StatusPill>,
        ],
    ];

    return (
        <>
            <Head title="Profile" />
            <div className="space-y-6">
                <PageHeader
                    eyebrow="Player account"
                    title="Profile"
                    description="Your community casino identity and account details."
                />
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.4fr)]">
                    <section className="kk-panel flex flex-col items-center p-6 text-center">
                        <span className="relative flex size-24 items-center justify-center rounded-full border border-gold/60 bg-crimson/20 font-display text-3xl text-gold">
                            {initialsOf(user.username)}
                            <span className="absolute right-1 bottom-1 size-3.5 rounded-full border-2 border-surface bg-success" />
                        </span>
                        <h2 className="kk-title mt-5 text-xl break-all text-ink">
                            {user.username}
                        </h2>
                        <StatusPill tone="success" className="mt-3">
                            Account active
                        </StatusPill>
                        <p className="mt-5 w-full border-y border-border py-3 text-xs tracking-wider text-ink-muted">
                            {user.playerCode}
                        </p>
                        <ActionButton
                            asChild
                            look="outline"
                            className="mt-5 h-11 px-6"
                        >
                            <Link href={accountSettings()}>
                                Account settings <ChevronRight />
                            </Link>
                        </ActionButton>
                    </section>

                    <section className="kk-panel">
                        <div className="border-b border-border p-5 sm:p-6">
                            <p className="kk-eyebrow mb-2">Account</p>
                            <h2 className="kk-title text-xl text-ink">
                                Player information
                            </h2>
                        </div>
                        <dl>
                            {rows.map(([label, value]) => (
                                <div
                                    key={label}
                                    className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 text-xs last:border-b-0 sm:px-6"
                                >
                                    <dt className="text-ink-muted">{label}</dt>
                                    <dd className="text-right">{value}</dd>
                                </div>
                            ))}
                        </dl>
                        <div className="m-5 flex flex-col gap-3 rounded-lg border border-success/25 bg-success/5 p-4 sm:m-6 sm:flex-row sm:items-center">
                            <Shield className="size-5 shrink-0 text-success-light" />
                            <div className="flex-1">
                                <p className="text-xs font-semibold text-success-light">
                                    Keep your account secure
                                </p>
                                <p className="text-[11px] text-ink-muted">
                                    Use a unique password you don&apos;t use
                                    elsewhere.
                                </p>
                            </div>
                            <Link
                                href={accountSettings()}
                                className="text-[11px] font-medium text-gold hover:text-gold-light"
                            >
                                Change password
                            </Link>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}
