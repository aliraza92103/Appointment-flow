import React from "react";
import { motion } from "motion/react";
import { 
  Bot, 
  ArrowRight, 
  Sparkles, 
  Zap, 
  Calendar, 
  Users, 
  Activity, 
  Smartphone, 
  Bell, 
  ShieldCheck, 
  ArrowDown 
} from "lucide-react";
import TiltedCard from "./TiltedCard";
import ThemeToggle from "./ThemeToggle";

interface HeroLandingViewProps {
  onGetStarted: () => void;
  onSignIn: () => void;
  businessName: string;
}

export default function HeroLandingView({ onGetStarted, onSignIn, businessName }: HeroLandingViewProps) {
  // 6 feature declarations
  const features = [
    {
      icon: Bot,
      title: "AI Reminder Assistant",
      desc: "Tailored WhatsApp reminders synthesized in seconds by Gemini models to match your specific brand persona.",
      color: "from-emerald-500 to-teal-500",
    },
    {
      icon: Zap,
      title: "Instant WhatsApp Gateway",
      desc: "Direct-to-chat WhatsApp message delivery with verified account styling and zero cold waiting time queues.",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Calendar,
      title: "Google Calendar Coordination",
      desc: "Native bi-directional syncing between Google Calendar, local rosters, and WhatsApp action loops.",
      color: "from-teal-500 to-emerald-400",
    },
    {
      icon: Users,
      title: "Live Portal Specialists",
      desc: "Assign separate barbers, therapists, or specialists and let individual staff members check their rosters.",
      color: "from-emerald-600 to-green-500",
    },
    {
      icon: Activity,
      title: "Performance Data Visuals",
      desc: "Track client response times, WhatsApp confirmation percentages, and drop-offs with custom interactive graphs.",
      color: "from-teal-600 to-emerald-500",
    },
    {
      icon: Smartphone,
      title: "Interactive Sandbox Workbench",
      desc: "Test simulated WhatsApp replies and preview live action updates on a beautiful mobile dashboard mockup.",
      color: "from-green-600 to-teal-500",
    },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300" id="hero-landing-root">
      {/* Dynamic Aurora Overlay Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Soft, glowing aurora mesh spheres for Dark & Light Mode compatibility */}
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 blur-[120px] spotlight-pulse" />
        <div className="absolute top-[20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-teal-500/10 dark:bg-teal-500/5 blur-[100px] spotlight-pulse [animation-delay:3s]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[55vw] h-[55vw] rounded-full bg-green-500/10 dark:bg-green-500/5 blur-[130px] spotlight-pulse [animation-delay:6s]" />
      </div>

      {/* Hero Navbar */}
      <header className="relative z-20 mx-auto max-w-7xl px-6 py-6 flex items-center justify-between border-b border-slate-100 dark:border-white/5 bg-white/50 dark:bg-slate-950/20 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <span className="font-extrabold tracking-tight font-sans text-sm text-slate-900 dark:text-white">AppointFlow</span>
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">SaaS v2.5</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button
            onClick={onSignIn}
            className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer"
            id="hero-header-signin-btn"
          >
            Sign In
          </button>
          <button
            onClick={onGetStarted}
            className="hidden sm:inline-flex px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 rounded-xl transition-all cursor-pointer shadow-sm shadow-emerald-500/10"
            id="hero-header-getstarted-btn"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Main Focus Landing Hero Section */}
      <section className="relative z-10 mx-auto max-w-7xl min-h-[calc(100vh-80px)] px-6 pt-16 pb-24 flex flex-col justify-center items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center gap-6"
        >
          {/* Tagline / Indicator */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-white/5 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-spin [animation-duration:4s]" />
            <span>Eliminate appointment cancellations in real-time</span>
          </div>

          {/* Headline - Clean minimalist premium design */}
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tight text-slate-900 dark:text-white max-w-5xl leading-none">
            Never Miss An <br />
            <span className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 bg-clip-text text-transparent italic font-serif">
              Appointment
            </span>{" "}
            Again.
          </h1>

          {/* Subtext */}
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-lg leading-relaxed mt-2">
            The minimal, lightning-fast scheduling tool pairing official WhatsApp direct message alerts with Gemini AI copywriting style matching to slash client no-shows of <b>{businessName || "your workspace"}</b>.
          </p>

          {/* Buttons Block */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 w-full sm:w-auto">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-4 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-500/20 hover:scale-[1.02] flex items-center justify-center gap-2"
              id="hero-cta-primary"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#key-features-grid"
              className="w-full sm:w-auto px-8 py-4 text-sm font-bold text-slate-700 dark:text-slate-200 bg-white/50 dark:bg-slate-950/20 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all cursor-pointer hover:scale-[1.02] flex items-center justify-center gap-2"
              id="hero-cta-secondary"
            >
              See How It Works
            </a>
          </div>
        </motion.div>

        {/* Floating Glass Mockup Card */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative w-full max-w-5xl mt-16 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-slate-900/40 p-4 md:p-6 shadow-2xl backdrop-blur-md"
        >
          {/* Standard Apple browser window header dots */}
          <div className="flex items-center gap-1.5 pb-4 border-b border-slate-200 dark:border-white/5 mb-4">
            <span className="w-3 h-3 rounded-full bg-rose-400/80 dark:bg-rose-500/30" />
            <span className="w-3 h-3 rounded-full bg-amber-400/80 dark:bg-amber-500/30" />
            <span className="w-3 h-3 rounded-full bg-emerald-400/80 dark:bg-emerald-500/30" />
            <span className="text-[10px] text-slate-400 dark:text-wrap font-mono uppercase tracking-widest pl-2">appointflow.com/dashboard</span>
          </div>

          {/* Simple Clean Mockup Screenshot representation */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-left font-sans">
            <div className="md:col-span-4 p-4 rounded-xl bg-white dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 flex flex-col gap-3">
              <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">ACTIVE NOTIFICATION</span>
              <div className="w-full h-8 bg-slate-100 dark:bg-white/5 rounded-lg flex items-center px-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                💇‍♂️ Haircut Specialist Booking Checked
              </div>
              <div className="w-full h-16 bg-slate-100 dark:bg-white/5 rounded-lg flex flex-col justify-center px-2.5 gap-1">
                <span className="text-[10px] text-slate-400">Recipient Client</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Emery Vance (Active)</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span>Roster Status</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">Confirmed</span>
              </div>
            </div>

            <div className="md:col-span-8 p-4 rounded-xl bg-white dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">GEMINI COPYWRITER OUTBOUND</span>
                <span className="text-[10px] text-slate-400">Ver. 2.5 Active</span>
              </div>
              <p className="text-xs italic leading-relaxed text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-white/5 p-3 rounded-lg border border-slate-100 dark:border-white/5">
                "Hi Emery! This is a warm reminder that your premium hair styling session with {businessName || "our salon"} is scheduled for June 16th at 10:00 AM."
              </p>
              <div className="h-6 w-full bg-slate-100 dark:bg-white/5 rounded-lg" />
            </div>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-slate-400 animate-bounce">
          <span className="text-[10px] font-mono tracking-wider uppercase">More details below</span>
          <ArrowDown className="w-4 h-4 text-emerald-500" />
        </div>
      </section>

      {/* Upgraded Feature Grid Section */}
      <section id="key-features-grid" className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-slate-100 dark:border-white/5">
        <div className="text-center mb-16">
          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">PRODUCT FEATURES</span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mt-2 leading-none">
            Upgraded For Maximum Performance
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-3">
            Harnessing premium components and smart design patterns to completely optimize client communication.
          </p>
        </div>

        {/* Upgraded 6 feature items structured with interactive 3D TiltCards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <TiltedCard
                key={index}
                intensity={12}
                className="group border border-slate-200 dark:border-white/5 shadow-md flex flex-col relative h-full bg-white dark:bg-slate-950/40 p-8 rounded-2xl transition-all hover:border-emerald-500/40 hover:shadow-[0_0_20px_rgba(5,150,105,0.1)] dark:hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]"
              >
                {/* Feature Card Wrapper */}
                <div className="flex flex-col gap-6">
                  {/* Big Icon 48px */}
                  <div className={`w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-white/5 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-10 h-10" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans mt-1">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              </TiltedCard>
            );
          })}
        </div>
      </section>

      {/* Footer Branding Area */}
      <footer className="relative z-10 max-w-7xl mx-auto px-6 py-12 border-t border-slate-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-4">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-emerald-500" />
          <span className="font-bold text-slate-800 dark:text-slate-200">AppointFlow SaaS</span>
          <span>© 2026. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-emerald-500 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-emerald-500 transition-colors">Terms of Operations</a>
          <a href="mailto:admin@appointflow.com" className="hover:text-emerald-500 transition-colors">Enterprise Contact</a>
        </div>
      </footer>
    </div>
  );
}
