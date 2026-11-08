import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';

const config = {
    balance: { label: 'House balance', color: 'var(--color-gold)' },
} satisfies ChartConfig;

/** House balance over time (index 0 = Mar 1), built on the shadcn chart primitives. */
export default function HouseBalanceChart({ values }: { values: number[] }) {
    const rows = values.map((balance, index) => ({
        day: `Mar ${index + 1}`,
        balance,
    }));

    return (
        <ChartContainer
            config={config}
            className="aspect-auto h-56 w-full"
            role="img"
            aria-label={`House balance, ${rows[0]?.day} to ${rows.at(-1)?.day}`}
        >
            <AreaChart data={rows} accessibilityLayer>
                <defs>
                    <linearGradient id="house-fill" x1="0" x2="0" y1="0" y2="1">
                        <stop
                            offset="0%"
                            stopColor="var(--color-balance)"
                            stopOpacity={0.4}
                        />
                        <stop
                            offset="100%"
                            stopColor="var(--color-balance)"
                            stopOpacity={0}
                        />
                    </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--color-border)" />
                <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={32}
                    tick={{ fill: 'var(--color-ink-muted)', fontSize: 11 }}
                />
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" />}
                />
                <Area
                    dataKey="balance"
                    type="monotone"
                    stroke="var(--color-balance)"
                    strokeWidth={2.5}
                    fill="url(#house-fill)"
                />
            </AreaChart>
        </ChartContainer>
    );
}
