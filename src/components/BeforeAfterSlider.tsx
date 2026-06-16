import React, { useState, useRef, useEffect } from "react";
import {
  XCircle,
  CheckCircle,
  SmileySad,
  Clock,
  BellSlash,
  UserMinus,
  CurrencyDollar,
  Phone,
  ArrowLeft,
  ArrowRight,
  Checks,
  UserCheck,
  Lightning,
  TrendDown,
  Timer,
  DeviceMobile
} from "@phosphor-icons/react";

interface AnimatedNumberProps {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  trigger: boolean;
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  suffix = "",
  prefix = "",
  duration = 1800,
  trigger
}) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!trigger) return;
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out quad
      const easedProgress = progress * (2 - progress);
      setCurrent(Math.floor(easedProgress * value));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCurrent(value);
      }
    };
    window.requestAnimationFrame(step);
  }, [value, duration, trigger]);

  return (
    <span className="bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-emerald-300">
      {prefix}{current}{suffix}
    </span>
  );
};

export default function BeforeAfterSlider() {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  // Live tracked container width to handle clip mask matching flawlessly on all viewports
  const [containerWidth, setContainerWidth] = useState(900);

  // States for stats trigger
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Track container width dynamically on resize to avoid shifting content layout
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });
    
    observer.observe(containerRef.current);
    
    // Read initial width
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width > 0) {
      setContainerWidth(rect.width);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setStatsVisible(true);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, []);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.min(Math.max((x / rect.width) * 100, 5), 95);
    setSliderPos(pct);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    handleMove(e.clientX);
    document.addEventListener("mousemove", handleGlobalMouseMove);
    document.addEventListener("mouseup", handleGlobalMouseUp);
  };

  const handleGlobalMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return;
    handleMove(e.clientX);
  };

  const handleGlobalMouseUp = () => {
    isDragging.current = false;
    document.removeEventListener("mousemove", handleGlobalMouseMove);
    document.removeEventListener("mouseup", handleGlobalMouseUp);
  };

  // Touch Events for mobile, ensuring 0 jitter and no scrolling issues
  const handleTouchStart = (e: React.TouchEvent) => {
    isDragging.current = true;
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
  };

  return (
    <section className="relative z-10 py-16 lg:py-24 px-5 md:px-8 lg:px-0 max-w-7xl mx-auto" id="difference-slider-section">
      {/* SECTION WRAPPER HEADER */}
      <div className="text-center mb-12">
        <h2 
          className="text-[28px] sm:text-[34px] lg:text-[44px] font-black tracking-tight text-slate-900 dark:text-white leading-tight animate-fade-in" 
          style={{ fontFamily: '"Bricolage Grotesque", sans-serif' }}
          id="slider-heading"
        >
          See the difference
        </h2>
        <p className="text-[14px] sm:text-[16px] text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mt-3 font-sans font-medium" id="slider-subheading">
          Businesses using AppointFlow report 94% fewer no-shows in the first month
        </p>
      </div>

      {/* THE SLIDER CONTAINER - TOUCH-ACTION NONE PREVENTS MOBILE SCROLL INTERFERENCE */}
      <div 
        ref={containerRef}
        className="relative mx-auto max-w-[900px] h-[320px] md:h-[420px] rounded-[20px] overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 shadow-[0_0_60px_rgba(34,197,94,0.08)] select-none touch-none"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        id="interactive-comparison-slider"
        style={{ cursor: isDragging.current ? "col-resize" : "default" }}
      >
        {/* LEFT PANEL: BEFORE */}
        <div 
          className="absolute inset-y-0 left-0 overflow-hidden bg-red-500/[0.03] dark:bg-red-500/[0.04]"
          style={{ width: `${sliderPos}%` }}
        >
          {/* Inner div wrapper must have real-time dynamic track width so it doesn't squash on resizing */}
          <div className="absolute inset-y-0 left-0 p-4 md:p-6 flex flex-col justify-between" style={{ width: containerWidth }}>
            {/* Top Badge */}
            <div className="self-start flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-[11px] md:text-xs font-bold text-red-500">
              <XCircle weight="fill" size={14} color="#ef4444" />
              <span>Without AppointFlow</span>
            </div>

            {/* Core Content */}
            <div className="flex flex-col gap-2 md:gap-4 my-auto max-w-[340px] md:max-w-md">
              {/* Row 1 - Problem */}
              <div className="flex items-center gap-2 md:gap-3">
                <SmileySad weight="duotone" size={24} color="#ef4444" className="shrink-0" />
                <span className="text-[11px] md:text-[13px] text-slate-500 dark:text-slate-400 font-medium font-sans">Client reaching out manually</span>
              </div>

              {/* Row 2 - Chat Bubble */}
              <div className="self-start bg-slate-200/60 dark:bg-white/5 rounded-[12px] md:rounded-[16px] rounded-bl-[4px] px-3.5 py-2 md:px-4 md:py-3 border border-slate-300/30 dark:border-white/5 shadow-xs">
                <p className="text-[11.5px] md:text-[13px] text-slate-800 dark:text-slate-200 leading-normal font-sans">
                  Hi, is my 3pm appointment confirmed?
                </p>
                <div className="flex items-center gap-1 mt-1 text-[9px] md:text-[10px] text-slate-400 dark:text-slate-500 font-sans">
                  <Clock size={10} />
                  <span>10:23 AM</span>
                </div>
              </div>

              {/* Row 3 - No reply indicator */}
              <div className="flex items-center gap-2 bg-red-500/[0.06] border border-dashed border-red-500/30 rounded-lg p-2 md:p-3">
                <BellSlash weight="duotone" size={14} color="#ef4444" className="shrink-0" />
                <span className="text-[10.5px] md:text-[12px] font-semibold text-red-500 font-sans">No reminder was sent</span>
              </div>

              {/* Row 4 - Result Stats */}
              <div className="hidden md:flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[13px] text-slate-500 dark:text-slate-400 font-medium font-sans">
                  <UserMinus weight="duotone" size={16} color="#ef4444" className="shrink-0" />
                  <span>3 no-shows today</span>
                </div>
                <div className="flex items-center gap-2 text-[13px] text-slate-500 dark:text-slate-400 font-medium font-sans">
                  <CurrencyDollar weight="duotone" size={16} color="#ef4444" className="shrink-0" />
                  <span>$180 revenue lost</span>
                </div>
                <div className="flex items-center gap-2 text-[13px] text-slate-500 dark:text-slate-400 font-medium font-sans">
                  <Phone weight="duotone" size={16} color="#ef4444" className="shrink-0" />
                  <span>45 min spent on manual calls</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: AFTER */}
        <div 
          className="absolute inset-y-0 right-0 overflow-hidden bg-emerald-500/[0.03] dark:bg-emerald-500/[0.04]"
          style={{ width: `${100 - sliderPos}%` }}
        >
          {/* Inner div wrapper must also have real-time dynamic track width and stay anchored to right */}
          <div className="absolute inset-y-0 right-0 p-4 md:p-6 flex flex-col justify-between" style={{ width: containerWidth }}>
            {/* Top Badge */}
            <div className="self-end flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] md:text-xs font-bold text-emerald-500">
              <CheckCircle weight="fill" size={14} color="#22c55e" />
              <span>With AppointFlow</span>
            </div>

            {/* Core Content */}
            <div className="flex flex-col gap-2 md:gap-4 my-auto max-w-[340px] md:max-w-md ml-auto text-right items-end">
              {/* Row 1 - Sender Status */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] md:text-[12px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5 font-sans">
                  <svg width="12" height="14" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-emerald-500 shrink-0">
                    <path d="M8 0L0 3V9C0 14 3.5 16.5 8 18C12.5 16.5 16 14 16 9V3L8 0ZM8 15.8C4.5 14.5 2 12.1 2 9V4.5L8 2.2L14 4.5V9C14 12.1 11.5 14.5 8 15.8Z" fill="currentColor"/>
                  </svg>
                  AppointFlow sent automatically
                </span>
              </div>

              {/* Row 2 - Outgoing Green WhatsApp Bubble */}
              <div className="self-end max-w-[240px] md:max-w-[280px] bg-[#25D366] dark:bg-[#1ea952] rounded-[12px] md:rounded-[16px] rounded-br-[4px] px-3.5 py-2 md:px-4 md:py-3 shadow-md border-r-4 border-emerald-600 dark:border-emerald-700 text-left">
                <p className="text-[11px] md:text-[12.5px] text-white font-medium leading-relaxed font-sans">
                  Hi Sarah! Reminder: Your Haircut appointment with Ahmed is tomorrow at 3:00 PM. Reply YES to confirm.
                </p>
                <div className="flex items-center justify-end gap-1.5 mt-1.5 text-[9px] md:text-[10px] text-white/80 font-sans">
                  <span>9:00 AM</span>
                  <div className="flex items-center gap-1">
                    <Checks weight="fill" size={12} color="rgba(255,255,255,0.9)" />
                    <span>Delivered</span>
                  </div>
                </div>
              </div>

              {/* Row 3 - Reply Bubble */}
              <div className="self-start text-left bg-slate-200/60 dark:bg-white/5 rounded-[12px] md:rounded-[16px] rounded-bl-[4px] px-3.5 py-1.5 md:px-4 md:py-2 border border-slate-300/30 dark:border-white/5 shadow-xs">
                <p className="text-[11px] md:text-[12.5px] text-slate-800 dark:text-slate-200 leading-normal font-sans">
                  YES confirmed! See you tomorrow
                </p>
                <div className="flex items-center gap-1 mt-1 text-[9px] md:text-[10px] text-slate-400 dark:text-slate-500 font-sans">
                  <Clock size={10} />
                  <span>9:04 AM</span>
                </div>
              </div>

              {/* Row 4 - Result Stats */}
              <div className="hidden md:flex flex-col gap-2 text-right items-end">
                <div className="flex items-center gap-2 text-[13px] text-slate-500 dark:text-slate-400 font-medium font-sans">
                  <span>0 no-shows today</span>
                  <UserCheck weight="duotone" size={16} color="#22c55e" className="shrink-0" />
                </div>
                <div className="flex items-center gap-2 text-[13px] text-slate-500 dark:text-slate-400 font-medium font-sans">
                  <span>$180 revenue protected</span>
                  <CurrencyDollar weight="duotone" size={16} color="#22c55e" className="shrink-0" />
                </div>
                <div className="flex items-center gap-2 text-[13px] text-slate-500 dark:text-slate-400 font-medium font-sans">
                  <span>Fully automated, 0 min spent</span>
                  <Lightning weight="duotone" size={16} color="#22c55e" className="shrink-0" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DRAG DIVIDER */}
        <div 
          className="absolute inset-y-0 w-[2px] pointer-events-none z-30"
          style={{ 
            left: `${sliderPos}%`,
            background: "linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.4) 20%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0.4) 80%, transparent)" 
          }}
        />

        {/* DRAG HANDLE CIRCLE */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-11 h-11 bg-white dark:bg-slate-950 border-2 border-emerald-500 rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.3)] z-40 select-none cursor-grab active:cursor-grabbing hover:scale-105 active:scale-95 transition-transform duration-100 touch-none"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="flex items-center gap-[2px]">
            <ArrowLeft weight="bold" size={12} color="#22c55e" />
            <ArrowRight weight="bold" size={12} color="#22c55e" />
          </div>
        </div>
      </div>

      {/* RESULTS STATS BAR */}
      <div 
        ref={statsRef}
        className="mt-16 max-w-5xl mx-auto"
        id="stats-metrics-bar"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-6 md:gap-4 items-center justify-center">
          
          {/* Stat 1 */}
          <div className="flex flex-col items-center text-center self-start">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 mb-2">
              <TrendDown weight="duotone" size={24} color="#22c55e" />
            </div>
            <div className="text-[34px] md:text-[48px] font-black tracking-tight leading-none animate-fade-in" style={{ fontFamily: '"Bricolage Grotesque", sans-serif' }}>
              <AnimatedNumber value={94} suffix="%" trigger={statsVisible} />
            </div>
            <span className="text-[12px] md:text-[14px] text-slate-400 dark:text-slate-500 mt-1.5 font-medium font-sans">
              Fewer No-shows
            </span>
          </div>

          {/* Divider 1 */}
          <div className="hidden md:block h-12 w-px bg-slate-200 dark:bg-white/10 self-center mx-auto" />

          {/* Stat 2 */}
          <div className="flex flex-col items-center text-center self-start">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 mb-2">
              <CurrencyDollar weight="duotone" size={24} color="#22c55e" />
            </div>
            <div className="text-[34px] md:text-[48px] font-black tracking-tight leading-none animate-fade-in" style={{ fontFamily: '"Bricolage Grotesque", sans-serif' }}>
              <AnimatedNumber value={340} prefix="$" trigger={statsVisible} />
            </div>
            <span className="text-[12px] md:text-[14px] text-slate-400 dark:text-slate-500 mt-1.5 font-medium font-sans">
              Avg Monthly Saved
            </span>
          </div>

          {/* Divider 2 */}
          <div className="hidden md:block h-12 w-px bg-slate-200 dark:bg-white/10 self-center mx-auto" />

          {/* Stat 3 */}
          <div className="flex flex-col items-center text-center self-start">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 mb-2">
              <Timer weight="duotone" size={24} color="#22c55e" />
            </div>
            <div className="text-[34px] md:text-[48px] font-black tracking-tight leading-none animate-fade-in" style={{ fontFamily: '"Bricolage Grotesque", sans-serif' }}>
              <AnimatedNumber value={2} suffix=" min" trigger={statsVisible} />
            </div>
            <span className="text-[12px] md:text-[14px] text-slate-400 dark:text-slate-500 mt-1.5 font-medium font-sans">
              Setup Time
            </span>
          </div>

          {/* Divider 3 */}
          <div className="hidden md:block h-12 w-px bg-slate-200 dark:bg-white/10 self-center mx-auto" />

          {/* Stat 4 */}
          <div className="flex flex-col items-center text-center self-start">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 mb-2">
              <DeviceMobile weight="duotone" size={24} color="#22c55e" />
            </div>
            <div className="text-[34px] md:text-[48px] font-black tracking-tight leading-none animate-fade-in" style={{ fontFamily: '"Bricolage Grotesque", sans-serif' }}>
              <AnimatedNumber value={98} suffix="%" trigger={statsVisible} />
            </div>
            <span className="text-[12px] md:text-[14px] text-slate-400 dark:text-slate-500 mt-1.5 font-medium font-sans">
              Delivery Rate
            </span>
          </div>

        </div>
      </div>
    </section>
  );
}
