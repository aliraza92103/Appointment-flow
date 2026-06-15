import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, 
  Trash2, 
  Plus, 
  Clock, 
  Calendar,
  X,
  Edit2,
  AlertTriangle,
  Scissors
} from "lucide-react";
import { Barber, supabaseMock } from "../lib/supabase";

interface BarbersViewProps {
  onUpdateCount?: () => void;
  addLog: (text: string, type?: string) => void;
}

export default function BarbersView({ onUpdateCount, addLog }: BarbersViewProps) {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [hours, setHours] = useState("09:00 AM - 06:00 PM");
  const [seed, setSeed] = useState("alex");
  const [errorMsg, setErrorMsg] = useState("");

  const refreshData = () => {
    setBarbers(supabaseMock.getBarbers());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleDeleteBarber = async (id: string, barberName: string) => {
    try {
      await fetch(`/api/barbers/${id}`, { method: "DELETE" });
      supabaseMock.deleteBarber(id);
      refreshData();
      addLog(`Removed specialist profile: '${barberName}'`, "system");
      if (onUpdateCount) onUpdateCount();
    } catch {
      supabaseMock.deleteBarber(id);
      refreshData();
    }
  };

  const handleEditInit = (b: Barber) => {
    setIsEditing(true);
    setEditId(b.id);
    setName(b.name);
    setSpecialty(b.specialty);
    setHours(b.workingHours);
    setSeed(b.avatarSeed);
    setIsModalOpen(true);
  };

  const handleSaveBarber = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim() || !specialty.trim()) {
      setErrorMsg("Please specify the specialist's full name and focal specialty.");
      return;
    }

    const payload = {
      name,
      specialty,
      workingHours: hours,
      avatarSeed: seed,
      appointmentsToday: isEditing ? (barbers.find(b => b.id === editId)?.appointmentsToday || 0) : 0
    };

    try {
      if (isEditing && editId) {
        await fetch(`/api/barbers/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        supabaseMock.saveBarber({ ...payload, id: editId });
        addLog(`Updated specialist credentials: '${name}'`, "system");
      } else {
        await fetch("/api/barbers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        supabaseMock.saveBarber(payload);
        addLog(`Successfully registered new specialist: '${name}'`, "system");
      }

      refreshData();
      setIsModalOpen(false);
      resetForm();
      if (onUpdateCount) onUpdateCount();
    } catch {
      supabaseMock.saveBarber({ ...payload, id: editId || undefined });
      refreshData();
      setIsModalOpen(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setName("");
    setSpecialty("");
    setHours("09:00 AM - 06:00 PM");
    setSeed("alex");
  };

  const getInitials = (fullname: string) => {
    const parts = fullname.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return fullname.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex flex-col gap-6" id="barbers-workspace-grid">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Specialist Directory</h2>
          <p className="text-xs text-muted">Manager console for specialist schedules, assignments, and availability.</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="py-2 px-4 rounded-xl text-xs font-bold glass-button-primary text-slate-950 flex items-center gap-2 cursor-pointer transition-all self-start"
        >
          <Plus className="w-4 h-4 shrink-0" />
          Add Specialist
        </button>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {barbers.length === 0 ? (
          <div className="col-span-full p-12 text-center glass-panel rounded-3xl flex flex-col items-center gap-2 text-slate-500">
            <AlertTriangle className="w-8 h-8 opacity-30 text-slate-400" />
            <span className="font-semibold text-xs">No active staff registered.</span>
            <span className="text-[11px] opacity-75">Click "Add Specialist" to enroll new provider coordinates.</span>
          </div>
        ) : (
          barbers.map((b) => (
            <div 
              key={b.id}
              className="rounded-3xl glass-card p-6 flex flex-col gap-4 relative overflow-hidden group border border-white/5"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Scissors className="w-12 h-12 text-slate-400" />
              </div>

              {/* Card Header Profile */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold text-sm tracking-wider">
                  {getInitials(b.name)}
                </div>
                <div>
                  <h3 className="font-bold text-glow-blue font-sans text-sm">{b.name}</h3>
                  <span className="text-[10px] bg-slate-900/50 text-slate-400 px-2.5 py-0.5 rounded-full border border-white/5 inline-block mt-0.5">
                    {b.id.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Stats Block details */}
              <div className="grid grid-cols-2 gap-3 bg-white/[0.01] rounded-2xl p-3 border border-white/5">
                <div className="flex flex-col">
                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">Duty Specialty</span>
                  <span className="text-xs font-semibold text-slate-200 mt-0.5 truncate">{b.specialty}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">Bookings Today</span>
                  <span className="text-xs font-semibold text-emerald-400 mt-0.5">{b.appointmentsToday} sessions</span>
                </div>
              </div>

              {/* Hours operation indicator */}
              <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Shift Hours: <span className="text-slate-200 font-semibold font-mono">{b.workingHours}</span></span>
              </div>

              {/* Actions interface */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5 mt-1">
                <button
                  onClick={() => handleEditInit(b)}
                  className="p-1 px-3 rounded-lg border border-white/5 bg-slate-900/50 hover:bg-white/10 hover:text-white transition-all text-xs text-slate-300 flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteBarber(b.id, b.name)}
                  className="p-1 px-3 rounded-lg border border-rose-500/10 bg-rose-500/5 hover:bg-rose-505/20 text-rose-400 transition-all text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* SPECIALIST DIALOG MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md glass-panel-heavy rounded-3xl p-6 md:p-8 overflow-hidden border border-white/10 shadow-2xl flex flex-col gap-4"
            >
              <div className="absolute right-4 top-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-emerald-400" />
                  {isEditing ? "Edit Specialist Credentials" : "Enroll New Specialist"}
                </h3>
                <p className="text-xs text-slate-400 mt-1">Configure profile coordinates to enable scheduling.</p>
              </div>

              <form onSubmit={handleSaveBarber} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-300">Provider Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Alex Thorne"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full bg-slate-900/50 border border-white/5 rounded-xl text-xs pl-8.5 pr-4 py-2 focus:outline-none focus:border-emerald-500/30"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-300">Focus Specialty</label>
                  <input
                    type="text"
                    placeholder="Hot Towel Shaving & Laser Contour"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    required
                    className="w-full bg-slate-900/50 border border-white/5 rounded-xl text-xs px-3 py-2 focus:outline-none focus:border-emerald-500/30"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-300">Shift Working Hours</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="09:00 AM - 06:00 PM"
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                      required
                      className="w-full bg-slate-900/50 border border-white/5 rounded-xl text-xs pl-8.5 pr-4 py-2 focus:outline-none focus:border-emerald-500/30"
                    />
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-2.5 text-rose-400 bg-rose-500/5 border border-rose-500/15 rounded-xl text-xs">
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full mt-2 py-2.5 rounded-xl font-bold bg-emerald-500 text-slate-950 text-xs hover:bg-emerald-400 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Save Specialist Profile
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
