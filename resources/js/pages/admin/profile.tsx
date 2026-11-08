import { Form, Head, Link, usePage } from '@inertiajs/react';
import { Fingerprint, Lock } from 'lucide-react';
import { useState } from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import ActionButton from '@/components/casino/action-button';
import PageHeader from '@/components/casino/page-header';
import StatusPill from '@/components/casino/status-pill';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { initialsOf } from '@/lib/format';
import { edit as editSecurity } from '@/routes/security';
import type { Auth } from '@/types';

/** Real profile + password forms (Settings controllers), styled per the admin Figma. */
export default function AdminProfile() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const user = auth.user;
    const [passwordOpen, setPasswordOpen] = useState(false);
    const created = new Date(user.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
    });

    return (
        <>
            <Head title="Profile & settings" />
            <div className="space-y-6">
                <PageHeader
                    title="Profile & settings"
                    description="Manage your account information and sign-in security."
                />
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.5fr)]">
                    <section className="kk-panel flex min-w-0 flex-col items-center p-6 text-center">
                        <span className="flex size-[72px] items-center justify-center rounded-full border border-gold/50 bg-crimson/20 font-display text-2xl text-gold">
                            {initialsOf(user.name)}
                        </span>
                        <h2 className="kk-title mt-4 text-lg text-ink">
                            {user.name}
                        </h2>
                        <p className="mt-1 text-[11px] text-ink-muted">
                            @{user.username} · Administrator
                        </p>
                        <StatusPill
                            tone="success"
                            caps={false}
                            className="mt-3"
                        >
                            Active
                        </StatusPill>
                        <dl className="mt-6 w-full divide-y divide-border text-[11px]">
                            {[
                                ['Account created', created],
                                ['Permission level', 'Administrator'],
                            ].map(([k, v]) => (
                                <div
                                    key={k}
                                    className="flex justify-between py-3"
                                >
                                    <dt className="text-ink-muted">{k}</dt>
                                    <dd className="font-semibold text-ink">
                                        {v}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </section>

                    <div className="min-w-0 space-y-5">
                        <section className="kk-panel p-5 sm:p-6">
                            <h2 className="kk-title text-lg text-ink">
                                Profile information
                            </h2>
                            <p className="mt-1 text-[11px] text-ink-muted">
                                Update your administrator details
                            </p>
                            <Form
                                {...ProfileController.update.form()}
                                options={{ preserveScroll: true }}
                                className="mt-5 grid gap-4 sm:grid-cols-2"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">
                                                Display name
                                            </Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                defaultValue={user.name}
                                                className="h-11 border-border"
                                            />
                                            <InputError message={errors.name} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="username">
                                                Username
                                            </Label>
                                            <Input
                                                id="username"
                                                name="username"
                                                defaultValue={user.username}
                                                autoCapitalize="none"
                                                className="h-11 border-border"
                                            />
                                            <InputError
                                                message={errors.username}
                                            />
                                        </div>
                                        <div className="flex justify-end sm:col-span-2">
                                            <ActionButton
                                                type="submit"
                                                disabled={processing}
                                                className="h-10 px-5 text-xs"
                                            >
                                                {processing && <Spinner />} Save
                                                changes
                                            </ActionButton>
                                        </div>
                                    </>
                                )}
                            </Form>
                        </section>

                        <section className="kk-panel p-5 sm:p-6">
                            <h2 className="kk-title text-lg text-ink">
                                Password & security
                            </h2>
                            <p className="mt-1 text-[11px] text-ink-muted">
                                Use a strong, unique password for this account.
                            </p>
                            <div className="mt-5 flex items-center gap-4 rounded-lg border border-border p-4">
                                <span className="flex size-10 items-center justify-center rounded-lg bg-gold/10 text-gold">
                                    <Lock className="size-4" />
                                </span>
                                <span className="flex-1 text-xs font-semibold text-ink">
                                    Password
                                </span>
                                <ActionButton
                                    look="outline"
                                    className="h-10 px-4 text-xs"
                                    onClick={() => setPasswordOpen(true)}
                                >
                                    Change password
                                </ActionButton>
                            </div>
                            <div className="mt-3 flex items-center gap-4 rounded-lg border border-border p-4">
                                <span className="flex size-10 items-center justify-center rounded-lg bg-gold/10 text-gold">
                                    <Fingerprint className="size-4" />
                                </span>
                                <span className="flex-1">
                                    <span className="block text-xs font-semibold text-ink">
                                        Two-factor and passkeys
                                    </span>
                                    <span className="text-[11px] text-ink-muted">
                                        Authenticator app, recovery codes and
                                        passkeys
                                    </span>
                                </span>
                                <ActionButton
                                    asChild
                                    look="outline"
                                    className="h-10 px-4 text-xs"
                                >
                                    <Link href={editSecurity()}>Manage</Link>
                                </ActionButton>
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
                <DialogContent className="max-w-[calc(100%-2rem)] border-gold/20 bg-surface sm:max-w-[460px]">
                    <DialogHeader>
                        <DialogTitle className="kk-title text-xl">
                            Change password
                        </DialogTitle>
                        <DialogDescription>
                            Enter your current password and choose a new one.
                        </DialogDescription>
                    </DialogHeader>
                    <Form
                        {...SecurityController.update.form()}
                        options={{ preserveScroll: true }}
                        resetOnSuccess
                        onSuccess={() => setPasswordOpen(false)}
                        className="space-y-4"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="current_password">
                                        Current password
                                    </Label>
                                    <PasswordInput
                                        id="current_password"
                                        name="current_password"
                                        autoComplete="current-password"
                                        className="h-11"
                                    />
                                    <InputError
                                        message={errors.current_password}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="new_password">
                                        New password
                                    </Label>
                                    <PasswordInput
                                        id="new_password"
                                        name="password"
                                        autoComplete="new-password"
                                        className="h-11"
                                    />
                                    <InputError message={errors.password} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="confirm_password">
                                        Confirm new password
                                    </Label>
                                    <PasswordInput
                                        id="confirm_password"
                                        name="password_confirmation"
                                        autoComplete="new-password"
                                        className="h-11"
                                    />
                                    <InputError
                                        message={errors.password_confirmation}
                                    />
                                </div>
                                <ActionButton
                                    type="submit"
                                    disabled={processing}
                                    className="h-11 w-full"
                                >
                                    {processing && <Spinner />} Update password
                                </ActionButton>
                            </>
                        )}
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
}
