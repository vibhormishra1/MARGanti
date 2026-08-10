import { httpClient } from "@/lib/http-client";

export interface UserContext {
  user_id: string;
  organization_id: string;
  role: string;
}

export const getMe = async (): Promise<UserContext> => {
  const { data } = await httpClient.get<UserContext>("/api/v1/auth/me");
  return data;
};
