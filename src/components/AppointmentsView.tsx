import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  MagnifyingGlass, 
  Funnel, 
  Trash, 
  Plus, 
  DeviceMobile, 
  User, 
  Clock, 
  CalendarBlank, 
  Check, 
  Warning, 
  X, 
  PencilSimple, 
  CaretLeft, 
  CaretRight, 
  Sparkle, 
  PaperPlaneTilt 
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { Booking, BookingStatus, ReminderTone } from "../types";
import { supabaseMock, Barber } from "../lib/supabase";
import useDebounce from "../hooks/useDebounce";

interface AppointmentsViewProps {
  bookings: Booking[];
  onUpdateBookings: (newBookings: Booking[]) => void;
  addLog: (text: string, type?: string) => void;
}

export default function AppointmentsView({ bookings, onUpdateBookings, addLog }: AppointmentsViewProps) {
  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  // Apply our custom useDebounce hook
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const [statusFilter, setStatusFilter] = useState<string>("");
  const [barberFilter, setBarberFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Selected for edits, bulk deletes
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Delete protection alert state
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

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
        return "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400";
      case "sent":
        return "bg-sky-50 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/30 text-sky-700 dark:text-sky-400";
      case "pending":
        return "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-500";
      case "queued":
        return "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-400";
      case "cancelled":
        return "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400";
      default:
        return "bg-slate-100 dark:bg-slate-500/10 border-slate-200 dark:border-slate-500/30 text-slate-700 dark:text-slate-400";
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
        return `Hello ${clientName || "Customer"}. Please confirm your slot for *${serviceDesc}* with *${businessName}* scheduled on *${dateTime}* at *${timeSlot}*.\n\nYour prompt response ensures resource availability.\n\n-> Confirm: Reply *1*\n-> Reschedule: Reply *2*\n-> Cancel: Reply *3*`;
      case "Playful & Friendly":
        return `Hey ${clientName || "Friend"}! Quick heads up! Your session for *${serviceDesc}* over at *${businessName}* is just around the corner!\n\nWhen: ${dateTime} at ${timeSlot}\n\nWe've prepped everything for you! Can you let us know if you're still on?\n\nQuick Reply:\n1 - Yes, see you there!\n2 - Need to change the time\n3 - Can't make it this time`;
      case "Slick & Ultra-premium":
        return `Dear ${clientName || "Guest"},\n\nWe look forward to hosting you for your reserved *${serviceDesc}* session with *${businessName}*.\n\nReservation Details:\nDate: ${dateTime} | Time: ${timeSlot}\n\nTo ensure flawless preparation, please verify your arrival:\n\nReply *1* to Confirm\nReply *2* to Reschedule\nReply *3* to Cancel`;
      default:
        return `Hi ${clientName || "Customer"}! This is a friendly reminder of your upcoming slot for *${serviceDesc}* with *${businessName}* on *${dateTime}* at *${timeSlot}*.\n\nPlease confirm or manage your slot by choosing one response below:\n\n1 - Confirm Slot\n2 - Reschedule\n3 - Cancel Booking`;
    }
  };

  const draftPreviewText = useMemo(() => getDraftPreview(), [clientName, serviceDesc, dateTime, timeSlot, aiTone]);

  // Save or Edit logic
  const handleSaveAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!clientName.trim() || !phone.trim() || !serviceDesc.trim() || !timeSlot.trim()) {
      const msg = "All parameters are required to generate message preview schedules.";
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    const payload: Omit<Booking, "id"> = {
      clientName,
      phone,
      dateTime,
      timeSlot,
      serviceDesc,
      status: isEditing ? (bookings.find(b => b.id === editId)?.status || "pending") : "pending",
      messageDraft: draftPreviewText,
      createdAt: new Date().toISOString(),
      aiTone,
      history: [{ timestamp: "Just now", action: isEditing ? "Updated parameters" : "Booking created" }]
    };

    try {
      if (isEditing && editId) {
        await fetch(`/api/appointments/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        supabaseMock.saveAppointment({ ...payload, id: editId });
        onUpdateBookings(supabaseMock.getAppointments());
        addLog(`Successfully updated appointment details for: '${clientName}'`, "system");
        toast.success("Appointment updated successfully");
      } else {
        await fetch("/api/appointments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        supabaseMock.saveAppointment(payload);
        onUpdateBookings(supabaseMock.getAppointments());
        addLog(`Created new scheduled reservation slot mapping for ${clientName}`, "sync");
        toast.success("Appointment added");
      }

      setIsModalOpen(false);
      resetForm();
    } catch (err: any) {
      // client-side fail safe fallback
      supabaseMock.saveAppointment({ ...payload, id: editId || undefined });
      onUpdateBookings(supabaseMock.getAppointments());
      toast.success(isEditing ? "Appointment updated" : "Appointment added");
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

  const initDelete = (id: string) => {
    setPendingDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    const id = pendingDeleteId;
    try {
      await fetch(`/api/appointments/${id}`, { method: "DELETE" });
      supabaseMock.deleteAppointment(id);
      onUpdateBookings(supabaseMock.getAppointments());
      setSelectedIds(prev => prev.filter(x => x !== id));
      addLog(`Removed scheduled appointment ID: ${id}`, "system");
      toast.success("Delete confirmed");
    } catch {
      supabaseMock.deleteAppointment(id);
      onUpdateBookings(supabaseMock.getAppointments());
      setSelectedIds(prev => prev.filter(x => x !== id));
      toast.success("Delete confirmed");
    } finally {
      setPendingDeleteId(null);
    }
  };

  const handleBulkDelete = () => {
    selectedIds.forEach(id => {
      supabaseMock.deleteAppointment(id);
    });
    onUpdateBookings(supabaseMock.getAppointments());
    addLog(`Bulk deleted ${selectedIds.length} reservations successfully`, "system");
    toast.success("Delete confirmed");
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

  // Filter application with debounced search
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const matchesSearch = b.clientName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || 
                            b.phone.includes(debouncedSearchTerm) || 
                            b.serviceDesc.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      const matchesStatus = statusFilter === "" || b.status === statusFilter;
      const matchesBarber = barberFilter === "" || b.serviceDesc.toLowerCase().includes(barberFilter.toLowerCase());
      return matchesSearch && matchesStatus && matchesBarber;
    });
  }, [bookings, debouncedSearchTerm, statusFilter, barberFilter]);

  // Pagination bounds
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage) || 1;
  const paginatedList = useMemo(() => {
    return filteredBookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [filteredBookings, currentPage]);

  return (
    <div className="flex flex-col gap-6 font-sans" id="appointments-portal-module">
      {/* Top Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[20px] md:text-[28px] font-bold text-[#111827] dark:text-white font-sans tracking-tight">Appointment Records</h2>
          <p className="text-xs text-[#6b7280] dark:text-slate-400">Create, edit, delete, and configure client dispatch queues.</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="py-2.5 px-4 rounded-xl text-xs font-semibold glass-button-primary text-slate-950 flex items-center gap-2 cursor-pointer transition-all self-start action-btn"
          aria-label="Add new appointment"
        >
          <Plus className="w-4 h-4 shrink-0 action-icon" weight="bold" />
          Add Appointment
        </button>
      </header>

      {/* Filter and Query Board */}
      <section className="p-4 rounded-2xl bg-white dark:bg-[#141a23]/55 border border-[#e2e8f0] dark:border-white/5 shadow-[0_1px_3px_rgba(0,0,0,0.1)] dark:shadow-none flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlass className="absolute left-3 top-3 w-4 h-4 text-slate-400" weight="bold" />
            <input
              type="text"
              placeholder="Search customer, services..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              aria-label="Search appointments"
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-xl text-xs pl-9 pr-4 py-2.5 focus:outline-none focus:border-emerald-500/30 font-sans"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            aria-label="Filter by status"
            className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-xl text-xs px-3 py-2.5 text-inherit focus:outline-none focus:border-emerald-500/30 font-sans"
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
            aria-label="Filter by specialist"
            className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-xl text-xs px-3 py-2.5 text-inherit focus:outline-none focus:border-emerald-500/30 font-sans"
          >
            <option value="">All Specialists</option>
            {barbers.map(b => (
              <option key={b.id} value={b.name}>{b.name}</option>
            ))}
          </select>
        </div>

        {/* Clear selection bulk tool */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl px-3 py-1.5 self-start">
            <span className="text-[11px] font-mono text-emerald-800 dark:text-emerald-400 font-semibold">{selectedIds.length} Selected</span>
            <button
              onClick={handleBulkDelete}
              className="text-rose-600 dark:text-rose-400 hover:text-rose-500 text-xs font-semibold hover:underline flex items-center gap-1 cursor-pointer action-btn"
            >
              <Trash className="w-3.5 h-3.5 trash-icon action-icon" weight="duotone" />
              Delete Bulk
            </button>
          </div>
        )}
      </section>

      {/* Main Datatable Grid */}
      <main className="bg-white dark:bg-[#141a23]/55 border border-[#e2e8f0] dark:border-white/5 shadow-[0_1px_3px_rgba(0,0,0,0.1)] dark:shadow-none rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-[#e2e8f0] dark:border-white/5 text-[#6b7280] dark:text-slate-400 bg-slate-50 dark:bg-white/[0.01] text-[11px] font-semibold tracking-[0.1em] uppercase">
                <th className="py-3 px-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={filteredBookings.length > 0 && selectedIds.length === filteredBookings.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-slate-900 text-[#16a34a] focus:ring-0 cursor-pointer w-4 h-4"
                  />
                </th>
                <th className="py-3 px-3 font-mono">CUSTOMER PROFILE</th>
                <th className="py-3 px-3 font-mono">SERVICE & TIME</th>
                <th className="py-3 px-3 font-mono">TONE STYLE</th>
                <th className="py-3 px-3 font-mono">STATUS</th>
                <th className="py-3 px-4 text-right font-mono">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#6b7280]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Warning className="w-8 h-8 opacity-30 text-emerald-500" weight="duotone" />
                      <p className="font-semibold text-xs text-[#111827] dark:text-white">No Scheduled Bookings Found</p>
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
                      className={`border-b border-[#e2e8f0] dark:border-white/5 transition-colors hover:bg-black/[0.005] dark:hover:bg-white/[0.012] ${
                        isChecked ? "bg-emerald-500/[0.015]" : ""
                      }`}
                    >
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelect(b.id)}
                          className="rounded border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-slate-900 text-[#16a34a] focus:ring-0 cursor-pointer w-4 h-4"
                        />
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-[#111827] dark:text-glow-blue dark:text-slate-200">{b.clientName}</div>
                        <div className="text-[10px] text-[#6b7280] dark:text-slate-400 font-mono mt-0.5">{b.phone}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-[#374151] dark:text-slate-200">{b.serviceDesc}</div>
                        <div className="text-[10px] text-[#6b7280] dark:text-slate-400 font-mono mt-1 flex items-center gap-1.5">
                          <CalendarBlank className="w-3.5 h-3.5 text-[#16a34a]" weight="duotone" />
                          <span>{b.dateTime} | {b.timeSlot}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono text-[#4b5563] dark:text-slate-400 text-[10px] bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded border border-slate-200 dark:border-white/5">
                          {b.aiTone}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${getStatusBadge(b.status)}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2 text-slate-400">
                          <button
                            onClick={() => handleEditInit(b)}
                            className="p-1 px-2.5 rounded-lg border border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-slate-900/50 hover:bg-emerald-500/10 hover:text-[#18a058] transition-all cursor-pointer action-btn"
                            title="Edit Scheduling Info"
                            aria-label={`Edit appointment for ${b.clientName}`}
                          >
                            <PencilSimple className="w-4 h-4 action-icon" weight="duotone" />
                          </button>
                          <button
                            onClick={() => initDelete(b.id)}
                            className="p-1 px-2.5 rounded-lg border border-rose-100 dark:border-rose-500/10 hover:bg-rose-500/20 bg-rose-50 dark:bg-rose-500/5 text-rose-600 dark:text-rose-400 hover:text-rose-500 transition-all cursor-pointer action-btn"
                            title="Delete Entry"
                            aria-label={`Delete appointment for ${b.clientName}`}
                          >
                            <Trash className="w-4 h-4 trash-icon action-icon" weight="duotone" />
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

        {/* Footer controls for pagination */}
        {filteredBookings.length > 0 && (
          <footer className="p-4 border-t border-[#e2e8f0] dark:border-white/5 flex items-center justify-between text-xs bg-slate-50 dark:bg-white/[0.005]">
            <span className="text-[#6b7280] dark:text-slate-400 font-mono">
              Displaying {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredBookings.length)} of {filteredBookings.length}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 bg-slate-100 dark:bg-slate-900 disabled:opacity-30 cursor-pointer action-btn transition-colors"
                aria-label="Previous Page"
              >
                <CaretLeft className="w-4 h-4 action-icon" weight="bold" />
              </button>
              <span className="font-mono px-3 font-semibold text-[#111827] dark:text-slate-200">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 bg-slate-100 dark:bg-slate-900 disabled:opacity-30 cursor-pointer action-btn transition-colors"
                aria-label="Next Page"
              >
                <CaretRight className="w-4 h-4 action-icon" weight="bold" />
              </button>
            </div>
          </footer>
        )}
      </main>

      {/* DIALOG/ALERT: DELETE CONFIRMATION */}
      <AnimatePresence>
        {pendingDeleteId && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPendingDeleteId(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white dark:bg-[#141a23] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-2xl z-10 text-left flex flex-col gap-4 text-inherit"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-full bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  <Warning className="w-6 h-6" weight="duotone" />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-[#111827] dark:text-white font-sans">Delete Appointment</h3>
                  <p className="text-xs text-[#6b7280] dark:text-slate-400">Are you sure you want to delete this appointment for {bookings.find(b => b.id === pendingDeleteId)?.clientName}?</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">This action is irreversible. The AI scheduled logs and conversation templates for this client will be removed.</p>
              
              <footer className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  onClick={() => setPendingDeleteId(null)}
                  className="px-4 py-2 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold text-[#6b7280] dark:text-slate-400/90 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/10 cursor-pointer transition-colors"
                >
                  Confirm Delete
                </button>
              </footer>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
              className="relative w-full max-w-4xl bg-white dark:bg-[#151c27] md:glass-panel-heavy rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl flex flex-col md:flex-row text-inherit"
            >
              <div className="absolute right-4 top-4 z-50">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-[#6b7280] dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  aria-label="Close dialog"
                >
                  <X className="w-5 h-5" weight="bold" />
                </button>
              </div>

              {/* LEFT HALF: Interactive Form */}
              <form onSubmit={handleSaveAppointment} className="flex-1 p-6 md:p-8 flex flex-col gap-4 border-r border-[#e2e8f0] dark:border-white/5">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2 text-[#111827] dark:text-white font-sans">
                    <Sparkle className="w-5 h-5 text-emerald-500 animate-pulse" weight="duotone" />
                    {isEditing ? "Modify Scheduled Appointment" : "Schedule New AI Reminder"}
                  </h3>
                  <p className="text-xs text-[#6b7280] dark:text-slate-400 mt-1">Configure parameters to trigger the AI message generation chain.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="client-full-name-field" className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#4b5563] dark:text-slate-300">Customer Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" weight="duotone" />
                      <input
                        id="client-full-name-field"
                        type="text"
                        placeholder="Emery Vance"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        required
                        className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-xl text-xs pl-9 pr-4 py-2 focus:outline-none focus:border-emerald-500/30 font-sans"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label htmlFor="whatsapp-number-field" className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#4b5563] dark:text-slate-300">WhatsApp Mobile Number</label>
                    <div className="relative">
                      <DeviceMobile className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" weight="duotone" />
                      <input
                        id="whatsapp-number-field"
                        type="tel"
                        placeholder="+1 (555) 304-2098"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-xl text-xs pl-9 pr-4 py-2 focus:outline-none focus:border-emerald-500/30 font-sans"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="appointment-date-field" className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#4b5563] dark:text-slate-300">Appointment Date</label>
                    <div className="relative">
                      <CalendarBlank className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" weight="duotone" />
                      <input
                        id="appointment-date-field"
                        type="date"
                        value={dateTime}
                        onChange={(e) => setDateTime(e.target.value)}
                        required
                        className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-xl text-xs pl-9 pr-4 py-2 focus:outline-none focus:border-emerald-500/30 font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label htmlFor="time-slot-assignment-field" className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#4b5563] dark:text-slate-300">Time Slot Assignment</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" weight="duotone" />
                      <input
                        id="time-slot-assignment-field"
                        type="text"
                        placeholder="02:30 PM"
                        value={timeSlot}
                        onChange={(e) => setTimeSlot(e.target.value)}
                        required
                        className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-xl text-xs pl-9 pr-4 py-2 focus:outline-none focus:border-emerald-500/30 font-sans"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="service-or-appointment-spec-field" className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#4b5563] dark:text-slate-300">Service or Appointment Spec</label>
                  <input
                    id="service-or-appointment-spec-field"
                    type="text"
                    placeholder="Classic Hot Towel Shave & Tapering"
                    value={serviceDesc}
                    onChange={(e) => setServiceDesc(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-xl text-xs px-3.5 py-2.5 focus:outline-none focus:border-emerald-500/30 font-sans"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="aesthetic-tone-field" className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#4b5563] dark:text-slate-300">Aesthetic Tone of Copywriter</label>
                    <select
                      id="aesthetic-tone-field"
                      value={aiTone}
                      onChange={(e) => setAiTone(e.target.value as ReminderTone)}
                      className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-xl text-xs px-3 py-2.5 text-inherit focus:outline-none focus:border-emerald-500/30 font-sans"
                    >
                      <option value="Warm & Professional">Warm & Professional</option>
                      <option value="Urgent & Direct">Urgent & Direct</option>
                      <option value="Playful & Friendly">Playful & Friendly</option>
                      <option value="Slick & Ultra-premium">Slick & Ultra-premium</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#4b5563] dark:text-slate-300">Pre-Appointment Timing Interval</label>
                    <div className="grid grid-cols-3 gap-2">
                      {["24h", "2h", "Immediate"].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setReminderTiming(t)}
                          className={`py-1.5 px-3 rounded-xl text-[10px] font-bold font-mono border transition-all cursor-pointer ${
                            reminderTiming === t 
                              ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400" 
                              : "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-white/5 text-[#6b7280] dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
                          }`}
                        >
                          {t.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-sans">
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full mt-2 py-3 rounded-xl font-bold bg-[#16a34a] text-white hover:bg-emerald-600 text-xs transition-all tracking-wide flex items-center justify-center gap-2 cursor-pointer action-btn shadow-lg shadow-emerald-700/10"
                >
                  <Check className="w-4 h-4 shrink-0 action-icon" weight="bold" />
                  {isEditing ? "Save Changes" : "Create & Deploy Schedule"}
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
                  <div className="flex items-center justify-between text-[8px] font-mono text-slate-400 px-1 select-none">
                    <span>9:41 AM</span>
                    <div className="flex items-center gap-1">
                      <span>LTE</span>
                      <span className="h-2 w-4 border border-slate-400 rounded-sm inline-block" />
                    </div>
                  </div>

                  {/* Conversation Bubble */}
                  <div className="flex-1 py-3 overflow-y-auto px-1">
                    <div className="bg-emerald-900/40 border border-emerald-500/30 text-slate-100 p-3 rounded-2xl rounded-tl-sm text-[10px] max-w-[90%] leading-relaxed shadow-lg whitespace-pre-wrap font-sans relative">
                      {/* Notch Arrow */}
                      <div className="absolute top-0 -left-1 w-2 h-2 bg-emerald-950 border-l border-t border-emerald-500/30 rotate-45 select-none" />
                      {draftPreviewText}
                    </div>
                  </div>

                  {/* Character counter dynamically floating */}
                  <div className="text-[9px] font-mono text-slate-500 text-right pr-2">
                    {draftPreviewText.length} characters
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
                      <PaperPlaneTilt className="w-3.5 h-3.5" weight="duotone" />
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
