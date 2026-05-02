

export interface PaymentTransaction {
    id: number;
    amount: number;
    externalReference: string;
    status: "INITIATED" | "SUCCESSFUL" | "FAILED" | "CANCELLED";
    createdAt: string;
}