import { Form, Head } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import AdministratorController from '@/actions/App/Http/Controllers/Admin/AdministratorController';
import ActionButton from '@/components/casino/action-button';
import DataTable, { type Column } from '@/components/casino/data-table';
import PageHeader from '@/components/casino/page-header';
import StatusPill from '@/components/casino/status-pill';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

type Administrator = {
    id: number;
    name: string;
    username: string;
    createdAt: string | null;
    twoFactorEnabled: boolean;
    passkeys: number;
    isYou: boolean;
};

type Editing = Administrator | 'new' | null;

function since(iso: string | null): string {
    return iso
        ? new Date(iso).toLocaleDateString('en-GB', { dateStyle: 'medium' })
        : '-';
}

function AdminPasswordField({ error }: { error?: string }) {
    return (
        <div className="grid gap-2 rounded-lg border border-gold/20 bg-gold/5 p-3">
            <Label htmlFor="admin_password">Your password</Label>
            <PasswordInput
                id="admin_password"
                name="admin_password"
                autoComplete="current-password"
                placeholder="Confirm it is you"
                className="h-11"
            />
            <InputError message={error} />
        </div>
    );
}

export default function Administrators({
    administrators,
}: {
    administrators: Administrator[];
}) {
    const [editing, setEditing] = useState<Editing>(null);
    const [removing, setRemoving] = useState<Administrator | null>(null);
    const isNew = editing === 'new';
    const target = editing && editing !== 'new' ? editing : null;
    const only = administrators.length <= 1;

    const columns: Column<Administrator>[] = [
        {
            key: 'name',
            header: 'Administrator',
            primary: true,
            cell: (a) => (
                <span className="font-semibold text-ink">
                    {a.name}
                    {a.isYou && (
                        <span className="ml-2 text-[11px] font-normal text-gold">
                            You
                        </span>
                    )}
                </span>
            ),
        },
        { key: 'user', header: 'Username', cell: (a) => `@${a.username}` },
        {
            key: '2fa',
            header: 'Two-factor',
            cell: (a) => (
                <StatusPill
                    tone={a.twoFactorEnabled ? 'success' : 'neutral'}
                    caps={false}
                >
                    {a.twoFactorEnabled ? 'On' : 'Off'}
                </StatusPill>
            ),
        },
        {
            key: 'passkeys',
            header: 'Passkeys',
            cell: (a) => (a.passkeys === 0 ? 'None' : String(a.passkeys)),
        },
        { key: 'since', header: 'Added', cell: (a) => since(a.createdAt) },
        {
            key: 'action',
            header: 'Action',
            action: true,
            cell: (a) => (
                <span className="flex justify-end gap-2">
                    <ActionButton
                        look="outline"
                        className="h-8 px-3 text-[11px]"
                        onClick={() => setEditing(a)}
                    >
                        <Pencil /> Manage
                    </ActionButton>
                    {!a.isYou && !only && (
                        <ActionButton
                            look="danger"
                            className="h-8 px-3 text-[11px]"
                            onClick={() => setRemoving(a)}
                        >
                            <Trash2 /> Remove
                        </ActionButton>
                    )}
                </span>
            ),
        },
    ];

    return (
        <>
            <Head title="Administrators" />
            <div className="space-y-6">
                <PageHeader
                    eyebrow="Account"
                    title="Administrators"
                    description="People who can run the casino. Every change asks for your own password again."
                    actions={
                        <ActionButton
                            className="h-11 px-5"
                            onClick={() => setEditing('new')}
                        >
                            <Plus /> Add administrator
                        </ActionButton>
                    }
                />

                <DataTable
                    columns={columns}
                    rows={administrators}
                    rowKey={(a) => a.id}
                    empty="No administrators."
                />
            </div>

            <Dialog
                open={editing !== null}
                onOpenChange={(open) => !open && setEditing(null)}
            >
                <DialogContent className="max-w-[calc(100%-2rem)] border-gold/20 bg-surface sm:max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle className="kk-title text-xl">
                            {isNew
                                ? 'Add administrator'
                                : 'Manage administrator'}
                        </DialogTitle>
                        <DialogDescription>
                            {isNew
                                ? 'They sign in with this username and password, and can add a passkey or two-factor themselves.'
                                : 'Change the name or username. Leave the password blank to keep it.'}
                        </DialogDescription>
                    </DialogHeader>
                    {editing && (
                        <Form
                            key={target?.id ?? 'new'}
                            {...(target
                                ? AdministratorController.update.form(target.id)
                                : AdministratorController.store.form())}
                            options={{ preserveScroll: true }}
                            resetOnSuccess
                            onSuccess={() => setEditing(null)}
                            className="space-y-4"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">
                                            Display name
                                        </Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            defaultValue={target?.name ?? ''}
                                            className="h-11"
                                        />
                                        <InputError message={errors.name} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="username">
                                            Username
                                        </Label>
                                        <Input
                                            id="username"
                                            name="username"
                                            defaultValue={
                                                target?.username ?? ''
                                            }
                                            autoCapitalize="none"
                                            autoComplete="off"
                                            className="h-11"
                                        />
                                        <InputError message={errors.username} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="password">
                                            {isNew
                                                ? 'Password'
                                                : 'New password (optional)'}
                                        </Label>
                                        <PasswordInput
                                            id="password"
                                            name="password"
                                            autoComplete="new-password"
                                            className="h-11"
                                        />
                                        <InputError message={errors.password} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="password_confirmation">
                                            Confirm password
                                        </Label>
                                        <PasswordInput
                                            id="password_confirmation"
                                            name="password_confirmation"
                                            autoComplete="new-password"
                                            className="h-11"
                                        />
                                        <InputError
                                            message={
                                                errors.password_confirmation
                                            }
                                        />
                                    </div>
                                    <AdminPasswordField
                                        error={errors.admin_password}
                                    />
                                    <ActionButton
                                        type="submit"
                                        disabled={processing}
                                        className="h-11 w-full"
                                    >
                                        {processing && <Spinner />}
                                        {isNew
                                            ? 'Add administrator'
                                            : 'Save changes'}
                                    </ActionButton>
                                </>
                            )}
                        </Form>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog
                open={removing !== null}
                onOpenChange={(open) => !open && setRemoving(null)}
            >
                <DialogContent className="max-w-[calc(100%-2rem)] border-gold/20 bg-surface sm:max-w-[440px]">
                    <DialogHeader>
                        <DialogTitle className="kk-title text-xl">
                            Remove {removing?.name}?
                        </DialogTitle>
                        <DialogDescription>
                            @{removing?.username} will lose access to the admin
                            console right away. This cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    {removing && (
                        <Form
                            key={removing.id}
                            {...AdministratorController.destroy.form(
                                removing.id,
                            )}
                            options={{ preserveScroll: true }}
                            onSuccess={() => setRemoving(null)}
                            className="space-y-4"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <AdminPasswordField
                                        error={errors.admin_password}
                                    />
                                    <ActionButton
                                        type="submit"
                                        look="danger"
                                        disabled={processing}
                                        className="h-11 w-full"
                                    >
                                        {processing && <Spinner />} Remove
                                        administrator
                                    </ActionButton>
                                </>
                            )}
                        </Form>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
