import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login as loginApi } from "../../services/auth.service";
import useAuth from "../../hooks/useAuth";
import BrandLogo from "../../components/common/BrandLogo";

function MailIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>;
}
function LockIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>;
}
function EyeIcon({ closed }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" />{closed && <path d="m4 4 16 16" />}</svg>;
}
function LensMark() {
  return <div className="relative mx-auto mb-8 h-40 w-40 sm:h-48 sm:w-48" aria-hidden="true">
    <div className="absolute inset-0 rounded-full border border-cyan-200/20" />
    <div className="absolute inset-4 rounded-full border border-cyan-200/30" />
    <div className="absolute inset-8 rounded-full border border-violet-200/40 bg-gradient-to-br from-cyan-300/20 via-sky-400/5 to-violet-400/20 shadow-[0_0_60px_rgba(34,211,238,.12)]" />
    <div className="absolute inset-[3.25rem] rounded-full border border-cyan-100/60 bg-gradient-to-br from-white/20 to-cyan-200/5 shadow-[inset_0_0_28px_rgba(255,255,255,.12)]" />
    <div className="absolute left-1/2 top-1/2 h-px w-[130%] -translate-x-1/2 -translate-y-1/2 rotate-[-32deg] bg-gradient-to-r from-transparent via-cyan-200/80 to-transparent" />
    <div className="absolute left-1/2 top-1/2 h-[130%] w-px -translate-x-1/2 -translate-y-1/2 rotate-[-32deg] bg-gradient-to-b from-transparent via-cyan-200/50 to-transparent" />
    <div className="absolute right-5 top-7 h-2 w-2 rounded-full bg-cyan-200 shadow-[0_0_18px_rgba(103,232,249,.9)]" />
    <div className="absolute bottom-8 left-5 h-1.5 w-1.5 rounded-full bg-violet-200 shadow-[0_0_14px_rgba(196,181,253,.9)]" />
  </div>;
}

