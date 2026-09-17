import { useState } from "react";
import { Card } from "./ui";
import { cn } from "../utils/cn";

const APP_ID = "com.elenildon.horasextras";
const VERSION_LABEL = "1.0.0 · versionCode 1";

type Tab = "apk" | "rapido" | "twa" | "nativo";

const CHECKLIST = [
  "Manifest PWA incluído",
  "Ícone 512px + maskable",
  "Tema #4f46e5 · standalone",
  "Idioma pt-BR",
  `Pacote ${APP_ID}`,
  `Versão ${VERSION_LABEL}`,
];

const BUBBLEWRAP_CMDS = [
  { id: "bw1", label: "Instalar o Bubblewrap", cmd: "npm i -g @bubblewrap/cli" },
  {
    id: "bw2",
    label: "Iniciar o projeto TWA",
    cmd: "bubblewrap init --manifest=https://SEU-DOMINIO/manifest.webmanifest",
  },
  { id: "bw3", label: "Gerar o .aab assinado", cmd: "bubblewrap build" },
];

const CAPACITOR_CMDS = [
  {
    id: "cap1",
    label: "Instalar o Capacitor",
    cmd: "npm i @capacitor/core @capacitor/cli @capacitor/android",
  },
  { id: "cap2", label: "Gerar o build web", cmd: "npm run build" },
  { id: "cap3", label: "Criar o projeto Android", cmd: "npx cap add android" },
  { id: "cap4", label: "Sincronizar arquivos", cmd: "npx cap sync" },
  { id: "cap5", label: "Abrir no Android Studio", cmd: "npx cap open android" },
];

const KEYSTORE_CMD =
  "keytool -genkeypair -v -keystore he-release.keystore -alias he -keyalg RSA -keysize 2048 -validity 10000";

const ASSETLINKS = `[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "${APP_ID}",
    "sha256_cert_fingerprints": ["SUA_SHA256_DO_KEYSTORE"]
  }
}]`;

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      return true;
    } catch {
      return false;
    }
  }
}

function CmdBlock({
  label,
  cmd,
  copied,
  onCopy,
}: {
  label: string;
  cmd: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-950 p-3 dark:border-slate-700">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </span>
        <button
          type="button"
          onClick={onCopy}
          className={cn(
            "rounded-lg px-2 py-1 text-[11px] font-bold transition active:scale-95",
            copied
              ? "bg-emerald-500 text-white"
              : "bg-slate-800 text-slate-200 hover:bg-slate-700"
          )}
        >
          {copied ? "Copiado!" : "Copiar"}
        </button>
      </div>
      <pre className="overflow-x-auto whitespace-pre-wrap break-all font-mono text-xs leading-relaxed text-emerald-300">
        {cmd}
      </pre>
    </div>
  );
}

function ExternalButton({
  href,
  primary,
  children,
}: {
  href: string;
  primary?: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition active:scale-[0.98]",
        primary
          ? "bg-emerald-600 text-white shadow-sm shadow-emerald-500/25 hover:bg-emerald-500"
          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
      )}
    >
      {children}
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <path d="M15 3h6v6M10 14 21 3" />
      </svg>
    </a>
  );
}

