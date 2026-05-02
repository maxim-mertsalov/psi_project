import { Product } from "./catalog";


export interface CartItem {
    id: number;
    // cart: Cart;
    product: Product;

    quantity: number;
    unitPriceSnapshot: number;
}

export interface Cart {
    id: number;
    sessionId: string;
    createdAt: string;
    updatedAt: string;

    items: CartItem[];
}