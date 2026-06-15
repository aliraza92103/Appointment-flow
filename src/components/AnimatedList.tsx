import { motion, AnimatePresence } from "motion/react";
import { Booking } from "../types";
import { Calendar, CheckCircle2, AlertTriangle, Play, RefreshCw, XCircle, Clock } from "lucide-react";

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
          bg: "bg-amber-500/10",
          border: "border-amber-500/20",
          text: "text-amber-400",
          icon: Clock,
          label: "Draft Ready",
          dotColor: "bg-amber-400",
        };
      case "queued":
        return {
          bg: "bg-sky-500/10",
          border: "border-sky-500/20",
          text: "text-sky-400",
          icon: RefreshCw,
          label: "In Queue",
          dotColor: "bg-sky-400 animate-pulse",
        };
      case "sent":
        return {
          bg: "bg-emerald-500/10",
          border: "border-emerald-500/20",
          text: "text-emerald-400",
          icon: Play,
          label: "Sent",
          dotColor: "bg-emerald-400",
        };
      case "confirmed":
        return {
          bg: "bg-green-500/15",
          border: "border-green-500/30",
          text: "text-green-400 text-glow-green",
          icon: CheckCircle2,
          label: "Confirmed ✅",
          dotColor: "bg-green-400 animate-ping",
        };
      case "rescheduled":
        return {
          bg: "bg-purple-500/10",
          border: "border-purple-500/20",
          text: "text-purple-400",
          icon: RefreshCw,
          label: "Rescheduled",
          dotColor: "bg-purple-400",
        };
      case "cancelled":
        return {
          bg: "bg-rose-500/10",
          border: "border-rose-500/20",
          text: "text-rose-400",
          icon: XCircle,
          label: "Cancelled",
          dotColor: "bg-rose-400",
        };
    }
  };

  return (
    <div className="flex flex-col gap-3 min-h-[300px]" id="appointflow-animated-reminder-list">
      <div className="flex items-center justify-between pb-2 border-b border-white/5">
        <h3 className="text-sm font-semibold text-white/80 tracking-wide font-sans flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#25D366]" />
          ACTIVE REMINDER QUEUE ({bookings.length})
        </h3>
        <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full text-white/40 font-mono">
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
              className="flex flex-col items-center justify-center py-12 text-center text-white/40"
              id="empty-queue-visual"
            >
              <Clock className="w-8 h-8 opacity-25 mb-2 stroke-[1.5]" />
              <p className="text-xs">No active bookings in simulation queue.</p>
              <p className="text-[11px] text-white/20 mt-1 uppercase tracking-wider">Add a booking above to fire up AI engine.</p>
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
                      ? "bg-gradient-to-r from-emerald-500/10 to-[#25D366]/5 border border-[#25D366]/40 shadow-lg shadow-emerald-900/10" 
                      : "bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/10"
                  }`}
                  id={`reminder-row-${booking.id}`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm text-white flex items-center gap-1.5">
                        {booking.clientName}
                      </h4>
                      <span className="text-[10px] text-white/40 font-mono">
                        {booking.phone}
                      </span>
                    </div>

                    <div className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 border ${style.bg} ${style.border} ${style.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${style.dotColor}`} />
                      {style.label}
                    </div>
                  </div>

                  <p className="text-xs text-white/60 line-clamp-1 mb-2">
                    {booking.serviceDesc}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-white/40">
                    <span className="font-mono bg-white/[0.03] px-2 py-0.5 rounded border border-white/5">
                      📅 {booking.dateTime} | {booking.timeSlot}
                    </span>
                    <span className="text-[10px] opacity-75">
                      Tone: <span className="text-white/60">{booking.aiTone}</span>
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
