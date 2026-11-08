export type AppealStatus = 'pending' | 'resolved' | 'rejected';

export type Appeal = {
    id: number;
    username: string;
    email: string;
    message: string | null;
    status: AppealStatus;
    accountFound: boolean;
    accountIsAdmin: boolean;
    submittedAt: string | null;
    linkExpiresAt: string | null;
};

type Mail = { to: string; subject: string; body: string };

/** Opens a pre-filled Gmail compose window. The admin still has to press Send. */
export function gmailComposeUrl({ to, subject, body }: Mail): string {
    const params = new URLSearchParams({
        view: 'cm',
        fs: '1',
        to,
        su: subject,
        body,
    });

    return `https://mail.google.com/mail/?${params.toString()}`;
}

export function resetLinkMail(
    appeal: Pick<Appeal, 'username' | 'email'>,
    url: string,
    hours: number,
    site: string,
): Mail {
    return {
        to: appeal.email,
        subject: `${site}: reset your password`,
        body: [
            `Hello ${appeal.username},`,
            '',
            `We received your password appeal for ${site}. Open this one-time link to choose a new password. It works once and expires in ${hours} hours:`,
            '',
            url,
            '',
            'If you did not ask for this, you can ignore this message.',
            '',
            `${site} admin team`,
        ].join('\n'),
    };
}

export function temporaryPasswordMail(
    appeal: Pick<Appeal, 'username' | 'email'>,
    password: string,
    site: string,
): Mail {
    return {
        to: appeal.email,
        subject: `${site}: your temporary password`,
        body: [
            `Hello ${appeal.username},`,
            '',
            `We received your password appeal for ${site}. Sign in with this temporary password and change it right away in your account security settings:`,
            '',
            password,
            '',
            `${site} admin team`,
        ].join('\n'),
    };
}
