'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';

const CONSENT_VERSION = '2026-08-23-v1';
const CONSENT_PURPOSE = 'تسيير سكان الحي والتواصل والخدمات والمساهمات المالية للحي، وفق الغرض المعلن وبالقدر اللازم.';

export default function NewResident() {
  const [form, setForm] = useState({
    building: '', apartment: '', first_name: '', last_name: '', phone: '',
    housing_status: '', housing_relation: ''
  });
  const [consent, setConsent] = useState(false);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const required = (label: string) => <span>{label} <b className="requiredStar" aria-hidden="true">*</b></span>;
  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  async function save(e: any) {
    e.preventDefault(); setMsg('');
    if (!consent) { setMsg('يجب الحصول على موافقة الجار على معالجة بياناته الشخصية قبل الحفظ.'); return; }
    if (!form.housing_status) { setMsg('يرجى تحديد علاقة الجار بالشقة.'); return; }
    if (form.housing_status === 'other' && !form.housing_relation.trim()) { setMsg('يرجى كتابة علاقة الجار بالشقة.'); return; }
    setBusy(true);
    const full_name = `${form.first_name} ${form.last_name}`.trim();
    const { data: dup } = await supabase.from('residents').select('id').eq('building', form.building).eq('apartment', form.apartment).eq('full_name', full_name).limit(1);
    if (dup?.length) { setMsg('يوجد جار مسجل بنفس البيانات.'); setBusy(false); return; }
    const now = new Date().toISOString();
    const { error } = await supabase.from('residents').insert({
      building: form.building, apartment: form.apartment, first_name: form.first_name,
      last_name: form.last_name, phone: form.phone, full_name, updated_at: now,
      housing_status: form.housing_status,
      housing_relation: form.housing_status === 'other' ? form.housing_relation.trim() : null,
      privacy_consent: true, privacy_consent_at: now,
      privacy_consent_version: CONSENT_VERSION, privacy_consent_purpose: CONSENT_PURPOSE
    });
    setMsg(error ? (error.message.includes('PRIVACY_CONSENT_REQUIRED') ? 'لم يتم الحفظ: موافقة معالجة البيانات الشخصية إلزامية.' : `تعذر الحفظ: ${error.message}`) : 'تمت إضافة الجار وحفظ بياناته وموافقته بنجاح.');
    if (!error) {
      setForm({ building: '', apartment: '', first_name: '', last_name: '', phone: '', housing_status: '', housing_relation: '' });
      setConsent(false);
    }
    setBusy(false);
  }

  return <main className="wrap">
    <div className="sectionTitle">
      <div><h2>إضافة جار جديد</h2><p className="muted">الحقول المعلّمة بـ <b className="requiredStar">*</b> إجبارية.</p></div>
      <Link href="/residents">العودة للجيران</Link>
    </div>

    <form className="card formGrid" onSubmit={save}>
      <label>{required('العمارة')}<input required value={form.building} onChange={e => update('building', e.target.value)} /></label>
      <label>{required('رقم الشقة')}<input required value={form.apartment} onChange={e => update('apartment', e.target.value)} /></label>
      <label>{required('الاسم')}<input required value={form.first_name} onChange={e => update('first_name', e.target.value)} /></label>
      <label>{required('اللقب')}<input required value={form.last_name} onChange={e => update('last_name', e.target.value)} /></label>
      <label>{required('رقم الهاتف')}<input required inputMode="tel" value={form.phone} onChange={e => update('phone', e.target.value)} /></label>

      <fieldset className="formFieldset">
        <legend>{required('العلاقة بالشقة')}</legend>
        <div className="relationOptions">
          <label className={`relationOption ${form.housing_status === 'owner' ? 'selected' : ''}`}><input type="radio" name="housing_status" value="owner" required checked={form.housing_status === 'owner'} onChange={e => update('housing_status', e.target.value)} /> صاحب الشقة</label>
          <label className={`relationOption ${form.housing_status === 'tenant' ? 'selected' : ''}`}><input type="radio" name="housing_status" value="tenant" required checked={form.housing_status === 'tenant'} onChange={e => update('housing_status', e.target.value)} /> مستأجر</label>
          <label className={`relationOption ${form.housing_status === 'other' ? 'selected' : ''}`}><input type="radio" name="housing_status" value="other" required checked={form.housing_status === 'other'} onChange={e => update('housing_status', e.target.value)} /> علاقة أخرى</label>
        </div>
        {form.housing_status === 'other' && <label className="otherRelation">{required('حدد العلاقة')}<input required value={form.housing_relation} placeholder="مثال: أحد أفراد الأسرة، وكيل، حارس..." onChange={e => update('housing_relation', e.target.value)} /></label>}
      </fieldset>

      <div className="privacyBox">
        <h3>{required('موافقة معالجة البيانات الشخصية')}</h3>
        <p>أوافق صراحةً على جمع وحفظ ومعالجة بياناتي الشخصية المدخلة في هذا النموذج (الاسم واللقب، رقم العمارة، رقم الشقة، رقم الهاتف، والعلاقة بالشقة) لغرض تسيير شؤون سكان الحي والتواصل والخدمات والمساهمات المالية المرتبطة بالحي، وفي حدود الغرض المعلن.</p>
        <p>أعلم أن لي حقوقًا تتعلق ببياناتي، بما فيها الاطلاع والتصحيح وسحب الموافقة وفقًا للقانون رقم 18-07 المؤرخ في 10 يونيو 2018 المتعلق بحماية الأشخاص الطبيعيين في مجال معالجة المعطيات ذات الطابع الشخصي.</p>
        <label className="consentRow"><input type="checkbox" required checked={consent} onChange={e => setConsent(e.target.checked)} /><span>أوافق صراحةً على معالجة بياناتي الشخصية وفق هذا الإشعار. <b className="requiredStar">*</b></span></label>
        <small className="muted">نسخة الموافقة: {CONSENT_VERSION}</small>
      </div>

      <div><button className="primary" disabled={busy || !consent}>{busy ? 'جاري الحفظ...' : 'حفظ الجار'}</button></div>
      {msg && <div className="notice">{msg}</div>}
    </form>
  </main>;
}
