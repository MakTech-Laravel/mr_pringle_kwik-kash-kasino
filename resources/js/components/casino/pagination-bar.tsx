import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { formatNumber } from '@/lib/format';

type Props = {
    shown: number;
    total: number;
    pageSize: number;
    page: number;
    onPage: (page: number) => void;
};

/**
 * "Showing 1–6 of 1,284" with page links. the page changes state only;
 * the fixture rows do not change between pages.
 */
export default function PaginationBar({
    shown,
    total,
    pageSize,
    page,
    onPage,
}: Props) {
    const pages = Math.max(1, Math.ceil(total / pageSize));
    const visible = [1, 2, 3].filter((p) => p <= pages);

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] text-ink-muted">
                Showing 1–{shown} of {formatNumber(total)}
            </p>
            <Pagination className="mx-0 w-auto justify-start">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            href="#"
                            aria-label="Previous page"
                            className={
                                page === 1
                                    ? 'pointer-events-none opacity-40'
                                    : ''
                            }
                            onClick={(e) => {
                                e.preventDefault();
                                onPage(Math.max(1, page - 1));
                            }}
                        />
                    </PaginationItem>
                    {visible.map((p) => (
                        <PaginationItem key={p}>
                            <PaginationLink
                                href="#"
                                isActive={p === page}
                                onClick={(e) => {
                                    e.preventDefault();
                                    onPage(p);
                                }}
                                className={
                                    p === page
                                        ? 'border-crimson bg-crimson text-white hover:bg-crimson'
                                        : 'text-ink-muted'
                                }
                            >
                                {p}
                            </PaginationLink>
                        </PaginationItem>
                    ))}
                    {pages > 3 && (
                        <PaginationItem>
                            <PaginationLink
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    onPage(pages);
                                }}
                                isActive={page === pages}
                                className="text-ink-muted"
                            >
                                {formatNumber(pages)}
                            </PaginationLink>
                        </PaginationItem>
                    )}
                    <PaginationItem>
                        <PaginationNext
                            href="#"
                            aria-label="Next page"
                            className={
                                page === pages
                                    ? 'pointer-events-none opacity-40'
                                    : ''
                            }
                            onClick={(e) => {
                                e.preventDefault();
                                onPage(Math.min(pages, page + 1));
                            }}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
}
