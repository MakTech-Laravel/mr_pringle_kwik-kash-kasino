import StatusPill, { type PillTone } from '@/components/casino/status-pill';
import type { RequestStatus } from '@/types/casino';

const tones: Record<RequestStatus, PillTone> = {
    pending: 'warning',
    approved: 'success',
    completed: 'success',
    rejected: 'danger',
};

/** Pending / Approved / Completed / Rejected chip. */
export default function RequestStatusPill({
    status,
    caps = true,
}: {
    status: RequestStatus;
    caps?: boolean;
}) {
    return (
        <StatusPill tone={tones[status]} caps={caps}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </StatusPill>
    );
}
