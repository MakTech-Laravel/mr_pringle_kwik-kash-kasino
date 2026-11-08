import { useCallback, useEffect, useState } from 'react';
import {
    getEcho,
    getEchoGeneration,
    getReverbClientConfig,
    reconnectEcho,
} from '@/lib/echo';

export type ConnectionStatus =
    | 'disabled'
    | 'idle'
    | 'connecting'
    | 'connected'
    | 'unavailable'
    | 'disconnected'
    | 'failed';

type PusherConnection = {
    state?: string;
    socket_id?: string;
    bind: (event: string, cb: (...args: unknown[]) => void) => void;
    unbind: (event: string, cb?: (...args: unknown[]) => void) => void;
};

function connectionOf(): PusherConnection | null {
    const echo = getEcho();
    const connector = echo?.connector as
        | { pusher?: { connection?: PusherConnection } }
        | undefined;

    return connector?.pusher?.connection ?? null;
}

function toStatus(state: string | undefined, enabled: boolean) {
    if (!enabled) {
        return 'disabled' as const;
    }

    switch (state) {
        case 'connecting':
        case 'connected':
        case 'unavailable':
        case 'failed':
        case 'disconnected':
            return state;
        default:
            return 'idle' as const;
    }
}

function describeError(payload: unknown): string {
    if (typeof payload === 'string') {
        return payload;
    }

    const record = (payload ?? {}) as {
        error?: { data?: { message?: string; code?: number } };
        message?: string;
    };
    const data = record.error?.data;

    if (data?.message) {
        return `${data.message}${data.code ? ` (code ${data.code})` : ''}`;
    }

    return record.message ?? 'Connection error';
}

/** Live Reverb connection state from the shared Echo/Pusher client. */
export function useEchoConnection() {
    const config = getReverbClientConfig();
    const [status, setStatus] = useState<ConnectionStatus>(
        config.enabled ? 'idle' : 'disabled',
    );
    const [socketId, setSocketId] = useState<string | null>(null);
    const [lastError, setLastError] = useState<string | null>(null);
    const [generation, setGeneration] = useState(getEchoGeneration());

    useEffect(() => {
        const connection = connectionOf();

        if (!connection) {
            setStatus(config.enabled ? 'unavailable' : 'disabled');

            return;
        }

        const sync = () => {
            setStatus(toStatus(connection.state, config.enabled));
            setSocketId(connection.socket_id ?? null);
        };
        const onError = (...args: unknown[]) => {
            setLastError(describeError(args[0]));
            sync();
        };
        const onConnected = () => {
            setLastError(null);
            sync();
        };
        const events = [
            'state_change',
            'disconnected',
            'unavailable',
            'failed',
        ];

        sync();
        events.forEach((event) => connection.bind(event, sync));
        connection.bind('connected', onConnected);
        connection.bind('error', onError);

        return () => {
            events.forEach((event) => connection.unbind(event, sync));
            connection.unbind('connected', onConnected);
            connection.unbind('error', onError);
        };
    }, [config.enabled, generation]);

    const reconnect = useCallback(() => {
        setLastError(null);
        setSocketId(null);
        reconnectEcho();
        setGeneration(getEchoGeneration());
    }, []);

    return {
        status,
        socketId,
        lastError,
        generation,
        config,
        enabled: config.enabled,
        reconnect,
    };
}
