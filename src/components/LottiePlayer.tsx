import { useEffect, useState } from "react";
import Lottie from "lottie-react";

interface LottiePlayerProps {
  src: string;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
}

export default function LottiePlayer({ src, loop = true, autoplay = true, className = "" }: LottiePlayerProps) {
  const [animationData, setAnimationData] = useState<any>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(src)
      .then((res) => {
        if (!res.ok) throw new Error("HTTP error " + res.status);
        return res.json();
      })
      .then((data) => {
        if (active) {
          setAnimationData(data);
        }
      })
      .catch((err) => {
        console.warn("Lottie loading failed, using elegant fallback:", err);
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [src]);

  if (error) {
    // Elegant dynamic animated SVG helper as a fallback if the asset fails to download
    return (
      <div className={`flex items-center justify-center border border-[#16a34a]/10 bg-emerald-500/5 rounded-2xl ${className}`}>
        <svg className="w-12 h-12 text-emerald-500 animate-pulse" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" strokeDasharray="3 3"/>
          <path d="m15 9-6 6M9 9l6 6"/>
        </svg>
      </div>
    );
  }

  if (!animationData) {
    return <div className={`skeleton ${className}`} />;
  }

  return (
    <div className={className}>
      <Lottie animationData={animationData} loop={loop} autoplay={autoplay} />
    </div>
  );
}
