import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useRequestOtp, useVerifyOtp } from "../../hooks/useAuth";
import { useCountdown } from "../../hooks/useCountdown";
import { OtpInput } from "../../components/admin/OtpInput";
import { Button } from "../../components/ui/Button";
import { APP_NAME } from "../../lib/constants";
import { cn } from "../../lib/cn";

type Step = "email" | "otp";

const RESEND_COOLDOWN = 60;

export function AdminLoginPage() {
  const [searchParams] = useSearchParams();
  const expired = searchParams.get("expired") === "1";

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [cooldown, restartCooldown] = useCountdown(0);

  const requestOtp = useRequestOtp();
  const verifyOtp = useVerifyOtp();

  // Toast when redirected here because the session expired
  useEffect(() => {
    if (expired) {
      toast.info("Session expired", {
        description: "Please sign in again.",
      });
    }
  }, [expired]);

  const emailValid = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()),
    [email]
  );

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailValid || requestOtp.isPending) return;

    try {
      const res = await requestOtp.mutateAsync({ email: email.trim() });
      setChallengeId(res.challengeId);
      setStep("otp");
      setOtp("");
      restartCooldown(RESEND_COOLDOWN);
      toast.success("OTP sent", {
        description: `Check your inbox at ${email}`,
      });
    } catch {
      // Error toast handled inside the hook
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || requestOtp.isPending) return;
    try {
      const res = await requestOtp.mutateAsync({ email: email.trim() });
      setChallengeId(res.challengeId);
      setOtp("");
      restartCooldown(RESEND_COOLDOWN);
      toast.success("New code sent");
    } catch {
      /* toast in hook */
    }
  };

  const handleVerify = async (code?: string) => {
    const value = code ?? otp;
    if (!challengeId || value.length !== 6 || verifyOtp.isPending) return;
    verifyOtp.mutate({
      challengeId,
      email: email.trim(),
      otp: value,
    });
  };

  const backToEmail = () => {
    setStep("email");
    setChallengeId(null);
    setOtp("");
  };

  return (
    <div className="relative min-h-screen grid place-items-center px-4 py-10">
      {/* Small ambient glow for a polished feel */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(700px circle at 20% 20%, rgba(99,102,241,0.18), transparent 60%)," +
            "radial-gradient(600px circle at 80% 80%, rgba(217,70,239,0.16), transparent 60%)",
        }}
        aria-hidden
      />

      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="grid h-12 w-12 place-items-center rounded-2xl btn-gradient shadow-lg shadow-brand-600/30">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">
            Admin sign-in
          </h1>
          <p className="mt-1 text-sm text-[rgb(var(--text-secondary))]">
            {step === "email"
              ? "We'll email you a one-time code."
              : `Enter the code we sent to ${email}`}
          </p>
        </div>

        {/* Card */}
        <div className="glass-strong rounded-2xl p-6 sm:p-8 shadow-2xl">
          {/* Step indicator */}
          <div className="mb-6 flex items-center gap-2 text-[11px] uppercase tracking-wider text-[rgb(var(--text-tertiary))]">
            <StepDot active={step === "email"} done={step === "otp"} label="1" />
            <span className="text-[rgb(var(--text-tertiary))]">Email</span>
            <div className="mx-1 h-px flex-1 bg-[rgb(var(--border-strong))]/60" />
            <StepDot active={step === "otp"} done={false} label="2" />
            <span className="text-[rgb(var(--text-tertiary))]">Verify</span>
          </div>

          {/* Step 1 — Email */}
          {step === "email" && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-[rgb(var(--text-secondary))]">
                  Admin email
                </span>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--text-tertiary))]" />
                  <input
                    type="email"
                    autoFocus
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    disabled={requestOtp.isPending}
                    className="h-11 w-full rounded-xl surface pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/50 disabled:opacity-60"
                  />
                </div>
              </label>

              <Button
                type="submit"
                variant="gradient"
                size="lg"
                className="w-full"
                disabled={!emailValid}
                isLoading={requestOtp.isPending}
              >
                Send code
              </Button>

              <p className="text-center text-xs text-[rgb(var(--text-tertiary))]">
                Only the configured admin email will receive a code.
              </p>
            </form>
          )}

          {/* Step 2 — OTP */}
          {step === "otp" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleVerify();
              }}
              className="space-y-5"
            >
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-medium text-[rgb(var(--text-secondary))]">
                    Enter 6-digit code
                  </span>
                  <button
                    type="button"
                    onClick={backToEmail}
                    className="inline-flex items-center gap-1 text-xs text-[rgb(var(--text-tertiary))] hover:text-[rgb(var(--text-primary))] transition-colors"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    Change email
                  </button>
                </div>

                <div className="flex justify-center">
                  <OtpInput
                    value={otp}
                    onChange={setOtp}
                    onComplete={(v) => handleVerify(v)}
                    disabled={verifyOtp.isPending}
                    autoFocus
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="gradient"
                size="lg"
                className="w-full"
                disabled={otp.length !== 6}
                isLoading={verifyOtp.isPending}
              >
                Verify &amp; sign in
              </Button>

              {/* Resend */}
              <div className="flex items-center justify-center gap-1.5 text-xs text-[rgb(var(--text-tertiary))]">
                <span>Didn&apos;t receive it?</span>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={cooldown > 0 || requestOtp.isPending}
                  className={cn(
                    "font-medium transition-colors",
                    cooldown > 0 || requestOtp.isPending
                      ? "text-[rgb(var(--text-tertiary))] cursor-not-allowed"
                      : "text-brand-500 hover:text-brand-400"
                  )}
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-center gap-3 text-xs text-[rgb(var(--text-tertiary))]">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Passwordless admin access for {APP_NAME}</span>
        </div>

        <div className="mt-2 text-center text-xs">
          <Link
            to="/"
            className="text-[rgb(var(--text-tertiary))] hover:text-[rgb(var(--text-primary))] transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

function StepDot({
  active,
  done,
  label,
}: {
  active: boolean;
  done: boolean;
  label: string;
}) {
  return (
    <span
      className={cn(
        "grid h-5 w-5 place-items-center rounded-full text-[10px] font-semibold transition-colors",
        done
          ? "bg-brand-500 text-white"
          : active
          ? "bg-brand-500 text-white"
          : "bg-[rgb(var(--bg-muted))] text-[rgb(var(--text-tertiary))]"
      )}
    >
      {label}
    </span>
  );
}