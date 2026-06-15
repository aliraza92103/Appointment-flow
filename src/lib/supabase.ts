import { Booking, BookingStatus } from "../types";

export interface Barber {
  id: string;
  name: string;
  specialty: string;
  appointmentsToday: number;
  workingHours: string;
  avatarSeed: string;
}

export interface ReminderLog {
  id: string;
  customerName: string;
  phone: string;
  appointmentTime: string;
  sentAt: string;
  status: 'delivered' | 'failed' | 'pending';
  messagePreview: string;
}

export interface WebSettings {
  whatsappApiKey: string;
  whatsappPhoneId: string;
  reminderAdvanceHours: number;
  messageTemplate: string;
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  enableSound: boolean;
  enableSmsFallback: boolean;
}

// Initial Mock Seed Data
const DEFAULT_BARBERS: Barber[] = [
  {
    id: "b-1",
    name: "Alex Thorne",
    specialty: "High-Fade & Hair Rejuvenation",
    appointmentsToday: 5,
    workingHours: "09:00 AM - 06:00 PM",
    avatarSeed: "alex"
  },
  {
    id: "b-2",
    name: "Marcus Vance",
    specialty: "Beard Sculpture & Hot Towel Shave",
    appointmentsToday: 3,
    workingHours: "10:00 AM - 07:00 PM",
    avatarSeed: "marcus"
  },
  {
    id: "b-3",
    name: "Dorian Gray",
    specialty: "Classic Scissor Cuts & Texturizing",
    appointmentsToday: 4,
    workingHours: "08:00 AM - 05:00 PM",
    avatarSeed: "dorian"
  }
];

const DEFAULT_APPOINTMENTS: Booking[] = [
  {
    id: "booking-1",
    clientName: "Sonia Mercer",
    phone: "+1 (555) 393-2019",
    dateTime: "2026-06-15",
    timeSlot: "11:00 AM",
    serviceDesc: "Elite Adjustment Room",
    status: "confirmed",
    messageDraft: "Hi Sonia! This is a friendly reminder of your appointment at our salon on 2026-06-15 at 11:00 AM. Reply 1 to Confirm",
    createdAt: new Date().toISOString(),
    aiTone: "Warm & Professional",
    history: [{ timestamp: "10:02 AM", action: "Triggered via Google Calendar" }, { timestamp: "10:03 AM", action: "Client Replied '1' (Confirmed)" }]
  },
  {
    id: "booking-2",
    clientName: "David Cole",
    phone: "+1 (555) 812-7492",
    dateTime: "2026-06-15",
    timeSlot: "03:45 PM",
    serviceDesc: "Lash Lift & Brow Lamination",
    status: "sent",
    messageDraft: "Hello David! Lashes appointment is scheduled for 03:45 PM today. Confirm with reply 1.",
    createdAt: new Date().toISOString(),
    aiTone: "Slick & Ultra-premium",
    history: [{ timestamp: "12:15 PM", action: "Dispatched to WhatsApp Business Queue" }]
  },
  {
    id: "booking-3",
    clientName: "Michael Chang",
    phone: "+1 (555) 489-3209",
    dateTime: "2026-06-16",
    timeSlot: "01:30 PM",
    serviceDesc: "Textured Mid-Fade Cut",
    status: "pending",
    messageDraft: "Hey Michael! Friendly reminder of your Textured Mid-Fade with Alex Thorne scheduled tomorrow at 01:30 PM. Reply 1 to Confirm.",
    createdAt: new Date().toISOString(),
    aiTone: "Playful & Friendly",
    history: [{ timestamp: "09:12 AM", action: "Booking Created" }]
  }
];

const DEFAULT_REMINDERS: ReminderLog[] = [
  {
    id: "rem-1",
    customerName: "Sonia Mercer",
    phone: "+1 (555) 393-2019",
    appointmentTime: "2026-06-15 11:00 AM",
    sentAt: "2 mins ago",
    status: "delivered",
    messagePreview: "Hi Sonia! This is a friendly reminder of your upcoming booking..."
  },
  {
    id: "rem-2",
    customerName: "David Cole",
    phone: "+1 (555) 812-7492",
    appointmentTime: "2026-06-15 03:45 PM",
    sentAt: "1 hour ago",
    status: "delivered",
    messagePreview: "Hello David! Lashes appointment is scheduled for 03:45 PM today..."
  },
  {
    id: "rem-3",
    customerName: "Robert Green",
    phone: "+1 (555) 234-9011",
    appointmentTime: "2026-06-15 09:30 AM",
    sentAt: "3 hours ago",
    status: "failed",
    messagePreview: "Hi Robert! Your premium styling appointment today at 09:30 AM is ready..."
  }
];

const DEFAULT_SETTINGS: WebSettings = {
  whatsappApiKey: "waba_live_sec_prod_90831aef7e",
  whatsappPhoneId: "109382103982310",
  reminderAdvanceHours: 24,
  messageTemplate: "Hi {clientName}! This is a friendly reminder of your appointment for {serviceDesc} at {businessName} on {bookingDate} at {bookingTime}. Reply *1* to Confirm, *2* to Reschedule, or *3* to Cancel.",
  businessName: "Your Brand Studio",
  businessEmail: "hello@yourbrand.com",
  businessPhone: "+1 (555) 393-2019",
  enableSound: true,
  enableSmsFallback: false
};

