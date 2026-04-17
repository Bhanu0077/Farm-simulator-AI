import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import LoadingSpinner from "./LoadingSpinner";
import { useAuth } from "../context/AuthContext";


export default function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await login(formData);
      toast.success("Login successful");
      navigate(location.state?.from?.pathname || "/simulator", { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.error || "Unable to login");
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
          name="email"
          type="email"
          autoComplete="email"
          className="w-full rounded-2xl border border-white/15 bg-white/90 px-4 py-3 text-stone-900 outline-none transition focus:border-lime-300 focus:ring-4 focus:ring-lime-200/30"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-stone-100" htmlFor="password">
            Password
          </label>
          <Link className="text-sm text-lime-200 hover:text-lime-100" to="/forgot-password">
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            className="w-full rounded-2xl border border-white/15 bg-white/90 px-4 py-3 pr-12 text-stone-900 outline-none transition focus:border-lime-300 focus:ring-4 focus:ring-lime-200/30"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="absolute inset-y-0 right-0 flex items-center px-4 text-stone-600 transition hover:text-stone-900"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center rounded-2xl bg-stone-950 px-4 py-3 font-semibold text-white transition hover:bg-stone-900 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? <LoadingSpinner size="sm" label="Signing in..." /> : "Login"}
      </button>
    </form>
  );
}
