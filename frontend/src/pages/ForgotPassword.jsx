import AuthShell from "../components/AuthShell";
import ForgotPasswordForm from "../components/ForgotPasswordForm";


export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Forgot Password"
      subtitle="Enter your email and we will generate a secure reset link for local testing."
      footerText="Remembered your password?"
      footerLinkText="Back to login"
      footerLinkTo="/login"
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
