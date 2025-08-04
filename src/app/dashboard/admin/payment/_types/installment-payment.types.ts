export type InstallmentPaymentResponse = any;

export type InstallmentPaymentCreate = any;

export type InstallmentPaymentUpdate = any;

export type CreatePaymentInstallmentConfig = any;

export type UpdatePaymentInstallmentConfig = any;

export type PaymentInstallmentConfigResponse = Omit<any, "payment"> & {
  payment: PaymentResponse;
};
