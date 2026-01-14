import { apiClient } from '../apiClient';
import type {
  DealsResponse,
  DealResponse,
  CreateDealRequest,
  UpdateDealRequest,
  DealStagesResponse,
} from '@one-base/shared';

export const dealsApi = {
  list: () => apiClient.get<DealsResponse>('/api/v1/deals'),
  
  getById: (id: string) => apiClient.get<DealResponse>(`/api/v1/deals/${id}`),
  
  create: (data: CreateDealRequest) =>
    apiClient.post<DealResponse>('/api/v1/deals', data),
  
  update: (id: string, data: UpdateDealRequest) =>
    apiClient.patch<DealResponse>(`/api/v1/deals/${id}`, data),
  
  delete: (id: string) =>
    apiClient.delete<void>(`/api/v1/deals/${id}`),
  
  listStages: () => apiClient.get<DealStagesResponse>('/api/v1/deal-stages'),
};
