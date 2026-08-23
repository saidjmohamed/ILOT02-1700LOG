'use client';
import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function Login(){
 const router=useRouter();
 const[phone,setPhone]=useState('');
 const[password,setPassword]=useState('');
 const[error,setError]=useState('');
 const[busy,setBusy]=useState(false);
 async function submit(e:FormEvent){
  e.preventDefault();setError('');setBusy(true);
  const{data,error:fnError}=await supabase.functions.invoke('login-with-phone-username',{body:{phone,password}});
  if(fnError||!data?.access_token){setError('اسم المستخدم أو كلمة المرور غير صحيحة.');setBusy(false);return}
  const{error:setErrorResult}=await supabase.auth.setSession({access_token:data.access_token,refresh_token:data.refresh_token});
  if(setErrorResult){setError('تعذر إنشاء جلسة الدخول. حاول مرة أخرى.');setBusy(false);return}
  router.replace('/');setBusy(false)
 }
 return <main className="authScreen">
  <div className="card authCard">
   <div className="authBrand"><div className="brandMark authMark">🏘️</div><div><h1>حي 1700 مسكن — إيلو 02</h1><p>بوابة سكان الحي</p></div></div>
   <p className="authIntro">مرحبًا بك. سجّل الدخول للوصول إلى حسابك.</p>
   <div className="authSwitch" role="tablist" aria-label="طريقة الدخول">
    <span className="authTab active">🔐 تسجيل الدخول</span>
    <Link className="authTab" href="/register">🆕 إنشاء حساب</Link>
   </div>
   <form id="login-form" className="authForm" onSubmit={submit}>
    <h2>تسجيل الدخول</h2>
    <label>رقم الهاتف<input required inputMode="tel" autoComplete="username" placeholder="0558 35 76 89" value={phone} onChange={e=>setPhone(e.target.value)}/></label>
    <label>كلمة المرور<input required type="password" autoComplete="current-password" placeholder="أدخل كلمة المرور" value={password} onChange={e=>setPassword(e.target.value)}/></label>
    {error&&<div className="notice">{error}</div>}
    <button className="primary authSubmit" disabled={busy}>{busy?'جاري الدخول...':'دخول إلى الحساب'}</button>
   </form>
   <p className="authFooter">بياناتك محمية ولا يمكن للمستخدمين العاديين إدارة حسابات المسؤولين.</p>
  </div>
 </main>
}
