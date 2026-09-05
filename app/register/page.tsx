'use client';
import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
const PURPOSE='تسيير سكان الحي والتواصل والخدمات والمساهمات المالية للحي';

export default function Register(){
 const router=useRouter();
 const[f,setF]=useState({first_name:'',last_name:'',phone:'',building:'',apartment:'',password:'',confirm:''});
 const[consent,setConsent]=useState(false); const[error,setError]=useState(''); const[busy,setBusy]=useState(false);
 const update=(k:string,v:string)=>setF(x=>({...x,[k]:v}));
 async function submit(e:FormEvent){
  e.preventDefault(); setError('');
  const values={first_name:f.first_name.trim(),last_name:f.last_name.trim(),phone:f.phone.trim(),building:f.building.trim(),apartment:f.apartment.trim(),password:f.password,confirm:f.confirm};
  if(Object.values(values).some(v=>!v)){setError('جميع الخانات إجبارية. يجب ملء كل الخانات قبل إنشاء الحساب.');return}
  if(values.password.length<6){setError('كلمة السر يجب أن تكون 6 أحرف/أرقام على الأقل.');return}
  if(values.password!==values.confirm){setError('تأكيد كلمة السر غير مطابق.');return}
  if(!consent){setError('يجب الموافقة على معالجة البيانات قبل إنشاء الحساب.');return}
  setBusy(true);
  const{data,error:fn}=await supabase.functions.invoke('register-resident',{body:{...values,consent}});
  if(fn||!data?.ok){const code=data?.error;setError(code==='PHONE_ALREADY_REGISTERED'?'رقم الهاتف مسجل مسبقًا. اختر «دخول للحساب».':code==='CONSENT_REQUIRED'?'الموافقة على معالجة البيانات مطلوبة.':code==='INVALID_INPUT'?'تحقق من البيانات المدخلة ورقم الهاتف وكلمة السر.':'تعذر إنشاء الحساب حاليًا، حاول مرة أخرى.');setBusy(false);return}
  alert('تم إنشاء حسابك وإضافتك تلقائيًا إلى قائمة سكان العمارة التي اخترتها. يمكنك الآن تسجيل الدخول.');router.replace('/login');setBusy(false)
 }
 return <main className="authScreen"><form className="card authCard" onSubmit={submit} noValidate>
  <div className="brandMark authMark">🏠</div><h1>إنشاء حساب جار جديد</h1><p className="muted">سيتم ربط الحساب تلقائيًا بالعمارة والشقة التي تدخلها.</p>
  <div className="formGrid">
   <label>الاسم <b className="requiredStar">*</b><input required value={f.first_name} onChange={e=>update('first_name',e.target.value)} /></label>
   <label>اللقب <b className="requiredStar">*</b><input required value={f.last_name} onChange={e=>update('last_name',e.target.value)} /></label>
   <label>رقم الهاتف <b className="requiredStar">*</b><input required inputMode="tel" placeholder="0558357689" value={f.phone} onChange={e=>update('phone',e.target.value)} /></label>
   <label>رقم العمارة <b className="requiredStar">*</b><input required value={f.building} onChange={e=>update('building',e.target.value)} /></label>
   <label>رقم الشقة <b className="requiredStar">*</b><input required value={f.apartment} onChange={e=>update('apartment',e.target.value)} /></label>
   <label>كلمة السر <b className="requiredStar">*</b><input required type="password" minLength={6} value={f.password} onChange={e=>update('password',e.target.value)} /></label>
   <label>تأكيد كلمة السر <b className="requiredStar">*</b><input required type="password" minLength={6} value={f.confirm} onChange={e=>update('confirm',e.target.value)} /></label>
  </div>
  <div className="privacyBox"><h3>الموافقة على معالجة البيانات <b className="requiredStar">*</b></h3><p>أوافق على جمع وحفظ ومعالجة اسمي ولقبي ورقم هاتفي وبيانات العمارة والشقة لغرض {PURPOSE}، وفي حدود الغرض المعلن.</p><label className="consentRow"><input type="checkbox" required checked={consent} onChange={e=>setConsent(e.target.checked)}/><span>أوافق صراحةً على معالجة بياناتي الشخصية.</span></label></div>
  {error&&<div className="notice">{error}</div>}
  <button className="primary" disabled={busy||!consent}>{busy?'جاري إنشاء الحساب...':'إنشاء الحساب'}</button><Link href="/login">لدي حساب بالفعل — تسجيل الدخول</Link>
 </form></main>
}
