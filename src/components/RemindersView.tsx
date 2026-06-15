import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  MessageSquare, 
  Send, 
  RefreshCw, 
  Filter, 
  AlertTriangle, 
  CheckCircle, 
  X,
  Search,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock
} from "lucide-react";
import { ReminderLog, supabaseMock } from "../lib/supabase";

interface RemindersViewProps {
  onTriggerLogRefresh?: () => void;
  addLog: (text: string, type?: string) => void;
}

export default function RemindersView({ onTriggerLogRefresh, addLog }: RemindersViewProps) {
  const [reminders, setReminders] = useState<ReminderLog[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [retryingIds, setRetryingIds] = useState<string[]>([]);

  const loadLogs = () => {
    setReminders(supabaseMock.getReminders());
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleRetrySend = async (r: ReminderLog) => {
    setRetryingIds(prev => [...prev, r.id]);
    addLog(`Initiating re-dispatch logic for failed payload to ${r.phone}...`, "sync");

    setTimeout(() => {
      // Simulate successful delivery update
      supabaseMock.updateReminderStatus(r.id, "delivered");
      loadLogs();
      setRetryingIds(prev => prev.filter(x => x !== r.id));
      addLog(`Re-dispatch successful to ${r.phone}: Dispatched code 200`, "outbound");
      if (onTriggerLogRefresh) onTriggerLogRefresh();
    }, 1500);
  };

  // Filter list
  const filteredLogs = reminders.filter(r => {
    const matchesSearch = r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.phone.includes(searchTerm) || 
                          r.messagePreview.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6" id="reminders-logs-screen">
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Reminder Dispatch Logs</h2>
          <p className="text-xs text-muted">Audited catalog of WhatsApp notification statuses, failures, and retries.</p>
        </div>
        <div className="text-xs font-mono text-slate-400 p-2.5 bg-slate-900/50 rounded-xl border border-white/5 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Automatic dispatch frequency: <span className="text-emerald-400 font-bold font-mono">24 Hours Pre-Session</span></span>
        </div>
      </div>

      {/* Filter and Query Center */}
      <div className="p-4 rounded-2xl glass-panel grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search Input */}
        <div className="relative col-span-1 sm:col-span-2">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search customer Name, phone, or raw message contents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/50 border border-white/5 rounded-xl text-xs pl-10 pr-4 py-2 focus:outline-none focus:border-emerald-500/30"
          />
        </div>

        {/* Status Dropdown */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-900/50 border border-white/5 rounded-xl text-xs px-3 py-2 text-inherit focus:outline-none focus:border-emerald-500/30 font-sans"
        >
          <option value="">All Logs</option>
          <option value="delivered">Delivered Successfully</option>
          <option value="failed">Sent Failed</option>
          <option value="pending">Awaiting Sync Queue</option>
        </select>
      </div>

      {/* Tables log overview */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/5 text-slate-400 bg-white/[0.01]">
                <th className="py-3.5 px-4 font-semibold font-mono">RECIPIENT CUSTOMER</th>
                <th className="py-3.5 px-3 font-semibold font-mono">TARGET SESSION TIME</th>
                <th className="py-3.5 px-3 font-semibold font-mono font-mono">DISPATCH TIME</th>
                <th className="py-3.5 px-3 font-semibold font-mono">MESSAGE PREVIEW</th>
                <th className="py-3.5 px-3 font-semibold font-mono">LOG STATUS</th>
                <th className="py-3.5 px-4 text-right font-semibold font-mono">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <HelpCircle className="w-8 h-8 opacity-35 text-slate-400" />
                      <span className="font-semibold text-xs">No Matching Dispatch Logs</span>
                      <span className="text-[11px] opacity-75">Adjust search queries or trigger reminders to populated nodes.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((r) => {
                  const isRetrying = retryingIds.includes(r.id);
                  return (
                    <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.012]">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-glow-blue">{r.customerName}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{r.phone}</div>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-300">
                        {r.appointmentTime}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-400">
                        {r.sentAt}
                      </td>
                      <td className="py-3 px-3 max-w-xs truncate text-slate-400">
                        {r.messagePreview}
                      </td>
                      <td className="py-3 px-3">
                        {r.status === "delivered" ? (
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" />
                            DELIVERED
                          </div>
                        ) : r.status === "failed" ? (
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-500/10 border border-rose-500/20 text-rose-400">
                            <XCircle className="w-3 h-3" />
                            FAILED
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-500">
                            <Clock className="w-3 h-3" />
                            PENDING
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {r.status === "failed" && (
                          <button
                            onClick={() => handleRetrySend(r)}
                            disabled={isRetrying}
                            className="p-1 px-3.5 rounded-lg border border-emerald-500/25 bg-emerald-500/5 hover:bg-emerald-500/15 text-emerald-400 hover:text-emerald-300 transition-all font-semibold font-mono text-[10px] flex items-center gap-1.5 cursor-pointer ml-auto"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${isRetrying ? "animate-spin" : ""}`} />
                            {isRetrying ? "RETRYING" : "RETRY DISPATCH"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
