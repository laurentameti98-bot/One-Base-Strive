import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountsApi } from '@/lib/api/accountsApi';
import type { CreateAccountRequest, UpdateAccountRequest } from '@one-base/shared';

export function useAccounts() {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountsApi.list(),
  });
}

export function useAccount(id: string | undefined) {
  return useQuery({
    queryKey: ['accounts', id],
    queryFn: () => accountsApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAccountRequest) => accountsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

export function useUpdateAccount(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateAccountRequest) => accountsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['accounts', id] });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => accountsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}
