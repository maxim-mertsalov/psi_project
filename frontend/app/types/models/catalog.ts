

interface Category {
    id: number;
    name: string;
}


interface Product {
    id: number;
    name: string;
    description: string;
    basePrice: number;
    available: number;
    category: Category;
}


interface StockItem {
    id: number;
    product: Product;
    quantityOnHand: number;
    quantityReserved: number;
}