import { motion, AnimatePresence } from "motion/react";
import { Booking } from "../types";
import { 
  CalendarCheck, 
  Hourglass, 
  Spinner, 
  PaperPlaneTilt, 
  CheckCircle, 
  ArrowsClockwise, 
  XCircle, 
  Clock 
} from "@phosphor-icons/react";
import LottiePlayer from "./LottiePlayer";

interface AnimatedListProps {
  bookings: Booking[];
  onSelectBooking: (booking: Booking) => void;
  selectedBookingId?: string | null;
}

export default function AnimatedList({
  bookings,
  onSelectBooking,
  selectedBookingId,
}: AnimatedListProps) {
  
  const getStatusStyle = (status: Booking['status']) => {
    switch (status) {
      case "pending":
        return {
          bg: "bg-amber-500/10 dark:bg-amber-500/10",
          border: "border-amber-500/20 dark:border-amber-500/30",
          text: "text-amber-600 dark:text-amber-400",
          icon: Hourglass,
          label: "Draft Ready",
          dotColor: "bg-amber-500",
        };
      case "queued":
        return {
          bg: "bg-sky-500/10 dark:bg-sky-500/10",
          border: "border-sky-500/20 dark:border-sky-500/30",
          text: "text-sky-600 dark:text-sky-400",
          icon: Spinner,
          label: "In Queue",
          dotColor: "bg-sky-500 animate-pulse",
        };
      case "sent":
        return {
          bg: "bg-emerald-500/10",
          border: "border-emerald-500/20",
          text: "text-emerald-600 dark:text-emerald-400",
          icon: PaperPlaneTilt,
          label: "Sent",
          dotColor: "bg-emerald-500",
        };
      case "confirmed":
        return {
          bg: "bg-emerald-100 dark:bg-emerald-500/15",
          border: "border-emerald-200 dark:border-emerald-500/30",
          text: "text-emerald-700 dark:text-emerald-400 text-glow-green",
          icon: CheckCircle,
          label: "Confirmed ✅",
          dotColor: "bg-emerald-500 animate-ping",
        };
      case "rescheduled":
        return {
          bg: "bg-purple-500/10",
          border: "border-purple-500/30",
          text: "text-purple-600 dark:text-purple-400",
          icon: ArrowsClockwise,
          label: "Rescheduled",
          dotColor: "bg-purple-500",
        };
      case "cancelled":
        return {
          bg: "bg-rose-500/10",
          border: "border-rose-500/30",
          text: "text-rose-600 dark:text-rose-400",
          icon: XCircle,
          label: "Cancelled",
          dotColor: "bg-rose-500",
        };
    }
  };

  return (
    <div className="flex flex-col gap-3 min-h-[300px]" id="appointflow-animated-reminder-list">
      <div className="flex items-center justify-between pb-2 border-b border-[#f3f4f6] dark:border-white/5">
        <h3 className="text-sm font-semibold text-[#111827] dark:text-white/80 tracking-wide font-sans flex items-center gap-2">
          <CalendarCheck className="w-5 h-5 text-[#25D366] nav-icon" weight="duotone" />
          ACTIVE REMINDER QUEUE ({bookings.length})
        </h3>
        <span className="text-[10px] bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-full text-slate-500 dark:text-white/40 font-mono">
          REAL-TIME ENGINE
        </span>
      </div>

      <div className="relative overflow-y-auto max-h-[420px] pr-1 flex flex-col gap-2">
        <AnimatePresence mode="popLayout">
          {bookings.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12 text-center text-[#6b7280] dark:text-white/40"
              id="empty-queue-visual"
            >
              <LottiePlayer 
                src="https://lottie.host/80fe03c1-01f1-4322-902c-fa20d1faf5eb/eQ66I7GvWb.json" 
                className="w-24 h-24 mb-3"
                loop={true}
              />
              <p className="text-xs font-semibold">No active bookings in queue.</p>
              <p className="text-[11px] text-[#9ca3af] dark:text-white/20 mt-1 uppercase tracking-wider">Add a booking above to fire up AI engine.</p>
            </motion.div>
          ) : (
            bookings.map((booking, index) => {
              const style = getStatusStyle(booking.status);
              const isSelected = selectedBookingId === booking.id;
              const IconComponent = style.icon;

              return (
                <motion.div
                  key={booking.id}
                  layoutId={`booking-card-${booking.id}`}
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0, 
                    scale: 1,
                    transition: { delay: index * 0.04 }
                  }}
                  exit={{ opacity: 0, scale: 0.9, x: -50, transition: { duration: 0.3 } }}
                  onClick={() => onSelectBooking(booking)}
                  className={`p-3.5 rounded-2xl cursor-pointer text-left transition-all relative ${
                    isSelected 
                      ? "bg-[#16a34a]/10 border border-[#25D366] shadow-lg dark:shadow-emerald-950/20" 
                      : "bg-[#141a23]/5 hover:bg-[#141a23]/10 dark:bg-white/[0.02] dark:hover:bg-white/[0.05] border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10"
                  }`}
                  id={`reminder-row-${booking.id}`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm text-[#111827] dark:text-white flex items-center gap-1.5 font-sans">
                        {booking.clientName}
                      </h4>
                      <span className="text-[10px] text-[#6b7280] dark:text-white/40 font-mono">
                        {booking.phone}
                      </span>
                    </div>

                    <div className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 border uppercase ${style.bg} ${style.border} ${style.text}`}>
                      <IconComponent className={`w-3.5 h-3.5 ${booking.status === "queued" ? "animate-spin" : ""}`} weight="duotone" />
                      {style.label}
                    </div>
                  </div>

                  <p className="text-xs text-[#374151] dark:text-white/60 line-clamp-1 mb-2 font-sans">
                    {booking.serviceDesc}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-[#6b7280] dark:text-white/40">
                    <span className="font-mono bg-slate-100 dark:bg-white/[0.03] px-2 py-0.5 rounded border border-slate-200 dark:border-white/5">
                      📅 {booking.dateTime} | {booking.timeSlot}
                    </span>
                    <span className="text-[10px] opacity-75">
                      Tone: <span className="text-[#374151] dark:text-white/60">{booking.aiTone}</span>
                    </span>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
