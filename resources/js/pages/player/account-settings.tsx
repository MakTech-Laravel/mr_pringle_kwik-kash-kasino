import { Form, Head, Link, router, usePage } from '@inertiajs/react';
import { LogOut, Shield } from 'lucide-react';
import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import ActionButton from '@/components/casino/action-button';
import PageHeader from '@/components/casino/page-header';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { logout } from '@/routes';
import { profile } from '@/routes/player';
import type { Auth } from '@/types';

/** Real password change (Fortify-backed SecurityController), styled per Figma. */
export default function AccountSettings() {
    const { auth } = usePage<{ auth: Auth }>().props;

    return (
        <>
            <Head title="Account settings" />
            <div className="space-y-6">
                <PageHeader
                    eyebrow="Profile"
                    title="Account settings"
                    description="Update your password and manage your session."
                />
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                    <section className="kk-panel">
                        <div className="flex items-start justify-between border-b border-border p-5 sm:p-6">
                            <div>
                                <p className="kk-eyebrow mb-2">Security</p>
                                <h2 className="kk-title text-xl text-ink">
                                    Change password
                                </h2>
                            </div>
                            <Shield className="size-5 text-gold" />
                        </div>
                        <Form
                            {...SecurityController.update.form()}
                            options={{ preserveScroll: true }}
                            resetOnSuccess
                            className="space-y-5 p-5 sm:p-6"
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
                                            placeholder="Enter current password"
                                            className="h-12"
                                        />
                                        <InputError
                                            message={errors.current_password}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="password">
                                            New password
                                        </Label>
                                        <PasswordInput
                                            id="password"
                                            name="password"
                                            autoComplete="new-password"
                                            placeholder="At least 8 characters"
                                            className="h-12"
                                        />
                                        <InputError message={errors.password} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="password_confirmation">
                                            Confirm new password
                                        </Label>
                                        <PasswordInput
                                            id="password_confirmation"
                                            name="password_confirmation"
                                            autoComplete="new-password"
                                            placeholder="Re-enter new password"
                                            className="h-12"
                                        />
                                        <InputError
                                            message={
                                                errors.password_confirmation
                                            }
                                        />
                                    </div>
                                    <ActionButton
                                        type="submit"
                                        disabled={processing}
                                        className="h-11 px-6"
                                    >
                                        {processing && <Spinner />} Save changes
                                    </ActionButton>
                                </>
                            )}
                        </Form>
                    </section>

                    <aside className="kk-panel h-fit p-5 sm:p-6">
                        <h2 className="kk-title text-xl text-ink">Account</h2>
                        <dl className="mt-4 space-y-3 text-xs">
                            <div>
                                <dt className="text-ink-muted">Username</dt>
                                <dd className="font-semibold text-ink">
                                    {auth.user.username}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-ink-muted">Player ID</dt>
                                <dd className="font-semibold text-ink">
                                    {auth.user.playerCode}
                                </dd>
                            </div>
                        </dl>
                        <ActionButton
                            asChild
                            look="outline"
                            className="mt-6 h-11 w-full"
                        >
                            <Link href={profile()}>Back to profile</Link>
                        </ActionButton>
                        <hr className="my-5 border-border" />
                        <ActionButton
                            look="danger"
                            className="h-11 w-full"
                            onClick={() => {
                                router.flushAll();
                                router.post(logout());
                            }}
                        >
                            <LogOut /> Log out
                        </ActionButton>
                    </aside>
                </div>
            </div>
        </>
    );
}
