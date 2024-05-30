export declare class UserDto {
    readonly first_name: string;
    readonly last_name: string;
    readonly email: string;
    readonly phone: string;
    readonly organization: string;
    readonly user_role: string;
    readonly login_attempts: number;
    readonly salt: string;
    readonly hash: string;
    readonly password_created: string;
    readonly account_pending: boolean;
    readonly account_denied: boolean;
    readonly account_locked: boolean;
    readonly account_revoked: boolean;
    readonly status_change_reason: string;
    readonly denial_reason: string;
    readonly denial_details: string;
    readonly forceLogOut: boolean;
}
