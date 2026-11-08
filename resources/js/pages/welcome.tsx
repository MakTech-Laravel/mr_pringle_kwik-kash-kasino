import { Head, Link, usePage } from '@inertiajs/react';
import ActionButton from '@/components/casino/action-button';
import BrandLogo from '@/components/casino/brand-logo';
import GameArt from '@/components/casino/game-art';
import { dashboard, login, register } from '@/routes';
import type { Auth } from '@/types';
import type { GameKind } from '@/types/casino';

const games: { game: GameKind; name: string; blurb: string }[] = [
    {
        game: 'blackjack',
        name: 'Blackjack',
        blurb: 'Play your hand against the house.',
    },
    {
        game: 'poker',
        name: 'Poker',
        blurb: 'Up to six players per hosted table.',
    },
    {
        game: 'roulette',
        name: 'Roulette',
        blurb: 'Watch the wheel decide your fortune.',
    },
];

/** Public landing. INFERRED design: Figma has no landing screen, so it reuses the approved tokens and game art. */
export default function Welcome() {
    const { auth } = usePage<{ auth: Auth | { user: null } }>().props;
    const signedIn = !!auth?.user;

    return (
        <>
            <Head title="Welcome" />
            <div className="min-h-svh bg-background">
                <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
                    <BrandLogo />
                    <nav
                        className="flex items-center gap-2"
                        aria-label="Account"
                    >
                        {signedIn ? (
                            <ActionButton asChild className="h-10 px-5">
                                <Link href={dashboard()}>Go to dashboard</Link>
                            </ActionButton>
                        ) : (
                            <>
                                <ActionButton
                                    asChild
                                    look="ghost"
                                    className="h-10 px-4"
                                >
                                    <Link href={login()}>Log in</Link>
                                </ActionButton>
                                <ActionButton asChild className="h-10 px-5">
                                    <Link href={register()}>Register</Link>
                                </ActionButton>
                            </>
                        )}
                    </nav>
                </header>

                <main className="mx-auto max-w-6xl px-5 pt-10 pb-16 sm:px-8 sm:pt-20">
                    <section className="relative overflow-hidden rounded-2xl border border-gold/20 bg-[radial-gradient(ellipse_at_80%_0%,rgb(169_39_44/0.35),transparent_60%),radial-gradient(ellipse_at_0%_100%,rgb(15_90_63/0.35),transparent_55%)] px-6 py-14 text-center sm:px-12 sm:py-24">
                        <p className="kk-eyebrow mb-5">The private game room</p>
                        <h1 className="kk-title mx-auto max-w-3xl text-4xl leading-tight text-ink sm:text-6xl">
                            Take your seat at the Kwik Kash table.
                        </h1>
                        <p className="mx-auto mt-6 max-w-xl text-sm text-ink-muted sm:text-base">
                            Hosted blackjack, poker and roulette for our
                            community. Virtual credits only, with no real money
                            involved.
                        </p>
                        <div className="mt-9 flex flex-wrap justify-center gap-3">
                            <ActionButton asChild className="h-12 px-8">
                                <Link
                                    href={signedIn ? dashboard() : register()}
                                >
                                    {signedIn
                                        ? 'Open the casino'
                                        : 'Create your account'}
                                </Link>
                            </ActionButton>
                            {!signedIn && (
                                <ActionButton
                                    asChild
                                    look="outline"
                                    className="h-12 px-8"
                                >
                                    <Link href={login()}>Log in</Link>
                                </ActionButton>
                            )}
                        </div>
                    </section>

                    <section
                        aria-label="Games"
                        className="mt-10 grid gap-5 md:grid-cols-3"
                    >
                        {games.map((g) => (
                            <article
                                key={g.game}
                                className="kk-panel overflow-hidden"
                            >
                                <GameArt game={g.game} className="h-40" />
                                <div className="p-5">
                                    <h2 className="kk-title text-xl text-ink">
                                        {g.name}
                                    </h2>
                                    <p className="mt-2 text-sm text-ink-muted">
                                        {g.blurb}
                                    </p>
                                </div>
                            </article>
                        ))}
                    </section>
                </main>

                <footer className="border-t border-border px-5 py-6 text-center text-[11px] text-ink-muted/70">
                    Illustrative prototype. Virtual credits have no real-world
                    value.
                </footer>
            </div>
        </>
    );
}
