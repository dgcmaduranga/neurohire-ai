"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  Briefcase,
  Globe,
  Loader2,
  MapPin,
  Moon,
  Save,
  Shield,
  Sun,
  User,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface SettingsData {
  full_name: string;
  email: string;

  theme: string;
  language: string;

  notifications_enabled: boolean;
  email_notifications: boolean;
  interview_reminders: boolean;
  job_alerts: boolean;

  profile_visibility: string;

  preferred_job_role: string;
  preferred_location: string;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [settings, setSettings] = useState<SettingsData>({
    full_name: "",
    email: "",

    theme: "light",
    language: "English",

    notifications_enabled: true,
    email_notifications: true,
    interview_reminders: true,
    job_alerts: true,

    profile_visibility: "public",

    preferred_job_role: "",
    preferred_location: "",
  });

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/settings/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to load settings");
      }

      setSettings({
        full_name: data.full_name || "",
        email: data.email || "",

        theme: data.theme || "light",
        language: data.language || "English",

        notifications_enabled: data.notifications_enabled ?? true,
        email_notifications: data.email_notifications ?? true,
        interview_reminders: data.interview_reminders ?? true,
        job_alerts: data.job_alerts ?? true,

        profile_visibility: data.profile_visibility || "public",

        preferred_job_role: data.preferred_job_role || "",
        preferred_location: data.preferred_location || "",
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings() {
    try {
      setSaving(true);
      setMessage("");
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/settings/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to update settings");
      }

      setMessage("Settings updated successfully.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function updateField(key: keyof SettingsData, value: any) {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  if (loading) {
    return (
      <div className="grid min-h-[70vh] place-items-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-[2rem] bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 p-8 text-white shadow-2xl shadow-blue-500/20">
        <h1 className="text-4xl font-black">Settings</h1>

        <p className="mt-3 text-blue-100">
          Manage your account preferences, notifications and career settings.
        </p>
      </section>

      {message && (
        <div className="rounded-2xl border border-green-100 bg-green-50 p-4 text-sm font-bold text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      {/* Profile */}
      <section className="rounded-[2rem] border border-blue-100 bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center gap-3">
          <User className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-black">Profile Settings</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-black">
              Full Name
            </label>

            <input
              value={settings.full_name}
              onChange={(e) =>
                updateField("full_name", e.target.value)
              }
              className="w-full rounded-2xl border border-blue-100 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-black">
              Email
            </label>

            <input
              value={settings.email}
              disabled
              className="w-full rounded-2xl border border-blue-100 bg-slate-50 px-4 py-3"
            />
          </div>
        </div>
      </section>

      {/* Appearance */}
      <section className="rounded-[2rem] border border-blue-100 bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center gap-3">
          <Moon className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-black">Appearance</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-black">
              Theme
            </label>

            <select
              value={settings.theme}
              onChange={(e) =>
                updateField("theme", e.target.value)
              }
              className="w-full rounded-2xl border border-blue-100 px-4 py-3"
            >
              <option value="light">☀️ Light</option>
              <option value="dark">🌙 Dark</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-black">
              Language
            </label>

            <select
              value={settings.language}
              onChange={(e) =>
                updateField("language", e.target.value)
              }
              className="w-full rounded-2xl border border-blue-100 px-4 py-3"
            >
              <option>English</option>
              <option>Sinhala</option>
              <option>Tamil</option>
            </select>
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="rounded-[2rem] border border-blue-100 bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center gap-3">
          <Bell className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-black">Notifications</h2>
        </div>

        <div className="space-y-5">
          <Toggle
            title="Enable Notifications"
            value={settings.notifications_enabled}
            onChange={(v) =>
              updateField("notifications_enabled", v)
            }
          />

          <Toggle
            title="Email Notifications"
            value={settings.email_notifications}
            onChange={(v) =>
              updateField("email_notifications", v)
            }
          />

          <Toggle
            title="Interview Reminders"
            value={settings.interview_reminders}
            onChange={(v) =>
              updateField("interview_reminders", v)
            }
          />

          <Toggle
            title="Job Alerts"
            value={settings.job_alerts}
            onChange={(v) =>
              updateField("job_alerts", v)
            }
          />
        </div>
      </section>

      {/* Career */}
      <section className="rounded-[2rem] border border-blue-100 bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center gap-3">
          <Briefcase className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-black">Career Preferences</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-black">
              Preferred Job Role
            </label>

            <input
              value={settings.preferred_job_role}
              onChange={(e) =>
                updateField("preferred_job_role", e.target.value)
              }
              placeholder="Software Engineer"
              className="w-full rounded-2xl border border-blue-100 px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-black">
              Preferred Location
            </label>

            <input
              value={settings.preferred_location}
              onChange={(e) =>
                updateField("preferred_location", e.target.value)
              }
              placeholder="Colombo"
              className="w-full rounded-2xl border border-blue-100 px-4 py-3"
            />
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section className="rounded-[2rem] border border-blue-100 bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center gap-3">
          <Shield className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-black">Privacy</h2>
        </div>

        <select
          value={settings.profile_visibility}
          onChange={(e) =>
            updateField("profile_visibility", e.target.value)
          }
          className="w-full rounded-2xl border border-blue-100 px-4 py-3"
        >
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
      </section>

      {/* Save Button */}
      <button
        onClick={saveSettings}
        disabled={saving}
        className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-4 text-sm font-black text-white shadow-xl shadow-blue-500/25"
      >
        {saving ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="mr-2 h-5 w-5" />
            Save Changes
          </>
        )}
      </button>
    </div>
  );
}

function Toggle({
  title,
  value,
  onChange,
}: {
  title: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-blue-100 p-4">
      <span className="font-bold">{title}</span>

      <button
        onClick={() => onChange(!value)}
        className={`h-8 w-16 rounded-full transition ${
          value ? "bg-green-500" : "bg-slate-300"
        }`}
      >
        <div
          className={`h-8 w-8 rounded-full bg-white shadow transition ${
            value ? "translate-x-8" : ""
          }`}
        />
      </button>
    </div>
  );
}