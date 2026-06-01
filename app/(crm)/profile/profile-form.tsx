"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

type ProfileMetadata = {
  job_title?: string;
  department?: string;
  city?: string;
  country?: string;
  timezone?: string;
};

type InitialProfile = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  tenant_id: string;
  metadata: ProfileMetadata;
  created_at?: string;
};

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  commercial_lead: "Líder comercial",
  seller: "Vendedor",
};

export function ProfileForm({
  initialProfile,
}: {
  initialProfile: InitialProfile;
}) {
  const [fullName, setFullName] = useState(initialProfile.full_name ?? "");
  const [phone, setPhone] = useState(initialProfile.phone ?? "");

  const [jobTitle, setJobTitle] = useState(
    initialProfile.metadata?.job_title ?? ""
  );
  const [department, setDepartment] = useState(
    initialProfile.metadata?.department ?? ""
  );
  const [city, setCity] = useState(initialProfile.metadata?.city ?? "");
  const [country, setCountry] = useState(
    initialProfile.metadata?.country ?? "Colombia"
  );
  const [timezone, setTimezone] = useState(
    initialProfile.metadata?.timezone ?? "America/Bogota"
  );

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleUpdateProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setProfileMessage("");

    if (!fullName.trim()) {
      setProfileMessage("El nombre es obligatorio.");
      return;
    }

    setIsUpdatingProfile(true);

    const metadata: ProfileMetadata = {
      job_title: jobTitle,
      department,
      city,
      country,
      timezone,
    };

    const { error } = await supabase.rpc("update_my_profile", {
      p_full_name: fullName.trim(),
      p_phone: phone.trim(),
      p_metadata: metadata,
    });

    setIsUpdatingProfile(false);

    if (error) {
      setProfileMessage(`Error: ${error.message}`);
      return;
    }

    setProfileMessage("Datos actualizados correctamente.");
  }

  async function handleChangePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPasswordMessage("");

    if (password.length < 8) {
      setPasswordMessage("La contraseña debe tener mínimo 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setPasswordMessage("Las contraseñas no coinciden.");
      return;
    }

    setIsChangingPassword(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setIsChangingPassword(false);

    if (error) {
      setPasswordMessage(`Error: ${error.message}`);
      return;
    }

    setPassword("");
    setConfirmPassword("");
    setPasswordMessage("Contraseña actualizada correctamente.");
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-sm font-medium text-dual-purple">Cuenta de usuario</p>
        <h2 className="mt-1 text-3xl font-bold text-slate-950">Mi perfil</h2>
        <p className="mt-2 text-sm text-slate-500">
          Consulta tu información, actualiza tus datos personales y cambia tu
          contraseña de acceso.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-dual-purple text-3xl font-bold text-white">
              {fullName
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0])
                .join("")
                .toUpperCase() || "U"}
            </div>

            <h3 className="mt-4 text-xl font-bold text-slate-950">
              {fullName || "Usuario"}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {initialProfile.email}
            </p>

            <span className="mt-4 rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700">
              {ROLE_LABELS[initialProfile.role] ?? initialProfile.role}
            </span>
          </div>

          <div className="mt-6 space-y-3 border-t border-slate-200 pt-6 text-sm">
            <div>
              <p className="text-slate-500">Empresa</p>
              <p className="font-semibold text-slate-900">Dual Developments</p>
            </div>

            <div>
              <p className="text-slate-500">Correo</p>
              <p className="font-semibold text-slate-900">
                {initialProfile.email}
              </p>
            </div>

            <div>
              <p className="text-slate-500">Rol</p>
              <p className="font-semibold text-slate-900">
                {ROLE_LABELS[initialProfile.role] ?? initialProfile.role}
              </p>
            </div>

            <div>
              <p className="text-slate-500">ID de usuario</p>
              <p className="break-all text-xs font-medium text-slate-700">
                {initialProfile.id}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-950">
              Información personal
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Estos datos ayudan a identificarte dentro del CRM.
            </p>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Nombre completo
                </label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-dual-purple"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nombre completo"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Teléfono / WhatsApp
                </label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-dual-purple"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+57 300 000 0000"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Cargo
                </label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-dual-purple"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Ej: Vendedor, Líder comercial, Admin"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Área
                </label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-dual-purple"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Ej: Comercial, Administración"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Ciudad
                </label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-dual-purple"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ej: Medellín"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  País
                </label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-dual-purple"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Ej: Colombia"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Zona horaria
                </label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-dual-purple"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  placeholder="America/Bogota"
                />
              </div>
            </div>

            {profileMessage && (
              <div className="rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
                {profileMessage}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="rounded-xl bg-dual-purple px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
              >
                {isUpdatingProfile ? "Actualizando..." : "Actualizar datos"}
              </button>
            </div>
          </form>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-slate-950">
            Cambiar contraseña
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Usa esta opción si ingresaste con una contraseña temporal o deseas
            actualizar tu acceso.
          </p>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Nueva contraseña
              </label>
              <input
                type="password"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-dual-purple"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Confirmar contraseña
              </label>
              <input
                type="password"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-dual-purple"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la nueva contraseña"
                required
              />
            </div>
          </div>

          {passwordMessage && (
            <div className="rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
              {passwordMessage}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isChangingPassword}
              className="rounded-xl bg-dual-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {isChangingPassword ? "Cambiando..." : "Cambiar contraseña"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}