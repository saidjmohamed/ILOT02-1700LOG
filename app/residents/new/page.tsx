'use client';
import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';

const CONSENT_VERSION = '2026-08-23-v1';
const CONSENT_PURPOSE = 'تسيير سكان الحي والتواصل والخدمات والمساهمات المالية للحي، وفق الغرض المعلن وبالقدر اللازم.';

export default function NewResident(){
  const [form,setForm]=useState({building:'',apartment:'',first_name:'',last_name:'',phone:''});
  const [consent,setConsent]=useState(false);
  const [msg,setMsg]=useState('');
  const [busy,setBusy]=useState(false);

  async function save(e:any){
    e.preventDefault(); setMsg('');
    if(!consent){setMsg('يجب الحصول على موافقة الجار على معالجة بياناته الشخصية قبل الحفظ.');return;}
    setBusy(true);
    const full_name=`${form.first_name} ${form.last_name}`.trim();
    const {data:dup}=await supabase.from('residents').select('id').eq('building',form.building).eq('apartment',form.apartment).eq('full_name',full_name).limit(1);
    if(dup?.length){setMsg('يوجد جار مسجل بنفس البيانات.');setBusy(false);return}
    const now=new Date().toISOString();
    const {error}=await supabase.from('residents').insert({
      ...form, full_name, updated_at:now,
      privacy_consent:true,
      privacy_consent_at:now,
      privacy_consent_version:CONSENT_VERSION,
      privacy_consent_purpose:CONSENT_PURPOSE
    });
    setMsg(error?(error.message.includes('PRIVACY_CONSENT_REQUIRED')?'لم يتم الحفظ: موافقة معالجة البيانات الشخصية إلزامية.':`تعذر الحفظ: ${error.message}`):'تمت إضافة الجار وحفظ موافقته على معالجة بياناته بنجاح.');
    if(!error){setForm({building:'',apartment:'',first_name:'',last_name:'',phone:''});setConsent(false)}
    setBusy(false)
  }

  return <main className="wrap">
    <div className="sectionTitle"><div><h2>إضافة جار جديد</h2><p className="muted">لا يتم حفظ بيانات الجار دون موافقته الصريحة.</p></div><Link href="/residents">العودة للجيران</Link></div>
    <form className="card formGrid" onSubmit={save}>
      <label>العمارة<input required value={form.building} onChange={e=>setForm({...form,building:e.target.value})}/></label>
      <label>الشقة<input required value={form.apartment} onChange={e=>setForm({...form,apartment:e.target.value})}/></label>
      <label>الاسم<input required value={form.first_name} onChange={e=>setForm({...form,first_name:e.target.value})}/></label>
      <label>اللقب<input required value={form.last_name} onChange={e=>setForm({...form,last_name:e.target.value})}/></label>
      <label>رقم الهاتف<input inputMode="tel" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></label>

      <div className="privacyBox">
        <h3>موافقة معالجة البيانات الشخصية</h3>
        <p>أوافق صراحةً على جمع وحفظ ومعالجة بياناتي الشخصية المدخلة في هذا النموذج (الاسم واللقب، رقم العمارة، رقم الشقة، ورقم الهاتف إن تم تقديمه) لغرض تسيير شؤون سكان الحي والتواصل والخدمات والمساهمات المالية المرتبطة بالحي، وفي حدود الغرض المعلن.</p>
        <p>أعلم أن لي حقوقًا تتعلق ببياناتي، بما فيها الاطلاع والتصحيح وسحب الموافقة وفقًا للقانون رقم 18-07 المؤرخ في 10 يونيو 2018 المتعلق بحماية الأشخاص الطبيعيين في مجال معالجة المعطيات ذات الطابع الشخصي.</p>
        <label className="consentRow"><input type="checkbox" required checked={consent} onChange={e=>setConsent(e.target.checked)}/><span>أوافق صراحةً على معالجة بياناتي الشخصية وفق هذا الإشعار.</span></label>
        <small className="muted">نسخة الموافقة: {CONSENT_VERSION}</small>
      </div>

      <div><button className="primary" disabled={busy || !consent}>{busy?'جاري الحفظ...':'حفظ الجار'}</button></div>
      {msg&&<div className="notice">{msg}</div>}
    </form>
  </main>
}
