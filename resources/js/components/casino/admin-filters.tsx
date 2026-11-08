import { CalendarDays } from 'lucide-react';
import type { ReactNode } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type Option = { value: string; label: string };

/** Compact select used for status / type / date-range filters. */
export function FilterSelect({
    value,
    onChange,
    options,
    label,
    icon,
}: {
    value: string;
    onChange: (v: string) => void;
    options: Option[];
    label: string;
    icon?: ReactNode;
}) {
    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger
                aria-label={label}
                className="h-11 w-full min-w-40 gap-2 border-border sm:w-auto"
            >
                {icon}
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {options.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                        {o.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

export const dateRanges: Option[] = [
    { value: 'all', label: 'Any date' },
    { value: '7', label: 'Last 7 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 90 days' },
];

export function DateRangeSelect({
    value,
    onChange,
}: {
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <FilterSelect
            value={value}
            onChange={onChange}
            options={dateRanges}
            label="Date range"
            icon={<CalendarDays className="size-4 text-ink-muted" />}
        />
    );
}