// Database Initializers
const initStorage = () => {
  if (!localStorage.getItem("ap_barbers")) {
    localStorage.setItem("ap_barbers", JSON.stringify(DEFAULT_BARBERS));
  }
  if (!localStorage.getItem("ap_appointments")) {
    localStorage.setItem("ap_appointments", JSON.stringify(DEFAULT_APPOINTMENTS));
  }
  if (!localStorage.getItem("ap_reminders")) {
    localStorage.setItem("ap_reminders", JSON.stringify(DEFAULT_REMINDERS));
  }
  if (!localStorage.getItem("ap_settings")) {
    localStorage.setItem("ap_settings", JSON.stringify(DEFAULT_SETTINGS));
  }
};

export const supabaseMock = {
  getBarbers: (): Barber[] => {
    initStorage();
    return JSON.parse(localStorage.getItem("ap_barbers") || "[]");
  },
  saveBarber: (barber: Omit<Barber, "id"> & { id?: string }): Barber => {
    initStorage();
    const barbers = supabaseMock.getBarbers();
    const cleanBarber: Barber = {
      id: barber.id || `b-${Date.now()}`,
      name: barber.name,
      specialty: barber.specialty,
      appointmentsToday: barber.appointmentsToday || 0,
      workingHours: barber.workingHours || "09:00 AM - 05:00 PM",
      avatarSeed: barber.avatarSeed || "alex"
    };

    const index = barbers.findIndex(b => b.id === cleanBarber.id);
    if (index >= 0) {
      barbers[index] = cleanBarber;
    } else {
      barbers.push(cleanBarber);
    }
    localStorage.setItem("ap_barbers", JSON.stringify(barbers));
    return cleanBarber;
  },
  deleteBarber: (id: string): void => {
    initStorage();
    const barbers = supabaseMock.getBarbers();
    const updated = barbers.filter(b => b.id !== id);
    localStorage.setItem("ap_barbers", JSON.stringify(updated));
  },

  getAppointments: (): Booking[] => {
    initStorage();
    return JSON.parse(localStorage.getItem("ap_appointments") || "[]");
  },
  saveAppointment: (appt: Omit<Booking, "id"> & { id?: string }): Booking => {
    initStorage();
    const appts = supabaseMock.getAppointments();
    const cleanAppt: Booking = {
      id: appt.id || `booking-${Date.now()}`,
      clientName: appt.clientName,
      phone: appt.phone,
      dateTime: appt.dateTime,
      timeSlot: appt.timeSlot,
      serviceDesc: appt.serviceDesc,
      status: appt.status,
      messageDraft: appt.messageDraft,
      createdAt: appt.createdAt || new Date().toISOString(),
      aiTone: appt.aiTone || "Warm & Professional",
      history: appt.history || [{ timestamp: "Just now", action: "Registered" }]
    };

    const index = appts.findIndex(a => a.id === cleanAppt.id);
    if (index >= 0) {
      appts[index] = cleanAppt;
    } else {
      appts.unshift(cleanAppt);
    }
    localStorage.setItem("ap_appointments", JSON.stringify(appts));
    return cleanAppt;
  },
  deleteAppointment: (id: string): void => {
    initStorage();
    const appts = supabaseMock.getAppointments();
    const updated = appts.filter(a => a.id !== id);
    localStorage.setItem("ap_appointments", JSON.stringify(updated));
  },

  getReminders: (): ReminderLog[] => {
    initStorage();
    return JSON.parse(localStorage.getItem("ap_reminders") || "[]");
  },
  addReminder: (rem: Omit<ReminderLog, "id" | "sentAt">): ReminderLog => {
    initStorage();
    const reminders = supabaseMock.getReminders();
    const newRem: ReminderLog = {
      id: `rem-${Date.now()}`,
      customerName: rem.customerName,
      phone: rem.phone,
      appointmentTime: rem.appointmentTime,
      sentAt: "Just now",
      status: rem.status,
      messagePreview: rem.messagePreview
    };
    reminders.unshift(newRem);
    localStorage.setItem("ap_reminders", JSON.stringify(reminders));
    return newRem;
  },
  updateReminderStatus: (id: string, status: ReminderLog["status"]): void => {
    initStorage();
    const reminders = supabaseMock.getReminders();
    const updated = reminders.map(r => r.id === id ? { ...r, status, sentAt: "Just now" } : r);
    localStorage.setItem("ap_reminders", JSON.stringify(updated));
  },

  getSettings: (): WebSettings => {
    initStorage();
    return JSON.parse(localStorage.getItem("ap_settings") || JSON.stringify(DEFAULT_SETTINGS));
  },
  saveSettings: (settings: WebSettings): WebSettings => {
    initStorage();
    localStorage.setItem("ap_settings", JSON.stringify(settings));
    return settings;
  }
};
