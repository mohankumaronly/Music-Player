import { api, unwrap } from "./client";
import type {
  AuthSession,
  RequestOtpPayload,
  RequestOtpResponse,
  VerifyOtpPayload,
} from "./types";

export const authApi = {
  requestOtp: (payload: RequestOtpPayload) =>
    unwrap<RequestOtpResponse>(
      api.post("/api/v1/auth/admin/request-otp", payload)
    ),

  verifyOtp: (payload: VerifyOtpPayload) =>
    unwrap<AuthSession>(api.post("/api/v1/auth/admin/verify-otp", payload)),

  logout: () => api.post("/api/v1/auth/admin/logout"),
};