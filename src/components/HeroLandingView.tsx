import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";
import { 
  Bot, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  Check, 
  ChevronDown, 
  Play, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Smartphone, 
  Calendar, 
  DollarSign, 
  Award, 
  MessageSquare, 
  Timer, 
  ChevronRight, 
  Star, 
  Users, 
  Activity, 
  HelpCircle, 
  Twitter, 
  Linkedin, 
  Github, 
  Heart 
} from "lucide-react";
import TiltedCard from "./TiltedCard";
import ThemeToggle from "./ThemeToggle";
import BeforeAfterSlider from "./BeforeAfterSlider";

interface HeroLandingViewProps {
  onGetStarted: () => void;
  onSignIn: () => void;
  businessName: string;
}

// 1. MAGNETIC BUTTON WRAPPER FOR GORGEOUS INTERACTION
function MagneticButton({ 
  children, 
  className = "", 
  onClick 
}: { 
  children: React.ReactNode; 
  className?: string; 
  onClick?: () => void;
}) {
  const x = useTransform(useScroll().scrollY, [0, 1], [0, 0]); // dummy if needed, but we use internal springs
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const computedX = e.clientX - (rect.left + width / 2);
    const computedY = e.clientY - (rect.top + height / 2);
    setCoords({ x: computedX * 0.35, y: computedY * 0.35 });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCoords({ x: 0, y: 0 });
  };

  return (
    <motion.button
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      animate={{ x: coords.x, y: coords.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      onClick={onClick}
      className={`${className} cursor-pointer`}
    >
      {children}
    </motion.button>
  );
}

// 2. ANIMATED SELF-COUNTING NUMBER FOR STATS ROW
function AnimatedCounter({ value, duration = 2000, suffix = "" }: { value: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasStarted) return;
    let start = 0;
    const end = value;
    const startTime = performance.now();
    let frameId: number;

    const run = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setCount(Math.floor(ease * (end - start) + start));
      if (progress < 1) {
        frameId = requestAnimationFrame(run);
      }
    };
    frameId = requestAnimationFrame(run);
    return () => cancelAnimationFrame(frameId);
  }, [value, duration, hasStarted]);

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

