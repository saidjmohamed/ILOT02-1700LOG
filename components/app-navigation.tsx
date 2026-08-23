'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

export default function AppNavigation(){
 const pathname=usePathname();const router=useRouter();
 if(pathname==='/login'||pathname==='/register'||pathname==='/setup')return null;
 async function logout(){await supabase.auth.signOut();router.replace('/login')}
 return <nav className="globalNav" aria-label="التنقل الرئيسي">
  <button type="button" onClick={()=>window.history.back()} aria-label="رجوع">‹ <span>رجوع</span></button>
  <Link href="/" aria-label="الرئيسية">⌂ <span>الرئيسية</span></Link>
  <button type="button" className="logoutBtn" onClick={logout} aria-label="تسجيل الخروج">↪ <span>خروج</span></button>
 </nav>
}
