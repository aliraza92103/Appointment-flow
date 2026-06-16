import React from "react";
import { LockSimple, ArrowRight } from "@phosphor-icons/react";

interface PlanGuardProps {
  feature: string;
  userPlan: string;
  requiredPlan: "pro" | "agency";
  children: React.ReactNode;
}

// Wraps any component — shows upgrade prompt
// if user does not have required plan
export function PlanGuard({ 
  feature, 
  userPlan, 
  requiredPlan, 
  children 
}: PlanGuardProps) {
  const hierarchy = { free: 0, pro: 1, agency: 2 };
  const hasAccess = 
    hierarchy[userPlan as keyof typeof hierarchy] >= 
    hierarchy[requiredPlan];

  if (hasAccess) return <>{children}</>;

  return (
    <div className="relative">
      {/* Blurred content behind */}
      <div className="pointer-events-none blur-sm opacity-40 
        select-none">
        {children}
      </div>
      
      {/* Upgrade overlay */}
      <div className="absolute inset-0 flex flex-col 
        items-center justify-center rounded-xl
        bg-black/60 backdrop-blur-sm border
        border-white/10 p-6 text-center">
        
        <div className="p-3 rounded-full 
          bg-green-500/10 border border-green-500/20 mb-4">
          <LockSimple 
            weight="duotone" 
            size={28} 
            className="text-green-400" 
          />
        </div>
        
        <h3 className="text-white font-semibold text-base mb-1">
          {requiredPlan === "pro" ? "Pro" : "Agency"} Feature
        </h3>
        
        <p className="text-white/50 text-sm mb-4 max-w-[200px]">
          {feature} is available on the{" "}
          {requiredPlan === "pro" ? "Pro ($20/mo)" : "Agency ($49/mo)"}{" "}
          plan and above
        </p>
        
        <button
          onClick={() => {
            const el = document.getElementById("pricing");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
          className="flex items-center gap-2 px-4 py-2 
            bg-emerald-500 hover:bg-emerald-400 
            text-black font-semibold text-sm 
            rounded-lg transition-all duration-200 cursor-pointer"
        >
          Upgrade Now
          <ArrowRight weight="bold" size={14} />
        </button>
      </div>
    </div>
  );
}

// Simple hook to check plan
export function usePlan(userPlan: string) {
  const hierarchy = { free: 0, pro: 1, agency: 2 };
  const level = hierarchy[userPlan as keyof typeof hierarchy] || 0;

  return {
    isFree: level === 0,
    isPro: level >= 1,
    isAgency: level >= 2,
    canUse: (required: "free" | "pro" | "agency") =>
      level >= hierarchy[required],
  };
}
