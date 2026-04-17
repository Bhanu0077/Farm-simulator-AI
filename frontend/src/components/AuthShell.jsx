import { Leaf, Sprout, Tractor } from "lucide-react";
import { Link } from "react-router-dom";


export default function AuthShell({
  title,
  subtitle,
  footerText,
  footerLinkText,
  footerLinkTo,
  children,
}) {
  return (
    <div className="auth-background relative min-h-screen overflow-hidden bg-field">
      <div className="field-lines absolute inset-x-0 bottom-0 h-1/3 opacity-25" />

      <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-4 py-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <div className="hidden space-y-8 text-white lg:block">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm backdrop-blur-md">
            <Leaf className="h-4 w-4 text-lime-200" />
            Smart Farm Simulator
          </div>

          <div className="max-w-xl space-y-5">
            <h1 className="text-5xl font-bold leading-tight">
              Grow better decisions with a farm simulator built for real field conditions.
            </h1>
            <p className="text-lg text-white/80">
              Monitor rainfall, temperature, humidity, and soil profile to compare Rice, Wheat, and Corn outcomes before you plant.
            </p>
          </div>

          <div className="grid max-w-2xl gap-4 sm:grid-cols-3">
            <div className="glass-panel animate-rise rounded-3xl p-5">
              <Sprout className="mb-3 h-8 w-8 text-lime-200" />
              <p className="text-sm text-white/70">Crop-wise yield signals with explainable recommendations.</p>
            </div>
            <div className="glass-panel animate-rise rounded-3xl p-5 [animation-delay:120ms]">
              <Leaf className="mb-3 h-8 w-8 text-emerald-200" />
              <p className="text-sm text-white/70">Protected simulator access with JWT-based authentication.</p>
            </div>
            <div className="glass-panel animate-rise rounded-3xl p-5 [animation-delay:240ms]">
              <Tractor className="mb-3 h-8 w-8 text-amber-200" />
              <p className="text-sm text-white/70">Fast local testing against the Flask backend on localhost.</p>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-md">
          <div className="glass-panel rounded-[2rem] p-6 text-stone-50 shadow-glow sm:p-8">
            <div className="mb-8 space-y-2">
              <p className="text-sm uppercase tracking-[0.3em] text-lime-200/80">Farm Access</p>
              <h2 className="text-3xl font-semibold">{title}</h2>
              <p className="text-sm text-stone-200/75">{subtitle}</p>
            </div>

            {children}

            <div className="mt-6 border-t border-white/10 pt-5 text-sm text-stone-200/80">
              {footerText}{" "}
              <Link className="font-medium text-lime-200 transition hover:text-lime-100" to={footerLinkTo}>
                {footerLinkText}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
