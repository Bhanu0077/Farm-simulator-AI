import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import api from "../services/api";
import LoadingSpinner from "./LoadingSpinner";


export default function ResetPasswordForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tokenError, setTokenError] = useState("");

  const token = searchParams.get("token") || "";

  useEffect(() => {
    if (!token) {
      setTokenError("Reset token is missing from the URL.");
    }
  }, [token]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!token) {
      toast.error("Reset token is missing");
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post("/auth/reset-password", {
        token,
        new_password: newPassword,
      });
      toast.success("Password reset successful");
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.error || "Unable to reset password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-stone-100" htmlFor="newPassword">
          New Password
        </label>
        <input
          id="newPassword"
          type="password"
          minLength={8}
          className="w-full rounded-2xl border border-white/15 bg-white/90 px-4 py-3 text-stone-900 outline-none transition focus:border-lime-300 focus:ring-4 focus:ring-lime-200/30"
          placeholder="Enter your new password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          required
        />
      </div>

      {tokenError ? (
        <div className="rounded-2xl border border-rose-200/30 bg-rose-300/10 px-4 py-3 text-sm text-rose-100">
          {tokenError}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting || !token}
        className="flex w-full items-center justify-center rounded-2xl bg-leaf-600 px-4 py-3 font-semibold text-white transition hover:bg-leaf-500 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? <LoadingSpinner size="sm" label="Updating..." /> : "Reset Password"}
      </button>
    </form>
  );
}
