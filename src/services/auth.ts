import type { AuthResponse, User } from "@/types";
import { api } from "./http";

export interface RegisterInput { email: string; password: string; first_name: string; last_name?: string; phone?: string; marketing_opt_in?: boolean }
export interface RegisterResult { email: string; expires_in: number; resend_in: number }

export const authService = {
  register: (d: RegisterInput) => api.post<RegisterResult>("/auth/register", d, { auth: false }),
  resend: (email: string) => api.post<RegisterResult>("/auth/resend-code", { email }, { auth: false }),
  verify: (email: string, code: string) => api.post<AuthResponse>("/auth/verify-email", { email, code }, { auth: false }),
  login: (email: string, password: string) => api.post<AuthResponse>("/auth/login", { email, password }, { auth: false }),
  logout: (refresh_token: string) => api.post<{ detail: string }>("/auth/logout", { refresh_token }, { auth: false }),
  forgot: (email: string) => api.post<{ detail: string }>("/auth/forgot-password", { email }, { auth: false }),
  reset: (email: string, code: string, new_password: string) => api.post<{ detail: string }>("/auth/reset-password", { email, code, new_password }, { auth: false }),
  changePassword: (current_password: string, new_password: string) => api.post<{ detail: string }>("/auth/change-password", { current_password, new_password }),
  me: () => api.get<User>("/me"),
};
