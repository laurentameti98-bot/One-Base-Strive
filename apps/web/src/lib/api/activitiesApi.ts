import { apiClient } from '../apiClient';
import type {
  ActivitiesResponse,
  ActivityResponse,
  CreateActivityRequest,
  UpdateActivityRequest,
} from '@one-base/shared';

export const activitiesApi = {
  list: (dealId?: string, accountId?: string, contactId?: string) => {
    const params = new URLSearchParams();
    if (dealId) params.set('deal_id', dealId);
    if (accountId) params.set('account_id', accountId);
    if (contactId) params.set('contact_id', contactId);
    const query = params.toString();
    return apiClient.get<ActivitiesResponse>(`/api/v1/activities${query ? `?${query}` : ''}`);
  },
  
  getById: (id: string) => apiClient.get<ActivityResponse>(`/api/v1/activities/${id}`),
  
  create: (data: CreateActivityRequest) =>
    apiClient.post<ActivityResponse>('/api/v1/activities', data),
  
  update: (id: string, data: UpdateActivityRequest) =>
    apiClient.patch<ActivityResponse>(`/api/v1/activities/${id}`, data),
  
  delete: (id: string) =>
    apiClient.delete<{ data: { ok: boolean } }>(`/api/v1/activities/${id}`),
};
