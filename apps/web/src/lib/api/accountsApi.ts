import { apiClient } from '../apiClient';
import type {
  AccountsResponse,
  AccountResponse,
  CreateAccountRequest,
  UpdateAccountRequest,
} from '@one-base/shared';

export const accountsApi = {
  list: () => apiClient.get<AccountsResponse>('/api/v1/accounts'),
  
  getById: (id: string) => apiClient.get<AccountResponse>(`/api/v1/accounts/${id}`),
  
  create: (data: CreateAccountRequest) =>
    apiClient.post<AccountResponse>('/api/v1/accounts', data),
  
  update: (id: string, data: UpdateAccountRequest) =>
    apiClient.patch<AccountResponse>(`/api/v1/accounts/${id}`, data),
  
  delete: (id: string) =>
    apiClient.delete<{ data: { ok: boolean } }>(`/api/v1/accounts/${id}`),
};
