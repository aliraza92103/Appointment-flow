import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Robot as Bot, 
  SquaresFour as LayoutDashboard, 
  Calendar, 
  Users, 
  Bell, 
  ChartLineUp as Activity, 
  Gear as Settings, 
  DeviceMobile as Smartphone, 
  SignOut as LogOut, 
  List as Menu, 
  X,
  Sparkle as Sparkles,
  ArrowsClockwise as RefreshCw,
  PaperPlaneRight as Send,
  WifiHigh as Wifi,
  BatteryFull as Battery,
  Flame,
  CheckCircle as CheckCircle2,
  Trash as Trash2,
  Lock,
  User,
  Info
} from "@phosphor-icons/react";
import { Toaster, toast } from "sonner";

import { Booking, ReminderTone } from "./types";
import { supabaseMock, Barber } from "./lib/supabase";
import ThemeToggle from "./components/ThemeToggle";
import AuthView from "./components/AuthView";
import DashboardView from "./components/DashboardView";
import AppointmentsView from "./components/AppointmentsView";
import BarbersView from "./components/BarbersView";
import RemindersView from "./components/RemindersView";
import AnalyticsView from "./components/AnalyticsView";
import SettingsView from "./components/SettingsView";
import AnimatedList from "./components/AnimatedList";
import HeroLandingView from "./components/HeroLandingView";

