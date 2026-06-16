import { useEffect, useState } from "react";
import { 
  ChartBar, 
  TrendUp, 
  Medal, 
  Flame, 
  Warning 
} from "@phosphor-icons/react";
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
    { name: "Hair Fades", value: 45, color: "#16a34a" },
    { name: "Beard Sculptures", value: 25, color: "#2563eb" },
    { name: "Spa Treatments", value: 20, color: "#ea580c" },
    { name: "Cosmetics Care", value: 10, color: "#9333ea" }
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
        return "bg-emerald-100 border-emerald-300 dark:bg-emerald-500/20 dark:border-emerald-400/30 text-emerald-800 dark:text-[#25D366] font-bold";
      case "high":
        return "bg-emerald-50/70 border-emerald-200 dark:bg-emerald-500/15 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300";
      case "medium":
        return "bg-slate-50 border-slate-100 dark:bg-emerald-500/5 dark:border-emerald-500/10 text-slate-700 dark:text-slate-300";
      default:
        return "bg-slate-50 border-slate-100 dark:bg-slate-900/40 dark:border-white/5 text-slate-400 dark:text-slate-500";
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans text-inherit" id="analytics-perf-dashboard">
      {/* Top Title */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[20px] md:text-[28px] font-bold text-[#111827] dark:text-white font-sans tracking-tight">Performance Analytics</h2>
          <p className="text-xs text-[#6b7280] dark:text-slate-400">Deep data charts detailing appointment density and reminder conversion successes.</p>
        </div>
        <div className="text-xs font-mono text-[#16a34a] dark:text-[#25D366] p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/25 flex items-center gap-2">
          <TrendUp className="w-5 h-5 animate-pulse" weight="bold" />
          <span>Real-time analysis is active</span>
        </div>
      </header>

      {/* Grid: Main 3 Charts */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Graph 1: 30 Days Bar */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#141a23]/55 border border-[#e2e8f0] dark:border-white/5 shadow-[0_1px_3px_rgba(0,0,0,0.1)] dark:shadow-none flex flex-col gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono font-bold tracking-wider text-[#16a34a] dark:text-emerald-400 uppercase">LOAD STATISTICS</span>
            <h3 className="text-sm font-semibold text-[#111827] dark:text-white font-sans">Scheduled Appointments (30 Days)</h3>
          </div>
          <div className="h-48 w-full font-mono text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ left: -30, right: 0, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" dark-stroke="#202A37" vertical={false} />
                <XAxis dataKey="day" stroke="#9ca3af" fontSize={8} tick={false} />
                <YAxis stroke="#9ca3af" fontSize={9} />
                <Tooltip />
                <Bar dataKey="count" fill="#16a34a" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graph 2: success over time */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#141a23]/55 border border-[#e2e8f0] dark:border-white/5 shadow-[0_1px_3px_rgba(0,0,0,0.1)] dark:shadow-none flex flex-col gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono font-bold tracking-wider text-[#2563eb] dark:text-sky-400 uppercase">REPLY CONVERSIONS</span>
            <h3 className="text-sm font-semibold text-[#111827] dark:text-white font-sans">Reminder Success rate over Time</h3>
          </div>
          <div className="h-48 w-full font-mono text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData} margin={{ left: -30, right: 0, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="week" stroke="#9ca3af" fontSize={9} />
                <YAxis stroke="#9ca3af" fontSize={9} domain={[60, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="rate" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graph 3: Pie Allocation */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#141a23]/55 border border-[#e2e8f0] dark:border-white/5 shadow-[0_1px_3px_rgba(0,0,0,0.1)] dark:shadow-none flex flex-col gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono font-bold tracking-wider text-purple-600 dark:text-purple-400 uppercase">OFFER VALUES</span>
            <h3 className="text-sm font-semibold text-[#111827] dark:text-white font-sans">Service Type Allocation Breakdowns</h3>
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
              <span className="text-lg font-extrabold text-[#111827] dark:text-glow-green dark:text-white">148</span>
              <span className="text-[8px] font-bold text-slate-400 uppercase">Total Services</span>
            </div>
          </div>
        </div>
      </section>

      {/* Grid: Heatmap + Top Performer stats */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Block 1: Heatmap Grid */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-white dark:bg-[#141a23]/55 border border-[#e2e8f0] dark:border-white/5 shadow-[0_1px_3px_rgba(0,0,0,0.1)] dark:shadow-none flex flex-col gap-4">
          <div className="flex flex-col pb-2 border-b border-slate-100 dark:border-white/5">
            <span className="text-[10px] font-mono font-bold tracking-wider text-[#16a34a] dark:text-[#25D366] uppercase">HOURLY INTENSITY</span>
            <h3 className="text-sm font-semibold text-[#111827] dark:text-white font-sans animate-fadeIn">Busiest Duty Operating Heatmap</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {heatmapData.map((d, index) => (
              <div 
                key={index}
                className={`p-3 rounded-2xl border text-center flex flex-col gap-1 transition-all ${getHeatmapColor(d.load)}`}
              >
                <span className="text-[10px] font-mono font-bold tracking-tight">{d.hr}</span>
                <span className="text-xs font-extrabold tracking-tight">{d.val}% load</span>
                <span className="text-[8px] font-mono opacity-60 uppercase tracking-widest">{d.load}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Block 2: Top Barber Performance */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#141a23]/55 border border-[#e2e8f0] dark:border-white/5 shadow-[0_1px_3px_rgba(0,0,0,0.1)] dark:shadow-none flex flex-col gap-4">
          <div className="flex flex-col pb-2 border-b border-slate-100 dark:border-white/5">
            <span className="text-[10px] font-mono font-bold tracking-wider text-amber-600 dark:text-amber-500 uppercase">CONGRATULATIONS</span>
            <h3 className="text-sm font-semibold text-[#111827] dark:text-white font-sans">Top Performing Specialist</h3>
          </div>

          <div className="bg-slate-50 dark:bg-white/[0.015] rounded-3xl p-5 border border-slate-100 dark:border-white/5 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center text-amber-500 relative">
              <Medal className="w-8 h-8 text-amber-500" weight="duotone" />
              <div className="absolute -bottom-1 -right-1 bg-[#16a34a] text-white p-1 rounded-full shadow">
                <Flame className="w-3.5 h-3.5 text-white" weight="duotone" />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <h4 className="font-extrabold text-[#111827] dark:text-glow-green dark:text-white text-sm">Alex Thorne</h4>
              <p className="text-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 py-0.5 px-3 rounded-full uppercase font-mono mt-1 inline-block">Specialist Lead</p>
            </div>

            <div className="w-full grid grid-cols-2 gap-2 mt-2">
              <div className="p-3 bg-white dark:bg-slate-950/40 rounded-2xl border border-slate-200 dark:border-white/5">
                <span className="text-[9px] font-mono text-slate-400 uppercase">Score rating</span>
                <p className="text-sm font-bold text-[#111827] dark:text-slate-100 mt-0.5">4.96</p>
              </div>
              <div className="p-3 bg-white dark:bg-slate-950/40 rounded-2xl border border-slate-200 dark:border-white/5">
                <span className="text-[9px] font-mono text-slate-400 uppercase">Deliver rate</span>
                <p className="text-sm font-bold text-[#111827] dark:text-slate-100 mt-0.5">98.2%</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
