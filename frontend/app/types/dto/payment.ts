

export interface InitiatePaymentRes {
    paymentId: number;
    externalReference: string;
    redirectUrl: string;
    status: string;
}

export interface PaymentCallbackReq {
    externalReference: string;
    result: string;
}

export interface PaymentCallbackRes {
    status: string;
    message: string;
}

