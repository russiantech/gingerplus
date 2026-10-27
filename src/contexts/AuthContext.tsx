import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { authService } from "@/services/auth";
import { setAuthLostHandler, tokenStore } from "@/services/http";
import type { AuthResponse, User } from "@/types";

interface Ctx {
  user: User | null; loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  completeVerification: (email: string, code: string) => Promise<User>;
  logout: () => Promise<void>;
  setUser: (u: User) => void;
  can: (permission: string) => boolean;
  isStaff: boolean; isPartner: boolean;
}
const AuthCtx = createContext<Ctx>(null!);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(!!tokenStore.get());

  const apply = (r: AuthResponse) => { tokenStore.set({ access: r.tokens.access_token, refresh: r.tokens.refresh_token }); setUser(r.user); return r.user; };

  useEffect(() => {
    setAuthLostHandler(() => setUser(null));
    if (!tokenStore.get()) return;
    authService.me().then(setUser).catch(() => tokenStore.set(null)).finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (e: string, p: string) => apply(await authService.login(e, p)), []);
  const completeVerification = useCallback(async (e: string, c: string) => apply(await authService.verify(e, c)), []);
  const logout = useCallback(async () => {
    const t = tokenStore.get();
    if (t) authService.logout(t.refresh).catch(() => undefined);
    tokenStore.set(null); setUser(null);
  }, []);

  const value = useMemo<Ctx>(() => ({
    user, loading, login, completeVerification, logout, setUser,
    can: (perm) => !!user && (user.role_key === "super_admin" || user.permissions.includes(perm)),
    isStaff: user?.user_type === "staff", isPartner: user?.user_type === "partner",
  }), [user, loading, login, completeVerification, logout]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
