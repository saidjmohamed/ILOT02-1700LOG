'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type Summary = { total_income:number; total_expense:number; balance:number; transaction_count:number; active_residents:number; monthly_contributors:number };
type Tx = { id:string; kind:'income'|'expense'; title:string; amount:number; transaction_date:string; description:string|null; };
const money = (n:number) => new Intl.NumberFormat('ar-DZ').format(Math.round(n)) + ' دج';
const date = (s:string) => new Intl.DateTimeFormat('ar-DZ',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(s+'T00:00:00'));

export default function Home(){
 const [summary,setSummary]=useState<Summary>({total_income:0,total_expense:0,balance:0,transaction_count:0,active_residents:0,monthly_contributors:0});
 const [tx,setTx]=useState<Tx[]>([]); const [loading,setLoading]=useState(true); const [error,setError]=useState('');
 useEffect(()=>{ (async()=>{ setLoading(true); const [{data:sum,error:se},{data:rows,error:re}]=await Promise.all([
   supabase.from('finance_summary').select('*').single(),
   supabase.from('transactions').select('id,kind,title,amount,transaction_date,description').order('transaction_date',{ascending:false}).limit(8)
 ]); if(se && se.code!=='PGRST116') setError('تعذر تحميل الملخص المالي.'); if(re) setError('تعذر تحميل العمليات.'); if(sum) setSummary(sum as Summary); setTx((rows||[]) as Tx[]); setLoading(false); })(); },[]);
 return <div className="app"><header className="topbar"><div className="brand"><div className="brandMark">🏘️</div><div><h1>خزينة الحي</h1><p>حي 1700 مسكن بوعنقود — البليدة إيلو 02</p></div></div><nav className="nav"><Link href="/">الرئيسية</Link><Link href="/residents">الجيران</Link><Link href="/treasuries">الخزائن</Link><Link href="/contributions">المساهمات</Link><Link href="/expenses">المصاريف</Link><Link href="/reports">التقارير</Link></nav></header><main className="wrap">
 <section className="hero"><div><h2>مرحباً بكم في نظام خزينة الحي</h2><p>تسيير شفاف للجيران والخزائن والمساهمات والمصاريف.</p></div><div className="date">البيانات من قاعدة البيانات مباشرة</div></section>
 {error && <div className="notice" style={{marginBottom:18}}><strong>تنبيه</strong>{error}</div>}
 <section className="stats">
  <Stat label="عدد الجيران" value={loading?'—':String(summary.active_residents)} />
  <Stat label="إجمالي الأموال" value={loading?'—':money(summary.total_income)} />
  <Stat label="إجمالي المصاريف" value={loading?'—':money(summary.total_expense)} />
  <Stat label="الرصيد الحالي" value={loading?'—':money(summary.balance)} />
 </section>
 <section className="grid"><div className="card"><div className="sectionTitle"><h3>آخر العمليات</h3><Link href="/reports">عرض التقارير</Link></div>{tx.length===0&&!loading?<div className="empty">لا توجد عمليات مالية مسجلة بعد.</div>:<div className="transactions">{tx.map(t=><div className="tx" key={t.id}><div className="txMain"><div className="txIcon">{t.kind==='expense'?'🧾':'💰'}</div><div><div className="txTitle">{t.title}</div><div className="txSub">{date(t.transaction_date)}{t.description?' • '+t.description:''}</div></div></div><div className={'amount '+(t.kind==='expense'?'red':'green')}>{t.kind==='expense'?'−':'+'}{money(t.amount)}</div></div>)}</div>}</div>
 <aside className="side"><div className="card"><div className="sectionTitle"><h3>المساهمون هذا الشهر</h3></div><div className="contribNumbers"><b>{summary.monthly_contributors}</b><span>مساهم</span></div><div className="progress"><div style={{width:`${summary.active_residents?Math.min(100,Math.round(summary.monthly_contributors/summary.active_residents*100)):0}%`}}/></div><div className="contribNumbers"><span>نسبة المشاركة</span><b>{summary.active_residents?Math.round(summary.monthly_contributors/summary.active_residents*100):0}%</b></div></div>
 <div className="card"><div className="sectionTitle"><h3>اختصارات</h3></div><div className="quick"><Link href="/residents/new">➕<br/>إضافة جار</Link><Link href="/treasuries/new">🏦<br/>خزينة جديدة</Link><Link href="/contributions">💰<br/>المساهمات</Link><Link href="/expenses">🧾<br/>المصاريف</Link></div></div></aside></section>
 <div className="footer">جميع الأرقام تُحتسب من Supabase ولا توجد بيانات تجريبية.</div></main></div>
}
function Stat({label,value}:{label:string;value:string}){return <div className="card"><div className="statLabel">{label}</div><div className="statValue">{value}</div></div>}