export default function App() {
  // Enhancements: Init & Utilities states
  const [appInitializing, setAppInitializing] = useState(true);
  const [showCookieBanner, setShowCookieBanner] = useState(() => {
    return localStorage.getItem("appointflow_cookie_consent") !== "true";
  });
  const [showBackToTop, setShowBackToTop] = useState(false);

  const handleAcceptCookies = () => {
    localStorage.setItem("appointflow_cookie_consent", "true");
    setShowCookieBanner(false);
  };

  // Theme & Session coordinates
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(() => {
    const saved = localStorage.getItem("appointflow_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [currentRoute, setCurrentRoute] = useState<"landing" | "login" | "dashboard">(() => {
    const saved = localStorage.getItem("appointflow_user");
    return saved ? "dashboard" : "landing";
  });

  const [currentView, setCurrentView] = useState("Dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Active bookings queue
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  
  // Custom toast notification states
  const [toasts, setToasts] = useState<Array<{ id: string; msg: string; type?: "success" | "error" | "info" }>>([]);

  // Sandbox States (Original Simulator)
  const [userName, setUserName] = useState("Emery Vance");
  const [userPhone, setUserPhone] = useState("+1 (555) 304-2098");
  const [serviceDesc, setServiceDesc] = useState("Elite High-Fade Restructuring");
  const [appDate, setAppDate] = useState("2026-06-16");
  const [appTime, setAppTime] = useState("10:00 AM");
  const [businessName, setBusinessName] = useState(() => {
    try {
      const savedSettings = localStorage.getItem("ap_settings");
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (parsed.businessName) return parsed.businessName;
      }
    } catch (e) {}
    return "Your Brand Studio";
  });
  const [selectedTone, setSelectedTone] = useState<ReminderTone>("Warm & Professional");
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [currentDraft, setCurrentDraft] = useState("");
  const [phoneActiveMsg, setPhoneActiveMsg] = useState("");
  const [simulatedReply, setSimulatedReply] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Custom webhook logger
  const [webhookLogs, setWebhookLogs] = useState<Array<{ time: string; text: string; type: string }>>([
    { time: "09:41:00", text: "Webhook receiver live on port 3000.", type: "system" },
    { time: "10:02:15", text: "Google Calendar sync check complete: 0 bookings synced.", type: "sync" },
    { time: "12:15:30", text: "Sent reminder payload for Emery Vance (Dispatch code: 202).", type: "outbound" }
  ]);

  // Load bookings from server or supabase mock on mount
  useEffect(() => {
    fetch("/api/appointments")
      .then(res => res.json())
      .then(data => {
        const appointmentList = Array.isArray(data) 
          ? data 
          : (data && Array.isArray(data.appointments) ? data.appointments : []);
        setBookings(appointmentList);
        if (appointmentList.length > 0) {
          setSelectedBooking(appointmentList[0]);
          setPhoneActiveMsg(appointmentList[0].messageDraft);
        }
      })
      .catch(() => {
        const localData = supabaseMock.getAppointments();
        setBookings(localData);
        if (localData.length > 0) {
          setSelectedBooking(localData[0]);
          setPhoneActiveMsg(localData[0].messageDraft);
        }
      });

    // Check Gemini API Key status
    fetch("/api/key-status")
      .then((res) => res.json())
      .then((data) => {
        setHasApiKey(data.hasKey);
      })
      .catch(() => {});
  }, []);

  // Simulating initializing state
  useEffect(() => {
    const timer = setTimeout(() => {
      setAppInitializing(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Back to top scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Update simulator fields based on selected booking
  useEffect(() => {
    if (selectedBooking) {
      setUserName(selectedBooking.clientName);
      setUserPhone(selectedBooking.phone);
      setServiceDesc(selectedBooking.serviceDesc);
      setAppDate(selectedBooking.dateTime);
      setAppTime(selectedBooking.timeSlot);
      setSelectedTone(selectedBooking.aiTone as ReminderTone);
      setPhoneActiveMsg(selectedBooking.messageDraft);
    }
  }, [selectedBooking]);

  const addLog = (text: string, type = "info") => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    setWebhookLogs(prev => [{ time, text, type }, ...prev].slice(0, 15));
  };

  const showToast = (msg: string, type: "success" | "info" | "error" = "success") => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const handleLoginSuccess = (name: string, email: string) => {
    const userSession = { name, email };
    setCurrentUser(userSession);
    localStorage.setItem("appointflow_user", JSON.stringify(userSession));
    setCurrentRoute("dashboard");
    showToast("Successfully authenticated workspace session");
    addLog(`Enterprise portal session loaded under: ${email}`, "system");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("appointflow_user");
    setCurrentRoute("landing");
    showToast("Workspace session expired safely", "info");
  };

  const handleSelectBookingFromQueue = (booking: Booking) => {
    setSelectedBooking(booking);
    setPhoneActiveMsg(booking.messageDraft);
    setSimulatedReply("");
  };

  // Live Generator and Sandbox simulation
  const handleGenerateAICopy = async () => {
    setIsGenerating(true);
    setCurrentDraft("");
    showToast("Accessing Gemini language generation chain...", "info");

    try {
      const response = await fetch("/api/generate-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: userName,
          bookingDate: appDate,
          bookingTime: appTime,
          bookingDesc: serviceDesc,
          companyName: businessName,
          tone: selectedTone,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setCurrentDraft(data.text);
        addLog(`AI Content Engine initialized using style: '${selectedTone}'`, "system");
        
        // Show simulated typing on the mock phone
        setIsTyping(true);
        setTimeout(() => {
          setPhoneActiveMsg(data.text);
          setIsTyping(false);
          showToast("AI reminder copy synthesised successfully");
        }, 1200);
      } else {
        throw new Error(data.error || "Generation error");
      }
    } catch (err: any) {
      addLog(`Failed to compile AI copy: ${err.message}`, "error");
      const localForm = `Hi ${userName}! This is a friendly reminder of your upcoming slot for *${serviceDesc}* with *${businessName}* on *${appDate}* at *${appTime}*.\n\nPlease confirm or manage your slot by choosing one response below:\n\n1 - Confirm Slot\n2 - Reschedule\n3 - Cancel Booking`;
      setCurrentDraft(localForm);
      setPhoneActiveMsg(localForm);
      showToast("Dynamic generation fallen back to local templates", "info");
    } finally {
      setIsGenerating(false);
    }
  };

  // Dispatch reminder simulation
  const handleScheduleReminder = () => {
    if (!userName || !serviceDesc) {
      showToast("Please provide customer details.", "error");
      return;
    }

    setIsSending(true);
    showToast("Syncing with corporate WhatsApp Gateway...", "info");
    addLog(`Registering new scheduled slot for ${userName} in AppointFlow Db...`, "sync");

    const payload: Omit<Booking, "id"> = {
      clientName: userName,
      phone: userPhone,
      dateTime: appDate,
      timeSlot: appTime,
      serviceDesc,
      status: "sent",
      messageDraft: phoneActiveMsg || currentDraft || `Hi ${userName}! Reminder for ${serviceDesc} on ${appDate} at ${appTime}.`,
      createdAt: new Date().toISOString(),
      aiTone: selectedTone,
      history: [{ timestamp: "Just now", action: "Dispatched direct to client's WhatsApp chat" }]
    };

    setTimeout(() => {
      const saved = supabaseMock.saveAppointment(payload);
      const appts = supabaseMock.getAppointments();
      setBookings(appts);
      setSelectedBooking(saved);
      addLog(`WebSocket dispatch success to ${userPhone}. Match Session ID: ${saved.id}`, "outbound");
      setIsSending(false);
      showToast("WhatsApp reminder dispatched to recipient device successfully");
    }, 1500);
  };

  // Simulated Client Responses
  const handleSimulatedReply = (replyCode: string, replyText: string) => {
    if (!selectedBooking) return;
    
    setSimulatedReply(replyText);
    addLog(`Incoming WhatsApp Webhook received from ${selectedBooking.phone}: "${replyCode}"`, "webhook");

    let nextStatus: Booking['status'] = "confirmed";
    let historyMessage = "Client Replied '1' (Confirmed Slot)";

    if (replyCode === "2") {
      nextStatus = "rescheduled";
      historyMessage = "Client Replied '2' (Requested Reschedule)";
    } else if (replyCode === "3") {
      nextStatus = "cancelled";
      historyMessage = "Client Replied '3' (Cancelled Reservation)";
    }

    // Save in storage
    supabaseMock.saveAppointment({
      ...selectedBooking,
      status: nextStatus,
      history: [...selectedBooking.history, { timestamp: "Just now", action: historyMessage }]
    });

    const updatedList = supabaseMock.getAppointments();
    setBookings(updatedList);
    setSelectedBooking(updatedList.find(b => b.id === selectedBooking.id) || null);

    showToast(`Processed webhook status event: '${nextStatus}'`);
    addLog(`Webhook successfully processed: Updated reservation ${selectedBooking.id} status to '${nextStatus}'.`, "system");
  };

  // Navigations Links
  const navigationItems = [
    { title: "Dashboard", icon: LayoutDashboard },
    { title: "Appointments", icon: Calendar },
    { title: "Specialists", icon: Users },
    { title: "Reminders Queue", icon: Bell },
    { title: "Interactive Sandbox", icon: Smartphone },
    { title: "Performance Data", icon: Activity },
    { title: "Settings Manager", icon: Settings }
  ];

  // Router mapping for landing and login views
  if (appInitializing) {
    return (
      <div className="fixed inset-0 bg-[#0b0f14] flex flex-col items-center justify-center z-50" id="app-initializing-splash">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full bg-emerald-500/10 blur-[120px] spotlight-pulse" />
        </div>
        <div className="relative flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-emerald-500/20 flex items-center justify-center shadow-xl shadow-emerald-500/10">
            <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-black tracking-wider text-white font-sans">AppointFlow</h2>
            <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mt-1">
              Synchronizing scheduling clusters...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (currentRoute === "landing") {
    return (
      <>
        <HeroLandingView 
          onGetStarted={() => setCurrentRoute("login")} 
          onSignIn={() => setCurrentRoute("login")}
          businessName={businessName}
        />
        {/* Cookie notice banner on landing */}
        {showCookieBanner && (
          <div className="fixed bottom-6 left-6 right-6 md:left-auto md:max-w-md z-50 p-5 rounded-2xl glass-panel-heavy border border-white/10 shadow-2xl flex flex-col gap-3" id="cookie-notice-banner">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-2.5 items-start">
                <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" weight="duotone" />
                <div className="flex flex-col gap-1">
                  <h4 className="text-xs font-bold text-white leading-tight">Privacy Consent</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                    We use cookies to secure persistent enterprise credentials and optimize real-time telemetry pipelines.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowCookieBanner(false)}
                className="text-slate-500 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex gap-2 justify-end">
              <button 
                onClick={handleAcceptCookies}
                className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-450 text-slate-950 text-[10px] font-extrabold transition-all cursor-pointer shadow-sm shadow-emerald-500/10"
              >
                Acknowledge
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  if (currentRoute === "login" || !currentUser) {
    return (
      <AuthView 
        onLoginSuccess={handleLoginSuccess}
        onBackToLanding={() => setCurrentRoute("landing")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0b0f14] text-slate-800 dark:text-theme-primary flex relative transition-colors duration-300 antialiased" id="appointflow-app-shell">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-radial-gradient from-emerald-500/5 via-transparent to-transparent pointer-events-none -z-10" />

      {/* --- TOAST PANEL MANAGER --- */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              className="p-4 rounded-2xl glass-panel-heavy border border-white/10 shadow-lg pointer-events-auto flex items-start gap-3"
            >
              <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${
                t.type === "error" ? "text-rose-500" : t.type === "info" ? "text-sky-400" : "text-emerald-400"
              }`} />
              <div className="text-xs font-semibold leading-relaxed text-glow-blue select-all">{t.msg}</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* --- DESKTOP SIDEBAR PANEL --- */}
      <aside 
        className={`hidden md:flex flex-col gap-6 p-5 border-r border-[#e2e8f0] dark:border-white/5 bg-[#ffffff] dark:bg-slate-950/20 backdrop-blur-xl h-screen sticky top-0 transition-all duration-300 shrink-0 z-40 ${
          sidebarCollapsed ? "w-20" : "w-64"
        }`}
        id="desktop-main-sidebar"
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3 border-b border-[#e2e8f0] dark:border-white/5 pb-4 bg-white dark:bg-transparent -mx-5 px-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5 text-[#16a34a] dark:text-emerald-400" />
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold tracking-tight text-[#111827] dark:text-white font-sans text-sm">AppointFlow</span>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold uppercase -mt-0.5">Automations V2</span>
            </div>
          )}
        </div>

        {/* Navigation Menus List */}
        <nav className="flex-1 flex flex-col gap-1.5 overflow-y-auto">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const isMatch = currentView === item.title;
            return (
              <button
                key={item.title}
                onClick={() => setCurrentView(item.title)}
                className={`py-3 px-3.5 rounded-xl text-xs font-bold text-left flex items-center gap-3 transition-all cursor-pointer relative ${
                  isMatch 
                    ? "bg-[#f0fdf4] dark:bg-emerald-500/10 border border-[#16a34a]/20 dark:border-emerald-500/25 text-[#16a34a] dark:text-emerald-400 border-l-4 border-l-[#16a34a] dark:border-l-emerald-400" 
                    : "text-[#374151] dark:text-slate-400 hover:text-emerald-600 dark:hover:text-white hover:bg-[#f0fdf4]/45 dark:hover:bg-white/5"
                }`}
                title={item.title}
              >
                <IconComponent className="w-4 h-4 shrink-0" />
                {!sidebarCollapsed && <span>{item.title}</span>}
              </button>
            );
          })}
        </nav>

        {/* User Session profile Footer */}
        <div className="border-t border-[#e2e8f0] dark:border-white/5 pt-4 flex flex-col gap-3">
          <div className="flex items-center gap-2.5 bg-[#f9fafb] dark:bg-transparent p-2 rounded-xl border border-slate-100 dark:border-transparent">
            <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-white/10 text-[#16a34a] dark:text-emerald-400 flex items-center justify-center font-mono font-bold text-xs shrink-0 select-none">
              JD
            </div>
            {!sidebarCollapsed && (
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[11px] font-bold text-[#374151] dark:text-white truncate leading-none">{currentUser.name}</span>
                <span className="text-[9px] text-[#6b7280] dark:text-slate-400 font-mono truncate leading-none">{currentUser.email}</span>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-2.5 rounded-xl border border-[#e2e8f0]/30 dark:border-rose-500/10 hover:border-rose-500/20 bg-rose-500/5 text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 font-bold transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            {!sidebarCollapsed && <span>Logout Account</span>}
          </button>
        </div>
      </aside>

      {/* --- WORKSPACE CONTAINER WRAPPER --- */}
      <div className="flex-1 flex flex-col min-w-0 relative h-screen overflow-y-auto">
        
        {/* --- STICKY NAVIGATION TOPBAR --- */}
        <header className="sticky top-0 w-full z-30 border-b border-[#e2e8f0] dark:border-white/5 bg-[#ffffff] dark:bg-slate-950/10 backdrop-blur-md py-4 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger menu */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl border border-[#e2e8f0] dark:border-white/10 text-[#374151] dark:text-inherit hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer flex items-center justify-center"
              aria-label="Open navigation menu"
            >
              <Menu className="w-4 h-4 text-[#374151] dark:text-white" />
            </button>
            
            <h1 className="text-sm font-bold font-mono tracking-wider text-[#6b7280] dark:text-slate-400 uppercase hidden sm:inline-block">PORTAL WORKSPACE</h1>
            <span className="text-xs text-[#6b7280] dark:text-slate-500 uppercase hidden sm:inline-block">/</span>
            <span className="text-sm font-bold text-[#111827] dark:text-white">{currentView.toUpperCase()}</span>
          </div>

          <div className="flex items-center gap-3.5">
            {/* Theme Toggle buttons */}
            <ThemeToggle />

            {/* Quick Profile initials */}
            <div className="w-8 h-8 rounded-full border border-[#e2e8f0] dark:border-white/10 bg-emerald-500/10 flex items-center justify-center text-[#16a34a] dark:text-emerald-400 font-mono font-bold text-xs select-none">
              JD
            </div>
          </div>
        </header>

        {/* --- MAIN PAGE VIEWS ROUTER PANEL --- */}
        <main className="p-6 md:p-8 flex-1 max-w-7xl mx-auto w-full pb-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {currentView === "Dashboard" && (
                <DashboardView 
                  bookings={bookings} 
                  addLog={addLog} 
                  webhookLogs={webhookLogs} 
                  onNavigate={(page) => setCurrentView(page)}
                />
              )}

              {currentView === "Appointments" && (
                <AppointmentsView 
                  bookings={bookings} 
                  onUpdateBookings={(updated) => {
                    setBookings(updated);
                    if (updated.length > 0) setSelectedBooking(updated[0]);
                  }} 
                  addLog={addLog}
                />
              )}

              {currentView === "Specialists" && (
                <BarbersView 
                  addLog={addLog} 
                />
              )}

              {currentView === "Reminders Queue" && (
                <RemindersView 
                  addLog={addLog} 
                />
              )}

              {currentView === "Performance Data" && (
                <AnalyticsView />
              )}

              {currentView === "Settings Manager" && (
                <SettingsView 
                  onSaveToast={(m) => showToast(m)} 
                  addLog={addLog}
                />
              )}

              {/* --- INTEGRATED SIMULATOR SANDBOX --- */}
              {currentView === "Interactive Sandbox" && (
                <div className="flex flex-col gap-6" id="interactive-sandbox-root">
                  <div>
                    <h2 className="text-xl font-bold">Simulator Workbench</h2>
                    <p className="text-xs text-muted font-sans mt-0.5">Design customized messaging models, generated by Gemini and test delivery logs.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch relative z-10" id="sandbox-grid-layout">
                    {/* LEFT Column controls */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                      <div className="p-6 rounded-3xl glass-panel flex flex-col gap-4 border border-white/5">
                        <h3 className="text-[#00ff88] text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 select-none">
                          <span className="w-2 h-2 rounded-full bg-[#25D366] animate-ping" />
                          1. Configurator
                        </h3>
                        
                        <div className="flex flex-col gap-3.5">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-white/40 tracking-wider font-mono font-medium uppercase font-bold">Client Full Name</label>
                            <input 
                              type="text" 
                              value={userName} 
                              onChange={(e) => setUserName(e.target.value)}
                              className="w-full bg-slate-900/40 border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/30"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-white/40 tracking-wider font-mono font-medium uppercase font-bold">WhatsApp Number</label>
                            <input 
                              type="text" 
                              value={userPhone} 
                              onChange={(e) => setUserPhone(e.target.value)}
                              className="w-full bg-slate-900/40 border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/30 font-mono"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] text-white/40 tracking-wider font-mono uppercase font-bold">Date Slot</label>
                              <input 
                                type="date" 
                                value={appDate} 
                                onChange={(e) => setAppDate(e.target.value)}
                                className="w-full bg-slate-900/40 border border-white/5 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/30"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] text-white/40 tracking-wider font-mono uppercase font-bold">Hour Time</label>
                              <input 
                                type="text" 
                                value={appTime} 
                                onChange={(e) => setAppTime(e.target.value)}
                                className="w-full bg-slate-900/40 border border-white/5 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/30"
                              />
                            </div>
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-white/40 tracking-wider font-mono font-medium uppercase font-bold">Service Specifics</label>
                            <input 
                              type="text" 
                              value={serviceDesc} 
                              onChange={(e) => setServiceDesc(e.target.value)}
                              className="w-full bg-slate-900/40 border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/30"
                            />
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] text-white/40 tracking-wider font-mono font-medium uppercase font-bold">AI Narrative copywriting style</label>
                            <div className="grid grid-cols-2 gap-1.5">
                              {(["Warm & Professional", "Urgent & Direct", "Playful & Friendly", "Slick & Ultra-premium"] as ReminderTone[]).map((t) => (
                                <button
                                  key={t}
                                  type="button"
                                  onClick={() => setSelectedTone(t)}
                                  className={`text-[9px] py-1.5 rounded-lg border text-center transition-all outline-none font-bold ${
                                    selectedTone === t
                                      ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 font-extrabold"
                                      : "bg-slate-900/40 border-white/5 text-slate-400 hover:border-white/10"
                                  }`}
                                >
                                  {t}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 mt-2">
                            <button
                              onClick={handleGenerateAICopy}
                              disabled={isGenerating}
                              className="w-full py-2.5 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/5 text-emerald-400 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              {isGenerating ? (
                                <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                              ) : (
                                <Sparkles className="w-4.5 h-4.5 text-emerald-400" />
                              )}
                              Compile AI Copy
                            </button>

                            <button
                              onClick={handleScheduleReminder}
                              disabled={isSending || isGenerating}
                              className="w-full py-3 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/10"
                            >
                              <Send className="w-4 h-4 text-emerald-950" />
                              Send Simulated SMS
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CENTER Column queues */}
                    <div className="lg:col-span-4 flex flex-col">
                      <div className="p-6 rounded-3xl glass-panel h-full flex flex-col justify-between border border-white/5">
                        <AnimatedList 
                          bookings={bookings} 
                          onSelectBooking={handleSelectBookingFromQueue} 
                          selectedBookingId={selectedBooking?.id}
                        />

                        {/* Logs */}
                        <div className="mt-6 pt-4 border-t border-white/5 flex flex-col gap-2">
                          <span className="text-[10px] text-white/30 font-mono flex items-center gap-1.5 uppercase font-bold select-none">
                            <Activity className="w-3.5 h-3.5 text-[#25D366] animate-pulse" />
                            Live Telemetry Logs
                          </span>
                          <div className="bg-slate-950/60 rounded-xl p-2.5 max-h-[140px] overflow-y-auto font-mono text-[9px] text-[#00ff88] border border-white/5 flex flex-col gap-1 select-none">
                            {webhookLogs.map((log, index) => (
                              <div key={index} className="flex gap-1.5 leading-relaxed">
                                <span className="text-white/35">[{log.time}]</span>
                                <span className={log.type === "error" ? "text-rose-400" : log.type === "webhook" ? "text-sky-400" : ""}>
                                  {log.text}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT iPhone device view */}
                    <div className="lg:col-span-4 flex flex-col items-center justify-center">
                      <div className="relative w-full max-w-[310px] h-[610px] rounded-[48px] border-[12px] border-[#1d2633] bg-[#0b0f14] shadow-2xl flex flex-col overflow-hidden select-none">
                        {/* Notch */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#1d2633] rounded-b-2xl z-40 flex items-center justify-center">
                          <div className="w-12 h-1 bg-[#101520] rounded-full mr-2" />
                          <div className="w-2 h-2 rounded-full bg-[#101520]" />
                        </div>

                        {/* Status bar */}
                        <div className="pt-7 px-6 pb-2 bg-[#121c25] flex justify-between items-center text-[10px] text-white/70">
                          <span>12:45</span>
                          <div className="flex items-center gap-1.5">
                            <Wifi className="w-3.5 h-3.5" />
                            <Battery className="w-4 h-4" />
                          </div>
                        </div>

                        {/* Chat header */}
                        <div className="bg-[#121c25] pb-3 px-3.5 border-b border-white/5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-[#25D366]/30 flex items-center justify-center relative">
                              <span className="text-[10px] font-bold text-[#25D366]">SA</span>
                            </div>
                            <div>
                              <h4 className="text-[11px] font-bold text-white leading-tight">{businessName}</h4>
                              <span className="text-[9px] text-[#00ff88]">verified account</span>
                            </div>
                          </div>
                        </div>

                        {/* Conversations thread */}
                        <div className="flex-grow p-3 bg-[#0e1621] overflow-y-auto flex flex-col gap-3">
                          {selectedBooking && (
                            <div className="rounded-2xl rounded-tl-none bg-[#122c22] border border-[#25D366]/30 p-3 max-w-[85%] self-start flex flex-col gap-1.5">
                              {isTyping ? (
                                <div className="flex items-center gap-1.5 p-1">
                                  <span className="w-1.5 h-1.5 bg-[#25D366] rounded-full animate-bounce" />
                                  <span className="w-1.5 h-1.5 bg-[#25D366] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                  <span className="w-1.5 h-1.5 bg-[#25D366] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                </div>
                              ) : (
                                <p className="text-[11px] leading-relaxed text-slate-100 whitespace-pre-wrap">{phoneActiveMsg || selectedBooking.messageDraft}</p>
                              )}
                              <span className="text-[8px] text-slate-400 font-mono text-right">12:45✓✓</span>
                            </div>
                          )}

                          {simulatedReply && (
                            <div className="rounded-2xl rounded-tr-none bg-[#121a22] border border-white/5 p-3 max-w-[85%] self-end flex flex-col gap-1 text-right">
                              <p className="text-[11px] text-slate-100 font-bold">{simulatedReply}</p>
                              <span className="text-[8px] text-slate-400 font-mono">12:46✓✓</span>
                            </div>
                          )}
                        </div>

                        {/* Interactive Client replies simulator */}
                        {selectedBooking && (
                          <div className="p-3 bg-[#121c25] border-t border-white/5 flex flex-col gap-2">
                            <span className="text-[9px] text-center font-mono opacity-50 font-bold uppercase select-none">Client reply options</span>
                            <div className="grid grid-cols-1 gap-1.5">
                              <button
                                onClick={() => handleSimulatedReply("1", "Confirm Slot ✅ (1)")}
                                className="py-1.5 px-3 rounded-xl border border-white/5 hover:border-emerald-500/20 bg-slate-900 text-slate-200 text-[10px] font-bold cursor-pointer"
                              >
                                Reply 1 (Confirm Appointment)
                              </button>
                              <button
                                onClick={() => handleSimulatedReply("2", "Reschedule 🔄 (2)")}
                                className="py-1.5 px-3 rounded-xl border border-white/5 hover:border-purple-500/20 bg-slate-900 text-slate-200 text-[10px] font-bold cursor-pointer"
                              >
                                Reply 2 (Request Reschedule)
                              </button>
                              <button
                                onClick={() => handleSimulatedReply("3", "Cancel Booking ❌ (3)")}
                                className="py-1.5 px-3 rounded-xl border border-white/5 hover:border-rose-500/20 bg-slate-900 text-slate-200 text-[10px] font-bold cursor-pointer"
                              >
                                Reply 3 (Cancel Reservation)
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!["Dashboard", "Appointments", "Specialists", "Reminders Queue", "Performance Data", "Settings Manager", "Interactive Sandbox"].includes(currentView) && (
                <div className="flex flex-col items-center justify-center py-20 text-center gap-6" id="unrecognized-route-404">
                  <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-500">
                    <Info className="w-8 h-8" weight="duotone" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Workspace View Not Found</h3>
                    <p className="text-xs text-[#6b7280] dark:text-slate-400 font-sans max-w-sm">
                      The active control module segment could not be loaded. This might be due to a malformed direct session link.
                    </p>
                  </div>
                  <button 
                    onClick={() => setCurrentView("Dashboard")}
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-450 text-slate-950 text-xs font-extrabold transition-all cursor-pointer shadow-lg shadow-emerald-500/10"
                  >
                    Return to Safe Desk
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* --- MOBILE FULL-SCREEN NAVIGATION DRAMA --- */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            {/* Backdrop filter overlay drawer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            {/* Moving block panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-72 max-w-[80vw] bg-slate-950 border-r border-white/10 h-full p-6 flex flex-col gap-6"
            >
              <div className="absolute right-4 top-4">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer flex items-center justify-center"
                  aria-label="Close navigation menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Brand Title */}
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <Bot className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <span className="font-extrabold tracking-tight text-white font-sans text-sm">AppointFlow</span>
                  <span className="text-[10px] font-mono text-emerald-400 font-semibold uppercase -mt-0.5">SaaS Core v2.4</span>
                </div>
              </div>

              {/* Nav targets */}
              <nav className="flex-grow flex flex-col gap-2 overflow-y-auto">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isMatch = currentView === item.title;
                  return (
                    <button
                      key={item.title}
                      onClick={() => { setCurrentView(item.title); setMobileMenuOpen(false); }}
                      className={`w-full py-3 px-4 rounded-xl text-left text-xs font-bold flex items-center gap-3 cursor-pointer ${
                        isMatch 
                          ? "bg-emerald-500/10 border border-emerald-500/25 text-emerald-400" 
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.title}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Logout coordinates */}
              <div className="border-t border-white/5 pt-4 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-white/10 text-emerald-400 font-bold font-mono text-xs flex items-center justify-center select-none">
                    JD
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-white truncate">{currentUser.name}</span>
                    <span className="text-[9px] text-slate-400 truncate">{currentUser.email}</span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 rounded-xl border border-rose-500/10 bg-rose-500/5 hover:bg-rose-500/15 text-rose-400 text-xs font-bold text-center cursor-pointer"
                >
                  Logout Session
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MOBILE BOTTOM FLOATING NAVIGATION BAR (5 tabs) */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-40 rounded-2xl bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 p-2 shadow-lg flex items-center justify-around">
        {[
          { title: "Dashboard", nav: "Dashboard", icon: LayoutDashboard },
          { title: "Appointments", nav: "Appointments", icon: Calendar },
          { title: "Specialists", nav: "Specialists", icon: Users },
          { title: "Reminders", nav: "Reminders Queue", icon: Bell },
          { title: "Sandbox", nav: "Interactive Sandbox", icon: Smartphone }
        ].map((item) => {
          const Icon = item.icon;
          const isMatch = currentView === item.nav;
          return (
            <button
              key={item.title}
              onClick={() => {
                setCurrentRoute("dashboard");
                setCurrentView(item.nav);
              }}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                isMatch 
                  ? "text-emerald-600 dark:text-emerald-400 font-extrabold bg-emerald-500/10" 
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[9px] font-sans font-bold tracking-tight">{item.title}</span>
            </button>
          );
        })}
      </div>

      {/* Modern Toast Notification Overlay */}
      <Toaster position="top-right" richColors />

      {/* Elegant back to top tracking control */}
      {showBackToTop && (
        <button
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
            const mainParent = document.querySelector('main')?.parentElement;
            if (mainParent) mainParent.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="fixed bottom-24 md:bottom-6 right-6 z-40 p-3 rounded-full bg-emerald-500 hover:bg-emerald-450 text-slate-950 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/25 transition-all cursor-pointer border border-white/10 hover:-translate-y-1 block no-print"
          aria-label="Back to top"
        >
          <span className="text-xs font-bold leading-none block">▲</span>
        </button>
      )}
    </div>
  );
}
