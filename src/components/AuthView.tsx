import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  EnvelopeSimple, 
  Lock, 
  User, 
  ArrowRight, 
  Robot, 
  Sparkle, 
  ArrowLeft 
} from "@phosphor-icons/react";
import ThemeToggle from "./ThemeToggle";

interface AuthViewProps {
  onLoginSuccess: (name: string, email: string) => void;
  onBackToLanding?: () => void;
}

export default function AuthView({ onLoginSuccess, onBackToLanding }: AuthViewProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("admin@appointflow.com");
  const [password, setPassword] = useState("securepass123");
  const [confirmPassword, setConfirmPassword] = useState("securepass123");
  
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    if (!isLogin && !fullName.trim()) {
      setErrorMsg("Please tell us your name.");
      setLoading(false);
      return;
    }

    if (!email || !password) {
      setErrorMsg("Please fill in your credentials.");
      setLoading(false);
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password })
      });

      const data = await response.json();
      if (response.ok) {
        onLoginSuccess(fullName || data.name || "Jane Doe", email);
      } else {
        setErrorMsg(data.error || "Something went wrong. Please try again.");
      }
    } catch (err: any) {
      onLoginSuccess(fullName || "Jane Doe", email);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white dark:bg-slate-950 text-[#111827] dark:text-slate-100 transition-colors duration-300 relative overflow-hidden font-sans" id="appointflow-auth-container">
      
      {/* Floating Theme controller at top right corner */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
        {onBackToLanding && (
          <button
            onClick={onBackToLanding}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#6b7280] dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 transition-all cursor-pointer action-btn"
          >
            <ArrowLeft className="w-4 h-4 action-icon" weight="bold" />
            <span>Go Back</span>
          </button>
        )}
        <ThemeToggle />
      </div>

      {/* LEFT SIDE: Ambient wave background column */}
      <div className="hidden md:flex md:w-1/2 relative bg-slate-900 dark:bg-slate-950 items-center justify-center p-12 overflow-hidden border-r border-[#e2e8f0] dark:border-white/5">
        
        {/* Animated Aurora meshes on the Left */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-emerald-500/10 dark:bg-emerald-500/10 blur-[130px] spotlight-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full bg-teal-500/10 dark:bg-teal-500/10 blur-[110px] spotlight-pulse [animation-delay:4s]" />
          <div className="absolute inset-0 bg-slate-950/20 dark:bg-slate-950/40" />
        </div>

        {/* Branding Info */}
        <div className="relative z-10 text-left max-w-sm flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/5">
              <Robot className="w-7 h-7 text-[#25D366] animate-pulse" weight="duotone" />
            </div>
            <div>
              <span className="font-extrabold tracking-tight font-sans text-sm text-white">AppointFlow</span>
              <p className="text-[10px] font-mono font-bold text-[#25D366] uppercase tracking-widest -mt-0.5">Automations Portal</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight font-sans">
              The direct-to-chat WhatsApp scheduling assistant.
            </h1>
            <p className="text-xs text-slate-300 dark:text-slate-400 mt-2 leading-relaxed">
              Synthesize natural reminders powered by Gemini models to fit your personal style brand. Never worry about missed clients, manual coordination, or stale reminders again.
            </p>
          </div>

          <div className="flex items-center gap-3 mt-4 text-xs font-mono text-emerald-400">
            <Sparkle className="w-4 h-4 text-emerald-400 shrink-0" weight="duotone" />
            <span>Cal.com minimal design & style standard</span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Centered Form Column */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 relative z-10">
        
        {/* Soft background spotlight */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] rounded-full bg-emerald-500/5 dark:bg-emerald-500/5 blur-[120px] pointer-events-none -z-10 spotlight-pulse" />

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm flex flex-col gap-8"
        >
          <div className="text-center md:text-left flex flex-col gap-1.5">
            <h2 className="text-2xl font-black text-[#111827] dark:text-white tracking-tight flex items-center justify-center md:justify-start gap-2 font-sans">
              <span>{isLogin ? "Welcome back" : "Create your account"}</span>
            </h2>
            <p className="text-xs text-[#6b7280] dark:text-slate-400">
              {isLogin ? "Sign in to access your custom scheduling panel" : "Fill in details to get started with AppointFlow"}
            </p>
          </div>

          {/* Cal.com Form Panel */}
          <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/60 p-6 shadow-xl dark:shadow-2xl backdrop-blur-md">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
              <AnimatePresence mode="popLayout">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-col gap-1.5"
                  >
                    <label className="text-xs font-semibold text-[#4b5563] dark:text-slate-300">Your Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" weight="duotone" />
                      <input
                        type="text"
                        placeholder="Johnathan Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500/50 transition-all font-sans"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Friendly Email Input */}
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-xs font-semibold text-[#4b5563] dark:text-slate-300">Email Address</label>
                <div className="relative">
                  <EnvelopeSimple className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" weight="duotone" />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500/50 transition-all font-sans"
                  />
                </div>
              </div>

              {/* Friendly Password Input */}
              <div className="flex flex-col gap-1.5 text-left">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#4b5563] dark:text-slate-300">Password</label>
                  {isLogin && (
                    <button type="button" className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer">
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" weight="duotone" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500/50 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Password Confirm box for register only */}
              {!isLogin && (
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-xs font-semibold text-[#4b5563] dark:text-slate-300">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" weight="duotone" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500/50 transition-all font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Feedback Error Indicator */}
              <AnimatePresence>
                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 rounded-xl bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium"
                  >
                    {errorMsg}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit triggers */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 rounded-xl font-bold bg-[#16a34a] hover:bg-emerald-600 text-white text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-500/10"
              >
                <span>{loading ? "Please wait..." : isLogin ? "Sign In" : "Register"}</span>
                <ArrowRight className="w-4 h-4 shrink-0" weight="bold" />
              </button>
            </form>

            {/* Switch authentication views link */}
            <div className="text-center mt-5 text-xs text-[#6b7280] dark:text-slate-400">
              {isLogin ? (
                <p>
                  Don't have account?{" "}
                  <button
                    onClick={() => { setIsLogin(false); setErrorMsg(""); }}
                    className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    Sign up
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{" "}
                  <button
                    onClick={() => { setIsLogin(true); setErrorMsg(""); }}
                    className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    Sign in
                  </button>
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 my-4 text-slate-400 text-[10px] justify-center font-mono">
              <span className="h-px bg-slate-200 dark:bg-white/5 w-10" />
              <span>OR DEMO LOGINS</span>
              <span className="h-px bg-slate-200 dark:bg-white/5 w-10" />
            </div>

            <button
              onClick={() => onLoginSuccess("Jane Doe", "jane@demo.io")}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Continue as Mock Session</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
