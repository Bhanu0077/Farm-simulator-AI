import { useState } from "react";
import { toast } from "sonner";

import api from "../services/api";
import LoadingSpinner from "./LoadingSpinner";


export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage("");

    try {
      const response = await api.post("/auth/forgot-password", { email });
      setSuccessMessage(response.data.message);
      toast.success("Reset request sent");
    } catch (error) {
      toast.error(error.response?.data?.error || "Unable to process request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-stone-100" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          className="w-full rounded-2xl border border-white/15 bg-white/90 px-4 py-3 text-stone-900 outline-none transition focus:border-lime-300 focus:ring-4 focus:ring-lime-200/30"
          placeholder="bhanu@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>

      {successMessage ? (
        <div className="rounded-2xl border border-lime-200/30 bg-lime-300/10 px-4 py-3 text-sm text-lime-100">
          {successMessage}. Check your email for the reset link.
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center rounded-2xl bg-soil-500 px-4 py-3 font-semibold text-white transition hover:bg-soil-400 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? <LoadingSpinner size="sm" label="Sending..." /> : "Send Reset Link"}
      </button>
    </form>
  );
}
