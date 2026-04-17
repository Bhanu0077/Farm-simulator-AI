import AuthShell from "../components/AuthShell";
import LoginForm from "../components/LoginForm";


export default function LoginPage() {
  return (
    <AuthShell
      title="Login"
      subtitle="Access your farm dashboard after verifying your email OTP."
      footerText="Need an account?"
      footerLinkText="Create one"
      footerLinkTo="/register"
    >
      <LoginForm />
    </AuthShell>
  );
}
