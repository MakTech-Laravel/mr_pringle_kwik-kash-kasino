import { Head } from '@inertiajs/react';
import RequestCredits from '@/components/casino/request-credits';
import { demoWallet } from '@/mocks/casino';

export default function CashOut() {
    return (
        <>
            <Head title="Request cash-out" />
            <RequestCredits mode="cash-out" balance={demoWallet.balance} />
        </>
    );
}
