import { Head } from '@inertiajs/react';
import RequestCredits from '@/components/casino/request-credits';
import { playerWallet } from '@/mocks/casino';

export default function CashIn() {
    return (
        <>
            <Head title="Request credits" />
            <RequestCredits mode="cash-in" balance={playerWallet.balance} />
        </>
    );
}
