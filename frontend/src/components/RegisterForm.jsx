import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import LoadingSpinner from "./LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import { getPasswordStrength } from "../utils/passwordStrength";


export default function RegisterForm() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
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
      const response = await register(formData);
      toast.success(response.message || "Account created successfully");
      navigate(`/verify-otp?email=${encodeURIComponent(formData.email)}`, { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.error || "Unable to create account");
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-stone-100" htmlFor="name">
          Full Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          className="w-full rounded-2xl border border-white/15 bg-white/90 px-4 py-3 text-stone-900 outline-none transition focus:border-lime-300 focus:ring-4 focus:ring-lime-200/30"
          placeholder="Bhanu"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-stone-100" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className="w-full rounded-2xl border border-white/15 bg-white/90 px-4 py-3 text-stone-900 outline-none transition focus:border-lime-300 focus:ring-4 focus:ring-lime-200/30"
          placeholder="bhanu@example.com"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-stone-100" htmlFor="password">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            minLength={8}
            className="w-full rounded-2xl border border-white/15 bg-white/90 px-4 py-3 pr-12 text-stone-900 outline-none transition focus:border-lime-300 focus:ring-4 focus:ring-lime-200/30"
            placeholder="At least 8 characters"
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

        <div className="space-y-2">
          <div className="h-2 overflow-hidden rounded-full bg-white/20">
            <div className={`h-full rounded-full transition-all ${passwordStrength.color} ${passwordStrength.width}`} />
          </div>
          <p className="text-sm text-stone-200">
            Password strength: <span className="font-medium">{passwordStrength.label}</span>
          </p>
          <p className="text-xs text-stone-300">
            Use 8+ characters with uppercase, lowercase, numbers, and symbols for a stronger password.
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center rounded-2xl bg-leaf-500 px-4 py-3 font-semibold text-white transition hover:bg-leaf-400 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? <LoadingSpinner size="sm" label="Creating account..." /> : "Create Account"}
      </button>
    </form>
  );
}
