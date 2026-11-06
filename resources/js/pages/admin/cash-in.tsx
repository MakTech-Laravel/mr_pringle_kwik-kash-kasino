import CashRequestsPage from '@/components/casino/cash-requests-page';
import { cashInRequests } from '@/mocks/casino';

export default function CashIn() {
    return (
        <CashRequestsPage
            direction="cash-in"
            initial={cashInRequests}
            stats={{
                total: '2,847',
                pendingNote: '42,500 credits',
                approved: '2,714',
                approvedNote: '95.3% approval rate',
                rejected: '125',
                rejectedNote: '4.4% of requests',
            }}
        />
    );
}
