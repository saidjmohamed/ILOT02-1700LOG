'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';

type Resident = {
  id: string;
  building: string;
  apartment: string | null;
  full_name: string | null;
  phone: string | null;
  assigned_role: string | null;
};

export default function Residents() {
  const [rows, setRows] = useState<Resident[]>([]);
  const [building, setBuilding] = useState('');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [canManage, setCanManage] = useState(false);

  async function load() {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    if (userData.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role,permissions')
        .eq('id', userData.user.id)
        .maybeSingle();
      setCanManage(['super_admin', 'admin', 'treasurer'].includes(profile?.role || ''));
    }

    const { data, error } = await supabase
      .from('residents')
      .select('id,building,apartment,full_name,phone,assigned_role')
      .eq('is_active', true)
      .order('building')
      .order('apartment');

    if (!error) setRows((data || []) as Resident[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const buildings = useMemo(() => {
    return Array.from(new Set(rows.map((r) => r.building).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b, 'ar', { numeric: true })
    );
  }, [rows]);

  const selectedResidents = useMemo(() => {
    if (!building) return [];
    return rows.filter((r) => {
      const text = `${r.full_name || ''} ${r.apartment || ''} ${r.phone || ''}`.toLowerCase();
      return text.includes(q.toLowerCase());
    });
  }, [rows, building, q]);

  async function remove(id: string) {
    if (!canManage) return;
    if (!confirm('سيتم إخفاء الجار من القائمة مع الحفاظ على سجله المالي. هل تريد المتابعة؟')) return;
    const { error } = await supabase
      .from('residents')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) alert(`تعذر حذف الجار: ${error.message}`);
    else load();
  }

  async function setRole(r: Resident, role: 'resident' | 'admin' | 'super_admin') {
    if (!canManage) return;
    if (!r.id) return;
    if (!confirm(`تعيين ${r.full_name} بدور ${role === 'super_admin' ? 'Super Admin' : role === 'admin' ? 'مسؤول عمارة' : 'جار عادي'}؟`)) return;
    const { error } = await supabase
      .from('residents')
      .update({ assigned_role: role, updated_at: new Date().toISOString() })
      .eq('id', r.id);
    if (error) {
      alert(`تعذر حفظ الدور: ${error.message}`);
      return;
    }
    if (r.id) {
      // Keep profile synchronization in the existing permission workflow when a login account exists.
      const { data: resident } = await supabase.from('residents').select('user_id').eq('id', r.id).maybeSingle();
      if (resident?.user_id) await supabase.from('profiles').update({ role }).eq('id', resident.user_id);
    }
    load();
  }

  return (
    <main className="wrap">
      <div className="sectionTitle">
        <div>
          <h2>الجيران</h2>
          <p className="muted">اختر العمارة أولًا لعرض الجيران المسجلين فيها.</p>
        </div>
        {canManage && <Link className="primary" href="/residents/new">إضافة جار</Link>}
      </div>

      <section className="card buildingPicker">
        <label className="requiredLabel">
          اختر العمارة
          <select value={building} onChange={(e) => { setBuilding(e.target.value); setQ(''); }}>
            <option value="">-- اختر رقم العمارة --</option>
            {buildings.map((b) => <option key={b} value={b}>العمارة رقم {b}</option>)}
          </select>
        </label>
        {!building && <p className="muted buildingHint">عدد العمارات المسجلة: {buildings.length}. اختر عمارة لعرض سكانها.</p>}
      </section>

      {building && (
        <section className="card">
          <div className="sectionTitle">
            <div>
              <h3>العمارة رقم {building}</h3>
              <p className="muted">{selectedResidents.length} جار مسجل في هذه العمارة</p>
            </div>
            <button className="secondaryBtn" type="button" onClick={() => { setBuilding(''); setQ(''); }}>تغيير العمارة</button>
          </div>

          <div className="toolbar oneColumnMobile">
            <input placeholder="بحث داخل العمارة بالاسم أو الشقة أو الهاتف" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>

          {loading ? <div className="empty">جاري التحميل...</div> : selectedResidents.length === 0 ? (
            <div className="empty">لا يوجد جيران مطابقون للبحث في هذه العمارة.</div>
          ) : (
            <div className="residentsList">
              {selectedResidents.map((r) => (
                <article className="residentCard" key={r.id}>
                  <div className="residentMain">
                    <div className="residentAvatar">{(r.full_name || 'ج').trim().charAt(0)}</div>
                    <div>
                      <h3>{r.full_name || 'بدون اسم'}</h3>
                      <p>الشقة رقم {r.apartment || '—'} {r.phone ? `• ${r.phone}` : ''}</p>
                      <span className="badge">{r.assigned_role === 'super_admin' ? 'Super Admin' : r.assigned_role === 'admin' ? 'مسؤول عمارة' : 'جار'}</span>
                    </div>
                  </div>
                  <div className="actions">
                    <Link href={`/residents/${r.id}`}>الملف</Link>
                    {canManage && <Link className="secondary" href={`/admin/permissions/${r.id}`}>الصلاحيات</Link>}
                    {canManage && <Link className="secondary" href={`/residents/${r.id}/edit`}>تعديل</Link>}
                    {canManage && <button className="danger" onClick={() => remove(r.id)}>حذف</button>}
                  </div>
                  {canManage && (
                    <label className="roleSelect">
                      الدور
                      <select value={r.assigned_role || 'resident'} onChange={(e) => setRole(r, e.target.value as 'resident' | 'admin' | 'super_admin')}>
                        <option value="resident">جار عادي</option>
                        <option value="admin">مسؤول عمارة</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    </label>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
