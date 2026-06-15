import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK lazily, with fallback if key is missing.
let aiClient: any = null;
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// REST API for checking API key status
app.get("/api/key-status", (req, res) => {
  const hasKey = !!process.env.GEMINI_API_KEY;
  res.json({ hasKey });
});

// REST API for prompting AI message customization
app.post("/api/generate-message", async (req, res) => {
  const { clientName, bookingDate, bookingTime, bookingDesc, companyName, tone } = req.body;

  if (!clientName || !bookingDate || !bookingTime || !bookingDesc) {
    return res.status(400).json({ error: "Missing required booking details for draft." });
  }

  const client = getGeminiClient();
  const actualCompany = companyName || "AppointFlow Aesthetics";
  const actualTone = tone || "Warm & Professional";

  const fallbackTemplates: Record<string, string> = {
    "Warm & Professional": `Hi ${clientName}! 🌟\n\nThis is a friendly reminder of your upcoming slot for *${bookingDesc}* with *${actualCompany}*.\n\n📅 *Date:* ${bookingDate}\n⏰ *Time:* ${bookingTime}\n\nWe are excited to see you! Please confirm or manage your slot by choosing one below:\n\n👉 *Reply:* \n*1* — Confirm Slot ✅\n*2* — Reschedule 🔄\n*3* — Cancel Booking ❌\n\nHave a lovely rest of your day! ✨`,
    "Urgent & Direct": `Hello ${clientName}. Please confirm your slot for *${bookingDesc}* with *${actualCompany}* scheduled on *${bookingDate}* at *${bookingTime}*.\n\nYour prompt response ensures resource availability.\n\n👉 *Confirm:* Reply *1* ✅\n👉 *Reschedule:* Reply *2* 🔄\n👉 *Cancel:* Reply *3* ❌\n\nThank you, ${actualCompany}.`,
    "Playful & Friendly": `Hey ${clientName}! 🎉 Quick heads up! Your fun session for *${bookingDesc}* over at *${actualCompany}* is just around the corner! \n\n🥳 *When:* ${bookingDate} at ${bookingTime}\n\nWe've prepped everything for you! Can you let us know if you're still on? \n\n💬 *Quick Reply:* \n*1* — Yes, see you there! 🥳\n*2* — Need to change the time ⏰\n*3* — Can't make it this time 😢`,
    "Slick & Ultra-premium": `Dear ${clientName},\n\nWe look forward to hosting you for your reserved *${bookingDesc}* session with *${actualCompany}*.\n\n✨ *Reservation Details:*\n📅 ${bookingDate} | ⏰ ${bookingTime}\n\nTo ensure flawless preparation, please verify your arrival:\n\n✨ Reply *1* to Confirm\n✨ Reply *2* to Reschedule\n✨ Reply *3* to Cancel\n\nYours sincerely,\nThe ${actualCompany} Team.`,
  };

  const fallbackText = fallbackTemplates[actualTone] || fallbackTemplates["Warm & Professional"];

  if (!client) {
    // Elegant fallback if no API key is specified
    return res.json({ text: fallbackText, isFallback: true });
  }

  const prompt = `Draft a premium, highly converting, WhatsApp reminder message for a client slot on Facebook/WhatsApp business.
Client Details:
- Name: ${clientName}
- Booking/Service: ${bookingDesc}
- Date: ${bookingDate}
- Time: ${bookingTime}
- Service provider / business name: ${actualCompany}
- Desired Style/Tone: ${actualTone}

Requirements:
1. Include a welcoming premium intro tailored to the style: "${actualTone}".
2. State appointment details clearly using formatting like bold text (*text*) or emojis.
3. Include clean structured response actions at the end, exactly:
   - Reply '1' to Confirm ✅
   - Reply '2' to Reschedule 🔄
   - Reply '3' to Cancel ❌
4. Keep the entire message concise, extremely elegant, mobile-friendly (fits beautiful in a single WhatsApp chat bubbles), and under 150 words. Do not use generic markdown tags other than asterisk (*for bold*).`;

  // List of models to try in case of heavy load/503 errors on specific models (e.g., gemini-3.5-flash)
  const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
  let generatedText = "";
  let successModel = "";
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`[AppointFlow] Attempting draft generation with ${modelName}...`);
      const response = await client.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          temperature: 0.7,
        },
      });

      if (response && response.text) {
        generatedText = response.text.trim();
        successModel = modelName;
        break; // Successfully got content! Stop attempting other models
      }
    } catch (err: any) {
      console.error(`[AppointFlow] Model ${modelName} failed context generation:`, err.message || err);
      lastError = err;
    }
  }

  if (generatedText) {
    console.log(`[AppointFlow] Successfully generated message using ${successModel}.`);
    return res.json({ text: generatedText, isFallback: false, modelUsed: successModel });
  } else {
    // Both active Gemini model endpoints and general model attempts failed (e.g. general high demand on all endpoints)
    console.warn(`[AppointFlow] All Gemini model attempts failed. Serving high-quality style fallback template. Last error:`, lastError?.message || lastError);
    return res.json({
      text: fallbackText,
      isFallback: true,
      fallbackReason: lastError?.message || "All Gemini models currently unavailable due to high demand"
    });
  }
});

