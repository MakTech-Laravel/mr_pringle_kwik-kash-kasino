import { Head, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import ActionButton from '@/components/casino/action-button';
import PageHeader from '@/components/casino/page-header';
import StatusPill, { type PillTone } from '@/components/casino/status-pill';
import {
    type ConnectionStatus,
    useEchoConnection,
} from '@/hooks/use-echo-connection';
import { getEcho } from '@/lib/echo';
import { health, ping, privateMethod } from '@/routes/admin/realtime';
import type { Auth } from '@/types';

type LogLevel = 'info' | 'success' | 'warn' | 'error';
type LogEntry = { id: number; level: LogLevel; message: string; ts: string };
type ReceivedEvent = {
    id: number;
    channel: string;
    event: string;
    data: unknown;
    ts: string;
    latencyMs: number | null;
};
type ChannelState = 'idle' | 'subscribing' | 'subscribed' | 'denied';

const STATUS_TONE: Record<ConnectionStatus, PillTone> = {
    connected: 'success',
    connecting: 'warning',
    unavailable: 'danger',
    disconnected: 'danger',
    failed: 'danger',
    idle: 'neutral',
    disabled: 'neutral',
};

const CHANNEL_TONE: Record<ChannelState, PillTone> = {
    subscribed: 'success',
    subscribing: 'warning',
    denied: 'danger',
    idle: 'neutral',
};

const LOG_COLOR: Record<LogLevel, string> = {
    info: 'text-gold-light',
    success: 'text-success-light',
    warn: 'text-gold',
    error: 'text-danger-light',
};

function clock() {
    return new Date().toLocaleTimeString('en-GB');
}

function xsrf(): string {
    const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/);

    return match ? decodeURIComponent(match[1]) : '';
}

