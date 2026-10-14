import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authApi } from "../api/auth.api";
import { useAuthStore } from "../store/authStore";
import type { ApiError } from "../api/client";
import type {
  RequestOtpPayload,
  VerifyOtpPayload,
} from "../api/types";

export function useRequestOtp() {
  return useMutation({
    mutationFn: (payload: RequestOtpPayload) => authApi.requestOtp(payload),
    onError: (err: ApiError) => {
      toast.error("Couldn't send OTP", {
        description: err.message,
      });
    },
  });
}

export function useVerifyOtp() {
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: VerifyOtpPayload) => authApi.verifyOtp(payload),
    onSuccess: (session, variables) => {
      setSession({
        accessToken: session.accessToken,
        email: variables.email,
        role: session.role,
      });

      // Clear any cached admin data from a previous session
      queryClient.removeQueries({ queryKey: ["admin"] });

      toast.success("Welcome back", {
        description: `Signed in as ${variables.email}`,
      });

      navigate("/admin", { replace: true });
    },
    onError: (err: ApiError) => {
      toast.error("Verification failed", {
        description:
          err.status === 401
            ? "Invalid or expired OTP. Please try again."
            : err.message,
      });
    },
  });
}

export function useLogout() {
  const clear = useAuthStore((s) => s.clear);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      // Always clear local state, even if the network call failed
      clear();
      queryClient.removeQueries({ queryKey: ["admin"] });
      navigate("/admin/login", { replace: true });
      toast.success("Signed out");
    },
  });
}