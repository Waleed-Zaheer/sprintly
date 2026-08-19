import { create } from "zustand";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "member";
  companyId: string | null;
};

type AuthState = {
  user: AuthUser | null;
  status: "loading" | "authenticated" | "unauthenticated";
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
};

/**
 * Global, client-side auth state — separate from (and never a substitute
 * for) server-side auth: every protected page/API route still calls
 * requireUser() fresh against the DB. This store exists purely so
 * client components that render before/outside a protected layout (the
 * marketing Navbar, most notably) can know "is someone logged in" without
 * prop-drilling or an extra fetch in every component that needs it.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: "loading",
  setUser: (user) => set({ user, status: user ? "authenticated" : "unauthenticated" }),
  logout: () => set({ user: null, status: "unauthenticated" }),
}));