export default function Realtime() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const userId = auth.user.id;
    const privateName = `App.Models.User.${userId}`;

    const {
        status,
        socketId,
        lastError,
        generation,
        config,
        enabled,
        reconnect,
    } = useEchoConnection();
    const [publicState, setPublicState] = useState<ChannelState>('idle');
    const [privateState, setPrivateState] = useState<ChannelState>('idle');
    const [events, setEvents] = useState<ReceivedEvent[]>([]);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [report, setReport] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const counter = useRef(0);
    const sentAt = useRef<Record<string, number>>({});

    const log = useCallback((level: LogLevel, message: string) => {
        setLogs((prev) => [
            { id: counter.current++, level, message, ts: clock() },
            ...prev.slice(0, 99),
        ]);
    }, []);

    const record = useCallback(
        (channel: string, event: string, data: unknown) => {
            const kind = event === 'ping' ? 'public' : 'private';
            const started = sentAt.current[kind];
            const latencyMs =
                started === undefined
                    ? null
                    : Math.round(performance.now() - started);

            delete sentAt.current[kind];
            setEvents((prev) =>
                [
                    {
                        id: counter.current++,
                        channel,
                        event,
                        data,
                        ts: clock(),
                        latencyMs,
                    },
                    ...prev,
                ].slice(0, 50),
            );
            log(
                'success',
                `${kind} event received on ${channel}${latencyMs === null ? '' : ` in ${latencyMs} ms`}`,
            );
        },
        [log],
    );

    useEffect(() => {
        if (lastError) {
            log('error', lastError);
        }
    }, [lastError, log]);

    useEffect(() => {
        log(
            'info',
            enabled
                ? `Connecting to ${config.secure ? 'wss' : 'ws'}://${config.host}:${config.port}`
                : 'VITE_REVERB_APP_KEY / VITE_REVERB_HOST are not set, so Echo is disabled.',
        );
    }, [enabled, config.secure, config.host, config.port, log, generation]);

    useEffect(() => {
        const echo = getEcho();

        if (!echo) {
            return;
        }

        setPublicState('subscribing');
        const channel = echo.channel('reverb-ping');

        channel.subscribed(() => {
            setPublicState('subscribed');
            log('success', 'Subscribed to public channel reverb-ping');
        });
        channel.listen('.ping', (data: unknown) =>
            record('reverb-ping', 'ping', data),
        );

        return () => {
            echo.leave('reverb-ping');
            setPublicState('idle');
        };
    }, [generation, log, record]);

    useEffect(() => {
        const echo = getEcho();

        if (!echo) {
            return;
        }

        setPrivateState('subscribing');
        const channel = echo.private(privateName);

        channel.subscribed(() => {
            setPrivateState('subscribed');
            log(
                'success',
                `Authorised and subscribed to private-${privateName}`,
            );
        });
        channel.error((error: unknown) => {
            setPrivateState('denied');
            log(
                'error',
                `Private channel auth failed: ${JSON.stringify(error)}`,
            );
        });
        channel.listen('.realtime.test', (data: unknown) =>
            record(privateName, 'realtime.test', data),
        );

        return () => {
            echo.leave(privateName);
            setPrivateState('idle');
        };
    }, [generation, privateName, log, record]);

    const call = useCallback(
        async (
            label: string,
            route: { url: string; method: string },
            kind?: 'public' | 'private',
        ) => {
            setBusy(true);
            log(
                'info',
                `${route.method.toUpperCase()} ${route.url} (${label})`,
            );

            if (kind) {
                sentAt.current[kind] = performance.now();
            }

            try {
                const response = await fetch(route.url, {
                    method: route.method.toUpperCase(),
                    credentials: 'same-origin',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-XSRF-TOKEN': xsrf(),
                    },
                    body: route.method === 'get' ? undefined : '{}',
                });
                const json = await response.json();

                setReport(JSON.stringify(json, null, 2));

                if (!response.ok) {
                    throw new Error(json.message ?? `HTTP ${response.status}`);
                }

                log(
                    'success',
                    kind
                        ? 'Laravel accepted the event; waiting for the WebSocket push'
                        : `${label} done`,
                );
            } catch (error) {
                if (kind) {
                    delete sentAt.current[kind];
                }

                log(
                    'error',
                    `${label} failed: ${error instanceof Error ? error.message : String(error)}`,
                );
            } finally {
                setBusy(false);
            }
        },
        [log],
    );

    const connected = status === 'connected';
    // A channel can only be live while the socket itself is connected.
    const live = (state: ChannelState): ChannelState =>
        !connected && state === 'subscribed' ? 'idle' : state;
    const publicLive = live(publicState);
    const privateLive = live(privateState);
    const endpoint = enabled
        ? `${config.secure ? 'wss' : 'ws'}://${config.host}:${config.port}`
        : 'not configured';

    return (
        <>
            <Head title="Realtime test" />
            <div className="space-y-6">
                <PageHeader
                    eyebrow="Diagnostics"
                    title="Realtime connection test"
                    description="Verify Laravel, the standalone Reverb server and this browser end to end, over a public and a private channel."
                />

                <section className="kk-panel space-y-5 p-5">
                    <div className="flex flex-wrap items-center gap-3">
                        <StatusPill tone={STATUS_TONE[status]}>
                            {status}
                        </StatusPill>
                        <StatusPill
                            tone={config.secure ? 'success' : 'warning'}
                            dot={false}
                        >
                            {config.secure ? 'wss (TLS)' : 'ws (plain)'}
                        </StatusPill>
                        <span className="text-xs break-all text-ink-muted">
                            socket_id:{' '}
                            <span className="text-ink">{socketId ?? '-'}</span>
                        </span>
                    </div>

                    {lastError && (
                        <p className="text-xs text-danger-light" role="alert">
                            {lastError}
                        </p>
                    )}

                    <dl className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
                        {[
                            ['WebSocket endpoint', endpoint],
                            [
                                'App key',
                                config.appKey
                                    ? `${config.appKey.slice(0, 8)}...`
                                    : 'MISSING',
                            ],
                            ['Auth endpoint', config.authEndpoint],
                            ['Transports', 'ws, wss'],
                        ].map(([label, value]) => (
                            <div
                                key={label}
                                className="min-w-0 rounded-lg border border-border p-3"
                            >
                                <dt className="text-ink-muted">{label}</dt>
                                <dd className="mt-1 font-semibold break-all text-ink">
                                    {value}
                                </dd>
                            </div>
                        ))}
                    </dl>

                    <div className="flex flex-wrap gap-4 text-xs text-ink-muted">
                        <span className="flex items-center gap-2">
                            Public <code>reverb-ping</code>
                            <StatusPill
                                tone={CHANNEL_TONE[publicLive]}
                                caps={false}
                            >
                                {publicLive}
                            </StatusPill>
                        </span>
                        <span className="flex items-center gap-2">
                            Private <code>{privateName}</code>
                            <StatusPill
                                tone={CHANNEL_TONE[privateLive]}
                                caps={false}
                            >
                                {privateLive}
                            </StatusPill>
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <ActionButton
                            className="h-10 px-4 text-xs"
                            disabled={busy || !connected}
                            onClick={() =>
                                call('public ping', ping(), 'public')
                            }
                        >
                            Send public signal
                        </ActionButton>
                        <ActionButton
                            className="h-10 px-4 text-xs"
                            disabled={
                                busy ||
                                !connected ||
                                privateLive !== 'subscribed'
                            }
                            onClick={() =>
                                call(
                                    'private signal',
                                    privateMethod(),
                                    'private',
                                )
                            }
                        >
                            Send private signal
                        </ActionButton>
                        <ActionButton
                            look="outline"
                            className="h-10 px-4 text-xs"
                            disabled={busy}
                            onClick={() =>
                                call('server and Redis check', health())
                            }
                        >
                            Check server and Redis
                        </ActionButton>
                        <ActionButton
                            look="outline"
                            className="h-10 px-4 text-xs"
                            disabled={!enabled}
                            onClick={() => {
                                log('info', 'Manual reconnect requested');
                                reconnect();
                            }}
                        >
                            Reconnect
                        </ActionButton>
                        <ActionButton
                            look="ghost"
                            className="h-10 px-4 text-xs"
                            onClick={() => {
                                setEvents([]);
                                setLogs([]);
                                setReport(null);
                            }}
                        >
                            Clear
                        </ActionButton>
                    </div>
                </section>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                    <section
                        className="kk-panel p-4"
                        aria-label="Received events"
                    >
                        <h2 className="kk-title mb-3 text-base text-ink">
                            Received events ({events.length})
                        </h2>
                        <div className="max-h-72 space-y-2 overflow-y-auto">
                            {events.length === 0 ? (
                                <p className="py-8 text-center text-xs text-ink-muted">
                                    No events yet.
                                </p>
                            ) : (
                                events.map((e) => (
                                    <div
                                        key={e.id}
                                        className="rounded-lg border border-border p-3 text-xs"
                                    >
                                        <div className="mb-1 flex flex-wrap justify-between gap-2 text-ink-muted">
                                            <span className="text-success-light">
                                                {e.channel} / {e.event}
                                            </span>
                                            <span>
                                                {e.ts}
                                                {e.latencyMs !== null &&
                                                    ` · ${e.latencyMs} ms`}
                                            </span>
                                        </div>
                                        <pre className="break-all whitespace-pre-wrap text-ink">
                                            {JSON.stringify(e.data, null, 2)}
                                        </pre>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    <section className="kk-panel p-4" aria-label="Debug log">
                        <h2 className="kk-title mb-3 text-base text-ink">
                            Debug log ({logs.length})
                        </h2>
                        <div className="max-h-72 space-y-1 overflow-y-auto font-mono text-[11px] leading-5">
                            {logs.length === 0 ? (
                                <p className="py-8 text-center text-xs text-ink-muted">
                                    No log entries.
                                </p>
                            ) : (
                                logs.map((l) => (
                                    <p key={l.id} className="break-all">
                                        <span className="text-ink-muted">
                                            {l.ts}{' '}
                                        </span>
                                        <span className={LOG_COLOR[l.level]}>
                                            [{l.level}]{' '}
                                        </span>
                                        <span className="text-ink">
                                            {l.message}
                                        </span>
                                    </p>
                                ))
                            )}
                        </div>
                    </section>
                </div>

                {report && (
                    <section
                        className="kk-panel p-4"
                        aria-label="Last server response"
                    >
                        <h2 className="kk-title mb-3 text-base text-ink">
                            Last server response
                        </h2>
                        <pre className="max-h-72 overflow-auto text-xs break-all whitespace-pre-wrap text-ink">
                            {report}
                        </pre>
                    </section>
                )}
            </div>
        </>
    );
}
