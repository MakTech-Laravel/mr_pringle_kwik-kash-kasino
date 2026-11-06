import type { Key, ReactNode } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

export type Column<T> = {
    key: string;
    header: string;
    cell: (row: T) => ReactNode;
    /** Column is the card heading on mobile. */
    primary?: boolean;
    /** Extra classes for the desktop cell. */
    className?: string;
    /** Hide the label/value pair on mobile cards. */
    hideOnMobile?: boolean;
    /** Span both columns of the mobile card grid (long values such as status chips). */
    wide?: boolean;
    /** Right-aligned action column (rendered without a label on mobile). */
    action?: boolean;
};

type Props<T> = {
    columns: Column<T>[];
    rows: T[];
    rowKey: (row: T) => Key;
    empty?: ReactNode;
    footer?: ReactNode;
    className?: string;
};

/**
 * Responsive data table: a shadcn Table from md up, stacked cards below.
 * Keeps one column definition for both layouts.
 */
export default function DataTable<T>({
    columns,
    rows,
    rowKey,
    empty,
    footer,
    className,
}: Props<T>) {
    const primary = columns.find((c) => c.primary) ?? columns[0];
    const actions = columns.filter((c) => c.action);
    const details = columns.filter(
        (c) => c !== primary && !c.action && !c.hideOnMobile,
    );

    return (
        <div className={cn('kk-panel overflow-hidden', className)}>
            {rows.length === 0 ? (
                <div className="p-10 text-center text-sm text-ink-muted">
                    {empty ?? 'Nothing to show yet.'}
                </div>
            ) : (
                <>
                    <div className="hidden md:block">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border hover:bg-transparent">
                                    {columns.map((col) => (
                                        <TableHead
                                            key={col.key}
                                            className={cn(
                                                'h-12 px-5 text-[10px] font-semibold tracking-[0.14em] text-ink-muted uppercase',
                                                col.action && 'text-right',
                                            )}
                                        >
                                            {col.header}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rows.map((row) => (
                                    <TableRow
                                        key={rowKey(row)}
                                        className="border-border hover:bg-white/[0.02]"
                                    >
                                        {columns.map((col) => (
                                            <TableCell
                                                key={col.key}
                                                className={cn(
                                                    'h-[64px] px-5 text-xs text-ink-muted',
                                                    col.primary &&
                                                        'font-semibold text-ink',
                                                    col.action && 'text-right',
                                                    col.className,
                                                )}
                                            >
                                                {col.cell(row)}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <ul className="divide-y divide-border md:hidden">
                        {rows.map((row) => (
                            <li key={rowKey(row)} className="space-y-3 p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 text-sm font-semibold text-ink">
                                        {primary.cell(row)}
                                    </div>
                                    {actions.length > 0 && (
                                        <div className="flex shrink-0 items-center gap-2">
                                            {actions.map((a) => (
                                                <span key={a.key}>
                                                    {a.cell(row)}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                                    {details.map((col) => (
                                        <div
                                            key={col.key}
                                            className={cn(
                                                'min-w-0',
                                                col.wide && 'col-span-2',
                                            )}
                                        >
                                            <dt className="text-[10px] tracking-[0.12em] text-ink-muted/80 uppercase">
                                                {col.header}
                                            </dt>
                                            <dd className="mt-0.5 text-xs [overflow-wrap:anywhere] text-ink">
                                                {col.cell(row)}
                                            </dd>
                                        </div>
                                    ))}
                                </dl>
                            </li>
                        ))}
                    </ul>
                </>
            )}
            {footer && (
                <div className="border-t border-border px-4 py-3 sm:px-5">
                    {footer}
                </div>
            )}
        </div>
    );
}
