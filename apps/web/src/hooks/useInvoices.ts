import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { invoicesApi } from "../lib/api/invoicesApi";
import type {
  CreateInvoiceSchema,
  UpdateInvoiceSchema,
} from "@one-base/shared";
import { z } from "zod";

export function useInvoices(params?: {
  search?: string;
  status?: string;
  customerId?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ["invoices", params],
    queryFn: () => invoicesApi.list(params),
  });
}

export function useInvoice(id: string | undefined) {
  return useQuery({
    queryKey: ["invoice", id],
    queryFn: () => invoicesApi.get(id!),
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: z.infer<typeof CreateInvoiceSchema>) =>
      invoicesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: z.infer<typeof UpdateInvoiceSchema>;
    }) => invoicesApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice", variables.id] });
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => invoicesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}
