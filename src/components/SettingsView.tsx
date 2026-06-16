import React, { useState, useEffect } from "react";
import { 
  Key, 
  Gear, 
  Briefcase, 
  Bell, 
  Check, 
  Question, 
  Eye, 
  TextT, 
  SpeakerHigh, 
  Copy 
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { WebSettings, supabaseMock } from "../lib/supabase";

interface SettingsViewProps {
  onSaveToast: (message: string) => void;
  addLog: (text: string, type?: string) => void;
}

export default function SettingsView({ onSaveToast, addLog }: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [settings, setSettings] = useState<WebSettings>({
    whatsappApiKey: "",
    whatsappPhoneId: "",
    reminderAdvanceHours: 24,
    messageTemplate: "",
    businessName: "",
    businessEmail: "",
    businessPhone: "",
    enableSound: true,
    enableSmsFallback: false
  });

  const [loading, setLoading] = useState(true);

  // Load preferences
  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        setLoading(false);
      })
      .catch(() => {
        setSettings(supabaseMock.getSettings());
        setLoading(false);
      });
  }, []);

  const handleUpdate = (field: keyof WebSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
      supabaseMock.saveSettings(settings);
      onSaveToast("Business preferences updated successfully");
      addLog("Successfully saved global AppointFlow parameters", "system");
    } catch {
      supabaseMock.saveSettings(settings);
      onSaveToast("Preferences updated (client local backup)");
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      if (!text) {
        toast.error("API Key is empty, nothing to copy.");
        return;
      }
      await navigator.clipboard.writeText(text);
      toast.success("API key copied to clipboard");
    } catch (e) {
      toast.error("Failed to copy to clipboard.");
    }
  };

  const tabsList = [
    { label: "WhatsApp Configuration", icon: Key },
    { label: "Template Editor", icon: TextT },
    { label: "Business Coordinates", icon: Briefcase },
    { label: "Notification Toggles", icon: Bell }
  ];

  if (loading) {
    return (
      <div className="py-24 text-center text-[#6b7280] dark:text-slate-500 font-mono text-xs animate-pulse">
         Synthesizing business parameters...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 font-sans text-inherit" id="settings-tabs-wrapper">
      <div>
        <h2 className="text-[20px] md:text-[28px] font-bold text-[#111827] dark:text-white font-sans tracking-tight">Business Parameters</h2>
        <p className="text-xs text-[#6b7280] dark:text-slate-400">Modify layout metrics, WhatsApp API webhooks, and default message templates.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left column tabs menu */}
        <div className="w-full lg:w-64 flex flex-col gap-1.5 shrink-0" role="tablist">
          {tabsList.map((t, idx) => {
            const Icon = t.icon;
            const isActive = activeTab === idx;
            return (
              <button
                key={idx}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(idx)}
                className={`py-3 px-4 rounded-xl text-xs font-bold text-left flex items-center gap-3 transition-all cursor-pointer border ${
                  isActive 
                    ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/25 text-[#16a34a] dark:text-emerald-400 font-extrabold" 
                    : "bg-white dark:bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 border-[#e2e8f0] dark:border-transparent text-[#4b5563] dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0 nav-icon" weight="duotone" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Right column active panels form */}
        <form onSubmit={handleFormSubmit} className="flex-1 w-full bg-white dark:bg-[#141a23]/55 rounded-3xl p-6 md:p-8 flex flex-col gap-6 border border-[#e2e8f0] dark:border-white/5 shadow-[0_1px_3px_rgba(0,0,0,0.1)] dark:shadow-none">
          {activeTab === 0 && (
            <div className="flex flex-col gap-4 animate-fadeIn" id="whatsapp-settings-tab">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2 text-[#111827] dark:text-white font-sans">
                  <Key className="w-4 h-4 text-[#16a34a] dark:text-emerald-400" weight="duotone" />
                  Official WhatsApp API Credentials
                </h3>
                <p className="text-[11px] text-[#6b7280] dark:text-slate-400 mt-1">Acquire these keys directly from Meta Developer dashboard.</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#4b5563] dark:text-slate-300">WABA Developer Api Secret Key</label>
                  <button 
                    type="button" 
                    onClick={() => copyToClipboard(settings.whatsappApiKey)}
                    className="text-[10px] font-mono text-emerald-600 dark:text-[#25D366] hover:underline flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                    aria-label="Copy secret key to clipboard"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy Key
                  </button>
                </div>
                <div className="relative">
                  <Eye className="absolute right-3.5 top-3 w-4 h-4 text-slate-500" weight="duotone" />
                  <input
                    type="password"
                    value={settings.whatsappApiKey}
                    onChange={(e) => handleUpdate("whatsappApiKey", e.target.value)}
                    placeholder="waba_live_sec_XXXXXXXXXX"
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-xl text-xs pl-4 pr-10 py-2.5 focus:outline-none focus:border-emerald-500/30 font-mono"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#4b5563] dark:text-slate-300">WhatsApp Phone Number Identification ID</label>
                <input
                  type="text"
                  value={settings.whatsappPhoneId}
                  onChange={(e) => handleUpdate("whatsappPhoneId", e.target.value)}
                  placeholder="109382103982310"
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-xl text-xs px-4 py-2.5 focus:outline-none focus:border-emerald-500/30 font-mono"
                />
              </div>

              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/15 rounded-2xl flex items-start gap-2.5 text-xs text-[#4b5563] dark:text-slate-400">
                <Question className="w-5 h-5 text-[#16a34a] dark:text-[#25D366] shrink-0 mt-0.5" weight="duotone" />
                <p className="leading-relaxed">
                  AppointFlow utilizes official WhatsApp Cloud API systems. Ensure your Meta Developer App is in Live Production Mode to prevent messaging limitations on user cellular nodes.
                </p>
              </div>
            </div>
          )}

          {activeTab === 1 && (
            <div className="flex flex-col gap-4 animate-fadeIn" id="templates-settings-tab">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-2 text-[#111827] dark:text-white font-sans">
                    <TextT className="w-4 h-4 text-[#16a34a] dark:text-emerald-400" weight="bold" />
                    Default Message Copy Template Editor
                  </h3>
                  <p className="text-[11px] text-[#6b7280] dark:text-slate-400 mt-1">This template acts as a structured fallback template for manual creations or offline dispatches.</p>
                </div>
                {/* Character counter dynamically placed */}
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400">
                  {settings.messageTemplate.length} characters
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#4b5563] dark:text-slate-300">Fallback Message Template Configuration</label>
                <textarea
                  rows={5}
                  value={settings.messageTemplate}
                  onChange={(e) => handleUpdate("messageTemplate", e.target.value)}
                  placeholder="Hi {clientName}! This is a reminder..."
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-xl text-xs px-4 py-3 focus:outline-none focus:border-emerald-500/30 leading-relaxed font-sans"
                />
              </div>

              {/* Tag placeholders helper details */}
              <div className="bg-slate-50 dark:bg-slate-950/40 rounded-2xl p-4 border border-slate-200 dark:border-white/5">
                <span className="text-[9px] font-mono font-bold text-[#6b7280] dark:text-slate-400 uppercase">Available Template Dynamic Tags</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {["{clientName}", "{serviceDesc}", "{businessName}", "{bookingDate}", "{bookingTime}"].map((tag) => (
                    <span key={tag} className="text-[10px] font-mono font-bold text-[#16a34a] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/15 py-0.5 px-2.5 rounded-lg select-all">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 2 && (
            <div className="flex flex-col gap-4 animate-fadeIn" id="business-settings-tab">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2 text-[#111827] dark:text-white font-sans">
                  <Briefcase className="w-4 h-4 text-slate-500 dark:text-slate-200" weight="duotone" />
                  Business Profile Coordinates
                </h3>
                <p className="text-[11px] text-[#6b7280] dark:text-slate-400 mt-1">Variables here feed directly into the dynamic reminder engine.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#4b5563] dark:text-slate-300">Registered Corporate Name</label>
                  <input
                    type="text"
                    value={settings.businessName}
                    onChange={(e) => handleUpdate("businessName", e.target.value)}
                    placeholder="Your Brand Studio"
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-xl text-xs px-4 py-2.5 focus:outline-none focus:border-emerald-500/30"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#4b5563] dark:text-slate-300">Primary Support Phone Line</label>
                  <input
                    type="text"
                    value={settings.businessPhone}
                    onChange={(e) => handleUpdate("businessPhone", e.target.value)}
                    placeholder="+1 (555) 393-2019"
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-xl text-xs px-4 py-2.5 focus:outline-none focus:border-emerald-500/30"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#4b5563] dark:text-slate-300">Business Registry Email</label>
                <input
                  type="email"
                  value={settings.businessEmail}
                  onChange={(e) => handleUpdate("businessEmail", e.target.value)}
                  placeholder="support@sloaneaesthetics.com"
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-xl text-xs px-4 py-2.5 focus:outline-none focus:border-emerald-500/30 font-sans"
                />
              </div>
            </div>
          )}

          {activeTab === 3 && (
            <div className="flex flex-col gap-4 animate-fadeIn" id="notifs-settings-tab">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2 text-[#111827] dark:text-white font-sans">
                  <Bell className="w-4 h-4 text-[#16a34a] dark:text-emerald-400" weight="duotone" />
                  System Sound Alerts & Switch Toggles
                </h3>
                <p className="text-[11px] text-[#6b7280] dark:text-slate-400 mt-1">Fine-tune system alert sounds, automatic routes, and notifications overrides.</p>
              </div>

              <div className="flex flex-col gap-4 divide-y divide-slate-100 dark:divide-white/5">
                {/* Switch 1 */}
                <div className="flex items-center justify-between py-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold font-sans flex items-center gap-2 text-[#111827] dark:text-white">
                      <SpeakerHigh className="w-4 h-4 text-slate-400" weight="duotone" />
                      Audible Event Sounds
                    </span>
                    <span className="text-[10px] text-[#6b7280] dark:text-slate-400 leading-normal">Play responsive click actions, dispatch sounds, and successful feedback tones.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleUpdate("enableSound", !settings.enableSound)}
                    className={`w-11 h-6 rounded-full transition-all relative outline-none flex items-center p-0.5 cursor-pointer border ${
                      settings.enableSound 
                        ? "bg-emerald-500/20 border-[#25D366] text-[#16a34a] dark:text-emerald-400" 
                        : "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-white/5 text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    <div className={`w-4.5 h-4.5 rounded-full bg-current transition-transform duration-300 ${
                      settings.enableSound ? "translate-x-5" : "translate-x-0"
                    }`} />
                  </button>
                </div>

                {/* Switch 2 */}
                <div className="flex items-center justify-between py-3 pt-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold font-sans flex items-center gap-2 text-[#111827] dark:text-white">
                      <Bell className="w-4 h-4 text-slate-400" weight="duotone" />
                      Fallback SMS Delivery Route
                    </span>
                    <span className="text-[10px] text-[#6b7280] dark:text-slate-400 leading-normal">Automatically fire standard cellular SMS if clients have closed WhatsApp sessions.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleUpdate("enableSmsFallback", !settings.enableSmsFallback)}
                    className={`w-11 h-6 rounded-full transition-all relative outline-none flex items-center p-0.5 cursor-pointer border ${
                      settings.enableSmsFallback 
                        ? "bg-emerald-500/20 border-[#25D366] text-[#16a34a] dark:text-emerald-400" 
                        : "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-white/5 text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    <div className={`w-4.5 h-4.5 rounded-full bg-current transition-transform duration-300 ${
                      settings.enableSmsFallback ? "translate-x-5" : "translate-x-0"
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Form Save Button */}
          <div className="pt-4 border-t border-slate-100 dark:border-white/5 mt-2">
            <button
              type="submit"
              className="py-2.5 px-6 rounded-xl font-bold bg-[#16a34a] text-white hover:bg-emerald-600 text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-emerald-700/10"
            >
              <Check className="w-4 h-4 shrink-0" weight="bold" />
              Save Settings Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
