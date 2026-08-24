import type { Metadata, Viewport } from 'next';
import './globals.css';
import AuthGate from '../components/auth-gate';
import AppNavigation from '../components/app-navigation';
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
`;
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ar" dir="rtl"><body><style dangerouslySetInnerHTML={{__html:contrastFix}}/><AuthGate><AppNavigation />{children}</AuthGate></body></html>}