export function AndroidExport() {
  const [tab, setTab] = useState<Tab>("apk");
  const [copied, setCopied] = useState<string | null>(null);
  const [apkUrl, setApkUrl] = useState("");

  const handleCopy = (key: string, text: string) => {
    void copyText(text).then((ok) => {
      if (ok) {
        setCopied(key);
        window.setTimeout(() => setCopied(null), 1600);
      }
    });
  };

  const cleanUrl = apkUrl.trim().replace(/\/+$/, "");
  const pwaBuilderUrl = cleanUrl
    ? `https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(cleanUrl)}`
    : "https://www.pwabuilder.com/";

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50 px-5 py-4 dark:border-slate-800 dark:from-emerald-500/10 dark:to-teal-500/5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#3ddc84] text-white shadow-sm">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
            <path d="M17.6 9.48l1.84-3.18a.38.38 0 0 0-.66-.38l-1.86 3.22a11.62 11.62 0 0 0-9.84 0L5.22 5.92a.38.38 0 0 0-.66.38L6.4 9.48A10.78 10.78 0 0 0 1 18h22a10.78 10.78 0 0 0-5.4-8.52zM7 15.25a1.25 1.25 0 1 1 1.25-1.25A1.25 1.25 0 0 1 7 15.25zm10 0a1.25 1.25 0 1 1 1.25-1.25 1.25 1.25 0 0 1-1.25 1.25z" />
          </svg>
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white sm:text-base">
            Publicar no Android{" "}
            <span className="ml-1 rounded-full bg-emerald-500/15 px-2 py-0.5 align-middle text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
              Opção A · APK direto
            </span>
          </h3>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
            APK instala direto no celular · .aab é só para a Play Store
          </p>
        </div>
      </div>

      <div className="space-y-4 p-5">
        {/* Checklist */}
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
          {CHECKLIST.map((item) => (
            <div
              key={item}
              className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800/60 dark:text-slate-300"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              <span className="truncate">{item}</span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          {(
            [
              { id: "apk", label: "A · Gerar APK" },
              { id: "rapido", label: "B · PWABuilder (.aab)" },
              { id: "twa", label: "C · Bubblewrap (TWA)" },
              { id: "nativo", label: "D · Capacitor" },
            ] as { id: Tab; label: string }[]
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "flex-1 rounded-lg px-2 py-2 text-xs font-bold transition-all sm:text-[13px]",
                tab === t.id
                  ? "bg-white text-emerald-700 shadow-sm dark:bg-slate-700 dark:text-emerald-300"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "apk" && (
          <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
            {/* A1 — online generators */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-500/25 dark:bg-emerald-500/5">
              <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
                A1 · Gerador online em 1 clique (sem instalar nada)
              </p>
              <p className="mt-1 text-[13px]">
                Publique a pasta <code className="rounded bg-white/70 px-1 font-mono text-xs dark:bg-slate-800">dist/</code> em
                HTTPS (Netlify, Vercel, Firebase), cole a URL abaixo e abra o gerador:
              </p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input
                  type="url"
                  inputMode="url"
                  value={apkUrl}
                  onChange={(e) => setApkUrl(e.target.value)}
                  placeholder="https://seu-app.netlify.app"
                  className="w-full flex-1 rounded-xl border border-emerald-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-emerald-500/30 dark:bg-slate-900 dark:text-slate-200 dark:focus:ring-emerald-900/40"
                />
              </div>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <ExternalButton href={pwaBuilderUrl} primary>
                  Gerar APK no PWABuilder
                </ExternalButton>
                <ExternalButton href="https://appmaker.xyz/pwa-to-apk/">
                  Gerar APK no AppMaker
                </ExternalButton>
              </div>
              <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-[13px]">
                <li>No PWABuilder, clique em <strong>Package for Android</strong> e baixe o <strong>.apk</strong> (não o .aab).</li>
                <li>Envie o arquivo para o celular (WhatsApp, Drive, USB ou e-mail).</li>
                <li>No Android, toque no arquivo e permita <strong>“Instalar apps desconhecidos”</strong> quando pedir.</li>
              </ol>
            </div>

            {/* A2 — automatic via GitHub Actions */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-700 dark:bg-slate-800/40">
              <p className="text-sm font-bold text-slate-800 dark:text-white">
                A2 · Gerador automático (sem publicar site — via GitHub Actions)
              </p>
              <p className="mt-1 text-[13px]">
                Já deixei o workflow pronto em{" "}
                <code className="rounded bg-slate-100 px-1 font-mono text-xs dark:bg-slate-900">.github/workflows/build-apk.yml</code>.
                Ele compila o app e entrega o APK para download:
              </p>
              <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-[13px]">
                <li>Suba este projeto para um repositório no <strong>GitHub</strong>.</li>
                <li>
                  Abra a aba <strong>Actions → “Opção A · Gerar APK Android” → Run workflow</strong>.
                </li>
                <li>
                  Ao terminar, baixe o artefato <strong>HorasExtras-OpcaoA</strong> (arquivo{" "}
                  <code className="rounded bg-slate-100 px-1 font-mono text-xs dark:bg-slate-900">HorasExtras-OpcaoA.apk</code>).
                </li>
                <li>Transfira para o celular e instale (é um APK de depuração, ideal para testar e usar no dia a dia).</li>
              </ol>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-200">
                APK de depuração usa assinatura de teste: instala normalmente, mas para publicar na Play Store use o
                caminho B/C/D (bundle assinado .aab).
              </div>
            </div>

            {/* Install mini-guide */}
            <div className="grid gap-2 text-[13px] sm:grid-cols-3">
              {[
                { t: "1 · Baixe o .apk", d: "PWABuilder, AppMaker ou Actions." },
                { t: "2 · Libere a instalação", d: "Android pede “fontes desconhecidas” só 1 vez." },
                { t: "3 · Toque e instale", d: "O ícone Horas Extras aparece na tela inicial." },
              ].map((s) => (
                <div key={s.t} className="rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-800/60">
                  <p className="font-bold text-slate-800 dark:text-white">{s.t}</p>
                  <p className="text-slate-500 dark:text-slate-400">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "rapido" && (
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <p>
              <strong className="text-slate-800 dark:text-white">Sem instalar nada:</strong>{" "}
              publique a pasta <code className="rounded bg-slate-100 px-1 font-mono text-xs dark:bg-slate-800">dist/</code> em
              qualquer hospedagem HTTPS e empacote online.
            </p>
            <ol className="list-decimal space-y-1.5 pl-5 text-[13px]">
              <li>
                Rode <code className="rounded bg-slate-100 px-1 font-mono text-xs dark:bg-slate-800">npm run build</code> e
                publique o conteúdo de <code className="rounded bg-slate-100 px-1 font-mono text-xs dark:bg-slate-800">dist/</code> (ex.: Netlify, Vercel, Firebase Hosting).
              </li>
              <li>
                Acesse <strong>pwabuilder.com</strong>, informe a URL do app e clique em{" "}
                <strong>Package for Android</strong>.
              </li>
              <li>
                Baixe o <strong>.aab assinado</strong> e envie no{" "}
                <strong>Google Play Console → Produção</strong>.
              </li>
            </ol>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-200">
              Para abrir sem barra do navegador (TWA), publique este arquivo em{" "}
              <code className="font-mono">https://SEU-DOMINIO/.well-known/assetlinks.json</code>:
            </div>
            <CmdBlock
              label="assetlinks.json — publicar no domínio"
              cmd={ASSETLINKS}
              copied={copied === "assetlinks"}
              onCopy={() => handleCopy("assetlinks", ASSETLINKS)}
            />
          </div>
        )}

        {tab === "twa" && (
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <p>
              Transforma o site instalado em app de tela cheia usando o Chrome (mesmo resultado do PWABuilder, mas no seu terminal).
            </p>
            <div className="space-y-2">
              {BUBBLEWRAP_CMDS.map((c) => (
                <CmdBlock
                  key={c.id}
                  label={c.label}
                  cmd={c.cmd}
                  copied={copied === c.id}
                  onCopy={() => handleCopy(c.id, c.cmd)}
                />
              ))}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Saída: <code className="rounded bg-slate-100 px-1 font-mono dark:bg-slate-800">app-release-signed.aab</code> ·
              um modelo inicial já está no arquivo <code className="rounded bg-slate-100 px-1 font-mono dark:bg-slate-800">twa-manifest.json</code> na raiz do projeto.
            </p>
          </div>
        )}

        {tab === "nativo" && (
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <p>
              Gera um projeto Android de verdade (a config{" "}
              <code className="rounded bg-slate-100 px-1 font-mono text-xs dark:bg-slate-800">capacitor.config.ts</code> já
              está pronta na raiz, com pacote <code className="rounded bg-slate-100 px-1 font-mono text-xs dark:bg-slate-800">{APP_ID}</code>).
            </p>
            <div className="space-y-2">
              {CAPACITOR_CMDS.map((c) => (
                <CmdBlock
                  key={c.id}
                  label={c.label}
                  cmd={c.cmd}
                  copied={copied === c.id}
                  onCopy={() => handleCopy(c.id, c.cmd)}
                />
              ))}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No Android Studio: <strong>Build → Generate Signed Bundle / APK → Android App Bundle</strong>. O arquivo sai em{" "}
              <code className="rounded bg-slate-100 px-1 font-mono dark:bg-slate-800">android/app/build/outputs/bundle/release/app-release.aab</code>
              {" "}— para APK direto use <strong>Build APK(s)</strong> em vez de Bundle.
            </p>
            <CmdBlock
              label="Criar chave de assinatura (keystore)"
              cmd={KEYSTORE_CMD}
              copied={copied === "keystore"}
              onCopy={() => handleCopy("keystore", KEYSTORE_CMD)}
            />
          </div>
        )}

        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-200">
          <strong>Atenção:</strong> guarde o keystore e as senhas em local seguro. Sem o mesmo keystore não é possível
          atualizar o app na Play Store depois.
        </div>
      </div>
    </Card>
  );
}
