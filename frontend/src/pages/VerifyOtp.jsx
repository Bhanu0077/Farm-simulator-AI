import AuthShell from "../components/AuthShell";
import VerifyOtpForm from "../components/VerifyOtpForm";


export default function VerifyOtpPage() {
  return (
    <AuthShell
      title="Verify Email"
      subtitle="Enter the OTP sent to your email to activate your account."
      footerText="Need a different account?"
      footerLinkText="Register again"
      footerLinkTo="/register"
    >
      <VerifyOtpForm />
    </AuthShell>
  );
}
