'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
export default function AppNavigation(){const pathname=usePathname();const router=useRouter();if(pathname==='/login'||pathname==='/register'||pathname==='/setup')return null;async function logout(){await supabase.auth.signOut();router.replace('/login')}return <div className="globalNav"><button type="button" onClick={()=>window.history.back()} aria-label="رجوع">← رجوع</button><button type="button" onClick={()=>window.history.forward()} aria-label="تقدم">تقدم →</button><Link href="/">⌂ الرئيسية</Link><button type="button" className="logoutBtn" onClick={logout}>↪ تسجيل الخروج</button></div>}
