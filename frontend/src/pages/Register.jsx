import AuthShell from "../components/AuthShell";
import RegisterForm from "../components/RegisterForm";


export default function RegisterPage() {
  return (
    <AuthShell
      title="Create Account"
      subtitle="Sign up to save your session and unlock the simulator."
      footerText="Already registered?"
      footerLinkText="Login"
      footerLinkTo="/login"
    >
      <RegisterForm />
    </AuthShell>
  );
}
