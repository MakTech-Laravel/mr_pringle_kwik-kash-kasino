import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { update } from '@/routes/password-appeal/reset';

type Props = {
    token: string;
    username: string | null;
    valid: boolean;
};

/** Landing page for the one-time reset link an admin gave the player. */
export default function ResetWithLink({ token, username, valid }: Props) {
    if (!valid) {
        return (
            <>
                <Head title="Link not valid" />
                <div className="flex flex-col gap-4 text-center">
                    <p className="text-sm text-muted-foreground">
                        This reset link has already been used, has expired, or
                        was replaced. Ask an administrator for a new one.
                    </p>
                    <TextLink href={login()}>Back to log in</TextLink>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="Choose a new password" />
            <Form
                {...update.form(token)}
                resetOnSuccess={['password', 'password_confirmation']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <p className="text-sm text-muted-foreground">
                            Choose a new password for{' '}
                            <span className="font-semibold text-ink">
                                {username}
                            </span>
                            .
                        </p>
                        <div className="grid gap-2">
                            <Label htmlFor="password">New password</Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                required
                                autoFocus
                                autoComplete="new-password"
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
                                required
                                autoComplete="new-password"
                            />
                            <InputError
                                message={errors.password_confirmation}
                            />
                        </div>
                        <Button type="submit" disabled={processing}>
                            {processing && <Spinner />}
                            Save new password
                        </Button>
                    </>
                )}
            </Form>
        </>
    );
}

ResetWithLink.layout = {
    title: 'Set a new password',
    description: 'This link works once and expires after 24 hours',
};
