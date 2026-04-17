import AuthShell from "../components/AuthShell";
import LoginForm from "../components/LoginForm";


export default function LoginPage() {
  return (
    <AuthShell
      title="Login"
      subtitle="Access your farm dashboard and continue your latest simulation."
      footerText="Need an account?"
      footerLinkText="Create one"
      footerLinkTo="/register"
    >
      <LoginForm />
    </AuthShell>
  );
}
