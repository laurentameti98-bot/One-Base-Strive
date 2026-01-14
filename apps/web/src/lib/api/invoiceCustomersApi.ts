import { apiClient } from "../apiClient";
import type {
  InvoiceCustomer,
  CreateInvoiceCustomerSchema,
  UpdateInvoiceCustomerSchema,
  InvoiceCustomerResponse,
  InvoiceCustomersResponse,
} from "@one-base/shared";
import { z } from "zod";

export const invoiceCustomersApi = {
  list: async (params?: {
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<z.infer<typeof InvoiceCustomersResponse>> => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set("search", params.search);
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.offset) searchParams.set("offset", String(params.offset));

    const query = searchParams.toString();
    return apiClient.get(
      `/api/v1/invoice-customers${query ? `?${query}` : ""}`
    );
  },

  get: async (id: string): Promise<z.infer<typeof InvoiceCustomerResponse>> => {
    return apiClient.get(`/api/v1/invoice-customers/${id}`);
  },

  create: async (
    data: z.infer<typeof CreateInvoiceCustomerSchema>
  ): Promise<z.infer<typeof InvoiceCustomerResponse>> => {
    return apiClient.post("/api/v1/invoice-customers", data);
  },

  update: async (
    id: string,
    data: z.infer<typeof UpdateInvoiceCustomerSchema>
  ): Promise<z.infer<typeof InvoiceCustomerResponse>> => {
    return apiClient.patch(`/api/v1/invoice-customers/${id}`, data);
  },

  delete: async (id: string): Promise<{ data: { ok: boolean } }> => {
    return apiClient.delete(`/api/v1/invoice-customers/${id}`);
  },
};
