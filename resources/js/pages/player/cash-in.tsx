import { Head } from '@inertiajs/react';
import RequestCredits from '@/components/casino/request-credits';
import { demoWallet } from '@/mocks/casino';

export default function CashIn() {
    return (
        <>
            <Head title="Request credits" />
            <RequestCredits mode="cash-in" balance={demoWallet.balance} />
        </>
    );
}
