import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Props = {
    eyebrow?: string;
    title: ReactNode;
    description?: ReactNode;
    actions?: ReactNode;
    className?: string;
};

/** Gold eyebrow + serif small-caps title, with optional right-aligned actions. */
export default function PageHeader({
    eyebrow,
    title,
    description,
    actions,
    className,
}: Props) {
    return (
        <header
            className={cn(
                'flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between',
                className,
            )}
        >
            <div className="min-w-0">
                {eyebrow && <p className="kk-eyebrow mb-3">{eyebrow}</p>}
                <h1 className="kk-title text-3xl leading-tight text-ink sm:text-4xl lg:text-[44px]">
                    {title}
                </h1>
                {description && (
                    <p className="mt-3 text-sm text-ink-muted">{description}</p>
                )}
            </div>
            {actions && (
                <div className="flex shrink-0 flex-wrap items-center gap-3">
                    {actions}
                </div>
            )}
        </header>
    );
}
