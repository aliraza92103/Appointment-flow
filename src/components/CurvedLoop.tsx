import { motion } from "motion/react";
import { CalendarCheck, Robot, WhatsappLogo, Sparkle } from "@phosphor-icons/react";

export default function CurvedLoop() {
  return (
    <div className="w-full py-8 px-4 flex flex-col items-center justify-center relative" id="appointflow-curved-loop">
      {/* Dynamic Connector SVG with glowing dashboard lines */}
      <div className="w-full max-w-2xl relative h-40 flex items-center justify-between">
        
        {/* Animated Paths */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible" xmlns="http://www.w3.org/2000/svg">
          {/* Path 1: Calendar to AppointFlow */}
          <path
            d="M 50,80 C 150,20 200,20 320,80"
            fill="none"
            stroke="rgba(77, 163, 255, 0.15)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Animated Glow Dot Path 1 */}
          <motion.path
            d="M 50,80 C 150,20 200,20 320,80"
            fill="none"
            stroke="url(#gradient-blue)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray="20 150"
            animate={{
              strokeDashoffset: [-170, 0]
            }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              ease: "linear"
            }}
          />

          {/* Path 2: AppointFLow to WhatsApp */}
          <path
            d="M 320,80 C 440,140 490,140 590,80"
            fill="none"
            stroke="rgba(37, 211, 102, 0.15)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Animated Glow Dot Path 2 */}
          <motion.path
            d="M 320,80 C 440,140 490,140 590,80"
            fill="none"
            stroke="url(#gradient-green)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray="20 150"
            animate={{
              strokeDashoffset: [-170, 0]
            }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              ease: "linear",
              delay: 1.4
            }}
          />

          {/* Define SVG Gradients */}
          <defs>
            <linearGradient id="gradient-blue" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4da3ff" stopOpacity="0" />
              <stop offset="50%" stopColor="#4da3ff" stopOpacity="1" />
              <stop offset="100%" stopColor="#25D366" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="gradient-green" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#25D366" stopOpacity="0" />
              <stop offset="50%" stopColor="#00ff88" stopOpacity="1" />
              <stop offset="100%" stopColor="#4da3ff" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Node 1: Booking Software Integration */}
        <div className="flex flex-col items-center gap-2 z-10" id="source-app-node">
          <div className="w-16 h-16 rounded-full glass-panel-heavy flex items-center justify-center border border-sky-500/30 text-sky-400 shadow-lg shadow-sky-950/20 relative group">
            <div className="absolute inset-0 rounded-full bg-sky-400/5 filter blur-lg transition-all group-hover:bg-sky-400/15" />
            <CalendarCheck className="w-7 h-7 nav-icon" weight="duotone" />
            
            {/* Soft labels inside */}
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
            </span>
          </div>
          <span className="text-[11px] font-mono tracking-wider text-white/40 font-semibold text-center uppercase">
            BOOKING INPUT<br/>
            <span className="text-white/60 text-[10px] lowercase font-normal">Google Cal / Calendly</span>
          </span>
        </div>

        {/* Node 2: AppointFlow AI core processing */}
        <div className="flex flex-col items-center gap-2 z-10" id="core-ai-node">
          <div className="w-20 h-20 rounded-2xl glass-panel-heavy flex flex-col items-center justify-center border border-emerald-500/50 text-emerald-400 shadow-xl shadow-emerald-950/30 relative group">
            <div className="absolute inset-0 rounded-2xl bg-emerald-400/10 filter blur-xl transition-all group-hover:bg-[#25D366]/20" />
            
            {/* Animated rotating outer shine ring */}
            <motion.div
              className="absolute -inset-1 rounded-[18px] border border-dashed border-[#25D366]/40 pointer-events-none"
              animate={{ rotate: 360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            />

            <Robot className="w-8 h-8 text-[#25D366] nav-icon" weight="duotone" />
            <div className="flex items-center gap-0.5 mt-0.5 text-[#00ff88] text-[9px] font-mono font-bold uppercase tracking-widest">
              <Sparkle className="w-2.5 h-2.5 animate-pulse" weight="duotone" />
              AI CORE
            </div>
          </div>
          <span className="text-[11px] font-mono tracking-wider text-[#25D366] font-bold text-center uppercase text-glow-green">
            APPOINTFLOW<br/>
            <span className="text-white/40 text-[10px] lowercase font-normal font-sans">Gemini-Tailored Copy</span>
          </span>
        </div>

        {/* Node 3: Deliver to Client Phone */}
        <div className="flex flex-col items-center gap-2 z-10" id="delivery-whatsapp-node">
          <div className="w-16 h-16 rounded-full glass-panel-heavy flex items-center justify-center border border-emerald-400/30 text-emerald-400 shadow-lg shadow-emerald-950/25 relative group">
            <div className="absolute inset-0 rounded-full bg-[#25D366]/5 filter blur-lg transition-all group-hover:bg-[#25D366]/15" />
            <WhatsappLogo className="w-7 h-7 text-[#25D366] nav-icon" weight="duotone" />
          </div>
          <span className="text-[11px] font-mono tracking-wider text-white/40 font-semibold text-center uppercase">
            WHATSAPP REACH<br/>
            <span className="text-white/60 text-[10px] lowercase font-normal">Instant Client Chat</span>
          </span>
        </div>

      </div>

      {/* Description caption */}
      <span className="text-xs text-white/40 text-center max-w-md mt-2 font-sans italic">
        AppointFlow intercepts booking triggers, generates bespoke WhatsApp reminder copies instantly, and registers automated fast replies to cancel or confirm on your schedule.
      </span>
    </div>
  );
}
