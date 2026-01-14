import { apiClient } from '../apiClient';
import type {
  ContactsResponse,
  ContactResponse,
  CreateContactRequest,
  UpdateContactRequest,
} from '@one-base/shared';

export const contactsApi = {
  list: (accountId?: string) => {
    const params = accountId ? `?account_id=${accountId}` : '';
    return apiClient.get<ContactsResponse>(`/api/v1/contacts${params}`);
  },
  
  getById: (id: string) => apiClient.get<ContactResponse>(`/api/v1/contacts/${id}`),
  
  create: (data: CreateContactRequest) =>
    apiClient.post<ContactResponse>('/api/v1/contacts', data),
  
  update: (id: string, data: UpdateContactRequest) =>
    apiClient.patch<ContactResponse>(`/api/v1/contacts/${id}`, data),
  
  delete: (id: string) =>
    apiClient.delete<void>(`/api/v1/contacts/${id}`),
};
