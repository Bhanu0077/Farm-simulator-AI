export function getPasswordStrength(password) {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (!password) {
    return { label: "No password", color: "bg-stone-400", width: "w-0" };
  }
  if (score <= 2) {
    return { label: "Weak", color: "bg-rose-500", width: "w-1/4" };
  }
  if (score <= 4) {
    return { label: "Medium", color: "bg-amber-500", width: "w-2/4" };
  }
  if (score === 5) {
    return { label: "Strong", color: "bg-lime-500", width: "w-3/4" };
  }

  return { label: "Very strong", color: "bg-emerald-500", width: "w-full" };
}
