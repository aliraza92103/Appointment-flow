import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  Filter, 
  Trash2, 
  Plus, 
  Smartphone, 
  User, 
  Clock, 
  Calendar, 
  Check, 
  AlertTriangle,
  X,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Send
} from "lucide-react";
import { Booking, BookingStatus, ReminderTone } from "../types";
import { supabaseMock, Barber } from "../lib/supabase";

interface AppointmentsViewProps {
  bookings: Booking[];
  onUpdateBookings: (newBookings: Booking[]) => void;
  addLog: (text: string, type?: string) => void;
}

export default function AppointmentsView({ bookings, onUpdateBookings, addLog }: AppointmentsViewProps) {
  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [barberFilter, setBarberFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Selected for edits, bulk deletes
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form State
  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [dateTime, setDateTime] = useState("2026-06-16");
  const [timeSlot, setTimeSlot] = useState("10:00 AM");
  const [serviceDesc, setServiceDesc] = useState("Elite High-Fade Restructuring");
  const [aiTone, setAiTone] = useState<ReminderTone>("Warm & Professional");
  const [reminderTiming, setReminderTiming] = useState("24h");
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Barbers list configuration
  const [barbers, setBarbers] = useState<Barber[]>([]);
  
  // Form feedback
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setBarbers(supabaseMock.getBarbers());
  }, []);

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case "confirmed":
        return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
      case "sent":
        return "bg-sky-500/10 border-sky-500/30 text-sky-400";
      case "pending":
        return "bg-amber-500/10 border-amber-500/30 text-amber-500";
      case "queued":
        return "bg-blue-500/10 border-blue-500/30 text-blue-400";
      case "cancelled":
        return "bg-rose-500/10 border-rose-500/30 text-rose-400";
      default:
        return "bg-slate-500/10 border-slate-500/30 text-slate-400";
    }
  };

  // Generate a live simulation text of the draft template
  const getDraftPreview = () => {
    let businessName = "Your Brand Studio";
    try {
      const savedSettings = localStorage.getItem("ap_settings");
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (parsed.businessName) businessName = parsed.businessName;
      }
    } catch (e) {}
    
    switch (aiTone) {
      case "Urgent & Direct":
        return `Hello ${clientName || "Customer"}. Please confirm your slot for *${serviceDesc}* with *${businessName}* scheduled on *${dateTime}* at *${timeSlot}*.\n\nYour prompt response ensures resource availability.\n\n👉 Confirm: Reply *1*\n👉 Reschedule: Reply *2*\n👉 Cancel: Reply *3*`;
      case "Playful & Friendly":
        return `Hey ${clientName || "Friend"}! Quick heads up! Your session for *${serviceDesc}* over at *${businessName}* is just around the corner!\n\n📅 When: ${dateTime} at ${timeSlot}\n\nWe've prepped everything for you! Can you let us know if you're still on?\n\n💬 Quick Reply:\n1 - Yes, see you there!\n2 - Need to change the time\n3 - Can't make it this time`;
      case "Slick & Ultra-premium":
        return `Dear ${clientName || "Guest"},\n\nWe look forward to hosting you for your reserved *${serviceDesc}* session with *${businessName}*.\n\n✨ Reservation Details:\n📅 ${dateTime} | ⏰ ${timeSlot}\n\nTo ensure flawless preparation, please verify your arrival:\n\n✨ Reply *1* to Confirm\n✨ Reply *2* to Reschedule\n✨ Reply *3* to Cancel`;
      default:
        return `Hi ${clientName || "Customer"}! This is a friendly reminder of your upcoming slot for *${serviceDesc}* with *${businessName}* on *${dateTime}* at *${timeSlot}*.\n\nPlease confirm or manage your slot by choosing one response below:\n\n1 - Confirm Slot\n2 - Reschedule\n3 - Cancel Booking`;
    }
  };

  // Save or Edit logic
  const handleSaveAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!clientName.trim() || !phone.trim() || !serviceDesc.trim() || !timeSlot.trim()) {
      setErrorMsg("All parameters are required to generate message preview schedules.");
      return;
    }

    const payload: Omit<Booking, "id"> = {
      clientName,
      phone,
      dateTime,
      timeSlot,
      serviceDesc,
      status: isEditing ? (bookings.find(b => b.id === editId)?.status || "pending") : "pending",
      messageDraft: getDraftPreview(),
      createdAt: new Date().toISOString(),
      aiTone,
      history: [{ timestamp: "Just now", action: isEditing ? "Updated parameters" : "Booking created" }]
    };

    try {
      if (isEditing && editId) {
        // Backend put endpoint hook
        await fetch(`/api/appointments/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const saved = supabaseMock.saveAppointment({ ...payload, id: editId });
        onUpdateBookings(supabaseMock.getAppointments());
        addLog(`Successfully updated appointment log details for: '${clientName}'`, "system");
      } else {
        // Backend post endpoint hook
        await fetch("/api/appointments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const saved = supabaseMock.saveAppointment(payload);
        onUpdateBookings(supabaseMock.getAppointments());
        addLog(`Created new scheduled reservation slot mapping for ${clientName}`, "sync");
      }

      setIsModalOpen(false);
      resetForm();
    } catch (err: any) {
      // client-side fail safe fallback
      supabaseMock.saveAppointment({ ...payload, id: editId || undefined });
      onUpdateBookings(supabaseMock.getAppointments());
      setIsModalOpen(false);
      resetForm();
    }
  };

  const handleEditInit = (b: Booking) => {
    setIsEditing(true);
    setEditId(b.id);
    setClientName(b.clientName);
    setPhone(b.phone);
    setDateTime(b.dateTime);
    setTimeSlot(b.timeSlot);
    setServiceDesc(b.serviceDesc);
    setAiTone(b.aiTone as ReminderTone);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/appointments/${id}`, { method: "DELETE" });
      supabaseMock.deleteAppointment(id);
      onUpdateBookings(supabaseMock.getAppointments());
      setSelectedIds(prev => prev.filter(x => x !== id));
      addLog(`Removed scheduled appointment: ${id}`, "system");
    } catch {
      supabaseMock.deleteAppointment(id);
      onUpdateBookings(supabaseMock.getAppointments());
      setSelectedIds(prev => prev.filter(x => x !== id));
    }
  };

  const handleBulkDelete = () => {
    selectedIds.forEach(id => {
      supabaseMock.deleteAppointment(id);
    });
    onUpdateBookings(supabaseMock.getAppointments());
    addLog(`Bulk deleted ${selectedIds.length} reservations successfully`, "system");
    setSelectedIds([]);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredBookings.map(b => b.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(x => x !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setClientName("");
    setPhone("");
    setDateTime("2026-06-16");
    setTimeSlot("10:00 AM");
    setServiceDesc("Elite High-Fade Restructuring");
    setAiTone("Warm & Professional");
  };

  // Filter application
  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          b.phone.includes(searchTerm) || 
                          b.serviceDesc.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "" || b.status === statusFilter;
    const matchesBarber = barberFilter === "" || b.serviceDesc.toLowerCase().includes(barberFilter.toLowerCase());
    return matchesSearch && matchesStatus && matchesBarber;
  });

  // Pagination bounds
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage) || 1;
  const paginatedList = filteredBookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex flex-col gap-6" id="appointments-portal-module">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Appointment Records</h2>
          <p className="text-xs text-muted">Create, edit, delete, and configure client dispatch queues.</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="py-2 px-4 rounded-xl text-xs font-bold glass-button-primary text-slate-950 flex items-center gap-2 cursor-pointer transition-all self-start"
        >
          <Plus className="w-4 h-4 shrink-0" />
          Add Appointment
        </button>
      </div>

      {/* Filter and Query Board */}
      <div className="p-4 rounded-2xl glass-panel flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search customer, services..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-900/50 border border-white/5 rounded-xl text-xs pl-9 pr-4 py-2 focus:outline-none focus:border-emerald-500/30"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="bg-slate-900/50 border border-white/5 rounded-xl text-xs px-3 py-2 text-inherit focus:outline-none focus:border-emerald-500/30"
          >
            <option value="">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="sent">Sent</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Barber filter */}
          <select
            value={barberFilter}
            onChange={(e) => { setBarberFilter(e.target.value); setCurrentPage(1); }}
            className="bg-slate-900/50 border border-white/5 rounded-xl text-xs px-3 py-2 text-inherit focus:outline-none focus:border-emerald-500/30"
          >
            <option value="">All Specialists</option>
            {barbers.map(b => (
              <option key={b.id} value={b.name}>{b.name}</option>
            ))}
          </select>
        </div>

        {/* Clear selection bulk tool */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-1.5 self-start">
            <span className="text-[11px] font-mono text-emerald-400 font-semibold">{selectedIds.length} Selected</span>
            <button
              onClick={handleBulkDelete}
              className="text-rose-400 hover:text-rose-300 text-xs font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Bulk
            </button>
          </div>
        )}
      </div>

      {/* Main Datatable Grid */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/5 text-slate-400 bg-white/[0.01]">
                <th className="py-3 px-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={filteredBookings.length > 0 && selectedIds.length === filteredBookings.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-white/10 bg-slate-900 text-emerald-500 focus:ring-0 cursor-pointer w-4 h-4"
                  />
                </th>
                <th className="py-3 px-3 font-semibold font-mono">CUSTOMER PROFILE</th>
                <th className="py-3 px-3 font-semibold font-mono">SERVICE & TIME</th>
                <th className="py-3 px-3 font-semibold font-mono">TONE STYLE</th>
                <th className="py-3 px-3 font-semibold font-mono">STATUS</th>
                <th className="py-3 px-4 text-right font-semibold font-mono">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertTriangle className="w-8 h-8 opacity-30 text-slate-400" />
                      <p className="font-semibold text-xs">No Scheduled Bookings Found</p>
                      <p className="text-[11px] opacity-70">Adjust filters or create a new slot schedule mapping.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedList.map((b) => {
                  const isChecked = selectedIds.includes(b.id);
                  return (
                    <tr 
                      key={b.id} 
                      className={`border-b border-white/5 transition-colors hover:bg-white/[0.012] ${
                        isChecked ? "bg-emerald-500/[0.02]" : ""
                      }`}
                    >
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelect(b.id)}
                          className="rounded border-white/10 bg-slate-900 text-emerald-500 focus:ring-0 cursor-pointer w-4 h-4"
                        />
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-glow-blue">{b.clientName}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{b.phone}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-200">{b.serviceDesc}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-1 flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>{b.dateTime} | {b.timeSlot}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono text-slate-400 text-[10px] bg-white/5 px-2 py-0.5 rounded border border-white/5">
                          {b.aiTone}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${getStatusBadge(b.status)}`}>
                          {b.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2 text-slate-400">
                          <button
                            onClick={() => handleEditInit(b)}
                            className="p-1 px-2.5 rounded-lg border border-white/5 bg-slate-900/50 hover:bg-white/15 hover:text-white transition-all cursor-pointer"
                            title="Edit Scheduling Info"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(b.id)}
                            className="p-1 px-2.5 rounded-lg border border-rose-500/10 hover:bg-rose-500/20 bg-rose-500/5 text-rose-400 hover:text-rose-300 transition-all cursor-pointer"
                            title="Delete Entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer controls */}
        {filteredBookings.length > 0 && (
          <div className="p-4 border-t border-white/5 flex items-center justify-between text-xs bg-white/[0.005]">
            <span className="text-slate-400 font-mono">
              Displaying {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredBookings.length)} of {filteredBookings.length}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-white/5 hover:border-white/10 glass-button-secondary disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono px-3 font-semibold text-slate-200">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-white/5 hover:border-white/10 glass-button-secondary disabled:opacity-30 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DIALOG/MODAL: ADD & EDIT SLOTS */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            {/* Backdrop blurring click layer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            {/* Modal Body container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl glass-panel-heavy rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col md:flex-row"
            >
              <div className="absolute right-4 top-4 z-50">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* LEFT HALF: Interactive Form */}
              <form onSubmit={handleSaveAppointment} className="flex-1 p-6 md:p-8 flex flex-col gap-4 border-r border-white/5">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
                    {isEditing ? "Modify Scheduled Appointment" : "Schedule New AI Reminder"}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Configure parameters to trigger the AI message generation chain.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-300">Customer Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Emery Vance"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        required
                        className="w-full bg-slate-900/50 border border-white/5 rounded-xl text-xs pl-8.5 pr-4 py-2 focus:outline-none focus:border-emerald-500/30"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-300">WhatsApp Mobile Number</label>
                    <div className="relative">
                      <Smartphone className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                      <input
                        type="tel"
                        placeholder="+1 (555) 304-2098"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="w-full bg-slate-900/50 border border-white/5 rounded-xl text-xs pl-8.5 pr-4 py-2 focus:outline-none focus:border-emerald-500/30"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-300">Appointment Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                      <input
                        type="date"
                        value={dateTime}
                        onChange={(e) => setDateTime(e.target.value)}
                        required
                        className="w-full bg-slate-900/50 border border-white/5 rounded-xl text-xs pl-8.5 pr-4 py-2 focus:outline-none focus:border-emerald-500/30"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-300">Time Slot Assignment</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                      <input
                        type="text"
                        placeholder="02:30 PM"
                        value={timeSlot}
                        onChange={(e) => setTimeSlot(e.target.value)}
                        required
                        className="w-full bg-slate-900/50 border border-white/5 rounded-xl text-xs pl-8.5 pr-4 py-2 focus:outline-none focus:border-emerald-500/30"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-300">Service or Appointment Spec</label>
                  <input
                    type="text"
                    placeholder="Classic Hot Towel Shave & Tapering"
                    value={serviceDesc}
                    onChange={(e) => setServiceDesc(e.target.value)}
                    required
                    className="w-full bg-slate-900/50 border border-white/5 rounded-xl text-xs px-3.5 py-2 focus:outline-none focus:border-emerald-500/30"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-300">Aesthetic Tone of Copywriter</label>
                    <select
                      value={aiTone}
                      onChange={(e) => setAiTone(e.target.value as ReminderTone)}
                      className="w-full bg-slate-900/50 border border-white/5 rounded-xl text-xs px-3 py-2 text-inherit focus:outline-none focus:border-emerald-500/30 font-sans"
                    >
                      <option value="Warm & Professional">Warm & Professional</option>
                      <option value="Urgent & Direct">Urgent & Direct</option>
                      <option value="Playful & Friendly">Playful & Friendly</option>
                      <option value="Slick & Ultra-premium">Slick & Ultra-premium</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-300">Pre-Appointment Timing Interval</label>
                    <div className="grid grid-cols-3 gap-2">
                      {["24h", "2h", "Immediate"].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setReminderTiming(t)}
                          className={`py-1.5 px-3 rounded-xl text-[10px] font-bold font-mono border transition-all ${
                            reminderTiming === t 
                              ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400" 
                              : "bg-slate-900/40 border-white/5 text-slate-400 hover:text-white"
                          }`}
                        >
                          {t.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs">
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full mt-2 py-3 rounded-xl font-extrabold bg-emerald-500 text-slate-950 text-xs transition-all tracking-wide flex items-center justify-center gap-2 cursor-pointer hover:bg-emerald-400"
                >
                  <Check className="w-4 h-4 shrink-0" />
                  {isEditing ? "SaveChanges" : "Create & Deploy Schedule"}
                </button>
              </form>

              {/* RIGHT HALF: Live WhatsApp Bubble Preview */}
              <div className="md:w-[360px] bg-slate-950 p-6 md:p-8 flex flex-col gap-4 relative justify-center bg-gradient-to-b from-slate-950 to-[#0e161e]">
                <div className="flex flex-col gap-0.5 border-b border-white/5 pb-2.5">
                  <span className="text-[10px] font-mono font-bold tracking-wider text-emerald-400">WHATSAPP LIVE PREVIEW</span>
                  <div className="text-xs font-bold font-sans text-slate-200">How clients will view this notification</div>
                </div>

                {/* Simulated iPhone Screen */}
                <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-3 h-80 flex flex-col justify-between overflow-hidden shadow-2xl relative">
                  {/* Status Bar */}
                  <div className="flex items-center justify-between text-[8px] font-mono text-slate-400 px-1 border-b border-white/5 pb-1 select-none">
                    <span>9:41 AM</span>
                    <div className="flex items-center gap-1">
                      <span>LTE</span>
                      <span className="h-2 w-4 border border-slate-400 rounded-sm inline-block" />
                    </div>
                  </div>

                  {/* Conversation Bubble */}
                  <div className="flex-1 py-4 overflow-y-auto px-1">
                    <div className="bg-emerald-900/40 border border-emerald-500/30 text-slate-100 p-3 rounded-2xl rounded-tl-sm text-[10px] max-w-[90%] leading-relaxed shadow-lg whitespace-pre-wrap font-sans relative">
                      {/* Notch Arrow */}
                      <div className="absolute top-0 -left-1 w-2 h-2 bg-emerald-950 border-l border-t border-emerald-500/30 rotate-45 select-none" />
                      {getDraftPreview()}
                    </div>
                  </div>

                  {/* Reply indicators */}
                  <div className="border-t border-white/5 pt-2 flex items-center gap-1">
                    <input 
                      disabled 
                      type="text" 
                      placeholder="Type 1, 2, or 3 to reply..." 
                      className="flex-1 bg-slate-950 border border-white/5 rounded-lg text-[9px] px-2 py-1 text-slate-400"
                    />
                    <button type="button" className="p-1 rounded-md bg-emerald-500/25 border border-emerald-500/20 text-emerald-400">
                      <Send className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 font-sans leading-normal text-center italic">
                  Note: Tone and phrasing adapt automatically. All formatted bold constructs (*text*) render as crisp bold text on user screens.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
