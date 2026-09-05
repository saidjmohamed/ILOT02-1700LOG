'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

type Contribution = { id: string; amount: number; contribution_date: string; note: string | null; residents?: { full_name: string; building: string; apartment: string } | null; treasuries?: { name: string } | null };
type Expense = { id: string; amount: number; transaction_date: string; title: string; description: string | null; treasuries?: { name: string } | null; categories?: { name: string } | null };

export default function Reports() {
  const [summary, setSummary] = useState<any>(null);
  const [treasuries, setTreasuries] = useState<any[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const money = (value: unknown) => `${Number(value || 0).toLocaleString('ar-DZ')} دج`;

  async function load() {
    setLoading(true); setError('');
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) { setError('يجب تسجيل الدخول لعرض التقرير المالي.'); setLoading(false); return; }
    const [s, t, c, e] = await Promise.all([
      supabase.from('finance_summary').select('*').single(),
      supabase.from('treasury_summary').select('*').order('name'),
      supabase.from('contributions').select('id,amount,contribution_date,note,resident_id,treasury_id,residents(full_name,building,apartment),treasuries(name)').order('contribution_date', { ascending: false }),
      supabase.from('transactions').select('id,amount,transaction_date,title,description,treasuries(name),categories(name)').eq('kind', 'expense').order('transaction_date', { ascending: false }),
    ]);
    const firstError = s.error || t.error || c.error || e.error;
    if (firstError) setError(firstError.message);
    setSummary(s.data || null); setTreasuries(t.data || []); setContributions((c.data as Contribution[]) || []); setExpenses((e.data as Expense[]) || []); setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const monthly = contributions.reduce<Record<string, number>>((acc, row) => { const key = (row.contribution_date || '').slice(0, 7) || 'غير محدد'; acc[key] = (acc[key] || 0) + Number(row.amount || 0); return acc; }, {});
  const categories = expenses.reduce<Record<string, number>>((acc, row) => { const key = row.categories?.name || 'بدون تصنيف'; acc[key] = (acc[key] || 0) + Number(row.amount || 0); return acc; }, {});

  if (loading) return <main className="wrap"><div className="card">جاري تحميل التقرير المالي...</div></main>;
  return <main className="wrap">
    <div className="sectionTitle"><div><h2>التقارير المالية</h2><p className="muted">تقرير مباشر من بيانات الخزائن والمساهمات والمصاريف المسجلة.</p></div><button className="secondary" onClick={load}>تحديث التقرير</button></div>
    {error && <div className="notice">تعذر تحميل بعض بيانات التقرير: {error}</div>}
    <section className="stats">
      <div className="card"><div className="statLabel">إجمالي المساهمات</div><div className="statValue">{money(summary?.total_income)}</div></div>
      <div className="card"><div className="statLabel">إجمالي المصاريف</div><div className="statValue">{money(summary?.total_expense)}</div></div>
      <div className="card"><div className="statLabel">الرصيد الإجمالي</div><div className="statValue">{money(summary?.balance)}</div></div>
      <div className="card"><div className="statLabel">عدد العمليات</div><div className="statValue">{summary?.transaction_count || 0}</div></div>
    </section>
    <div className="card"><h3>تفصيل الخزائن</h3>{!treasuries.length ? <div className="empty">لا توجد خزائن.</div> : <div className="tableWrap"><table><thead><tr><th>الخزينة</th><th>المستهدف</th><th>المحصل</th><th>المصروف</th><th>الرصيد</th><th>الإنجاز</th></tr></thead><tbody>{treasuries.map(t => <tr key={t.id}><td>{t.name}</td><td>{money(t.target_amount)}</td><td>{money(t.total_contributions)}</td><td>{money(t.total_expenses)}</td><td>{money(t.balance)}</td><td>{Number(t.target_percent || 0).toLocaleString('ar-DZ')}%</td></tr>)}</tbody></table></div>}</div>
    <div className="card"><h3>التفصيل الكامل للمساهمات</h3>{!contributions.length ? <div className="empty">لا توجد مساهمات مسجلة.</div> : <div className="tableWrap"><table><thead><tr><th>الجار</th><th>العمارة</th><th>الشقة</th><th>الخزينة</th><th>المبلغ</th><th>التاريخ</th><th>ملاحظات</th></tr></thead><tbody>{contributions.map(c => <tr key={c.id}><td>{c.residents?.full_name || 'جار غير محدد'}</td><td>{c.residents?.building || '—'}</td><td>{c.residents?.apartment || '—'}</td><td>{c.treasuries?.name || 'خزينة غير محددة'}</td><td><b className="green">+{money(c.amount)}</b></td><td>{c.contribution_date || '—'}</td><td>{c.note || '—'}</td></tr>)}</tbody></table></div>}</div>
    <div className="card"><h3>المساهمات حسب الشهر</h3>{!Object.keys(monthly).length ? <div className="empty">لا توجد مساهمات.</div> : Object.entries(monthly).sort(([a], [b]) => b.localeCompare(a)).map(([month, value]) => <div className="tx" key={month}><span>{month}</span><b className="green">+{money(value)}</b></div>)}</div>
    <div className="card"><h3>تفصيل المصاريف</h3>{!expenses.length ? <div className="empty">لا توجد مصاريف مسجلة.</div> : <div className="tableWrap"><table><thead><tr><th>الخزينة</th><th>البيان</th><th>التصنيف</th><th>المبلغ</th><th>التاريخ</th></tr></thead><tbody>{expenses.map(e => <tr key={e.id}><td>{e.treasuries?.name || '—'}</td><td>{e.title}{e.description ? ` — ${e.description}` : ''}</td><td>{e.categories?.name || 'بدون تصنيف'}</td><td><b className="red">−{money(e.amount)}</b></td><td>{e.transaction_date || '—'}</td></tr>)}</tbody></table></div>}</div>
    <div className="card"><h3>المصاريف حسب التصنيف</h3>{!Object.keys(categories).length ? <div className="empty">لا توجد مصاريف.</div> : Object.entries(categories).map(([category, value]) => <div className="tx" key={category}><span>{category}</span><b className="red">−{money(value)}</b></div>)}</div>
  </main>;
}
