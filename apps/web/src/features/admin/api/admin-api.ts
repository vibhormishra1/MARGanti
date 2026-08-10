import { httpClient } from "@/lib/http-client";

export interface SystemConfig {
  key: string;
  organization_id: string;
  value: Record<string, any>;
  updated_at: string;
  updated_by: string;
}

export interface UserResponse {
  id: string;
  email: string;
  organization_id: string;
  role: string;
  is_active: boolean;
}

export interface Organization {
  id: string;
  name: string;
  departments: Record<string, any>[];
}

export const adminApi = {
  getUsers: () => httpClient.get<UserResponse[]>("/api/admin/users"),
  
  updateUser: (userId: string, data: { role?: string; is_active?: boolean }) => 
    httpClient.patch<UserResponse>(`/api/admin/users/${userId}`, data),
    
  getConfig: (key: string, organizationId?: string) => {
    const query = organizationId ? `?organization_id=${organizationId}` : "";
    return httpClient.get<SystemConfig>(`/api/admin/config/${key}${query}`);
  },
  
  updateConfig: (key: string, value: Record<string, any>, organizationId?: string) => {
    const query = organizationId ? `?organization_id=${organizationId}` : "";
    return httpClient.put<SystemConfig>(`/api/admin/config/${key}${query}`, { value });
  },
  
  getOrganization: () => httpClient.get<Organization>("/api/admin/organization"),
  
  updateOrganization: (data: { name?: string; departments?: Record<string, any>[] }) => 
    httpClient.patch<Organization>("/api/admin/organization", data),
};
