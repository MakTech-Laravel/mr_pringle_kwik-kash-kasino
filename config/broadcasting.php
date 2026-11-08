<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default Broadcaster
    |--------------------------------------------------------------------------
    |
    | Reverb runs as a SEPARATE service (the `reverb_server` repository). This
    | app never hosts a WebSocket server: it only publishes events to that
    | server over HTTP, signed with the shared app key/secret. The `reverb`
    | driver below is served by `pusher/pusher-php-server` (Pusher protocol),
    | so `laravel/reverb` is intentionally NOT installed here.
    |
    | Supported: "reverb", "log", "null"
    |
    */

    'default' => env('BROADCAST_CONNECTION', 'null'),

    /*
    |--------------------------------------------------------------------------
    | Broadcast Connections
    |--------------------------------------------------------------------------
    |
    | REVERB_APP_ID / KEY / SECRET must match the `reverb_server` environment
    | exactly. REVERB_HOST / PORT / SCHEME are the address THIS app uses to
    | reach the Reverb HTTP API (public domain in staging, 127.0.0.1:8080
    | locally).
    |
    */

    'connections' => [

        'reverb' => [
            'driver' => 'reverb',
            'key' => env('REVERB_APP_KEY'),
            'secret' => env('REVERB_APP_SECRET'),
            'app_id' => env('REVERB_APP_ID'),
            'options' => [
                'host' => env('REVERB_HOST'),
                'port' => env('REVERB_PORT', 443),
                'scheme' => env('REVERB_SCHEME', 'https'),
                'useTLS' => env('REVERB_SCHEME', 'https') === 'https',
            ],
            'client_options' => [
                // Fail fast instead of hanging a request when Reverb is down.
                'connect_timeout' => 3,
                'timeout' => 5,
            ],
        ],

        'log' => [
            'driver' => 'log',
        ],

        'null' => [
            'driver' => 'null',
        ],

    ],

];
