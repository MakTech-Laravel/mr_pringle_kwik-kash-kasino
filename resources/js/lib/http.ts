function xsrfToken(): string {
    const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/);

    return match ? decodeURIComponent(match[1]) : '';
}

/** POST to a Laravel route and read a JSON body, throwing the server's message on failure. */
export async function postJson<T>(url: string): Promise<T> {
    const response = await fetch(url, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-XSRF-TOKEN': xsrfToken(),
        },
        body: '{}',
    });
    const json = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(
            (json as { message?: string }).message ??
                `Request failed (HTTP ${response.status})`,
        );
    }

    return json as T;
}
