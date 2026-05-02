

export interface AdminProductRes {
    id: number;
    name: string;
    description: string;
    price: number;
    available: boolean;
    category: string;
    stockQuantity: number;
}

export interface AdminProductUpsertReq {
    name: string;
    description: string;
    price: number;
    available: boolean;
    categoryId?: number;
    stockQuantity: number;
}

export interface ProductDetailRes {
    id: number;
    name: string;
    description: string;
    price: number;
    available: boolean;
    stockAvailable: number;
    similarProducts: ProductSummaryRes[];
}

export interface ProductSummaryRes {
    id: number;
    name: string;
    price: number;
    available: boolean;
    stockAvailable: number;
}


export interface GetProductsQuery {
    q?: string;
    available?: string;
    minPrice?: number;
    maxPrice?: number;
}