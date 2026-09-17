import { useTheme } from "../theme";
import { Button } from "./ui";
import { getFirstName, getInitials } from "./UserWelcome";
import { RefreshCw, Moon, Sun, UserPlus } from "lucide-react";

interface HeaderProps {
  userName: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  lastUpdated?: Date;
}

export function Header({ userName, onRefresh, isRefreshing, lastUpdated }: HeaderProps) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  const hasName = userName.trim().length > 0;
  const firstName = getFirstName(userName);
  const initials = getInitials(userName);

  const formattedTime = lastUpdated
    ? lastUpdated.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "agora";

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/70">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
              <path d="M9 16l2 2 4-4" strokeWidth={2.2} />
            </svg>
          </div>
          <div className="min-w-0 leading-tight">
            <h1 className="truncate text-sm font-bold tracking-tight text-slate-900 sm:text-base dark:text-white">
              Calendário de Horas Extras
            </h1>
            <p className="hidden truncate text-xs text-slate-500 sm:block dark:text-slate-400">
              Dashboard otimizado & 100% automatizado
              {hasName ? (
                <>
                  {" · "}<span className="font-semibold text-indigo-600 dark:text-indigo-400">{firstName}</span>
                </>
              ) : (
                " · gestão Elenildon"
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Botão Atualizar Interativo */}
          {onRefresh && (
            <button
              type="button"
              id="btn-atualizar-header"
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Atualizar dados e sincronizar cálculos"
              aria-label="Atualizar dados e sincronizar cálculos"
              className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/90 px-3 py-2 text-xs font-semibold text-indigo-700 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-100 active:scale-95 disabled:opacity-70 dark:border-indigo-500/30 dark:bg-indigo-500/15 dark:text-indigo-300 dark:hover:bg-indigo-500/25"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 shrink-0 transition-transform duration-500 ${
                  isRefreshing ? "animate-spin text-indigo-600 dark:text-indigo-400" : ""
                }`}
              />
              <span className="font-bold">Atualizar</span>
              <span className="hidden text-[11px] font-normal text-indigo-500 dark:text-indigo-400 lg:inline">
                ({formattedTime})
              </span>
            </button>
          )}

          <span className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 md:inline-flex dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Sincronizado
          </span>

          {/* User chip */}
          {hasName ? (
            <div className="flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/70 py-1 pl-1 pr-2.5 dark:border-indigo-500/25 dark:bg-indigo-500/10 sm:pr-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-[10px] font-bold text-white">
                {initials}
              </div>
              <span className="hidden max-w-[120px] truncate text-xs font-semibold text-indigo-700 sm:block dark:text-indigo-300">
                {firstName}
              </span>
            </div>
          ) : (
            <a
              href="#user-name-input"
              className="hidden items-center gap-1.5 rounded-full border border-dashed border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:border-indigo-300 hover:text-indigo-600 sm:inline-flex dark:border-slate-600 dark:text-slate-400 dark:hover:border-indigo-500/50 dark:hover:text-indigo-300"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Informar nome
            </a>
          )}

          <Button
            aria-label="Alternar modo claro/escuro"
            onClick={toggle}
            className="h-10 w-10 p-0"
            title={isDark ? "Mudar para modo claro" : "Mudar para modo escuro"}
          >
            {isDark ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}

export function Avatar({ initials }: { initials: string }) {
  const grad = [
    "from-indigo-500 to-violet-500",
    "from-emerald-500 to-teal-500",
    "from-rose-500 to-pink-500",
    "from-amber-500 to-orange-500",
    "from-sky-500 to-blue-500",
  ];
  let h = 0;
  for (let i = 0; i < initials.length; i++) h = (h * 31 + initials.charCodeAt(i)) % grad.length;
  if (initials.toLowerCase().includes("elenildon")) h = 0;
  return (
    <div
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${grad[h]} text-[10px] font-bold text-white`}
    >
      {initials}
    </div>
  );
}
