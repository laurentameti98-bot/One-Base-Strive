import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { activitiesApi } from '@/lib/api/activitiesApi';
import type { CreateActivityRequest, UpdateActivityRequest } from '@one-base/shared';

export function useActivities(dealId?: string, accountId?: string, contactId?: string) {
  return useQuery({
    queryKey: ['activities', { dealId, accountId, contactId }],
    queryFn: () => activitiesApi.list(dealId, accountId, contactId),
  });
}

export function useActivity(id: string | undefined) {
  return useQuery({
    queryKey: ['activities', id],
    queryFn: () => activitiesApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateActivityRequest) => activitiesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
}

export function useUpdateActivity(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateActivityRequest) => activitiesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['activities', id] });
    },
  });
}

export function useDeleteActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => activitiesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
}
