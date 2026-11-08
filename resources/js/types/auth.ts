export type UserRole = 'player' | 'admin';

export type User = {
    id: number;
    name: string;
    username: string;
    role: UserRole;
    playerCode: string;
    created_at: string;
    avatar?: string;
    two_factor_enabled?: boolean;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
};

export type Passkey = {
    id: number;
    name: string;
    authenticator: string | null;
    created_at_diff: string;
    last_used_at_diff: string | null;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
