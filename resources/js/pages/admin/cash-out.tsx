import CashRequestsPage from '@/components/casino/cash-requests-page';
import { cashOutRequests } from '@/mocks/casino';

export default function CashOut() {
    return (
        <CashRequestsPage
            direction="cash-out"
            initial={cashOutRequests}
            stats={{
                total: '1,192',
                pendingNote: '18,200 credits',
                approved: '1,128',
                approvedNote: '94.6% approval rate',
                rejected: '59',
                rejectedNote: '5.0% of requests',
            }}
        />
    );
}
