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
};

/**
 * Compact passkey sign-in: an icon button that sits beside the password
 * field. Passkeys are discoverable, so no username is needed.
 */
export default function PasskeySignInButton({ showError = true }: Props) {
    const { verify, isLoading, error, isSupported } = usePasskeyVerify({
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
                        aria-label="Sign in with a passkey"
                        data-test="passkey-login-button"
                    >
                        {isLoading ? <Spinner /> : <Fingerprint />}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Sign in with a passkey</TooltipContent>
            </Tooltip>
            {showError && error && (
                <div className="basis-full">
                    <InputError message={error} />
                </div>
            )}
        </>
    );
}
