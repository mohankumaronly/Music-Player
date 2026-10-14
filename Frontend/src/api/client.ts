import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { API_BASE_URL, STORAGE_KEYS } from "../lib/constants";
import type { ApiResponse } from "./types";

/* ============================================================
   Token access (kept outside store to avoid circular imports)
   ============================================================ */
interface PersistedAuth {
  state?: {
    accessToken?: string | null;
    email?: string | null;
    role?: string | null;
  };
}

function readPersistedToken(): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedAuth;
    return parsed?.state?.accessToken ?? null;
  } catch {
    return null;
  }
}

/* ============================================================
   Axios instance
   ============================================================ */
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // backend sets JWT cookie too
  timeout: 30_000,
  headers: { Accept: "application/json" },
});

/* ----- Request interceptor: attach bearer for admin routes ----- */
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = readPersistedToken();
  const url = config.url ?? "";
  const isAdminRoute =
    url.startsWith("/api/v1/admin") || url.startsWith("/api/v1/auth/admin/logout");

  if (token && isAdminRoute) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }

  // Let browser set multipart boundary
  if (config.data instanceof FormData) {
    config.headers.delete?.("Content-Type");
  }

  return config;
});

/* ----- Response interceptor: unwrap + handle 401 ----- */
export interface ApiError {
  status: number;
  message: string;
  raw?: unknown;
}

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<ApiResponse<unknown>>) => {
    const status = error.response?.status ?? 0;
    const message =
      error.response?.data?.message ??
      error.message ??
      "Something went wrong. Please try again.";

    // Auto-logout on expired/invalid token for admin routes
    if (status === 401 && typeof window !== "undefined") {
      const url = error.config?.url ?? "";
      const onAdminRoute = window.location.pathname.startsWith("/admin");
      const isLoginCall = url.includes("/auth/admin/request-otp") ||
                          url.includes("/auth/admin/verify-otp");

      if (onAdminRoute && !isLoginCall) {
        localStorage.removeItem(STORAGE_KEYS.AUTH);
        if (!window.location.pathname.startsWith("/admin/login")) {
          window.location.replace("/admin/login?expired=1");
        }
      }
    }

    const apiError: ApiError = { status, message, raw: error.response?.data };
    return Promise.reject(apiError);
  }
);

/* ============================================================
   Helpers
   ============================================================ */
export async function unwrap<T>(
  promise: Promise<{ data: ApiResponse<T> }>
): Promise<T> {
  const res = await promise;
  if (!res.data.success) {
    throw {
      status: 200,
      message: res.data.message ?? "Request failed",
      raw: res.data,
    } satisfies ApiError;
  }
  return res.data.data;
}