import { Form, Head, router } from '@inertiajs/react';
import { MailCheck } from 'lucide-react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { login } from '@/routes';
import { cancel, resend, store, verify } from '@/routes/password-appeal';

type Props = {
    step: 'form' | 'verify' | 'sent';
    email?: string | null;
    username?: string | null;
};

/**
 * Forgotten-password appeal. There is no email reset: the player leaves an
 * email, proves they control it with a one-time code, and an admin follows up.
 */
export default function PasswordAppeal({ step, email, username }: Props) {
    if (step === 'sent') {
        return (
            <>
                <Head title="Appeal sent" />
                <div className="flex flex-col items-center gap-4 text-center">
                    <span className="flex size-14 items-center justify-center rounded-full border border-success/40 bg-success/10 text-success-light">
                        <MailCheck className="size-6" />
                    </span>
                    <h2 className="kk-title text-xl text-ink">Appeal sent</h2>
                    <p className="text-sm text-muted-foreground">
                        An administrator will review it and contact you at the
                        email you verified. Until then, your current password
                        stays unchanged.
                    </p>
                    <TextLink href={login()}>Back to log in</TextLink>
                </div>
            </>
        );
    }

    if (step === 'verify') {
        return (
            <>
                <Head title="Verify your email" />
                <Form
                    key="verify-step"
                    {...verify.form()}
                    resetOnSuccess={['code']}
                    className="flex flex-col gap-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <p className="text-sm text-muted-foreground">
                                We sent a 6-digit code to{' '}
                                <span className="font-semibold text-ink">
                                    {email}
                                </span>{' '}
                                for the account{' '}
                                <span className="font-semibold text-ink">
                                    {username}
                                </span>
                                . It expires in 15 minutes.
                            </p>
                            <div className="grid gap-2">
                                <Label htmlFor="code">Verification code</Label>
                                <Input
                                    id="code"
                                    name="code"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    maxLength={6}
                                    required
                                    autoFocus
                                    placeholder="123456"
                                    className="text-center text-lg tracking-[0.5em]"
                                />
                                <InputError message={errors.code} />
                                <InputError message={errors.email} />
                            </div>
                            <Button type="submit" disabled={processing}>
                                {processing && <Spinner />}
                                Verify and send appeal
                            </Button>
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <button
                                    type="button"
                                    className="underline underline-offset-4 hover:text-foreground"
                                    onClick={() => router.post(resend.url())}
                                >
                                    Send a new code
                                </button>
                                <button
                                    type="button"
                                    className="underline underline-offset-4 hover:text-foreground"
                                    onClick={() => router.post(cancel.url())}
                                >
                                    Use another email
                                </button>
                            </div>
                        </>
                    )}
                </Form>
            </>
        );
    }

    return (
        <>
            <Head title="Forgot password" />
            <Form
                key="form-step"
                {...store.form()}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <p className="text-sm text-muted-foreground">
                            Accounts here have no email on file, so passwords
                            cannot be reset automatically. Tell us who you are
                            and where to reach you. An administrator will review
                            your appeal.
                        </p>
                        <div className="grid gap-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                name="username"
                                required
                                autoFocus
                                autoCapitalize="none"
                                autoComplete="username"
                                placeholder="Your username"
                            />
                            <InputError message={errors.username} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email address</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                required
                                autoComplete="email"
                                placeholder="you@example.com"
                            />
                            <p className="text-xs text-muted-foreground">
                                We email a code to confirm this address. It is
                                used only for this appeal.
                            </p>
                            <InputError message={errors.email} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="message">
                                Anything that helps us confirm it is you
                            </Label>
                            <Textarea
                                id="message"
                                name="message"
                                rows={3}
                                maxLength={500}
                                placeholder="Optional"
                            />
                            <InputError message={errors.message} />
                        </div>
                        <Button type="submit" disabled={processing}>
                            {processing && <Spinner />}
                            Send verification code
                        </Button>
                        <div className="text-center text-sm text-muted-foreground">
                            Remembered it?{' '}
                            <TextLink href={login()}>Log in</TextLink>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

PasswordAppeal.layout = {
    title: 'Forgot your password?',
    description: 'File an appeal and an administrator will help you back in',
};
