import AuthShell from "../components/AuthShell";
import RegisterForm from "../components/RegisterForm";


export default function RegisterPage() {
  return (
    <AuthShell
      title="Create Account"
      subtitle="Sign up first, then verify the OTP from your email to unlock the simulator."
      footerText="Already registered?"
      footerLinkText="Login"
      footerLinkTo="/login"
    >
      <RegisterForm />
    </AuthShell>
  );
}
