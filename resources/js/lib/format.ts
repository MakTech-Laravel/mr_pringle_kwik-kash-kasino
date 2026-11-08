const numberFormat = new Intl.NumberFormat('en-US');

/** 12500 -> "12,500" */
export function formatNumber(value: number): string {
    return numberFormat.format(value);
}

/** 12500 -> "12,500 CR" */
export function formatCredits(value: number): string {
    return `${formatNumber(value)} CR`;
}

/** 1250 -> "+1,250 CR", -500 -> "−500 CR" (typographic minus as in Figma) */
export function formatSignedCredits(value: number): string {
    const sign = value > 0 ? '+' : value < 0 ? '−' : '';

    return `${sign}${formatNumber(Math.abs(value))} CR`;
}

/** Initials for avatars: "CasinoPlayer01" -> "CP", "admin" -> "A" */
export function initialsOf(name: string): string {
    const parts = name
        .replace(/[_\-.]+/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .split(' ')
        .filter(Boolean);

    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }

    return name.slice(0, 2).toUpperCase();
}
