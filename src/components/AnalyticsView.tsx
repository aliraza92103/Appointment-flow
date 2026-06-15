import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { 
  TrendingUp, 
  BarChart2, 
  Clock, 
  Activity, 
  Award, 
  Flame,
  Calendar,
  AlertTriangle
} from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from "recharts";

export default function AnalyticsView() {
  // Generate mock data for charts
  const barChartData = Array.from({ length: 30 }, (_, i) => ({
    day: `Day ${i + 1}`,
    count: Math.floor(Math.sin(i * 0.5) * 6) + 12 + Math.floor(Math.random() * 5)
  }));

  const lineChartData = [
    { week: "Wk 1", rate: 82 },
    { week: "Wk 2", rate: 86 },
    { week: "Wk 3", rate: 90 },
    { week: "Wk 4", rate: 89 },
    { week: "Wk 5", rate: 94 },
    { week: "Wk 6", rate: 92 },
    { week: "Wk 7", rate: 96 }
  ];

  const pieChartData = [
    { name: "Hair Fades", value: 45, color: "#10b981" },
    { name: "Beard Sculptures", value: 25, color: "#4da3ff" },
    { name: "Spa Treatments", value: 20, color: "#f59e0b" },
    { name: "Cosmetics Care", value: 10, color: "#a855f7" }
  ];

  // Busiest hour heatmap values (Hourly slots from 09:00 AM to 06:00 PM)
  const heatmapData = [
    { hr: "09:00 AM", load: "low", val: 12 },
    { hr: "10:00 AM", load: "medium", val: 34 },
    { hr: "11:00 AM", load: "high", val: 78 },
    { hr: "12:00 PM", load: "peak", val: 96 },
    { hr: "01:00 PM", load: "medium", val: 42 },
    { hr: "02:00 PM", load: "high", val: 68 },
    { hr: "03:00 PM", load: "peak", val: 89 },
    { hr: "04:00 PM", load: "medium", val: 56 },
    { hr: "05:00 PM", load: "low", val: 24 },
    { hr: "06:00 PM", load: "low", val: 15 }
  ];

  const getHeatmapColor = (load: string) => {
    switch (load) {
      case "peak":
        return "bg-emerald-500 border-emerald-400/30 text-slate-950";
      case "high":
        return "bg-emerald-500/60 border-emerald-500/20 text-white";
      case "medium":
        return "bg-emerald-500/30 border-emerald-500/10 text-white/95";
      default:
        return "bg-slate-900/40 border-white/5 text-slate-400";
    }
  };

  return (
    <div className="flex flex-col gap-6" id="analytics-perf-dashboard">
      {/* Top Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Performance Analytics</h2>
          <p className="text-xs text-muted">Deep data charts detailing appointment density and reminder conversion successes.</p>
        </div>
        <div className="text-xs font-mono text-emerald-400 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-2">
          <Activity className="w-4 h-4" />
          <span>Real-time analysis is active</span>
        </div>
      </div>

      {/* Grid: Main 3 Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Graph 1: 30 Days Bar */}
        <div className="p-5 rounded-3xl glass-panel flex flex-col gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono font-bold tracking-wider text-emerald-400 uppercase">LOAD STATISTICS</span>
            <h3 className="text-sm font-semibold">Scheduled Appointments (Last 30 Days)</h3>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ left: -30, right: 0, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={8} tick={false} />
                <YAxis stroke="var(--text-muted)" fontSize={9} />
                <Tooltip />
                <Bar dataKey="count" fill="var(--theme-accent)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graph 2: success over time */}
        <div className="p-5 rounded-3xl glass-panel flex flex-col gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono font-bold tracking-wider text-sky-400 uppercase">REPLY CONVERSIONS</span>
            <h3 className="text-sm font-semibold">Reminder Success rate over Time</h3>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData} margin={{ left: -30, right: 0, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="week" stroke="var(--text-muted)" fontSize={9} />
                <YAxis stroke="var(--text-muted)" fontSize={9} domain={[60, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="rate" stroke="#38bdf8" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graph 3: Pie Allocation */}
        <div className="p-5 rounded-3xl glass-panel flex flex-col gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono font-bold tracking-wider text-purple-400 uppercase">OFFER VALUES</span>
            <h3 className="text-sm font-semibold">Service Type Allocation Breakdowns</h3>
          </div>
          <div className="h-48 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  innerRadius={44}
                  outerRadius={64}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieChartData.map((e, idx) => (
                    <Cell key={`cell-${idx}`} fill={e.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center">
              <span className="text-base font-extrabold text-glow-green">148</span>
              <span className="text-[8px] font-bold text-slate-400 uppercase">Total Services</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Heatmap + Top Performer stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Block 1: Heatmap Grid */}
        <div className="lg:col-span-2 p-5 rounded-3xl glass-panel flex flex-col gap-4">
          <div className="flex flex-col pb-2 border-b border-white/5">
            <span className="text-[10px] font-mono font-bold tracking-wider text-emerald-400 uppercase font-bold">HOURLY INTENSITY</span>
            <h3 className="text-sm font-semibold">Busiest Duty Operating Heatmap</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {heatmapData.map((d, index) => (
              <div 
                key={index}
                className={`p-3 rounded-2xl border text-center flex flex-col gap-1 transition-all ${getHeatmapColor(d.load)}`}
              >
                <span className="text-[10px] font-mono font-bold tracking-tight">{d.hr}</span>
                <span className="text-xs font-extrabold tracking-tight">{d.val}% load</span>
                <span className="text-[8px] font-mono opacity-50 uppercase tracking-widest">{d.load}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Block 2: Top Barber Performance */}
        <div className="p-5 rounded-3xl glass-panel flex flex-col gap-4">
          <div className="flex flex-col pb-2 border-b border-white/5">
            <span className="text-[10px] font-mono font-bold tracking-wider text-amber-500 uppercase">CONGRATULATIONS</span>
            <h3 className="text-sm font-semibold">Top Performing Specialist</h3>
          </div>

          <div className="bg-white/[0.015] rounded-3xl p-5 border border-white/5 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 relative">
              <Award className="w-8 h-8" />
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 p-1 rounded-full">
                <Flame className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <h4 className="font-extrabold text-glow-green text-sm">Alex Thorne</h4>
              <p className="text-[10px] bg-slate-900 border border-white/5 text-slate-400 py-0.5 px-3 rounded-full uppercase font-mono mt-1 inline-block">Specialist Lead</p>
            </div>

            <div className="w-full grid grid-cols-2 gap-2 mt-2">
              <div className="p-3 bg-slate-950/40 rounded-2xl border border-white/5">
                <span className="text-[9px] font-mono text-slate-400 uppercase">Score rating</span>
                <p className="text-sm font-bold text-slate-100 mt-0.5">4.96</p>
              </div>
              <div className="p-3 bg-slate-950/40 rounded-2xl border border-white/5">
                <span className="text-[9px] font-mono text-slate-400 uppercase">Deliver rate</span>
                <p className="text-sm font-bold text-slate-100 mt-0.5">98.2%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
