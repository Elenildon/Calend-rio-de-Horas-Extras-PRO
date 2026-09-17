// Configuração do Capacitor para gerar o app Android (.aab) a partir da pasta dist.
// Como gerar o .aab (na sua máquina, com Node 20+ e Android Studio instalados):
//   1) npm i @capacitor/core @capacitor/cli @capacitor/android
//   2) npm run build
//   3) npx cap add android
//   4) npx cap sync
//   5) npx cap open android
//   6) No Android Studio: Build > Generate Signed Bundle / APK > Android App Bundle (.aab)
//      ou Build > Build APK(s) para APK direto (Opção A, instala no celular)
// O .aab sai em: android/app/build/outputs/bundle/release/app-release.aab
// O .apk debug sai em: android/app/build/outputs/apk/debug/app-debug.apk
const config = {
  appId: "com.elenildon.horasextras",
  appName: "Horas Extras · Elenildon",
  webDir: "dist",
  backgroundColor: "#0f172a",
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
};

export default config;
