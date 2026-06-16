import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface IntroSplashProps {
  onComplete: () => void;
}

export default function IntroSplash({ onComplete }: IntroSplashProps) {
  const [isSeen, setIsSeen] = useState(false);
  const [phase, setPhase] = useState(1); // 1: dot pulses, 2: logo scales, 3: text types, 4: tagline fades, 5: burst & fade out

  useEffect(() => {
    // Check session storage seen code
    if (sessionStorage.getItem("appointflow_splash_seen") === "true") {
      setIsSeen(true);
      onComplete();
      return;
    }

    // Phase timers relative to start
    const t2 = setTimeout(() => setPhase(2), 600);   // Phase 2 at 600ms
    const t3 = setTimeout(() => setPhase(3), 1400);  // Phase 3 at 1400ms
    const t4 = setTimeout(() => setPhase(4), 2200);  // Phase 4 at 2200ms
    const t5 = setTimeout(() => setPhase(5), 2800);  // Phase 5 at 2800ms
    const tEnd = setTimeout(() => {
      sessionStorage.setItem("appointflow_splash_seen", "true");
      onComplete();
    }, 3200); // Sequence complete

    return () => {
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(tEnd);
    };
  }, [onComplete]);

  if (isSeen) return null;

  // Set up particle scatter locations
  const particles = Array.from({ length: 12 }).map((_, i) => {
    const angle = (i * 360) / 12 + (Math.random() * 15 - 7.5); // distribute with dynamic variation
    const rad = (angle * Math.PI) / 180;
    const distance = 90 + Math.random() * 40; // outward distance
    const x = Math.cos(rad) * distance;
    const y = Math.sin(rad) * distance;
    return { id: i, x, y };
  });

  const word = "AppointFlow";

  return (
    <AnimatePresence>
      {phase < 6 && (
        <motion.div
          id="intro-splash-container"
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#000000]"
          style={{
            background: "radial-gradient(circle, rgba(37,211,102,0.08) 0%, rgba(0,0,0,1) 100%)"
          }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          animate={phase === 5 ? { opacity: 0 } : { opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          {/* Centered Stage Content */}
          <div className="relative flex flex-col items-center justify-center">
            
            {/* Phase 1 Center Dot */}
            {phase === 1 && (
              <motion.div
                className="w-4.5 h-4.5 rounded-full bg-[#25D366]"
                animate={{ scale: [1, 1.8, 1], opacity: [0.3, 1, 1] }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              />
            )}

            {/* Phase 2+ Shield Logo */}
            {phase >= 2 && (
              <motion.div
                className="relative"
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 120, 
                  damping: 14,
                  delay: 0 
                }}
              >
                {/* Logo Glowing ring effect */}
                <div className="absolute inset-0 bg-[#25D366]/30 blur-2xl rounded-full scale-125" />
                
                {/* SVG Shield shape inside a clean container */}
                <svg 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  className="w-16 h-16 text-[#25D366] relative z-10 filter drop-shadow-[0_0_12px_rgba(37,211,102,0.5)]" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="currentColor" fillOpacity="0.12" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </motion.div>
            )}

            {/* Phase 3+ Letter Transmissions Typewriter */}
            {phase >= 3 && (
              <div className="flex justify-center items-center mt-6 z-10">
                {word.split("").map((letter, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.25,
                      delay: i * 0.06,
                      ease: "easeOut"
                    }}
                    className="text-[32px] font-bold text-white tracking-tight"
                    style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
                  >
                    {letter}
                  </motion.span>
                ))}
              </div>
            )}

            {/* Phase 4+ Tagline Presentation */}
            {phase >= 4 && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-[14px] uppercase tracking-[0.2em] text-[#25D366]/70 mt-2 font-medium z-10"
                style={{ fontFamily: '"Inter", sans-serif' }}
              >
                Smart reminders. Zero no-shows.
              </motion.p>
            )}

            {/* Phase 5 Center Particle Burst */}
            {phase === 5 && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none w-1 h-1">
                {particles.map((p) => (
                  <motion.div
                    key={p.id}
                    className="absolute w-1.5 h-1.5 rounded-full bg-[#25D366]"
                    initial={{ x: 0, y: 0, opacity: 1 }}
                    animate={{ x: p.x, y: p.y, opacity: 0, scale: 0.3 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                ))}
              </div>
            )}

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
