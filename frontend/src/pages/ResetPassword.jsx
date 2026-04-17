import AuthShell from "../components/AuthShell";
import ResetPasswordForm from "../components/ResetPasswordForm";


export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Reset Password"
      subtitle="Set a new password using the secure token from your reset link."
      footerText="Need to start over?"
      footerLinkText="Back to forgot password"
      footerLinkTo="/forgot-password"
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}
