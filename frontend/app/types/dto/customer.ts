
export interface AuthRes {
    accountId: number;
    name: string;
    email: string;
    role: "CUSTOMER" | "ADMIN" | "WAREHOUSE";
    token: string;
}

export interface LoginReq {
    email: string;
    password: string;
}

export interface RegisterAccountReq {
    name: string;
    email: string;
    password: string;
}