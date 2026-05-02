

export interface AddressDto {
    street: string;
    city: string;
    zipCode: string;
    country: string;
}

export interface CheckoutReq {
    guestEmail: string;
    shippingMethod: string;
    shippingPrice: number;
    paymentMethod: string;
    address: AddressDto;
}

export interface CheckoutRes {
    orderId: number;
    orderNumber: string;
    status: "WAITING_FOR_PAYMENT" | "PAID" | "PROCESSING" | "SHIPPED" | "CANCELLED";
    totalAmount: number;
}