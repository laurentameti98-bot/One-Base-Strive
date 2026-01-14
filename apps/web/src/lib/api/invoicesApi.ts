import { apiClient } from "../apiClient";
import type {
  Invoice,
  CreateInvoiceSchema,
  UpdateInvoiceSchema,
  InvoiceResponse,
  InvoicesResponse,
} from "@one-base/shared";
import { z } from "zod";

export const invoicesApi = {
  list: async (params?: {
    search?: string;
    status?: string;
    customerId?: string;
    limit?: number;
    offset?: number;
  }): Promise<z.infer<typeof InvoicesResponse>> => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set("search", params.search);
    if (params?.status) searchParams.set("status", params.status);
    if (params?.customerId) searchParams.set("customer_id", params.customerId);
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.offset) searchParams.set("offset", String(params.offset));

    const query = searchParams.toString();
    return apiClient.get(`/api/v1/invoices${query ? `?${query}` : ""}`);
  },

  get: async (id: string): Promise<z.infer<typeof InvoiceResponse>> => {
    return apiClient.get(`/api/v1/invoices/${id}`);
  },

  create: async (
    data: z.infer<typeof CreateInvoiceSchema>
  ): Promise<z.infer<typeof InvoiceResponse>> => {
    return apiClient.post("/api/v1/invoices", data);
  },

  update: async (
    id: string,
    data: z.infer<typeof UpdateInvoiceSchema>
  ): Promise<z.infer<typeof InvoiceResponse>> => {
    return apiClient.patch(`/api/v1/invoices/${id}`, data);
  },

  delete: async (id: string): Promise<{ data: { ok: boolean } }> => {
    return apiClient.delete(`/api/v1/invoices/${id}`);
  },
};
