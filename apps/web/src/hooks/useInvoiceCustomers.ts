import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { invoiceCustomersApi } from "../lib/api/invoiceCustomersApi";
import type {
  CreateInvoiceCustomerSchema,
  UpdateInvoiceCustomerSchema,
} from "@one-base/shared";
import { z } from "zod";

export function useInvoiceCustomers(params?: {
  search?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ["invoiceCustomers", params],
    queryFn: () => invoiceCustomersApi.list(params),
  });
}

export function useInvoiceCustomer(id: string | undefined) {
  return useQuery({
    queryKey: ["invoiceCustomer", id],
    queryFn: () => invoiceCustomersApi.get(id!),
    enabled: !!id,
  });
}

export function useCreateInvoiceCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: z.infer<typeof CreateInvoiceCustomerSchema>) =>
      invoiceCustomersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoiceCustomers"] });
    },
  });
}

export function useUpdateInvoiceCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: z.infer<typeof UpdateInvoiceCustomerSchema>;
    }) => invoiceCustomersApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["invoiceCustomers"] });
      queryClient.invalidateQueries({
        queryKey: ["invoiceCustomer", variables.id],
      });
    },
  });
}

export function useDeleteInvoiceCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => invoiceCustomersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoiceCustomers"] });
    },
  });
}