// ==========================================
// FULL-STACK SERVER-SIDE DATABASE SIMULATION
// ==========================================

let serverBarbers = [
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

let serverAppointments = [
  {
    id: "booking-1",
    clientName: "Sonia Mercer",
    phone: "+1 (555) 393-2019",
    dateTime: "2026-06-15",
    timeSlot: "11:00 AM",
    serviceDesc: "Elite Adjustment Room",
    status: "confirmed",
    messageDraft: "Hi Sonia! This is a friendly reminder of your appointment at Sloane Aesthetics on 2026-06-15 at 11:00 AM. Reply 1 to Confirm",
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

let serverReminders = [
  {
    id: "rem-1",
    customerName: "Sonia Mercer",
    phone: "+1 (555) 393-2019",
    appointmentTime: "2026-06-15 11:00 AM",
    sentAt: "2 mins ago",
    status: "delivered",
    messagePreview: "Hi Sonia! This is a friendly reminder of your appointment at Sloane Aesthetics..."
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

let serverSettings = {
  whatsappApiKey: "waba_live_sec_prod_90831aef7e",
  whatsappPhoneId: "109382103982310",
  reminderAdvanceHours: 24,
  messageTemplate: "Hi {clientName}! This is a friendly reminder of your appointment for {serviceDesc} at {businessName} on {bookingDate} at {bookingTime}. Reply *1* to Confirm, *2* to Reschedule, or *3* to Cancel.",
  businessName: "Sloane Aesthetics Spa",
  businessEmail: "hello@sloaneaesthetics.com",
  businessPhone: "+1 (555) 393-2019",
  enableSound: true,
  enableSmsFallback: false
};

// ==========================================
// AUTHENTICATION API ROUTES
// ==========================================

app.post("/api/auth/register", (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ error: "Please configure all forms correctly." });
    }
    return res.status(201).json({
      success: true,
      user: { id: "u-99", fullName, email }
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Internal auth error." });
  }
});

app.post("/api/auth/login", (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password configuration required." });
    }
    return res.status(200).json({
      success: true,
      user: { id: "u-99", fullName: "Jane Doe", email }
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Internal auth error." });
  }
});

app.post("/api/auth/logout", (req, res) => {
  return res.status(200).json({ success: true, message: "Logged out successfully" });
});

// ==========================================
// APPOINTMENTS API ROUTES (CRUD)
// ==========================================

app.get("/api/appointments", (req, res) => {
  try {
    const { status, barber, search } = req.query;
    let filtered = [...serverAppointments];

    if (status) {
      filtered = filtered.filter(a => a.status === status);
    }
    if (barber) {
      filtered = filtered.filter(a => a.serviceDesc.toLowerCase().includes(String(barber).toLowerCase()));
    }
    if (search) {
      const q = String(search).toLowerCase();
      filtered = filtered.filter(a => 
        a.clientName.toLowerCase().includes(q) || 
        a.phone.includes(q) || 
        a.serviceDesc.toLowerCase().includes(q)
      );
    }

    return res.status(200).json({
      appointments: filtered,
      totalCount: filtered.length
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/appointments", (req, res) => {
  try {
    const { clientName, phone, dateTime, timeSlot, serviceDesc, aiTone, messageDraft } = req.body;
    if (!clientName || !phone || !dateTime || !timeSlot || !serviceDesc) {
      return res.status(400).json({ error: "Missing required appointment schema parameters." });
    }

    const newAppt = {
      id: `booking-${Date.now()}`,
      clientName,
      phone,
      dateTime,
      timeSlot,
      serviceDesc,
      status: ("pending" as any),
      messageDraft: messageDraft || `Reminder for ${clientName}`,
      createdAt: new Date().toISOString(),
      aiTone: aiTone || "Warm & Professional",
      history: [{ timestamp: "Just now", action: "Created via Platform API Portal" }]
    };

    serverAppointments.unshift(newAppt);
    return res.status(201).json(newAppt);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.put("/api/appointments/:id", (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const index = serverAppointments.findIndex(a => a.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Appointment entry not found." });
    }

    serverAppointments[index] = {
      ...serverAppointments[index],
      ...body
    };

    return res.status(200).json(serverAppointments[index]);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.delete("/api/appointments/:id", (req, res) => {
  try {
    const { id } = req.params;
    const initialLen = serverAppointments.length;
    serverAppointments = serverAppointments.filter(a => a.id !== id);
    if (serverAppointments.length === initialLen) {
      return res.status(404).json({ error: "Appointment entry not found." });
    }
    return res.status(200).json({ success: true, message: "Appointment deleted" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ==========================================
// BARBERS API ROUTES (CRUD)
// ==========================================

app.get("/api/barbers", (req, res) => {
  return res.status(200).json(serverBarbers);
});

app.post("/api/barbers", (req, res) => {
  try {
    const { name, specialty, workingHours, avatarSeed } = req.body;
    if (!name || !specialty) {
      return res.status(400).json({ error: "Please configure name and specialty." });
    }

    const newBarber = {
      id: `b-${Date.now()}`,
      name,
      specialty,
      appointmentsToday: 0,
      workingHours: workingHours || "09:00 AM - 05:00 PM",
      avatarSeed: avatarSeed || "alex"
    };

    serverBarbers.push(newBarber);
    return res.status(201).json(newBarber);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.put("/api/barbers/:id", (req, res) => {
  try {
    const { id } = req.params;
    const index = serverBarbers.findIndex(b => b.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Barber not found." });
    }

    serverBarbers[index] = {
      ...serverBarbers[index],
      ...req.body
    };

    return res.status(200).json(serverBarbers[index]);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.delete("/api/barbers/:id", (req, res) => {
  try {
    const { id } = req.params;
    const initialLen = serverBarbers.length;
    serverBarbers = serverBarbers.filter(b => b.id !== id);
    if (serverBarbers.length === initialLen) {
      return res.status(404).json({ error: "Specialist not found." });
    }
    return res.status(200).json({ success: true, message: "Barber profile removed." });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ==========================================
// REMINDERS API ROUTES
// ==========================================

app.get("/api/reminders/logs", (req, res) => {
  return res.status(200).json(serverReminders);
});

app.post("/api/reminders/send", (req, res) => {
  try {
    const { customerName, phone, appointmentTime, messagePreview } = req.body;
    if (!customerName || !phone) {
      return res.status(400).json({ error: "Missing recipient details." });
    }

    // Attempt simulation sending
    const isSuccess = Math.random() > 0.08; // 92% success rate
    const newLog = {
      id: `rem-${Date.now()}`,
      customerName,
      phone,
      appointmentTime: appointmentTime || "Today",
      sentAt: "Just now",
      status: (isSuccess ? "delivered" : "failed" as any),
      messagePreview: messagePreview || "Reminder notification dispatched successfully."
    };

    serverReminders.unshift(newLog);
    return res.status(201).json(newLog);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ==========================================
// METRICS & SETTINGS APIS
// ==========================================

app.get("/api/dashboard/stats", (req, res) => {
  const totalSlots = serverAppointments.length;
  const activeConfirmed = serverAppointments.filter(a => a.status === "confirmed").length;
  const dispatchRate = ((serverReminders.filter(r => r.status === "delivered").length / Math.max(serverReminders.length, 1)) * 100).toFixed(0);

  return res.status(200).json({
    totalBookings: totalSlots + 12, // adds historical offsets
    confirmedBookings: activeConfirmed + 8,
    remindersSent: serverReminders.length + 154,
    successRate: `${dispatchRate}%`,
    recentActivity: serverAppointments.slice(0, 5)
  });
});

app.get("/api/settings", (req, res) => {
  return res.status(200).json(serverSettings);
});

app.put("/api/settings", (req, res) => {
  try {
    serverSettings = {
      ...serverSettings,
      ...req.body
    };
    return res.status(200).json(serverSettings);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

async function startServer() {
  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[AppointFlow Server] running on http://localhost:${PORT}`);
  });
}

startServer();
