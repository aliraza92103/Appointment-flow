export type BookingStatus = 'pending' | 'queued' | 'sent' | 'confirmed' | 'rescheduled' | 'cancelled';

export interface Booking {
  id: string;
  clientName: string;
  phone: string;
  dateTime: string;
  timeSlot: string;
  serviceDesc: string;
  status: BookingStatus;
  messageDraft: string;
  createdAt: string;
  aiTone: string;
  history: Array<{
    timestamp: string;
    action: string;
    details?: string;
  }>;
}

export type ReminderTone = 'Warm & Professional' | 'Urgent & Direct' | 'Playful & Friendly' | 'Slick & Ultra-premium';

export interface AnalyticalSnapshot {
  period: string;
  withAppointFlow: number; // No-show percentage (lower is better, e.g. 4%)
  withoutAppointFlow: number; // No-show percentage (e.g. 32%)
  remindersSent: number;
}
