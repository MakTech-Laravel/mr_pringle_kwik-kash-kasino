import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';

type Point = { day: string; in: number; out: number };

const config = {
    in: { label: 'Credits in', color: 'var(--color-gold)' },
    out: { label: 'Credits out', color: 'var(--color-crimson)' },
} satisfies ChartConfig;

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** Credits in vs out per day, built on the shadcn chart primitives. */
export default function CreditMovementChart({ data }: { data: Point[] }) {
    const rows = data.map((point, index) => ({
        ...point,
        day: days[index] ?? point.day,
    }));

    return (
        <ChartContainer
            config={config}
            className="aspect-auto h-56 w-full"
            role="img"
            aria-label="Bar chart of credits in and out for the last 7 days"
        >
            <BarChart data={rows} barGap={4} accessibilityLayer>
                <CartesianGrid vertical={false} stroke="var(--color-border)" />
                <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fill: 'var(--color-ink-muted)', fontSize: 11 }}
                />
                <ChartTooltip
                    cursor={{ fill: 'rgb(255 255 255 / 0.04)' }}
                    content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar
                    dataKey="in"
                    fill="var(--color-in)"
                    radius={[4, 4, 0, 0]}
                />
                <Bar
                    dataKey="out"
                    fill="var(--color-out)"
                    radius={[4, 4, 0, 0]}
                />
            </BarChart>
        </ChartContainer>
    );
}
