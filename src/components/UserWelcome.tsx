import { useState } from "react";
import { cn } from "../utils/cn";

interface Props {
  userName: string;
  onChange: (v: string) => void;
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function getFirstName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts[0] ?? "";
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "Bom dia";
  if (h >= 12 && h < 18) return "Boa tarde";
  return "Boa noite";
}

export function UserWelcome({ userName, onChange }: Props) {
  const [focused, setFocused] = useState(false);
  const trimmed = userName.trim();
  const firstName = getFirstName(userName);
  const initials = getInitials(userName);
  const hasName = trimmed.length > 0;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 p-5 text-white shadow-lg shadow-indigo-500/20 dark:border-indigo-500/20 sm:p-6">
      {/* decorative shapes */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-white/10 blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-28 right-32 h-56 w-56 rounded-full bg-violet-300/20 blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "22px 22px",
        }}
      />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: greeting + avatar */}
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-lg font-extrabold tracking-wide text-white ring-1 ring-white/30 backdrop-blur sm:h-16 sm:w-16 sm:text-xl">
            {hasName ? initials : (
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-widest text-indigo-200">
              {getGreeting()} · bem-vindo ao painel
            </p>
            <h2 className="mt-1 truncate text-xl font-bold tracking-tight sm:text-2xl">
              {hasName ? (
                <>
                  Olá, <span className="underline decoration-white/40 decoration-2 underline-offset-4">{firstName}</span>!
                </>
              ) : (
                "Qual é o seu nome?"
              )}
            </h2>
            <p className="mt-1 max-w-md text-sm text-indigo-100/90">
              {hasName
                ? "Seu painel de horas extras está personalizado e pronto para usar."
                : "Digite seu nome ao lado para personalizar todo o painel."}
            </p>
          </div>
        </div>

        {/* Right: name input */}
        <div className="w-full max-w-md">
          <label
            htmlFor="user-name-input"
            className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-indigo-200"
          >
            Nome do usuário
          </label>
          <div
            className={cn(
              "flex items-center gap-2 rounded-xl border bg-white/95 px-3 py-1 backdrop-blur transition-all dark:bg-slate-900/90",
              focused
                ? "border-white ring-4 ring-white/25"
                : "border-white/40 hover:border-white/70"
            )}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-indigo-500" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <input
              id="user-name-input"
              type="text"
              value={userName}
              maxLength={60}
              autoComplete="name"
              placeholder="Ex.: Elenildon Silva"
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              }}
              className="w-full bg-transparent py-2.5 text-sm font-semibold text-slate-800 outline-none placeholder:font-normal placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
            />
            {hasName && (
              <button
                type="button"
                onClick={() => onChange("")}
                aria-label="Limpar nome"
                title="Limpar nome"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 active:scale-95 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-indigo-100/80">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            {hasName
              ? "Salvo automaticamente · usado no cabeçalho, resumos e cálculos"
              : "O nome é salvo automaticamente neste dispositivo"}
          </p>
        </div>
      </div>
    </section>
  );
}
