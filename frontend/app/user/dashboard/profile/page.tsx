"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  AlertTriangle,
  Briefcase,
  CheckCircle2,
  Edit3,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

type UserProfile = {
  id?: string;
  _id?: string;
  name?: string;
  username?: string;
  email?: string;
  phone?: string;
  target_role?: string;
  location?: string;
  bio?: string;
  created_at?: string;
  updated_at?: string;
};

type ApiResponse = {
  status?: string;
  message?: string;
  user?: UserProfile;
  detail?: string | any;
};

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [phone, setPhone] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [savingPersonal, setSavingPersonal] = useState(false);
  const [savingCareer, setSavingCareer] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function getToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  }

  function getErrorMessage(data: ApiResponse) {
    if (typeof data?.detail === "string") return data.detail;
    if (Array.isArray(data?.detail)) return data.detail[0]?.msg || "Validation error.";
    if (typeof data?.message === "string") return data.message;
    return "Something went wrong.";
  }

  function fillForm(profile: UserProfile) {
    setUser(profile);

    setName(profile.name || "");
    setUsername(profile.username || "");
    setEmail(profile.email || "");

    setPhone(profile.phone || "");
    setTargetRole(profile.target_role || "");
    setLocation(profile.location || "");
    setBio(profile.bio || "");
  }

  function saveUserToBrowser(profile: UserProfile) {
    localStorage.setItem("user", JSON.stringify(profile));
    window.dispatchEvent(new Event("user-updated"));
    window.dispatchEvent(new Event("dashboard-refresh"));
  }

  async function fetchProfile() {
    setError("");
    setSuccess("");

    const token = getToken();

    if (!token) {
      setError("Login token missing. Please login again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/users/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(getErrorMessage(data));
      }

      const profile = data.user || data;

      if (profile) {
        fillForm(profile);
        saveUserToBrowser(profile);
      }
    } catch (err) {
      const savedUser = localStorage.getItem("user");

      if (savedUser) {
        const profile = JSON.parse(savedUser);
        fillForm(profile);
      }

      setError(err instanceof Error ? err.message : "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile(
    payload: Record<string, string>,
    successMessage: string
  ) {
    const token = getToken();

    if (!token) {
      setError("Login token missing. Please login again.");
      return;
    }

    setError("");
    setSuccess("");

    console.log("PROFILE UPDATE PAYLOAD:", payload);

    const response = await fetch(`${API_URL}/users/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data: ApiResponse = await response.json();

    console.log("PROFILE UPDATE RESPONSE:", data);

    if (!response.ok) {
      throw new Error(getErrorMessage(data));
    }

    const profile = data.user || data;

    if (profile) {
      fillForm(profile);
      saveUserToBrowser(profile);
    }

    setSuccess(successMessage);

    setTimeout(() => {
      setSuccess("");
    }, 2500);
  }

  async function handlePersonalSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSavingPersonal(true);

      await updateProfile(
        {
          name: name.trim(),
          username: username.trim(),
          email: email.trim(),
        },
        "Personal information updated successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update personal information."
      );
    } finally {
      setSavingPersonal(false);
    }
  }

  async function handleCareerSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSavingCareer(true);

      await updateProfile(
        {
          phone: phone.trim(),
          target_role: targetRole.trim(),
          location: location.trim(),
          bio: bio.trim(),
        },
        "Career information updated successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update career details."
      );
    } finally {
      setSavingCareer(false);
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password.trim().length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password and confirm password do not match.");
      return;
    }

    try {
      setSavingPassword(true);

      await updateProfile(
        {
          password: password.trim(),
        },
        "Password updated successfully."
      );

      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update password.");
    } finally {
      setSavingPassword(false);
    }
  }

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="rounded-[2rem] border border-blue-100 bg-white p-8 text-center shadow-xl shadow-blue-100/50">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-blue-600" />
          <h2 className="mt-4 text-xl font-black text-slate-950">
            Loading profile...
          </h2>
          <p className="mt-2 text-sm font-semibold text-slate-500">
            Preparing your account settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 p-6 text-white shadow-2xl shadow-blue-500/25 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-3xl bg-white/15 text-white shadow-lg">
              <User className="h-8 w-8" />
            </div>

            <div>
              <p className="text-sm font-bold text-blue-100">Account Settings</p>
              <h1 className="text-3xl font-black sm:text-4xl">My Profile</h1>
              <p className="mt-2 text-sm font-semibold text-blue-100">
                Manage your profile, career details and security information.
              </p>
            </div>
          </div>

          <div className="rounded-3xl bg-white/15 px-5 py-4 backdrop-blur-md">
            <p className="text-xs font-black uppercase tracking-widest text-blue-100">
              Signed in as
            </p>
            <p className="mt-1 text-sm font-black text-white">
              {user?.email || "No email"}
            </p>
          </div>
        </div>
      </section>

      {error && <AlertBox type="error" message={error} />}
      {success && <AlertBox type="success" message={success} />}

      <section className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <aside className="h-fit rounded-[2rem] border border-blue-100 bg-white p-6 shadow-xl shadow-blue-100/50">
          <div className="text-center">
            <div className="mx-auto grid h-28 w-28 place-items-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-4xl font-black text-white shadow-xl shadow-blue-500/25">
              {(name || email || "U").charAt(0).toUpperCase()}
            </div>

            <h2 className="mt-5 text-2xl font-black text-slate-950">
              {name || "Your Name"}
            </h2>

            <p className="mt-1 text-sm font-bold text-blue-600">
              @{username || "username"}
            </p>

            <p className="mt-2 break-all text-sm font-semibold text-slate-500">
              {email || "email@example.com"}
            </p>
          </div>

          <div className="mt-6 space-y-3 border-t border-blue-100 pt-5">
            <ProfileMini icon={Briefcase} label="Target Role" value={targetRole || "Not added"} />
            <ProfileMini icon={MapPin} label="Location" value={location || "Not added"} />
            <ProfileMini icon={Phone} label="Phone" value={phone || "Not added"} />
          </div>

          <div className="mt-6 rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <p className="text-sm font-black text-slate-900">
                NeuroHire Profile
              </p>
            </div>

            <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">
              Keep your profile updated for better resume suggestions, job
              discovery and interview practice.
            </p>
          </div>
        </aside>

        <main className="space-y-6">
          <form
            onSubmit={handlePersonalSubmit}
            className="rounded-[2rem] border border-blue-100 bg-white p-6 shadow-xl shadow-blue-100/50"
          >
            <SectionHeader
              icon={Edit3}
              title="Personal Information"
              description="Update your name, username and email separately."
            />

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <InputField label="Full Name" value={name} onChange={setName} placeholder="Charith Gamage" icon={User} />
              <InputField label="Username" value={username} onChange={setUsername} placeholder="charithgamage" icon={User} />
              <InputField label="Email Address" value={email} onChange={setEmail} placeholder="charith@gmail.com" icon={Mail} type="email" />
            </div>

            <div className="mt-6 flex justify-end">
              <SaveButton loading={savingPersonal} text="Save Personal Info" />
            </div>
          </form>

          <form
            onSubmit={handleCareerSubmit}
            className="rounded-[2rem] border border-blue-100 bg-white p-6 shadow-xl shadow-blue-100/50"
          >
            <SectionHeader
              icon={Briefcase}
              title="Career Information"
              description="This helps NeuroHire AI personalize career recommendations."
            />

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <InputField label="Phone Number" value={phone} onChange={setPhone} placeholder="+94 77 123 4567" icon={Phone} />
              <InputField label="Target Role" value={targetRole} onChange={setTargetRole} placeholder="Software Engineer" icon={Briefcase} />
              <InputField label="Location" value={location} onChange={setLocation} placeholder="Colombo, Sri Lanka" icon={MapPin} />
            </div>

            <label className="mt-5 block">
              <span className="text-sm font-black text-slate-800">Bio</span>
              <textarea
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                placeholder="Write a short professional bio..."
                className="mt-2 min-h-32 w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <div className="mt-6 flex justify-end">
              <SaveButton loading={savingCareer} text="Save Career Info" />
            </div>
          </form>

          <form
            onSubmit={handlePasswordSubmit}
            className="rounded-[2rem] border border-blue-100 bg-white p-6 shadow-xl shadow-blue-100/50"
          >
            <SectionHeader
              icon={ShieldCheck}
              title="Security"
              description="Change your account password securely."
            />

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <InputField label="New Password" value={password} onChange={setPassword} placeholder="Enter new password" icon={Lock} type="password" />
              <InputField label="Confirm Password" value={confirmPassword} onChange={setConfirmPassword} placeholder="Confirm new password" icon={Lock} type="password" />
            </div>

            <div className="mt-6 flex justify-end">
              <SaveButton loading={savingPassword} text="Update Password" />
            </div>
          </form>
        </main>
      </section>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600">
        <Icon className="h-6 w-6" />
      </div>

      <div>
        <h2 className="text-2xl font-black text-slate-950">{title}</h2>
        <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  icon: Icon,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon: React.ElementType;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-black text-slate-800">{label}</span>

      <div className="mt-2 flex items-center gap-3 rounded-2xl border border-blue-100 bg-white px-4 py-3 transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
        <Icon className="h-5 w-5 shrink-0 text-blue-600" />

        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400"
        />
      </div>
    </label>
  );
}

function SaveButton({ loading, text }: { loading: boolean; text: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-lg transition hover:-translate-y-1 hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {loading ? (
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      ) : (
        <Save className="mr-2 h-5 w-5" />
      )}
      {text}
    </button>
  );
}

function AlertBox({ type, message }: { type: "error" | "success"; message: string }) {
  const isError = type === "error";

  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm font-bold ${
        isError
          ? "border-red-100 bg-red-50 text-red-600"
          : "border-emerald-100 bg-emerald-50 text-emerald-700"
      }`}
    >
      {isError ? (
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
      ) : (
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
      )}

      {message}
    </div>
  );
}

function ProfileMini({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-blue-600">
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-black uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <p className="truncate text-sm font-black text-slate-700">{value}</p>
      </div>
    </div>
  );
}