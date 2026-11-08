import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import type { ChannelAuthorizationData } from 'pusher-js/types/src/core/auth/options';

declare global {
    interface Window {
        Pusher: typeof Pusher;
        Echo: Echo<'reverb'> | undefined;
    }
}

export type AppEcho = Echo<'reverb'>;

export type ReverbClientConfig = {
    enabled: boolean;
    appKey: string;
    host: string;
    port: number;
    scheme: 'http' | 'https';
    /** true => the browser opens wss://, false => ws:// (local dev). */
    secure: boolean;
    authEndpoint: string;
};

function csrfToken(): string {
    const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/);

    return match ? decodeURIComponent(match[1]) : '';
}

/**
 * Reverb settings baked into the bundle at build time (VITE_REVERB_*).
 * http  -> ws://host:port   (local reverb_server)
 * https -> wss://host:port  (staging / production behind the proxy)
 */
export function getReverbClientConfig(): ReverbClientConfig {
    const appKey = String(import.meta.env.VITE_REVERB_APP_KEY ?? '').trim();
    const host = String(import.meta.env.VITE_REVERB_HOST ?? '').trim();
    const scheme =
        String(import.meta.env.VITE_REVERB_SCHEME ?? 'https').trim() === 'http'
            ? 'http'
            : 'https';
    const secure = scheme === 'https';
    const port = Number(
        import.meta.env.VITE_REVERB_PORT ?? (secure ? 443 : 8080),
    );

    return {
        enabled: appKey !== '' && host !== '',
        appKey,
        host,
        port: Number.isFinite(port) && port > 0 ? port : secure ? 443 : 80,
        scheme,
        secure,
        authEndpoint: '/broadcasting/auth',
    };
}

let instance: AppEcho | null | undefined;
let generation = 0;

/** Bumped whenever the singleton is torn down, so listeners can re-subscribe. */
export function getEchoGeneration(): number {
    return generation;
}

function createEcho(): AppEcho | null {
    const config = getReverbClientConfig();

    if (typeof window === 'undefined' || !config.enabled) {
        return null;
    }

    window.Pusher = Pusher;

    return new Echo({
        broadcaster: 'reverb',
        key: config.appKey,
        wsHost: config.host,
        wsPort: config.port,
        wssPort: config.port,
        forceTLS: config.secure,
        // pusher-js names its WebSocket transport "ws" even when it connects
        // over TLS (wss://), so BOTH must be listed to support ws and wss.
        // Never add xhr/sockjs fallbacks: Reverb does not speak them.
        enabledTransports: ['ws', 'wss'],
        disableStats: true,
        authEndpoint: config.authEndpoint,
        auth: {
            headers: {
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
        },
        // Fresh CSRF token on every private-channel auth request.
        authorizer: (channel: { name: string }) => ({
            authorize: (
                socketId: string,
                callback: (
                    error: Error | null,
                    data: ChannelAuthorizationData | null,
                ) => void,
            ) => {
                fetch(config.authEndpoint, {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-XSRF-TOKEN': csrfToken(),
                    },
                    body: JSON.stringify({
                        socket_id: socketId,
                        channel_name: channel.name,
                    }),
                })
                    .then(async (response) => {
                        if (!response.ok) {
                            throw new Error(
                                `Channel auth failed (HTTP ${response.status})`,
                            );
                        }

                        callback(
                            null,
                            (await response.json()) as ChannelAuthorizationData,
                        );
                    })
                    .catch((error: Error) => callback(error, null));
            },
        }),
    });
}

/** Browser-only singleton. Returns null when VITE_REVERB_* is not configured. */
export function getEcho(): AppEcho | null {
    if (instance === undefined) {
        instance = createEcho();
        window.Echo = instance ?? undefined;
    }

    return instance;
}

export function disconnectEcho(): void {
    instance?.disconnect();
    instance = undefined;
    generation += 1;
    window.Echo = undefined;
}

/** Tear down a stuck client and open a fresh WebSocket. */
export function reconnectEcho(): AppEcho | null {
    disconnectEcho();

    return getEcho();
}
