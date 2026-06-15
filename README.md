# AppointFlow — Elite WhatsApp Appointment SaaS 🌟

Welcome to the official developer documentation and guidebook for **AppointFlow**, an Elite WhatsApp Appointment Reminder SaaS built with a fully-tailored Apple-style Liquid Glass UI design, immersive full-stack capabilities, and a robust Gemini AI integration engine featuring intelligent multi-model failover mechanisms.

This document serves as your complete map explaining how the entire platform operates, from frontend simulation to backend endpoint handlers.

---

## ⚡ Project Overview

**AppointFlow** solves the expensive problem of business "no-shows" (missed appointments) by creating custom, beautiful SMS/WhatsApp reminders directly tailored to the customer's booked service and brand style.

- **Frontend**: Single-Screen High-Fidelity Apple Dashboard with Liquid glass tiles, visual analytics comparisons, real-time message simulator, responsive simulated phone screen, and interactive webhook console.
- **Backend**: Node.js utilizing `Express` alongside standard modern ES module resolution patterns, lazily-loaded `@google/genai` client, and auto-fallback logic.
- **AI Engine**: Advanced dynamic prompts triggering multi-model sequential checks. If one model fails due to high load, it falls back to others, or supplies localized hand-tailored templates, maintaining 100% uptime.

---

## 📁 System & Directory Map

```bash
├── .env.example                # Template for configuration environment variables
├── .gitignore                  # Keeps system environments safe from Git tracking
├── index.html                  # Core HTML5 entry page displaying our Apple Fluid container
├── metadata.json               # Manifest file registering frame permissions and capabilities
├── package.json                # Project dependencies and deployment runner scripts
├── server.ts                   # Backend Express web Server + AI routing logic
├── src/
│   ├── App.tsx                 # Main application controller managing simulation flow
│   ├── main.tsx                # StrictMode loader mounting our React app
│   ├── index.css               # Global classes featuring customized Liquid Glass styling
│   ├── types.ts                # TypeScript system interfaces for Bookings and Analytics
│   └── components/
│       ├── LightfallBackground.tsx  # WebGL/WebGL-style ambient motion light paths
│       ├── TiltedCard.tsx           # Generates gorgeous 3D skew coordinates on hover
│       ├── AnimatedList.tsx         # Hand-crafted item animations
│       └── CurvedLoop.tsx           # Smooth looping animations for visual representations
```

---

## ⚙️ Full-Stack Backend Architecture (`server.ts`)

Our Express application acts as both the static file host and the secure API bridge separating sensitive API credentials from client browsers.

### Key Backend Endpoints

#### 1. API Secret Health Monitor: `GET /api/key-status`
Checks if `GEMINI_API_KEY` is present in current environment variables.
* **Response**: `{ hasKey: boolean }`

#### 2. AI Code Generation Service: `POST /api/generate-message`
Takes booking metadata and translates it using our dynamic Gemini Prompt guidelines.
* **Payload**:
  ```json
  {
    "clientName": "Jane Doe",
    "bookingDate": "2026-06-16",
    "bookingTime": "14:30",
    "bookingDesc": "Laser Facial Treatment",
    "companyName": "Sloane Aesthetics Spa",
    "tone": "Warm & Professional"
  }
  ```

* **Multi-Model Sequential Failover Mechanism**:
  To protect against high demand spikes and potential `503 Unavailable` temporary server errors, AppointFlow implements a layered fallback cascade sequence:
  1. **Primary Model**: `gemini-3.5-flash`
  2. **Secondary Model**: `gemini-3.1-flash-lite`
  3. **Tertiary Model**: `gemini-flash-latest`
  4. **Localized Standard Fallback**: Precision fallback templates custom-tailored in code matching the chosen brand identity tone.

---

## 🎨 UI Styling & Aesthetics (`src/index.css`)

AppointFlow is styled with elegant modern custom utilities powered by **Tailwind CSS**, Inter, plus Jakarta Sans display typography, and Custom Glassmorphic attributes:

- **`.glass-panel` & `.glass-card`**: Dynamic backdrops utilizing `-webkit-backdrop-filter` and soft borders to simulate luxury glass sheets overlays.
- **`.glass-button-primary`**: Sleek interactive button with inward drop-shadow values simulating liquid light.
- **`@keyframes fluid-blob`**: Harmonic organic blob transformations applied directly to aesthetic spots.

---

## 🚀 App Running and Execution Commands

To execute or compile the application locally, use the package scripts defined inside `package.json`:

```bash
# 1. Install project dependencies
npm install

# 2. Run background Full-Stack Development environment
npm run dev

# 3. Compile client-side static files & server bundles
npm run build

# 4. Run native production host
npm start
```

---

*(Roman Urdu Explanation below)*

# 🇵🇰 Project Explain In Roman Urdu

Aapke liye AppointFlow ka pura structure aur functional flow yahan asaan alfaz mein diya gaya hai taake aap usey behtareen tareeqe se samajh sakein:

### 1. Backend Ka Maqsad Aur AI Resilience (`server.ts`)
* Jab client frontend se **"Generate AI Copy"** dabata hai, toh request backend `/api/generate-message` par aati hai.
* Agar **Gemini API Key** available ho, toh humara backend automatic tareeqe se sequential calls karta hai. Pehle **`gemini-3.5-flash`** try hota hai. Agar server pe high load ki wajah se `503 Service Unavailable` aayega, toh code crash hone ki bajaye automatic **`gemini-3.1-flash-lite`** pe shift hoga, aur uske baad **`gemini-flash-latest`** pe.
* Agar saare Gemini models down hoon ya user ne API key nahi di ho, toh humara custom design kiya gaya **"Fallback Selector Engine"** chalta hai jo user ke select kiye hue brand tone (Warm, Slick, Urgent, Playful) ke mutabiq aslyat se bahrpur, premium messages tayaar karke as-it-is bhej deta hai. Isse app 100% live rehti hai.

### 2. Frontend Visual Experience (`src/App.tsx` & Components)
* **Realtime Logger Window**: Isme true webhook events print hote hain jo visual confirmation dete hain ke messages kab aur kaise queue/dispatch hue.
* **Simulation Live Simulator**: Screen ke right-side par ek complete iPhone simulation hai jo dynamic message copy, standard chat bubble animations, aur dynamic status updates visible karta hai.
* **Apple Premium Glass Panels**: Dashboard ko ultra-modern luxury aesthetic dene ke liye custom blur backdrops, glass controls, aur real-time high contrast visual trends design kiye gaye hain.
