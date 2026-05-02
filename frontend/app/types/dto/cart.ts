

export interface AddCartItemReq {
    productId: number;
    quantity: number;
}

export interface CartItemRes {
    itemId: number;
    productId: number;
    productName: string;
    quantity: number;
    unitPriceSnapshot: number;
    currentUnitPrice: number;
    priceChanged: boolean;
    lineTotal: number;
}

export interface CartRes {
    cartId: number;
    sessionId: string;
    items: CartItemRes[];
    subtotal: number;
}

export interface UpdateCartItemReq {
    quantity: number;
}