// 3. COLLAPSIBLE ACCORDION FOR FAQ ITEMS
function FAQAccordionItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-100 dark:border-white/5 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left py-2 font-sans font-semibold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
      >
        <span className="text-sm md:text-base">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-slate-400 shrink-0 ml-4"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HeroLandingView({ onGetStarted, onSignIn, businessName }: HeroLandingViewProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isYearly, setIsYearly] = useState(false);

  // Scroll event for sticky glass navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Features data (6 cards)
  const features = [
    {
      icon: MessageSquare,
      title: "Instant WhatsApp Delivery",
      desc: "Zero-latency delivery direct to customer chats. Tap into a 98% message open rate compared to stale emails.",
      color: "from-emerald-500 to-teal-500",
    },
    {
      icon: Bot,
      title: "AI Message Generator",
      desc: "Built-in Gemini AI auto-writes personalized and engaging messages based on the client's booking history.",
      color: "from-teal-500 to-green-500",
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      desc: "Deep visual agenda management syncing to Google Calendar blocks without tedious manual double reservations.",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Users,
      title: "Multi-Staff Support",
      desc: "Assign team members, set explicit rosters, and handle separate custom booking calendars under one dashboard.",
      color: "from-teal-600 to-emerald-500",
    },
    {
      icon: Activity,
      title: "Real-time Analytics",
      desc: "Visualize client confirmation rates, check in-depth queue updates and trace precise drop-off factors instantly.",
      color: "from-emerald-600 to-teal-600",
    },
    {
      icon: ShieldCheck,
      title: "Zero Setup Required",
      desc: "Deploy interactive WhatsApp alerts and premium schedules in less than 2 minutes. No custom hosting or code needed.",
      color: "from-green-600 to-emerald-500",
    },
  ];

  // Testimonials database (8 items for 2 horizontal rows)
  const row1Testimonials = [
    { quote: "cuttings no-shows by 95% is actual wizardry. Best investment we made this quarter.", author: "Emilia R.", title: "Salon Stylist" },
    { quote: "Our calendar is always organized and full now. The WhatsApp automated integration rules!", author: "Marcus T.", title: "Barber Co-Founder" },
    { quote: "Clients love the zero-friction timing confirmations. The Gemini-synthesized tones are great.", author: "Dante K.", title: "Wellness Specialist" },
    { quote: "Simple, incredibly elegant calendar layout. We saved over 15 hours of manual phone alerts weekly.", author: "Sarah L.", title: "Spa Owner" },
  ];

  const row2Testimonials = [
    { quote: "Highly recommend AppointFlow. No-shows on our premium therapy tiers fell to literal zero.", author: "Julian P.", title: "Yoga Instructor" },
    { quote: "The 3D dashboards have made roster coordination across our entire agency effortless.", author: "Sophia M.", title: "Clinic Manager" },
    { quote: "Absolutely gorgeous minimalist Cal-style aesthetic. It looks incredibly professional.", author: "Richard W.", title: "Cosmetics Specialist" },
    { quote: "A simple, game-changing tool for appointment management. Seamless and straightforward to setup.", author: "Elena G.", title: "Studio Executive" },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300" id="appointflow-landing-root">
      
      {/* SECTION 1: STICKY BLUR NAVBAR */}
      <nav className={`fixed top-0 left-0 right-0 z-50 h-[60px] flex items-center transition-all duration-300 ${
        scrolled 
          ? "bg-white/70 dark:bg-slate-950/75 backdrop-blur-md border-b border-slate-200/55 dark:border-white/5 shadow-md shadow-slate-100/10 dark:shadow-none" 
          : "bg-transparent border-b border-transparent"
      }`} id="landing-navbar">
        <div className="max-w-7xl mx-auto w-full px-6 flex items-center justify-between">
          
          {/* Logo Brand left */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Bot className="w-5 h-5" />
            </div>
            <span className="text-[20px] font-bold tracking-tight text-slate-900 dark:text-white" style={{ fontFamily: '"Bricolage Grotesque", sans-serif' }}>
              AppointFlow
            </span>
          </div>

          {/* Nav links center (Desktop only) */}
          <div className="hidden md:flex items-center gap-8 text-[13px] font-semibold text-slate-500 dark:text-slate-400">
            <a href="#key-features" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Pricing</a>
            <a href="#testimonials" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Testimonials</a>
            <a href="#faq" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">FAQ</a>
          </div>

          {/* Right side tools */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            <button
              onClick={onSignIn}
              className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-all"
            >
              Sign In
            </button>
            <MagneticButton
              onClick={onGetStarted}
              className="px-4.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 shadow-lg shadow-emerald-500/10 transition-all cursor-pointer"
            >
              Get Started
            </MagneticButton>
          </div>

          {/* Mobile hamburger trigger */}
          <div className="flex md:hidden items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE HEADER MENU SLIDE DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-[60px] z-40 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-white/5 shadow-2xl p-6 flex flex-col gap-5 md:hidden"
          >
            <div className="flex flex-col gap-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
              <a href="#key-features" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-slate-100 dark:border-white/5 hover:text-emerald-500">Features</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-slate-100 dark:border-white/5 hover:text-emerald-500">How It Works</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-slate-100 dark:border-white/5 hover:text-emerald-500">Pricing</a>
              <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-slate-100 dark:border-white/5 hover:text-emerald-500">Testimonials</a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-emerald-500">FAQ</a>
            </div>

            <div className="flex flex-col gap-3 pt-3 border-t border-slate-100 dark:border-white/5">
              <button
                onClick={() => { setMobileMenuOpen(false); onSignIn(); }}
                className="w-full py-3 rounded-xl border border-slate-200 dark:border-white/10 text-center text-xs font-bold text-slate-800 dark:text-white"
              >
                Sign In
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); onGetStarted(); }}
                className="w-full py-3 bg-emerald-600 dark:bg-emerald-500 text-white rounded-xl text-center text-xs font-bold shadow-md shadow-emerald-500/15"
              >
                Get Started Free
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECTION 2: HERO (SUPER IMMERSIVE MULTI-SPHERES GRADIENT BACKGROUND) */}
      <section className="relative min-h-screen w-full flex flex-col justify-center items-center py-16 lg:py-24 px-5 md:px-8 lg:px-0 overflow-hidden">
        
        {/* Animated dynamic background layers */}
        <div className="absolute inset-0 pointer-events-none z-0">
          {/* Dark Mode Ambient Color Spheres */}
          <div className="absolute top-[10%] left-[15%] w-[65vw] h-[65vw] rounded-full bg-emerald-500/5 dark:bg-emerald-500/5 blur-[140px] spotlight-pulse" />
          <div className="absolute top-[30%] right-[10%] w-[55vw] h-[55vw] rounded-full bg-indigo-500/5 dark:bg-indigo-500/5 blur-[120px] spotlight-pulse [animation-delay:3s]" />
          <div className="absolute bottom-[-10%] left-[25%] w-[60vw] h-[60vw] rounded-full bg-teal-500/5 dark:bg-teal-500/5 blur-[150px] spotlight-pulse [animation-delay:6s]" />
          
          {/* Light Mode subtle center grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.01)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)] opacity-30" />
        </div>

        {/* Hero content container */}
        <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
          
          {/* Staggered load animation card badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-white/5 shadow-sm text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-8"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>🚀 Trusted by 500+ modern businesses</span>
          </motion.div>

          {/* Headline - HUGE Display Layout (staggered per word) */}
          <h1 className="text-[32px] sm:text-[48px] lg:text-[72px] font-sans font-black tracking-tight text-slate-900 dark:text-white max-w-5xl" style={{ lineHeight: 1.1 }}>
            <motion.span
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="block"
            >
              Never Miss An
            </motion.span>
            
            <motion.span
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="block bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 bg-clip-text text-transparent font-serif italic font-extrabold pb-1.5"
            >
              Appointment
            </motion.span>
            
            <motion.span
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="block"
            >
              Again.
            </motion.span>
          </h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-[14px] sm:text-[16px] lg:text-[18px] text-slate-500 dark:text-slate-400 max-w-xl mx-auto mt-6 leading-relaxed font-semibold font-sans"
          >
            Send automatic, professional WhatsApp reminders to your customers. Zero manual coordination effort. 98% instant delivery rate. Set up in less than 2 minutes.
          </motion.p>

          {/* Two Buttons CTAs with 12px gap */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-[12px] mt-9 w-full sm:w-auto"
          >
            <MagneticButton
              onClick={onGetStarted}
              className="w-full sm:w-auto min-w-[160px] h-[48px] px-6 rounded-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-sm transition-all shadow-xl shadow-emerald-500/10 flex items-center justify-center gap-2 hover:scale-[1.02]"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 ml-1" />
            </MagneticButton>

            <a
              href="#how-it-works"
              className="w-full sm:w-auto min-w-[160px] h-[48px] px-6 rounded-[10px] bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 font-bold text-sm flex items-center justify-center gap-2 hover:scale-[1.02] transition-all cursor-pointer"
            >
              <span className="text-emerald-500 mr-0.5">▶</span>
              Watch Demo
            </a>
          </motion.div>

          {/* Stats Row Counter below buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65, duration: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4.5 w-full max-w-4xl mt-16 py-6 px-4 md:px-0 rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/10 backdrop-blur-md"
          >
            <div className="flex flex-col items-center">
              <span className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                <AnimatedCounter value={10000} suffix="+" />
              </span>
              <span className="text-[11px] font-sans font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Reminders Sent</span>
            </div>
            <div className="flex flex-col items-center border-l border-slate-200/50 dark:border-white/5">
              <span className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                <AnimatedCounter value={500} suffix="+" />
              </span>
              <span className="text-[11px] font-sans font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1 font-medium">Active Partners</span>
            </div>
            <div className="flex flex-col items-center border-l border-slate-200/50 dark:border-white/5">
              <span className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                <AnimatedCounter value={98} suffix="%" />
              </span>
              <span className="text-[11px] font-sans font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Delivery Rate</span>
            </div>
            <div className="flex flex-col items-center border-l border-slate-200/50 dark:border-white/5">
              <span className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                <AnimatedCounter value={2} suffix=" Min" />
              </span>
              <span className="text-[11px] font-sans font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Setup Time</span>
            </div>
          </motion.div>

          {/* Interactive Hero Floating Glass Dashboard Mockup Card with glow */}
          <motion.div
            initial={{ opacity: 0, y: 70 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.7 }}
            className="w-full mt-16 relative"
          >
            <div className="absolute inset-x-12 bottom-0 h-28 bg-emerald-500/20 dark:bg-emerald-500/30 rounded-full filter blur-[50px] -z-10 opacity-60" />
            
            {/* Tilted Container display */}
            <TiltedCard intensity={5} className="w-full rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-950/40 p-4 md:p-6 shadow-2xl backdrop-blur-md">
              <div className="flex items-center gap-1.5 pb-4 border-b border-slate-200/60 dark:border-white/5 mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-[10px] text-slate-400 font-mono tracking-wider ml-2 select-none">appointflow.io/workspace/live</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 text-left font-sans">
                {/* Simulated appointment side card */}
                <div className="md:col-span-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase">LATEST INCOMING</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[9px] font-bold">LIVE</span>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0">
                      <Calendar className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Eleanor Vance</span>
                      <span className="text-[10px] text-slate-400 font-mono">Premium Hair Spa • 10:00 AM</span>
                    </div>
                  </div>

                  <div className="h-[1px] bg-slate-200 dark:bg-white/5" />

                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                    <span>Reminder Engine Timing</span>
                    <span className="text-emerald-600 dark:text-emerald-400">2 Hours Before</span>
                  </div>
                </div>

                {/* Simulated chat timeline preview */}
                <div className="md:col-span-7 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase text-glow-green">WHATSAPP DIRECT AUTOMATION</span>
                    <span className="text-[9px] text-emerald-500 font-sans tracking-wide">● Active Node</span>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-xl p-3.5 my-3 relative">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">GEMINI WRITER TONE PREVIEW</span>
                    </div>
                    <p className="text-xs italic text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                      "Hello Eleanor! This is a automatic verification that your executive hair styling session is scheduled for tomorrow at 10:00 AM with our studio. Please write *1* to verify this appointment."
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                    <span>Delivered Outbox Stream</span>
                    <span>10.2s elapsed</span>
                  </div>
                </div>
              </div>
            </TiltedCard>
          </motion.div>

        </div>
      </section>

      {/* SECTION 3: SOCIAL PROOF INF BRAND LOGOS (MARQUEE SCROLL) */}
      <section className="relative z-10 py-16 border-y border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-slate-950/20 w-full overflow-hidden select-none">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-8">
            Empowering client success loops across industry teams
          </p>

          <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent_0%,_black_15%,_black_85%,transparent_100%)]">
            <div className="flex gap-16 animate-marquee-left max-w-full italic">
              {[
                "SLOANE AESTHETIC", "ELEVATE THERAPY", "FINLAND CUTS", "THE RETREAT", "VORTEX BARBERS", "NORDIC GLOW",
                "SLOANE AESTHETIC", "ELEVATE THERAPY", "FINLAND CUTS", "THE RETREAT", "VORTEX BARBERS", "NORDIC GLOW"
              ].map((logo, index) => (
                <div key={index} className="text-slate-400 dark:text-slate-500 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors text-base font-extrabold tracking-widest uppercase font-mono px-4">
                  {logo}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: FEATURES GRID (3x2 custom items) */}
      <section id="key-features" className="relative z-10 py-16 lg:py-24 px-5 md:px-8 lg:px-0 max-w-7xl mx-auto animate-fade-in">
        
        {/* Decorative ambient background spotlight */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] rounded-full bg-emerald-500/5 dark:bg-emerald-500/5 blur-[120px] pointer-events-none -z-10 spotlight-pulse" />

        <div className="text-center mb-16 select-none">
          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest px-3 py-1 bg-emerald-100/50 dark:bg-emerald-500/10 rounded-full border border-emerald-500/15">
            Everything You Need
          </span>
          <h2 className="text-[24px] sm:text-[30px] lg:text-[40px] font-black tracking-tight text-slate-900 dark:text-white mt-4 leading-none font-sans">
            Built for modern businesses
          </h2>
          <p className="text-sm text-slate-400 dark:text-slate-500 max-w-md mx-auto mt-3">
            Unlock professional roster scheduling direct to client devices.
          </p>
        </div>

        {/* Features 3x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {features.map((feat, index) => {
            const IconComponent = feat.icon;
            return (
              <TiltedCard
                key={index}
                intensity={12}
                className="group border border-slate-200/70 dark:border-white/5 relative h-full bg-white dark:bg-slate-900/10 p-[28px] rounded-[16px] hover:border-emerald-500/40 hover:shadow-[0_0_20px_rgba(5,150,105,0.06)] dark:hover:shadow-[0_0_25px_rgba(16,185,129,0.15)] transition-all cursor-crosshair pb-9 duration-300 animate-fade-in"
              >
                <div className="flex flex-col gap-6">
                  {/* Custom green icon block conforming to guidelines */}
                  <div className="w-11 h-11 rounded-[12px] bg-[#059669]/8 dark:bg-[#25D366]/10 border border-slate-100 dark:border-white/5 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform duration-300 shrink-0 p-[10px]">
                    <IconComponent className="w-6 h-6" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <h3 className="text-[15px] lg:text-[17px] font-black tracking-tight text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-[12px] lg:text-[14px] text-slate-500 dark:text-slate-400 leading-relaxed mt-1 font-sans font-medium">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              </TiltedCard>
            );
          })}
        </div>
      </section>

      {/* SECTION 5: HOW IT WORKS STEPPER */}
      <section id="how-it-works" className="relative z-10 py-16 lg:py-24 border-t border-slate-100 dark:border-white/5 bg-slate-50/20 dark:bg-slate-950/20 w-full px-5 md:px-8 lg:px-0">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 select-none">
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
              STEP BY STEP
            </span>
            <h2 className="text-[24px] sm:text-[30px] lg:text-[40px] font-black tracking-tight text-slate-900 dark:text-white mt-2 leading-none">
              Up and running in 3 steps
            </h2>
            <p className="text-sm text-slate-400 dark:text-slate-500 max-w-md mx-auto mt-3">
              Automated client operations laid out simple and fast.
            </p>
          </div>

          {/* Stepper container */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 relative">
            
            {/* Horizontal timeline line (Desktop only) */}
            <div className="hidden md:block absolute top-[28px] left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 opacity-20 -z-10" />

            {/* Step 1 */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left gap-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/35 flex items-center justify-center font-bold text-lg text-emerald-600 dark:text-emerald-400 shrink-0">
                1
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Add Your Appointments</h3>
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Enter basic customer coordinates, name, date, and targeted therapists or service type into the agenda roster.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left gap-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/35 flex items-center justify-center font-bold text-lg text-emerald-600 dark:text-emerald-400 shrink-0">
                2
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Set Reminder Timing</h3>
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Configure alerts to trigger exactly 1 hour, 2 hours, or 1 day before the client queue slots are scheduled.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left gap-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/35 flex items-center justify-center font-bold text-lg text-emerald-600 dark:text-emerald-400 shrink-0">
                3
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">WhatsApp Sends Automatically</h3>
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Our unified nodes dispatch messages instantly. Customer reviews appointment status directly from their mobile screen.
                </p>
              </div>
            </div>

          </div>

          {/* Floating Phone message preview mockup below steps */}
          <div className="mt-20 flex justify-center w-full">
            <TiltedCard intensity={8} className="w-full max-w-xs rounded-[36px] border-[6px] border-slate-900/90 dark:border-white/10 bg-black p-2.5 shadow-2xl relative">
              {/* iPhone screen header dot camera block */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-4 bg-slate-900 dark:bg-black rounded-full z-20 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-900/50" />
              </div>

              {/* iPhone simulated Screen content wrapping */}
              <div className="rounded-[28px] overflow-hidden bg-slate-100 dark:bg-slate-950 p-4 h-96 flex flex-col justify-between font-sans text-xs">
                {/* Whatsapp Header Bar mockup */}
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 dark:border-white/5 pt-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px]">
                      AP
                    </div>
                    <div className="flex flex-col">
                      <span className="font-extrabold text-[10px] text-slate-800 dark:text-white">AppointFlow Bot</span>
                      <span className="text-[8px] text-slate-400">Verified System</span>
                    </div>
                  </div>
                  <span className="text-[8px] font-mono text-slate-400">03:41 AM</span>
                </div>

                <div className="flex-1 flex flex-col justify-center gap-2">
                  <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 rounded-tl-sm border border-slate-200/50 dark:border-white/5 text-slate-800 dark:text-slate-200 flex flex-col gap-1 shadow-sm">
                    <span className="text-[8px] font-semibold text-emerald-600 dark:text-emerald-400 font-mono">AUTOMATED ALERT</span>
                    <p className="text-[10px] leading-relaxed">
                      "Hi Sophia! This is an elegant confirmation representing your wellness therapy tomorrow morning. Kindly write **1** to confirm or **2** to reschedule."
                    </p>
                  </div>

                  {/* Customer reply simulation */}
                  <div className="self-end p-2 rounded-xl bg-emerald-600 text-white rounded-tr-sm text-[10px] font-semibold shadow-xs">
                    1 (Confirmed)
                  </div>
                </div>

                {/* Simulated message input box footer */}
                <div className="p-1 px-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 text-slate-400 text-[9px] flex justify-between items-center select-none font-medium">
                  <span>Type message queue...</span>
                  <ArrowRight className="w-3 h-3 text-emerald-500" />
                </div>
              </div>
            </TiltedCard>
          </div>

        </div>
      </section>

      {/* SECTION 5.5: BEFORE/AFTER COMPARISON SLIDER */}
      <BeforeAfterSlider />

      {/* SECTION 6: PRICING WITH TOGGLE (STARTER FREE, PRO ACTIVE, AGENCY SPLIT) */}
      <section id="pricing" className="relative z-10 py-16 lg:py-24 px-5 md:px-8 lg:px-0 max-w-7xl mx-auto animate-fade-in">
        <div className="text-center mb-16 select-none">
          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest px-3 py-1 bg-emerald-100/50 dark:bg-emerald-500/10 rounded-full border border-emerald-500/15">
            PLANS & PRICING
          </span>
          <h2 className="text-[24px] sm:text-[30px] lg:text-[40px] font-black tracking-tight text-slate-900 dark:text-white mt-4 leading-none">
            Simple, transparent pricing
          </h2>
          <p className="text-sm text-slate-400 dark:text-slate-500 max-w-sm mx-auto mt-3">
            Choose a plan that fits your studio and slash cancellations today.
          </p>

          {/* Monthly / Yearly Switch Selector */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <span className={`text-xs font-bold transition-all duration-200 ${!isYearly ? "text-slate-900 dark:text-white" : "text-slate-400"}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="w-12 h-6.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 relative p-1 transition-all cursor-pointer"
              aria-label="Toggle pricing periodicity"
            >
              <div className={`w-4.5 h-4.5 rounded-full bg-emerald-500 transition-all ${
                isYearly ? "translate-x-5.5" : "translate-x-0"
              }`} />
            </button>
            <span className={`text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${isYearly ? "text-slate-900 dark:text-white" : "text-slate-400"}`}>
              <span>Yearly</span>
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black uppercase text-emerald-700 dark:text-emerald-400">
                -20% Off
              </span>
            </span>
          </div>
        </div>

        {/* 3 Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-stretch font-sans">
          
          {/* STARTER CARD */}
          <div className="flex flex-col justify-between p-8 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/10 shadow-lg relative h-full">
            <div className="flex flex-col gap-5">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400 tracking-widest uppercase">STARTER PLAN</span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">Free Tier</h3>
              </div>
              
              <div className="flex items-baseline gap-1 text-slate-900 dark:text-white">
                <span className="text-[36px] lg:text-[48px] font-extrabold">$0</span>
                <span className="text-xs text-slate-400">/ month</span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans mt-1">
                Perfect for solo self-employed barbers or start-up individual wellness stylists testing digital schedule platforms.
              </p>

              <div className="h-[1px] bg-slate-200 dark:bg-white/5 my-2" />

              <ul className="flex flex-col gap-3 text-xs text-slate-500 dark:text-slate-400 font-sans font-semibold">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>50 reminders / month</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>1 specialist roster</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Basic message templates</span>
                </li>
                <li className="flex items-center gap-2.5 text-slate-400 line-through">
                  <span>AI Message Generator</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Standard email support</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onGetStarted}
              className="w-full py-3.5 mt-8 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl text-xs font-bold text-slate-800 dark:text-white transition-all cursor-pointer"
            >
              Start Free
            </button>
          </div>

          {/* PRO PRO_PLAN (WITH CUSTOM ANIMATED GRADIENT GLOW BORDER AND SAME HEIGHT INNER CONTAINER) */}
          <div className="animated-gradient-border rounded-2xl md:-translate-y-2 relative shadow-xxl flex flex-col">
            <div className="flex flex-col justify-between p-8 rounded-[14px] bg-white dark:bg-slate-900 w-full h-full relative z-10 z-20">
              
              {/* Spotlight label overlay */}
              <div className="absolute top-0 right-6 -translate-y-1/2 px-3 py-1 rounded-full bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest z-30 flex items-center gap-1 shadow-md shadow-emerald-500/10">
                <Award className="w-3 h-3 animate-bounce" />
                <span>Most Popular</span>
              </div>

              <div className="flex flex-col gap-5">
                <div>
                  <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 tracking-widest uppercase">ELEVATED PERFORMANCE</span>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">Professional Choice</h3>
                </div>

                <div className="flex items-baseline gap-1 text-slate-900 dark:text-white">
                  <span className="text-[36px] lg:text-[48px] font-extrabold">
                    ${isYearly ? "16" : "20"}
                  </span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans mt-1">
                  For busy salons, clinics, or multi-specialist groups looking to fully coordinate customer rosters automatically with zero stress.
                </p>

                <div className="h-[1px] bg-slate-200 dark:bg-white/10 my-2" />

                <ul className="flex flex-col gap-3 text-xs text-slate-500 dark:text-slate-400 font-sans font-semibold">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span className="text-slate-900 dark:text-white font-extrabold">Unlimited direct messages</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Up to 10 staff specialists</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">AI Gemini generator active</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Comprehensive analytics dashboard</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Priority 24/7 client support</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={onGetStarted}
                className="w-full py-3.5 mt-8 bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-500/10 hover:scale-[1.01]"
              >
                Get Pro Now
              </button>
            </div>
          </div>

          {/* AGENCY / COMPANY SLOT */}
          <div className="flex flex-col justify-between p-8 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/10 shadow-lg relative h-full">
            <div className="flex flex-col gap-5">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400 tracking-widest uppercase">CORP OPERATIONS</span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">Enterprise Agency</h3>
              </div>

              <div className="flex items-baseline gap-1 text-slate-900 dark:text-white">
                <span className="text-[36px] lg:text-[48px] font-extrabold">
                  ${isYearly ? "39" : "49"}
                </span>
                <span className="text-xs text-slate-400">/ month</span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans mt-1">
                Designed for large chains, franchises, or multisite studios needing custom API setups, roles and priority access keys.
              </p>

              <div className="h-[1px] bg-slate-200 dark:bg-white/5 my-2" />

              <ul className="flex flex-col gap-3 text-xs text-slate-500 dark:text-slate-400 font-sans font-semibold">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Everything in Pro choice</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Unlimited staff specialist rosters</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Multi-branch franchise support</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>White label styling custom headers</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Full outbound APIs integration</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => window.open("mailto:enterprise@appointflow.io")}
              className="w-full py-3.5 mt-8 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl text-xs font-bold text-slate-800 dark:text-white transition-all cursor-pointer"
            >
              Contact Sales
            </button>
          </div>

        </div>
      </section>

      {/* SECTION 7: TESTIMONIALS INFINITE MARQUEE ROW (Row 1 Left, Row 2 Right) */}
      <section id="testimonials" className="relative z-10 py-16 lg:py-24 border-t border-slate-100 dark:border-white/5 bg-slate-50/20 dark:bg-slate-950/20 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center select-none mb-14 px-5 md:px-8 lg:px-0">
          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
            TESTIMONIALS
          </span>
          <h2 className="text-[24px] sm:text-[30px] lg:text-[40px] font-black tracking-tight text-slate-900 dark:text-white mt-2 leading-none">
            Loved by businesses worldwide
          </h2>
          <p className="text-sm text-slate-400 dark:text-slate-500 max-w-sm mx-auto mt-3">
            Real client data loops testifying to actual cancellation drops.
          </p>
        </div>

        {/* Row 1 Scrolling Left */}
        <div className="flex overflow-hidden relative w-full mb-8 [mask-image:linear-gradient(to_right,transparent_0%,_black_15%,_black_85%,transparent_100%)] select-none">
          <div className="flex gap-8 animate-marquee-left shrink-0">
            {row1Testimonials.map((test, index) => (
              <div key={index} className="w-80 md:w-96 shrink-0 p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-slate-900/40 shadow-sm flex flex-col justify-between font-sans text-left">
                <div>
                  <div className="flex gap-1.5 mb-3.5 text-amber-500">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-500" />)}
                  </div>
                  <div className="flex gap-1.5 align-top">
                    <span className="text-[32px] font-serif text-emerald-500 leading-none select-none font-black shrink-0">“</span>
                    <p className="text-[13px] lg:text-[15px] text-slate-600 dark:text-slate-300 italic leading-relaxed">
                      {test.quote}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-4.5 pt-3 border-t border-slate-100 dark:border-white/5">
                  <div className="w-[36px] h-[36px] rounded-full bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center font-semibold text-[14px] text-white uppercase shrink-0">
                    {test.author.substring(0, 2)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800 dark:text-white">{test.author}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{test.title}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Row 2 Scrolling Right */}
        <div className="flex overflow-hidden relative w-full [mask-image:linear-gradient(to_right,transparent_0%,_black_15%,_black_85%,transparent_100%)] select-none">
          <div className="flex gap-8 animate-marquee-right shrink-0">
            {row2Testimonials.map((test, index) => (
              <div key={index} className="w-80 md:w-96 shrink-0 p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-slate-900/40 shadow-sm flex flex-col justify-between font-sans text-left">
                <div>
                  <div className="flex gap-1.5 mb-3.5 text-amber-500">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-500" />)}
                  </div>
                  <div className="flex gap-1.5 align-top">
                    <span className="text-[32px] font-serif text-emerald-500 leading-none select-none font-black shrink-0">“</span>
                    <p className="text-[13px] lg:text-[15px] text-slate-600 dark:text-slate-300 italic leading-relaxed">
                      {test.quote}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-4.5 pt-3 border-t border-slate-100 dark:border-white/5">
                  <div className="w-[36px] h-[36px] rounded-full bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center font-semibold text-[14px] text-white uppercase shrink-0">
                    {test.author.substring(0, 2)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800 dark:text-white">{test.author}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{test.title}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8: FAQ ACCORDIONS (6 questions exactly as specified) */}
      <section id="faq" className="relative z-10 py-16 lg:py-24 px-5 md:px-8 lg:px-0 max-w-4xl mx-auto">
        <div className="text-center mb-16 select-none">
          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
            FAQ HUB
          </span>
          <h2 className="text-[24px] sm:text-[30px] lg:text-[40px] font-black tracking-tight text-slate-900 dark:text-white mt-2 leading-none">
            Frequently asked questions
          </h2>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-2 leading-relaxed">
            Resolve common general enquiries regarding the AppointFlow system.
          </p>
        </div>

        <div className="flex flex-col divide-y divide-slate-100 dark:divide-white/5 border-t border-b border-slate-100 dark:border-white/5">
          <FAQAccordionItem
            question="Is it really free to start?"
            answer="Yes, absolutely. The Starter plan provides up to 50 automated reminders per month and 1 staff specialist roster completely free of cost. No credit cards needed."
          />
          <FAQAccordionItem
            question="Which WhatsApp API do you use?"
            answer="AppointFlow integrates with official high-status Cloud WhatsApp Nodes to transmit verification alerts without lag. This guarantees consistent maximum delivery compliance rates."
          />
          <FAQAccordionItem
            question="Can I customize message templates?"
            answer="Of course! Inside your active Settings board, we formulate fully editable templates with tag placeholders such as {clientName} or {bookingTime} matching your specific brand persona."
          />
          <FAQAccordionItem
            question="How many staff members can I add?"
            answer="Starter plan lets you deploy 1 specialist. Our professional tier supports 10 concurrent team members, while the custom Enterprise package allows infinite specialist slots."
          />
          <FAQAccordionItem
            question="Is my data secure?"
            answer="We practice safe enterprise security, using end-to-end active HTTPS transport layers and cloud credentials parameters to securely hold customer calendar details."
          />
          <FAQAccordionItem
            question="Can I cancel anytime?"
            answer="Yes, quite easily. Your pro subscriptions can be downgraded or closed from the billing configuration menu inside Settings without arbitrary penalty codes."
          />
        </div>
      </section>

      {/* SECTION 9: CTA BANNER */}
      <section className="relative z-10 py-16 lg:py-24 px-5 md:px-8 lg:px-0 w-full max-w-7xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-800 dark:from-emerald-950 dark:to-slate-900 p-8 md:p-16 text-center shadow-2xl flex flex-col items-center gap-6 border border-emerald-500/20">
          
          {/* Subtle decoration overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1.5px,transparent_1.5px)] bg-[size:20px_20px] opacity-40" />

          <span className="relative z-10 text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest pl-1 py-1 rounded-full">
            SLASH CANCELLATIONS NOW
          </span>
          
          <h2 className="relative z-10 text-[26px] sm:text-[36px] lg:text-[48px] font-black tracking-tight text-white leading-tight max-w-2xl font-sans">
            Ready to eliminate no-shows?
          </h2>

          <p className="relative z-10 text-xs sm:text-sm md:text-base text-emerald-100/80 max-w-md mt-1 leading-relaxed">
            Join 500+ active cosmetic specialty centers and modern salons already scheduling client queues automatically.
          </p>

          <MagneticButton
            onClick={onGetStarted}
            className="relative z-10 mt-4 px-9 py-4 font-bold bg-white text-emerald-950 font-sans hover:bg-emerald-550 rounded-xl text-sm transition-all shadow-xl shadow-emerald-900/30 font-extrabold flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02]"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4 text-emerald-800" />
          </MagneticButton>

          <span className="relative z-10 text-[10px] font-semibold text-emerald-200/60 font-mono tracking-wide">
            Instant 2 minute setup • No credit card required
          </span>
        </div>
      </section>

      {/* SECTION 10: FOOTER BRANDING CARD */}
      <footer className="relative z-10 border-t border-slate-100 dark:border-white/5 bg-slate-50/80 dark:bg-slate-950 px-5 md:px-8 py-16 w-full select-none text-[12px] text-slate-500 dark:text-slate-400 font-sans">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-5 gap-y-10 gap-x-6 lg:gap-12 mb-12">
          
          {/* Branding column */}
          <div className="col-span-2 flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <Bot className="w-4.5 h-4.5" />
              </div>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">AppointFlow</span>
            </div>
            <p className="leading-relaxed text-slate-400 dark:text-slate-500 max-w-xs">
              The direct-to-device WhatsApp client auto-scheduling platform designed precisely for elite specialty barbers and busy aesthetic salons.
            </p>
            
            {/* Social media links rows */}
            <div className="flex items-center gap-4 mt-2">
              <a href="#" className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-emerald-500 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-emerald-500 transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-emerald-500 transition-colors">
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div className="col-span-1 flex flex-col gap-3 font-semibold">
            <span className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">Product</span>
            <a href="#key-features" className="hover:text-emerald-500 transition-colors">Engine Features</a>
            <a href="#how-it-works" className="hover:text-emerald-500 transition-colors">Step Guide</a>
            <a href="#pricing" className="hover:text-emerald-500 transition-colors">Pricing Options</a>
            <a href="#testimonials" className="hover:text-emerald-500 transition-colors">Partner Stories</a>
          </div>

          {/* Company Links */}
          <div className="col-span-1 flex flex-col gap-3 font-semibold">
            <span className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">Company</span>
            <a href="#" className="hover:text-emerald-500 transition-colors">About Us</a>
            <a href="#" className="hover:text-emerald-500 transition-colors">Roster Careers</a>
            <a href="#" className="hover:text-emerald-500 transition-colors">Press Portfolio</a>
            <a href="#" className="hover:text-emerald-500 transition-colors">Status Node</a>
          </div>

          {/* Resources & Legal Links */}
          <div className="col-span-1 flex flex-col gap-3 font-semibold">
            <span className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">Resources</span>
            <a href="#" className="hover:text-emerald-500 transition-colors">Support Center</a>
            <a href="#" className="hover:text-emerald-500 transition-colors">API Keys Reference</a>
            <a href="#" className="hover:text-emerald-500 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-emerald-500 transition-colors">Terms of Operations</a>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 font-medium">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-center sm:text-left text-[12px] text-slate-400 dark:text-slate-500">
            <span>© 1999–2026 AppointFlow Applet Inc. All rights reserved.</span>
            <span className="hidden sm:inline text-slate-200 dark:text-white/10">|</span>
            <span>Designed & Developed by <a href="https://nexorawebz.com" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-500 dark:hover:text-emerald-400 underline decoration-emerald-500/30 transition-all duration-200">nexorawebz.com</a></span>
          </div>
          <div className="flex items-center gap-1 text-[12px] text-slate-400 dark:text-slate-500">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
            <span>for elite schedulers worldwide.</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
