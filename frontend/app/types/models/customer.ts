
export interface Account {
    id: number;
    name: string;
    email: string;
    passwordHash: string;
    role: "CUSTOMER" | "ADMIN" | "WAREHOUSE";
    createdAt: string;
}


export interface AccountSession {
    id: number;
    token: string;
    account: Account;
    createdAt: string;
} 