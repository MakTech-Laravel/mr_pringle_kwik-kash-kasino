import { Link } from '@inertiajs/react';
import BrandLogo from '@/components/casino/brand-logo';
import PlayingCard from '@/components/games/playing-card';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

/**
 * Auth shell. INFERRED design: Figma has no login/register art, so this reuses
 * the approved palette, brand lockup and card/felt motifs. Mobile stacks the
 * showcase above the form.
 */
export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="grid min-h-svh bg-background lg:grid-cols-[1.1fr_0.9fr]">
            <section className="relative hidden overflow-hidden border-r border-gold/15 lg:flex lg:flex-col lg:justify-between lg:p-14">
                <div
                    aria-hidden
                    className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgb(169_39_44/0.35),transparent_55%),radial-gradient(ellipse_at_80%_90%,rgb(15_90_63/0.45),transparent_55%)]"
                />
                <Link href={home()} className="relative">
                    <BrandLogo />
                </Link>
                <div className="relative">
                    <div className="mb-10 flex items-center">
                        <PlayingCard
                            faceDown
                            size="lg"
                            className="-rotate-12"
                        />
                        <PlayingCard
                            card={{ rank: 'A', suit: 'spades' }}
                            size="lg"
                            className="-ml-5 rotate-3"
                        />
                        <PlayingCard
                            card={{ rank: 'K', suit: 'hearts' }}
                            size="lg"
                            className="-ml-5 rotate-12"
                        />
                    </div>
                    <p className="kk-eyebrow mb-4">The private game room</p>
                    <h2 className="kk-title max-w-md text-5xl leading-tight text-ink">
                        Take your seat at the table.
                    </h2>
                    <p className="mt-5 max-w-sm text-sm text-ink-muted">
                        Blackjack, poker and roulette, hosted live for our
                        community. Virtual credits only, no real money.
                    </p>
                </div>
                <p className="relative text-[11px] tracking-wider text-ink-muted/70">
                    Illustrative prototype. Virtual credits have no real-world
                    value.
                </p>
            </section>

            <section className="flex flex-col justify-center px-5 py-10 sm:px-10">
                <div className="mx-auto w-full max-w-sm">
                    <Link href={home()} className="mb-8 block lg:hidden">
                        <BrandLogo />
                    </Link>
                    <p className="kk-eyebrow mb-3">Player access</p>
                    <h1 className="kk-title text-3xl text-ink sm:text-4xl">
                        {title}
                    </h1>
                    <p className="mt-3 mb-8 text-sm text-ink-muted">
                        {description}
                    </p>
                    {children}
                </div>
            </section>
        </div>
    );
}
