import { Head, router, usePage } from '@inertiajs/react';
import { Check, Copy, KeyRound, Link2, Mail, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import ActionButton from '@/components/casino/action-button';
import DataTable, { type Column } from '@/components/casino/data-table';
import PageHeader from '@/components/casino/page-header';
import StatusPill, { type PillTone } from '@/components/casino/status-pill';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useClipboard } from '@/hooks/use-clipboard';
import {
    type Appeal,
    gmailComposeUrl,
    resetLinkMail,
    temporaryPasswordMail,
} from '@/lib/appeals';
import { postJson } from '@/lib/http';
import {
    link,
    reject,
    resolve,
    temporaryPassword,
} from '@/routes/admin/password-appeals';

type Issued =
    | { kind: 'link'; value: string; hours: number }
    | { kind: 'password'; value: string };

const tone: Record<Appeal['status'], PillTone> = {
    pending: 'warning',
    resolved: 'success',
    rejected: 'danger',
};

function when(iso: string | null): string {
    return iso
        ? new Date(iso).toLocaleString('en-GB', {
              dateStyle: 'medium',
              timeStyle: 'short',
          })
        : '-';
}

export default function PasswordAppeals({ appeals }: { appeals: Appeal[] }) {
    const { name } = usePage<{ name: string }>().props;
    const [selected, setSelected] = useState<Appeal | null>(null);
    const [issued, setIssued] = useState<Issued | null>(null);
    const [busy, setBusy] = useState(false);
    const [, copy] = useClipboard();

    // Always show the freshest copy of the appeal the dialog is about.
    const appeal = appeals.find((a) => a.id === selected?.id) ?? null;
    const actionable =
        appeal?.status === 'pending' &&
        appeal.accountFound &&
        !appeal.accountIsAdmin;

    const close = () => {
        setSelected(null);
        setIssued(null);
    };

    const issue = async (kind: 'link' | 'password') => {
        if (!appeal) {
            return;
        }

        setBusy(true);

        try {
            if (kind === 'link') {
                const res = await postJson<{ url: string; hours: number }>(
                    link.url(appeal.id),
                );
                setIssued({ kind, value: res.url, hours: res.hours });
            } else {
                const res = await postJson<{ password: string }>(
                    temporaryPassword.url(appeal.id),
                );
                setIssued({ kind, value: res.password });
            }

            router.reload({ only: ['appeals', 'pendingAppeals'] });
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed');
        } finally {
            setBusy(false);
        }
    };

    const send = () => {
        if (!appeal || !issued) {
            return;
        }

        const mail =
            issued.kind === 'link'
                ? resetLinkMail(appeal, issued.value, issued.hours, name)
                : temporaryPasswordMail(appeal, issued.value, name);

        window.open(gmailComposeUrl(mail), '_blank', 'noopener,noreferrer');
    };

    const closeWith = (action: typeof resolve | typeof reject) => {
        if (!appeal) {
            return;
        }

        router.post(
            action.url(appeal.id),
            {},
            { preserveScroll: true, onSuccess: close },
        );
    };

    const columns: Column<Appeal>[] = [
        {
            key: 'user',
            header: 'Username',
            primary: true,
            cell: (a) => (
                <span className="font-semibold text-ink">{a.username}</span>
            ),
        },
        { key: 'email', header: 'Email', cell: (a) => a.email },
        {
            key: 'acct',
            header: 'Account',
            cell: (a) => (
                <StatusPill
                    tone={a.accountFound ? 'success' : 'neutral'}
                    caps={false}
                >
                    {a.accountFound ? 'Found' : 'No match'}
                </StatusPill>
            ),
        },
        { key: 'at', header: 'Submitted', cell: (a) => when(a.submittedAt) },
        {
            key: 'status',
            header: 'Status',
            cell: (a) => (
                <StatusPill tone={tone[a.status]} caps={false}>
                    {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                </StatusPill>
            ),
        },
        {
            key: 'action',
            header: 'Action',
            action: true,
            cell: (a) => (
                <ActionButton
                    look="outline"
                    className="h-8 px-3 text-[11px]"
                    onClick={() => setSelected(a)}
                >
                    Review
                </ActionButton>
            ),
        },
    ];

    return (
        <>
            <Head title="Password appeals" />
            <div className="space-y-6">
                <PageHeader
                    title="Password appeals"
                    description="Players who lost their password. Each email was confirmed with a one-time code; verify the person yourself before you share anything."
                />

                <DataTable
                    columns={columns}
                    rows={appeals}
                    rowKey={(a) => a.id}
                    empty="No appeals yet."
                />
            </div>

            <Dialog open={!!appeal} onOpenChange={(open) => !open && close()}>
                <DialogContent className="max-w-[calc(100%-2rem)] gap-0 border-gold/20 bg-surface p-0 sm:max-w-[548px]">
                    {appeal && (
                        <>
                            <DialogHeader className="border-b border-border p-6 text-left">
                                <p className="kk-eyebrow">Password appeal</p>
                                <DialogTitle className="kk-title text-xl text-ink">
                                    {appeal.username}
                                </DialogTitle>
                                <DialogDescription className="sr-only">
                                    Review this password appeal.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-5 p-6">
                                <dl className="grid grid-cols-2 gap-4 text-xs">
                                    <div className="min-w-0">
                                        <dt className="text-ink-muted">
                                            Email (verified)
                                        </dt>
                                        <dd className="mt-1 font-semibold break-all text-ink">
                                            {appeal.email}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-ink-muted">
                                            Submitted
                                        </dt>
                                        <dd className="mt-1 font-semibold text-ink">
                                            {when(appeal.submittedAt)}
                                        </dd>
                                    </div>
                                </dl>

                                {appeal.message && (
                                    <p className="rounded-lg border border-border p-3 text-xs break-words text-ink">
                                        {appeal.message}
                                    </p>
                                )}

                                {!appeal.accountFound && (
                                    <p className="rounded-lg border border-gold/25 bg-gold/5 p-3 text-xs text-ink-muted">
                                        No account uses this username. You can
                                        only close the appeal.
                                    </p>
                                )}
                                {appeal.accountIsAdmin && (
                                    <p className="rounded-lg border border-gold/25 bg-gold/5 p-3 text-xs text-ink-muted">
                                        This is an administrator account. Admin
                                        passwords are not reset from appeals.
                                    </p>
                                )}

                                {issued && (
                                    <div className="space-y-3 rounded-lg border border-success/30 bg-success/5 p-4">
                                        <p className="text-xs text-ink-muted">
                                            {issued.kind === 'link'
                                                ? `One-time link, valid for ${issued.hours} hours. It is shown only now.`
                                                : 'Temporary password, set on the account. It is shown only now.'}
                                        </p>
                                        <div className="flex gap-2">
                                            <Input
                                                readOnly
                                                value={issued.value}
                                                onFocus={(e) =>
                                                    e.target.select()
                                                }
                                                aria-label={
                                                    issued.kind === 'link'
                                                        ? 'Reset link'
                                                        : 'Temporary password'
                                                }
                                            />
                                            <ActionButton
                                                look="outline"
                                                className="h-9 px-3 text-xs"
                                                onClick={async () =>
                                                    (await copy(issued.value))
                                                        ? toast.success(
                                                              'Copied',
                                                          )
                                                        : toast.error(
                                                              'Copy failed',
                                                          )
                                                }
                                            >
                                                <Copy /> Copy
                                            </ActionButton>
                                        </div>
                                        <ActionButton
                                            className="h-9 px-4 text-xs"
                                            onClick={send}
                                        >
                                            <Mail /> Send it
                                        </ActionButton>
                                        <p className="text-[11px] text-ink-muted">
                                            Opens Gmail with the message filled
                                            in. Nothing is sent until you press
                                            Send there.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-6">
                                {actionable ? (
                                    <div className="flex flex-wrap gap-2">
                                        <ActionButton
                                            className="h-10 px-4 text-xs"
                                            disabled={busy}
                                            onClick={() => issue('link')}
                                        >
                                            <Link2 /> Generate reset link
                                        </ActionButton>
                                        <ActionButton
                                            look="outline"
                                            className="h-10 px-4 text-xs"
                                            disabled={busy}
                                            onClick={() => issue('password')}
                                        >
                                            <KeyRound /> Set temporary password
                                        </ActionButton>
                                    </div>
                                ) : (
                                    <span />
                                )}
                                {appeal.status === 'pending' && (
                                    <div className="flex gap-2">
                                        <ActionButton
                                            look="danger"
                                            className="h-10 px-4 text-xs"
                                            onClick={() => closeWith(reject)}
                                        >
                                            <X /> Reject
                                        </ActionButton>
                                        <ActionButton
                                            look="outline"
                                            className="h-10 px-4 text-xs"
                                            onClick={() => closeWith(resolve)}
                                        >
                                            <Check /> Mark resolved
                                        </ActionButton>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
