
export interface OrderProcessRes {
    orderId: number;
    status: "INITIATED" | "PROCESSING" | "COMPLETED" | "FAILED";
    message: string;
} 

export interface OrderSummaryRes {
    orderId: number;
    orderNumber: string;
    status: "WAITING_FOR_PAYMENT" | "PAID" | "PROCESSING" | "SHIPPED" | "CANCELLED";
    totalAmount: number;
    createdAt: string;
    ownerEmail: string;
    guestEmail: string;
} 