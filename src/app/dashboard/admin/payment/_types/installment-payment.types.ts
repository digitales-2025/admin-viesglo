import { components } from "@/lib/api/types/api";

export type InstallmentPaymentResponse = components["schemas"]["InstallmentPayment"];

export type InstallmentPaymentCreate = components["schemas"]["CreateInstallmentPaymentDto"];

export type InstallmentPaymentUpdate = components["schemas"]["UpdateInstallmentPaymentDto"];

export type CreatePaymentInstallmentConfig = components["schemas"]["CreatePaymentInstallmentConfigDto"];

export type UpdatePaymentInstallmentConfig = components["schemas"]["UpdatePaymentInstallmentConfigDto"];

export type PaymentInstallmentConfigResponse = Omit<
  components["schemas"]["PaymentInstallmentConfigResponseDto"],
  "payment"
> & {
  payment: PaymentResponse;
};
