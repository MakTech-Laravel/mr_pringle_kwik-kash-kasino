import type { UrlMethodPair } from '@inertiajs/core';
import { router } from '@inertiajs/react';
import { usePasskeyVerify } from '@laravel/passkeys/react';
import { Fingerprint } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

type Props = {
    /** Reports a passkey error so the form can show it under the password field. */
    showError?: boolean;
    /** Custom passkey endpoints, e.g. the password-confirmation ones. Defaults to sign-in. */
    routes?: { options: UrlMethodPair; submit: UrlMethodPair };
    label?: string;
};

/**
 * Compact passkey button: an icon that sits beside the password field. Passkeys are discoverable, so no username is needed.
 */
export default function PasskeySignInButton({
    showError = true,
    routes,
    label = 'Sign in with a passkey',
}: Props) {
    const { verify, isLoading, error, isSupported } = usePasskeyVerify({
        ...(routes && {
            routes: {
                options: routes.options.url,
                submit: routes.submit.url,
            },
        }),
        onSuccess: (response) => {
            // "/" sends each role to its own home.
            router.visit(response.redirect ?? '/');
        },
    });

    if (!isSupported) {
        return null;
    }

    return (
        <>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-9 shrink-0 border-gold/40 text-gold hover:bg-gold/10 hover:text-gold"
                        onClick={verify}
                        disabled={isLoading}
                        aria-label={label}
                        data-test="passkey-login-button"
                    >
                        {isLoading ? <Spinner /> : <Fingerprint />}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>{label}</TooltipContent>
            </Tooltip>
            {showError && error && (
                <div className="basis-full">
                    <InputError message={error} />
                </div>
            )}
        </>
    );
}
