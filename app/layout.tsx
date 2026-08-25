import type { Metadata, Viewport } from 'next';
import './globals.css';
import AuthGate from '../components/auth-gate';
import AppNavigation from '../components/app-navigation';
import AppPrompts from '../components/app-prompts';
export const metadata: Metadata = { title:'إيلو 02 — 1700 مسكن', description:'نظام تسيير سكان وخزينة حي 1700 مسكن بوعنقود — إيلو 02', manifest:'/manifest.webmanifest', applicationName:'إيلو 02', appleWebApp:{capable:true,title:'إيلو 02',statusBarStyle:'default'} };
export const viewport: Viewport = { width:'device-width', initialScale:1, viewportFit:'cover', themeColor:'#0f3d2a' };
const contrastFix = `
  button:not(.primary):not(.logoutBtn):not(.authTab.active),
  .actions button,
  .quick button { color:#17231d; }
  .card,
  .formGrid,
  .privacyBox,
  .permissionItem,
  .actions a,
  .quick a { color:#17231d; }
  .globalNav button,.globalNav a,.globalNav .logoutBtn,
  .topbar,.topbar button,.hero,.hero button,
  .primary,.authTab.active { color:#fff; }
  .card a,.formGrid a,.privacyBox a,.actions a { color:#176b46; }
  input,select,textarea { color:#17231d !important; background:#fff !important; }
  .appPromptOverlay { position:fixed; inset:0; z-index:9999; display:flex; align-items:flex-end; justify-content:center; padding:16px; background:rgba(9,20,14,.48); backdrop-filter:blur(3px); }
  .appPromptCard { width:min(100%,460px); background:#fff; color:#17231d; border:1px solid #dce7e1; border-radius:24px; padding:24px; box-shadow:0 18px 50px rgba(0,0,0,.2); text-align:center; }
  .appPromptIcon { width:58px; height:58px; margin:0 auto 12px; display:grid; place-items:center; border-radius:18px; background:#e9f5ee; font-size:28px; }
  .appPromptCard h2 { margin:0 0 8px; color:#173f2d; font-size:22px; }
  .appPromptCard p { margin:0 auto 20px; color:#5d6b64; line-height:1.7; max-width:380px; }
  .appPromptActions { display:grid; gap:10px; }
  .appPromptPrimary,.appPromptSecondary { min-height:46px; border-radius:12px; border:0; font:inherit; font-weight:700; cursor:pointer; }
  .appPromptPrimary { background:#0f3d2a; color:#fff !important; }
  .appPromptSecondary { background:#f1f4f2; color:#314139 !important; }
`;
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ar" dir="rtl"><body><style dangerouslySetInnerHTML={{__html:contrastFix}}/><AuthGate><AppNavigation /><AppPrompts />{children}</AuthGate></body></html>}