export default function Login() {
  const [identifier, setIdentifier] = useState(() => localStorage.getItem("rememberedLogin") || "");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(Boolean(localStorage.getItem("rememberedLogin")));
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const auth = useAuth();

  async function submit(event) {
    event.preventDefault();
    try {
      setLoading(true);
      setError("");
      const response = await loginApi({ identifier, password });
      if (remember) localStorage.setItem("rememberedLogin", identifier);
      else localStorage.removeItem("rememberedLogin");
      auth.login(response.data.token, response.data.user);
      navigate("/");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="of-login min-h-[100dvh] bg-[#07111f] text-white lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(440px,0.82fr)]">
      <style>{`
        .of-login input:-webkit-autofill,
        .of-login input:-webkit-autofill:hover,
        .of-login input:-webkit-autofill:focus {
          -webkit-text-fill-color: #f8fafc;
          caret-color: #f8fafc;
          -webkit-box-shadow: 0 0 0 1000px #0b1b2d inset;
          transition: background-color 99999s ease-out 0s;
        }
      `}</style>

      <section className="relative hidden min-h-[100dvh] flex-col justify-between overflow-hidden border-r border-white/10 bg-[#081827] px-12 py-10 lg:flex xl:px-16" aria-label="OptiFlow optical ERP">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_18%_18%,rgba(34,211,238,.16),transparent_34%),radial-gradient(ellipse_at_80%_78%,rgba(124,58,237,.16),transparent_38%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.12]" style={{ backgroundImage: "linear-gradient(rgba(148,163,184,.28) 1px,transparent 1px),linear-gradient(90deg,rgba(148,163,184,.28) 1px,transparent 1px)", backgroundSize: "56px 56px" }} />
        <div className="relative z-10"><BrandLogo dark className="h-12 w-48" /></div>

        <div className="relative z-10 mx-auto w-full max-w-2xl py-12 text-center">
          <LensMark />
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200">Optical Shop ERP</p>
          <h2 className="mx-auto max-w-xl text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">A clearer view of your business.</h2>
          <p className="mx-auto mt-5 max-w-lg text-base leading-7 text-slate-300">Manage customers, prescriptions, inventory, billing and reports from one connected workspace.</p>
          <div className="mt-9 flex flex-wrap justify-center gap-2">
            {["Customer management", "Prescription tracking", "Real-time inventory"].map((item) => <span key={item} className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-slate-300">{item}</span>)}
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between gap-4 text-xs text-slate-500">
          <span>Designed for modern optical businesses</span>
          <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />Secure workspace</span>
        </div>
      </section>

      <section className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_50%_0%,rgba(14,116,144,.22),transparent_42%),#07111f] px-5 py-8 sm:px-8 lg:px-10">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-cyan-100/10" />
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full border border-cyan-100/10" />
        <div className="relative w-full max-w-[440px]">
          <div className="mb-8 text-center lg:hidden">
            <BrandLogo dark className="mx-auto h-14 w-52" />
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">Optical Shop ERP</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#0b1929]/95 p-6 shadow-[0_24px_80px_rgba(0,0,0,.35)] sm:p-9">
            <div className="mb-8">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Welcome back</p>
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-[2.15rem]">Sign in to OptiFlow</h1>
              <p className="mt-2 text-sm leading-6 text-slate-400">Enter your shop account details to continue.</p>
            </div>

            {error && <div role="alert" className="mb-5 rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm leading-5 text-red-200">{error}</div>}

            <form onSubmit={submit} className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-200">Email or User ID</span>
                <span className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#071321] px-3.5 text-slate-400 transition focus-within:border-cyan-300/70 focus-within:ring-4 focus-within:ring-cyan-300/10">
                  <MailIcon />
                  <input required autoComplete="username" className="min-w-0 flex-1 bg-transparent py-3.5 text-sm text-white outline-none placeholder:text-slate-500" placeholder="you@yourshop.com" value={identifier} onChange={(event) => setIdentifier(event.target.value)} />
                </span>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-200">Password</span>
                <span className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#071321] px-3.5 text-slate-400 transition focus-within:border-cyan-300/70 focus-within:ring-4 focus-within:ring-cyan-300/10">
                  <LockIcon />
                  <input required type={showPassword ? "text" : "password"} autoComplete="current-password" className="min-w-0 flex-1 bg-transparent py-3.5 text-sm text-white outline-none placeholder:text-slate-500" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} />
                  <button type="button" onClick={() => setShowPassword((value) => !value)} className="rounded-md p-1.5 text-slate-400 transition hover:bg-white/5 hover:text-cyan-200" aria-label={showPassword ? "Hide password" : "Show password"}><EyeIcon closed={!showPassword} /></button>
                </span>
              </label>

              <label className="flex w-fit cursor-pointer items-center gap-2.5 pt-0.5 text-sm text-slate-400">
                <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} className="h-4 w-4 rounded border-white/20 bg-[#071321] accent-cyan-400 focus:ring-cyan-300" />
                Remember my User ID
              </label>

              <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-300 px-5 py-3.5 text-sm font-bold text-[#06111f] shadow-lg shadow-cyan-950/30 transition hover:brightness-105 focus:outline-none focus:ring-4 focus:ring-cyan-300/20 disabled:cursor-wait disabled:opacity-70">
                {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-800/70 border-t-transparent" />}
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <div className="mt-7 flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] px-3.5 py-3">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true"><path d="M12 3 19 6v5c0 4.5-3 7.5-7 10-4-2.5-7-5.5-7-10V6l7-3Z" /><path d="m9 12 2 2 4-4" /></svg>
              <p className="text-xs leading-5 text-slate-400">Your shop data is securely isolated and protected.</p>
            </div>
          </div>
          <p className="mt-6 text-center text-xs text-slate-600">Powered by OptiFlow Optical Shop ERP</p>
        </div>
      </section>
    </main>
  );
}
