import ManagePasskeys, {
    type Props as ManagePasskeysProps,
} from '@/components/manage-passkeys';
import ManageTwoFactor, {
    type Props as ManageTwoFactorProps,
} from '@/components/manage-two-factor';

export type AccountSecurityProps = ManagePasskeysProps & ManageTwoFactorProps;

/**
 * Two-factor and passkey management as two panels, shown on the account page
 * of players and admins (which the server only opens after a password check).
 */
export default function AccountSecurityPanels(props: AccountSecurityProps) {
    const showTwoFactor = props.canManageTwoFactor ?? false;
    const showPasskeys = props.canManagePasskeys ?? false;

    return (
        <>
            {showTwoFactor && (
                <section className="kk-panel p-5 sm:p-6">
                    <ManageTwoFactor
                        canManageTwoFactor={props.canManageTwoFactor}
                        requiresConfirmation={props.requiresConfirmation}
                        twoFactorEnabled={props.twoFactorEnabled}
                    />
                </section>
            )}
            {showPasskeys && (
                <section className="kk-panel p-5 sm:p-6">
                    <ManagePasskeys
                        canManagePasskeys={props.canManagePasskeys}
                        passkeys={props.passkeys}
                    />
                </section>
            )}
        </>
    );
}
