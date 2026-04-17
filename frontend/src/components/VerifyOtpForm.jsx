import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import LoadingSpinner from "./LoadingSpinner";
import { useAuth } from "../context/AuthContext";


export default function VerifyOtpForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { requestOtp, verifyOtp } = useAuth();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleVerify = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await verifyOtp({
        email,
        otp,
        purpose: "verify_email",
      });
      toast.success("Email verified successfully");
      navigate("/simulator", { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.error || "Unable to verify OTP");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error("Enter your email first");
      return;
    }

    setIsResending(true);
    try {
      const response = await requestOtp({
        email,
        purpose: "verify_email",
      });
      toast.success(response.message || "Verification OTP sent");
    } catch (error) {
      toast.error(error.response?.data?.error || "Unable to resend OTP");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleVerify}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-stone-100" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          className="w-full rounded-2xl border border-white/15 bg-white/90 px-4 py-3 text-stone-900 outline-none transition focus:border-lime-300 focus:ring-4 focus:ring-lime-200/30"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-stone-100" htmlFor="otp">
          Verification OTP
        </label>
        <input
          id="otp"
          type="text"
          inputMode="numeric"
          maxLength={6}
          className="w-full rounded-2xl border border-white/15 bg-white/90 px-4 py-3 text-stone-900 outline-none transition focus:border-lime-300 focus:ring-4 focus:ring-lime-200/30"
          placeholder="Enter the OTP from your email"
          value={otp}
          onChange={(event) => setOtp(event.target.value)}
          required
        />
      </div>

      <div className="rounded-2xl border border-lime-200/20 bg-lime-300/10 px-4 py-3 text-sm text-lime-100">
        Verify your email to activate your account and enter the simulator.
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center rounded-2xl bg-leaf-500 px-4 py-3 font-semibold text-white transition hover:bg-leaf-400 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? <LoadingSpinner size="sm" label="Verifying..." /> : "Verify OTP"}
      </button>

      <button
        type="button"
        onClick={handleResend}
        disabled={isResending}
        className="flex w-full items-center justify-center rounded-2xl border border-white/15 bg-white/10 px-4 py-3 font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isResending ? <LoadingSpinner size="sm" label="Resending..." /> : "Resend OTP"}
      </button>

      <p className="text-center text-sm text-stone-200/80">
        Already verified?{" "}
        <Link className="text-lime-200 hover:text-lime-100" to="/login">
          Go to login
        </Link>
      </p>
    </form>
  );
}
