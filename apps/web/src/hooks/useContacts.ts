import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactsApi } from '@/lib/api/contactsApi';
import type { CreateContactRequest, UpdateContactRequest } from '@one-base/shared';

export function useContacts(accountId?: string) {
  return useQuery({
    queryKey: ['contacts', { accountId }],
    queryFn: () => contactsApi.list(accountId),
  });
}

export function useContact(id: string | undefined) {
  return useQuery({
    queryKey: ['contacts', id],
    queryFn: () => contactsApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateContactRequest) => contactsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}

export function useUpdateContact(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateContactRequest) => contactsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['contacts', id] });
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => contactsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}
