import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { 
  TrendingUp, 
  Calendar, 
  MessageSquare, 
  CheckCircle2, 
  Activity, 
  Send,
  ArrowUpRight,
  Clock,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { Booking } from "../types";
import { supabaseMock } from "../lib/supabase";

interface DashboardViewProps {
  bookings: Booking[];
  addLog: (text: string, type?: string) => void;
  webhookLogs: Array<{ time: string; text: string; type: string }>;
  onNavigate: (page: string) => void;
}

export default function DashboardView({ bookings, addLog, webhookLogs, onNavigate }: DashboardViewProps) {
  const [stats, setStats] = useState({
    totalBookings: 12,
    confirmedBookings: 8,
    remindersSent: 154,
    successRate: "92%"
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load statistics from server API or fall back local mock data
    fetch("/api/dashboard/stats")
      .then(res => res.json())
      .then(data => {
        setStats({
          totalBookings: data.totalBookings || bookings.length + 15,
          confirmedBookings: data.confirmedBookings || bookings.filter(b => b.status === "confirmed").length + 8,
          remindersSent: data.remindersSent || 154,
          successRate: data.successRate || "92%"
        });
        setLoading(false);
      })
      .catch(() => {
        // Safe localStorage client fallback
        const appts = supabaseMock.getAppointments();
        const rems = supabaseMock.getReminders();
        const confirmed = appts.filter(a => a.status === "confirmed").length;
        const total = appts.length + 12;
        const sent = rems.length + 120;
        const success = ((rems.filter(r => r.status === "delivered").length / Math.max(rems.length, 1)) * 100).toFixed(0);

        setStats({
          totalBookings: total,
          confirmedBookings: confirmed + 8,
          remindersSent: sent,
          successRate: `${success}%`
        });
        setLoading(false);
      });
  }, [bookings]);

  // Recharts Data Series
  const lineChartData = [
    { name: "Mon", count: 8 },
    { name: "Tue", count: 12 },
    { name: "Wed", count: 15 },
    { name: "Thu", count: 10 },
    { name: "Fri", count: 18 },
    { name: "Sat", count: 24 },
    { name: "Sun", count: 14 }
  ];

  const pieChartData = [
    { name: "Delivered", value: stats.confirmedBookings + 54, color: "#10b981" },
    { name: "Pending", value: 12, color: "#f59e0b" },
    { name: "Failed", value: 6, color: "#ef4444" }
  ];

  return (
    <div className="flex flex-col gap-6" id="appointflow-dashboard-screen">
      {/* Page Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#111827] dark:text-white">Main Console</h2>
          <p className="text-xs text-[#6b7280] dark:text-slate-400">Aesthetic workspace for managing client reservations.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-[11px] font-mono tracking-wider font-semibold bg-[#f0fdf4] dark:bg-emerald-500/10 text-[#16a34a] dark:text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/20">LIVE WEBHOOKS CONNECTED</span>
        </div>
      </div>

      {/* Grid: 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* STAT 1 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#141a23]/55 border border-[#e2e8f0] dark:border-white/5 shadow-[0_1px_3px_rgba(0,0,0,0.1)] dark:shadow-none flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 dark:opacity-20 group-hover:scale-110 transition-transform">
            <Calendar className="w-12 h-12 text-[#9ca3af] dark:text-slate-400" />
          </div>
          <span className="text-[11px] font-semibold text-[#6b7280] dark:text-slate-400 font-mono uppercase tracking-wider">Total Scheduled</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-[#111827] dark:text-white">
              {loading ? "..." : stats.totalBookings}
            </span>
            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded-full font-bold font-mono">
              +14%
            </span>
          </div>
          <p className="text-[10px] text-[#6b7280] dark:text-slate-400">Total appointments parsed this cycle</p>
        </div>

        {/* STAT 2 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#141a23]/55 border border-[#e2e8f0] dark:border-white/5 shadow-[0_1px_3px_rgba(0,0,0,0.1)] dark:shadow-none flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 dark:opacity-20 group-hover:scale-110 transition-transform">
            <CheckCircle2 className="w-12 h-12 text-[#9ca3af] dark:text-slate-400" />
          </div>
          <span className="text-[11px] font-semibold text-[#6b7280] dark:text-slate-400 font-mono uppercase tracking-wider">Confirmed Slots</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-[#111827] dark:text-white">
              {loading ? "..." : stats.confirmedBookings}
            </span>
            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded-full font-bold font-mono">
              +22%
            </span>
          </div>
          <p className="text-[10px] text-[#6b7280] dark:text-slate-400">Responded with status 1 on chat</p>
        </div>

        {/* STAT 3 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#141a23]/55 border border-[#e2e8f0] dark:border-white/5 shadow-[0_1px_3px_rgba(0,0,0,0.1)] dark:shadow-none flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 dark:opacity-20 group-hover:scale-110 transition-transform">
            <MessageSquare className="w-12 h-12 text-[#9ca3af] dark:text-slate-400" />
          </div>
          <span className="text-[11px] font-semibold text-[#6b7280] dark:text-slate-400 font-mono uppercase tracking-wider">WhatsApp Sent</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-[#111827] dark:text-white">
              {loading ? "..." : stats.remindersSent}
            </span>
            <span className="text-[10px] bg-sky-100 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 px-1.5 py-0.5 rounded-full font-bold font-mono">
              +8%
            </span>
          </div>
          <p className="text-[10px] text-[#6b7280] dark:text-slate-400">Notifications successfully published</p>
        </div>

        {/* STAT 4 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#141a23]/55 border border-[#e2e8f0] dark:border-white/5 shadow-[0_1px_3px_rgba(0,0,0,0.1)] dark:shadow-none flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 dark:opacity-20 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="text-[11px] font-semibold text-[#6b7280] dark:text-slate-400 font-mono uppercase tracking-wider">Delivery Rate</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-glow-green dark:text-emerald-400">
              {loading ? "..." : stats.successRate}
            </span>
            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded-full font-bold font-mono">
              Active
            </span>
          </div>
          <p className="text-[10px] text-[#6b7280] dark:text-slate-400">Successful chat session deliverability</p>
        </div>
      </div>

      {/* Grid: Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LINE CHART: Weekly Load */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-white dark:bg-[#141a23]/55 border border-[#e2e8f0] dark:border-white/5 shadow-[0_1px_3px_rgba(0,0,0,0.1)] dark:shadow-none flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#f3f4f6] dark:border-white/5">
            <div className="flex flex-col">
              <span className="text-xs font-mono font-bold tracking-wider text-emerald-600 dark:text-emerald-400">LOAD DISTRIBUTION</span>
              <h3 className="text-sm font-semibold text-[#111827] dark:text-white">Weekly Scheduled Load</h3>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
                <XAxis dataKey="name" stroke="var(--chart-axis)" fontSize={10} tickLine={false} />
                <YAxis stroke="var(--chart-axis)" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--glass-bg-heavy)",
                    borderColor: "var(--border-color)",
                    color: "var(--text-primary)",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                  itemStyle={{ color: "var(--text-primary)" }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#16a34a"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#16a34a" }}
                  activeDot={{ r: 6, fill: "#16a34a" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PIE CHART: Reminder statuses */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#141a23]/55 border border-[#e2e8f0] dark:border-white/5 shadow-[0_1px_3px_rgba(0,0,0,0.1)] dark:shadow-none flex flex-col gap-4">
          <div className="flex flex-col pb-2 border-b border-[#f3f4f6] dark:border-white/5">
            <span className="text-xs font-mono font-bold tracking-wider text-sky-600 dark:text-sky-400">MESSAGE PERFORMANCE</span>
            <h3 className="text-sm font-semibold text-[#111827] dark:text-white">Reminder Status Logs</h3>
          </div>
          <div className="h-44 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label */}
            <div className="absolute flex flex-col items-center">
              <span className="text-lg font-bold text-[#111827] dark:text-white">172</span>
              <span className="text-[9px] font-mono tracking-wider uppercase text-[#6b7280] dark:text-slate-400">Dispatched</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 mt-2">
            {pieChartData.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-[#6b7280] dark:text-slate-400 font-sans">{d.name}</span>
                </div>
                <span className="font-semibold font-mono text-[#111827] dark:text-white">{d.value} logs</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent List Table & Logs Console */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table: Recent bookings */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-white dark:bg-[#141a23]/55 border border-[#e2e8f0] dark:border-white/5 shadow-[0_1px_3px_rgba(0,0,0,0.1)] dark:shadow-none flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#f3f4f6] dark:border-white/5">
            <div className="flex flex-col">
              <span className="text-xs font-mono font-bold tracking-wider text-emerald-600 dark:text-emerald-400">APPOINTMENTS INDEX</span>
              <h3 className="text-sm font-semibold text-[#111827] dark:text-white">Recent Booking Operations</h3>
            </div>
            <button
              onClick={() => onNavigate("Appointments")}
              className="text-xs text-[#16a34a] dark:text-emerald-500 hover:underline cursor-pointer flex items-center gap-1 font-mono"
            >
              See all
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#f3f4f6] dark:border-white/5 text-[#6b7280] dark:text-slate-400">
                  <th className="py-2.5 font-semibold font-mono">CUSTOMER</th>
                  <th className="py-2.5 font-semibold font-mono">SPECIALIST TIME</th>
                  <th className="py-2.5 font-semibold font-mono">STATUS</th>
                  <th className="py-2.5 font-semibold font-mono">TONE STYLE</th>
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 3).map((b) => (
                  <tr key={b.id} className="border-b border-[#f3f4f6] dark:border-white/5 hover:bg-black/[0.01] dark:hover:bg-white/[0.01]">
                    <td className="py-3 font-semibold text-[#111827] dark:text-glow-blue dark:text-[#a0c4ff]">{b.clientName}</td>
                    <td className="py-3 text-[#374151] dark:text-[#e2e8f0]">
                      <div className="font-medium">{b.serviceDesc}</div>
                      <div className="text-[9px] text-[#6b7280] dark:text-slate-400 font-mono mt-0.5">{b.dateTime} | {b.timeSlot}</div>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                        b.status === "confirmed" 
                          ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400" 
                          : b.status === "sent"
                          ? "bg-sky-50 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/30 text-sky-700 dark:text-sky-400"
                          : "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-500"
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 text-[#6b7280] dark:text-slate-400 font-mono">{b.aiTone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live log events panel */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#141a23]/55 border border-[#e2e8f0] dark:border-white/5 shadow-[0_1px_3px_rgba(0,0,0,0.1)] dark:shadow-none flex flex-col gap-4">
          <div className="flex flex-col pb-2 border-b border-[#f3f4f6] dark:border-white/5">
            <span className="text-xs font-mono font-bold tracking-wider text-rose-600 dark:text-rose-500">EVENT OUTLET</span>
            <h3 className="text-sm font-semibold text-[#111827] dark:text-white">Interactive Webhook Logger</h3>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[190px] pr-1 flex flex-col gap-2 font-mono text-[10px]">
            {webhookLogs.map((log, index) => (
              <div 
                key={index}
                className={`p-2 rounded-lg border flex flex-col gap-0.5 ${
                  log.type === "error" 
                    ? "bg-rose-50/5 dark:bg-rose-500/5 border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400" 
                    : log.type === "outbound"
                    ? "bg-sky-50/5 dark:bg-sky-500/5 border-sky-200 dark:border-sky-500/25 text-sky-700 dark:text-sky-400"
                    : log.type === "webhook"
                    ? "bg-purple-50/5 dark:bg-purple-500/5 border-purple-200 dark:border-purple-500/20 text-purple-700 dark:text-purple-400"
                    : "bg-slate-50 border-slate-200 dark:bg-slate-900/50 dark:border-white/5 text-slate-700 dark:text-slate-300"
                }`}
              >
                <div className="flex items-center justify-between opacity-60 text-[8px] font-semibold text-[#6b7280] dark:text-slate-400">
                  <span>{log.type.toUpperCase()} CONNECTION</span>
                  <span>{log.time}</span>
                </div>
                <p className="leading-normal">{log.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
