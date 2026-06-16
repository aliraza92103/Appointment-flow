import { useState, useEffect } from "react";
import { 
  ChatTeardropText, 
  MagnifyingGlass, 
  ArrowsClockwise, 
  Question, 
  CheckCircle, 
  XCircle, 
  Clock 
} from "@phosphor-icons/react";
import { toast } from "sonner";
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
      supabaseMock.updateReminderStatus(r.id, "delivered");
      loadLogs();
      setRetryingIds(prev => prev.filter(x => x !== r.id));
      addLog(`Re-dispatch successful to ${r.phone}: Dispatched code 200`, "outbound");
      toast.success("Reminder sent successfully!");
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
    <div className="flex flex-col gap-6 font-sans" id="reminders-logs-screen">
      {/* Upper header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[20px] md:text-[28px] font-bold text-[#111827] dark:text-white font-sans tracking-tight">Reminder Dispatch Logs</h2>
          <p className="text-xs text-[#6b7280] dark:text-slate-400">Audited catalog of WhatsApp notification statuses, failures, and retries.</p>
        </div>
        <div className="text-xs font-mono text-slate-500 dark:text-slate-400 p-2.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-white/5 flex items-center gap-2">
          <ChatTeardropText className="w-5 h-5 text-[#16a34a] dark:text-emerald-400 shrink-0" weight="duotone" />
          <span>Automatic dispatch frequency: <span className="text-[#16a34a] dark:text-[#25D366] font-bold">24 Hours Pre-Session</span></span>
        </div>
      </header>

      {/* Filter and Query Center */}
      <section className="p-4 rounded-2xl bg-white dark:bg-[#141a23]/55 border border-[#e2e8f0] dark:border-white/5 shadow-[0_1px_3px_rgba(0,0,0,0.1)] dark:shadow-none grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search Input */}
        <div className="relative col-span-1 sm:col-span-2">
          <MagnifyingGlass className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" weight="bold" />
          <input
            type="text"
            placeholder="Search customer Name, phone, or raw message contents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-xl text-xs pl-10 pr-4 py-2.5 focus:outline-none focus:border-emerald-500/30 font-sans"
          />
        </div>

        {/* Status Dropdown */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-xl text-xs px-3 py-2.5 text-inherit focus:outline-none focus:border-emerald-500/30 font-sans"
        >
          <option value="">All Logs</option>
          <option value="delivered">Delivered Successfully</option>
          <option value="failed">Sent Failed</option>
          <option value="pending">Awaiting Sync Queue</option>
        </select>
      </section>

      {/* Tables log overview */}
      <main className="bg-white dark:bg-[#141a23]/55 border border-[#e2e8f0] dark:border-white/5 shadow-[0_1px_3px_rgba(0,0,0,0.1)] dark:shadow-none rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-[#e2e8f0] dark:border-white/5 text-[#6b7280] dark:text-slate-400 bg-slate-50 dark:bg-white/[0.01] text-[11px] font-semibold tracking-[0.1em] uppercase">
                <th className="py-3 px-4 font-mono">RECIPIENT CUSTOMER</th>
                <th className="py-3 px-3 font-mono">TARGET SESSION TIME</th>
                <th className="py-3 px-3 font-mono">DISPATCH TIME</th>
                <th className="py-3 px-3 font-mono">MESSAGE PREVIEW</th>
                <th className="py-3 px-3 font-mono">LOG STATUS</th>
                <th className="py-3 px-4 text-right font-mono">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#6b7280]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Question className="w-8 h-8 opacity-35 text-slate-400" weight="duotone" />
                      <span className="font-semibold text-xs text-[#111827] dark:text-white">No Matching Dispatch Logs</span>
                      <span className="text-[11px] opacity-75">Adjust search queries or trigger reminders to populated nodes.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((r) => {
                  const isRetrying = retryingIds.includes(r.id);
                  return (
                    <tr key={r.id} className="border-b border-[#e2e8f0] dark:border-white/5 hover:bg-black/[0.005] dark:hover:bg-white/[0.012]">
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#111827] dark:text-glow-blue dark:text-slate-200">{r.customerName}</div>
                        <div className="text-[10px] text-[#6b7280] dark:text-slate-400 font-mono mt-0.5">{r.phone}</div>
                      </td>
                      <td className="py-3 px-3 font-medium text-[#374151] dark:text-slate-300">
                        {r.appointmentTime}
                      </td>
                      <td className="py-3 px-3 font-mono text-[#6b7280] dark:text-slate-400">
                        {r.sentAt}
                      </td>
                      <td className="py-3 px-3 max-w-xs truncate text-[#6b7280] dark:text-slate-400">
                        {r.messagePreview}
                      </td>
                      <td className="py-3 px-3">
                        {r.status === "delivered" ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-[#16a34a] dark:text-emerald-400 uppercase tracking-wider">
                            <CheckCircle className="w-3.5 h-3.5" weight="duotone" />
                            DELIVERED
                          </div>
                        ) : r.status === "failed" ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 uppercase tracking-wider">
                            <XCircle className="w-3.5 h-3.5" weight="duotone" />
                            FAILED
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-500 uppercase tracking-wider">
                            <Clock className="w-3.5 h-3.5" weight="duotone" />
                            PENDING
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {r.status === "failed" && (
                          <button
                            onClick={() => handleRetrySend(r)}
                            disabled={isRetrying}
                            className="p-1 px-3.5 rounded-lg border border-emerald-200 dark:border-[#25D366]/30 bg-white dark:bg-[#25D366]/5 hover:bg-emerald-50 dark:hover:bg-[#25D366]/15 text-[#16a34a] dark:text-[#25D366] hover:text-[#18a058] transition-all font-semibold font-mono text-[10px] flex items-center gap-1.5 cursor-pointer ml-auto action-btn"
                          >
                            <ArrowsClockwise className={`w-3.5 h-3.5 shrink-0 ${isRetrying ? "animate-spin" : ""}`} weight="bold" />
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
      </main>
    </div>
  );
}
