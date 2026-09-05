'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function Contributions() {
  const [rows, setRows] = useState<any[]>([]);
  const [residents, setResidents] = useState<any[]>([]);
  const [treasuries, setTreasuries] = useState<any[]>([]);
  const [form, setForm] = useState({ resident_id: '', treasury_id: '', amount: '', contribution_date: new Date().toISOString().slice(0, 10), note: '' });
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    const [a, b, c] = await Promise.all([
      supabase.from('contributions').select('id,amount,contribution_date,note,residents(full_name,building,apartment),treasuries(name,building)').order('contribution_date', { ascending: false }),
      supabase.from('residents').select('id,full_name,building,apartment').eq('is_active', true).order('building').order('full_name'),
      supabase.from('treasury_summary').select('id,name,building,treasury_type').eq('is_active', true),
    ]);
    setRows(a.data || []); setResidents(b.data || []); setTreasuries(c.data || []);
  }
  useEffect(() => { load(); }, []);

  function chooseResident(id: string) {
    const r = residents.find(x => x.id === id);
    const t = r ? treasuries.find(x => x.treasury_type === 'building' && x.building === r.building) : null;
    setForm(f => ({ ...f, resident_id: id, treasury_id: t?.id || '' }));
    setMsg(t ? '' : (r ? `لا توجد خزينة مفعلة لعمارة ${r.building}.` : ''));
  }

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setMsg('');
    const residentId = form.resident_id.trim(), treasuryId = form.treasury_id.trim(), amount = Number(form.amount);
    if (!residentId || !treasuryId || !Number.isFinite(amount) || amount <= 0 || !form.contribution_date) { setMsg('يرجى اختيار الجار وإدخال مبلغ صحيح وتاريخ المساهمة.'); return; }
    setSaving(true);
    try {
      const { error } = await supabase.rpc('record_contribution', { p_resident_id: residentId, p_treasury_id: treasuryId, p_amount: amount, p_contribution_date: form.contribution_date, p_note: form.note.trim() || null });
      if (error) { setMsg(`تعذر تسجيل المساهمة: ${error.message}`); return; }
      setMsg('تم تسجيل المساهمة في خزينة العمارة بنجاح.');
      setForm(f => ({ ...f, amount: '', note: '' })); await load();
    } finally { setSaving(false); }
  }

  const selectedResident = residents.find(r => r.id === form.resident_id);
  const selectedTreasury = treasuries.find(t => t.id === form.treasury_id);

  return <main className="wrap">
    <div className="sectionTitle"><div><h2>المساهمات</h2><p className="muted">كل مساهمة تُسجل تلقائيًا في خزينة عمارة الجار.</p></div></div>
    <form className="card formGrid" onSubmit={save}>
      <label>الجار<select required value={form.resident_id} onChange={e => chooseResident(e.target.value)}><option value="">اختر الجار</option>{residents.map(r => <option key={r.id} value={r.id}>{r.full_name} — عمارة {r.building} / شقة {r.apartment}</option>)}</select></label>
      <label>الخزينة الخاصة بالجار<input readOnly value={selectedTreasury ? selectedTreasury.name : selectedResident ? `خزينة عمارة ${selectedResident.building} غير موجودة` : 'اختر الجار أولًا'} /></label>
      <label>المبلغ<input required type="number" min="0.01" step="0.01" value={form.amount} onChange={e => setForm({...form, amount:e.target.value})} /></label>
      <label>التاريخ<input required type="date" value={form.contribution_date} onChange={e => setForm({...form, contribution_date:e.target.value})} /></label>
      <label>ملاحظات<textarea value={form.note} onChange={e => setForm({...form, note:e.target.value})} /></label>
      <button className="primary" type="submit" disabled={saving || !form.treasury_id}>{saving ? 'جارٍ التسجيل...' : 'تسجيل المساهمة'}</button>
      {msg && <div className="notice">{msg}</div>}
    </form>
    <div className="card tableWrap"><h3>آخر المساهمات</h3><table><thead><tr><th>الجار</th><th>الخزينة</th><th>المبلغ</th><th>التاريخ</th></tr></thead><tbody>{rows.map(r => <tr key={r.id}><td>{r.residents?.full_name || '—'}</td><td>{r.treasuries?.name || '—'}</td><td>{Number(r.amount).toLocaleString('ar-DZ')} دج</td><td>{r.contribution_date}</td></tr>)}</tbody></table>{!rows.length&&<div className="empty">لا توجد مساهمات ظاهرة حسب صلاحيات حسابك.</div>}</div>
  </main>;
}
