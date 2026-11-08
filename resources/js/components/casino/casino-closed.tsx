import { Link } from '@inertiajs/react';
import ActionButton from '@/components/casino/action-button';
import { dashboard } from '@/routes';
import { index as walletIndex } from '@/routes/wallet';

/** Full-page state shown when an admin has closed the casino (Figma "Casino closed"). */
export default function CasinoClosed() {
    return (
        <section
            aria-labelledby="closed-heading"
            className="mx-auto flex max-w-2xl flex-col items-center py-10 text-center sm:py-16"
        >
            <div className="-rotate-2 border-2 border-gold bg-gradient-to-b from-crimson/40 to-crimson/10 px-8 py-6 shadow-2xl shadow-black/50 sm:px-12">
                <p className="font-display text-sm tracking-[0.4em] text-gold">
                    CASINO
                </p>
                <p className="font-display text-4xl font-semibold tracking-wide text-ink sm:text-5xl">
                    CLOSED
                </p>
                <p className="mt-2 text-[9px] tracking-[0.3em] text-gold uppercase">
                    The tables will return
                </p>
            </div>
            <p className="kk-eyebrow mt-10">Event status</p>
            <h1
                id="closed-heading"
                className="kk-title mt-3 text-3xl text-ink sm:text-4xl"
            >
                The casino is currently closed
            </h1>
            <p className="mt-4 max-w-md text-sm text-ink-muted">
                Check back when the next community event begins. Your wallet,
                history, and account remain available.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
                <ActionButton asChild className="h-11 px-6">
                    <Link href={dashboard()}>Return to dashboard</Link>
                </ActionButton>
                <ActionButton asChild look="outline" className="h-11 px-6">
                    <Link href={walletIndex()}>View my wallet</Link>
                </ActionButton>
            </div>
            <p className="mt-6 text-[11px] text-ink-muted/70">
                Next event time has not been announced.
            </p>
        </section>
    );
}
