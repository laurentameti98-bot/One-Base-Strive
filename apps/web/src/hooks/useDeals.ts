import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dealsApi } from '@/lib/api/dealsApi';
import type { CreateDealRequest, UpdateDealRequest } from '@one-base/shared';

export function useDeals() {
  return useQuery({
    queryKey: ['deals'],
    queryFn: () => dealsApi.list(),
  });
}

export function useDeal(id: string | undefined) {
  return useQuery({
    queryKey: ['deals', id],
    queryFn: () => dealsApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateDeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDealRequest) => dealsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
    },
  });
}

export function useUpdateDeal(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateDealRequest) => dealsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['deals', id] });
    },
  });
}

export function useDeleteDeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => dealsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
    },
  });
}

export function useDealStages() {
  return useQuery({
    queryKey: ['deal-stages'],
    queryFn: () => dealsApi.listStages(),
  });
}
