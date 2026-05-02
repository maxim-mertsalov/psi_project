

export interface Address {
    street: string;
    city: string;
    zipCode: string;
    country: string;
}

export interface OrderItem {
    id: number;
    productId: number;
    productNameSnapshot: string;
    quantity: number;
    unitPrice: number;
}

export interface OrderEntity {
    id: number;
    orderNumber: string;
    sessionId: string;
    ownerEmail: string;
    shippingMethod: string;
    paymentMethod: string;
    shippingPrice: number;
    totalAmount: number;
    status: "WAITING_FOR_PAYMENT" | "PAID" | "PROCESSING" | "SHIPPED" | "CANCELLED";
    createdAt: string;
    address: Address;
    items: OrderItem[];
}

