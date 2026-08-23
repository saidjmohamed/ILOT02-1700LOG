'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fepxwhtqxwtzzlkegsee.supabase.co';
const SUPABASE_KEY = 'sb_publishable__sU66St4OWzyl3VnKiJPYQ_KPp2Z-J7';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

type Summary = { total_income:number; total_expense:number; balance:number; transaction_count:number; active_residents:number; monthly_contributors:number };
type Tx = { id:string; kind:'income'|'expense'; title:string; amount:number; transaction_date:string; description:string|null; categories?:{name:string}|null };

const money = (n:number) => new Intl.NumberFormat('ar-DZ').format(Math.round(n)) + ' دج';
const date = (s:string) => new Intl.DateTimeFormat('ar-DZ',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(s+'T00:00:00'));

export default function Home(){
  const [summary,setSummary]=useState<Summary>({total_income:0,total_expense:0,balance:0,transaction_count:0,active_residents:1700,monthly_contributors:0});
  const [tx,setTx]=useState<Tx[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [tab,setTab]=useState('الرئيسية');

  useEffect(()=>{
    async function load(){
      setLoading(true); setError('');
      const [{data:sum,error:sumErr},{data:rows,error:rowsErr}]=await Promise.all([
        supabase.from('finance_summary').select('*').single(),
        supabase.from('transactions').select('id,kind,title,amount,transaction_date,description,categories(name)').order('transaction_date',{ascending:false}).limit(8)
      ]);
      if(sumErr && sumErr.code!=='PGRST116') setError('تعذر تحميل الملخص المالي.');
      if(rowsErr) setError('تعذر تحميل العمليات.');
      if(sum) setSummary(sum as Summary);
      if(rows) setTx(rows as Tx[]);
      setLoading(false);
    }
    load();
  },[]);

  return <div className="app">
    <header className="topbar">
      <div className="brand"><div className="brandMark">🏘️</div><div><h1>خزينة الحي</h1><p>Ilot 2 — 1700 مسكن بوعنقود، بوينان</p></div></div>
      <nav className="nav">{['الرئيسية','المداخيل','المصاريف','المساهمات','التقارير'].map(x=><button key={x} className={tab===x?'active':''} onClick={()=>setTab(x)}>{x}</button>)}</nav>
    </header>
    <main className="wrap">
      <section className="hero"><div><h2>مرحباً بكم في خزينة الحي 👋</h2><p>منصة موحدة لتنظيم المداخيل والمصاريف ومتابعة مساهمات السكان بشفافية.</p></div><div className="date">آخر تحديث: اليوم</div></section>
      {error && <div className="notice" style={{marginBottom:18}}><strong>تنبيه</strong>{error} إذا كانت قاعدة البيانات فارغة، فهذا طبيعي في أول تشغيل.</div>}
      <section className="stats">
        <div className="card"><div className="statLabel">الرصيد الحالي</div><div className="statValue green">{loading?'—':money(summary.balance)}</div></div>
        <div className="card"><div className="statLabel">إجمالي المداخيل</div><div className="statValue blue">{loading?'—':money(summary.total_income)}</div></div>
        <div className="card"><div className="statLabel">إجمالي المصاريف</div><div className="statValue red">{loading?'—':money(summary.total_expense)}</div></div>
        <div className="card"><div className="statLabel">عدد العمليات</div><div className="statValue orange">{loading?'—':summary.transaction_count}</div></div>
      </section>
      <section className="grid">
        <div className="card"><div className="sectionTitle"><h3>آخر العمليات</h3><span>{tab==='الرئيسية'?'آخر 8 عمليات':tab}</span></div>
          {tx.length===0 && !loading ? <div className="empty">لا توجد عمليات مالية مسجلة بعد.</div> : <div className="transactions">{tx.map(t=><div className="tx" key={t.id}><div className="txMain"><div className="txIcon">{t.kind==='income'?'💰':'🧾'}</div><div><div className="txTitle">{t.title} <span className={'pill '+(t.kind==='income'?'in':'out')}>{t.kind==='income'?'مدخول':'مصروف'}</span></div><div className="txSub">{date(t.transaction_date)}{t.description?' • '+t.description:''}</div></div></div><div className={'amount '+(t.kind==='income'?'green':'red')}>{t.kind==='income'?'+':'−'} {money(t.amount)}</div></div>)}</div>}
        </div>
        <aside className="side">
          <div className="card"><div className="sectionTitle"><h3>مساهمات السكان</h3><span>هذا الشهر</span></div><div className="contribNumbers"><b>{summary.monthly_contributors} مساهم</b><span>من أصل {summary.active_residents || 1700}</span></div><div className="progress"><div style={{width:`${Math.min(100,Math.round((summary.monthly_contributors/Math.max(summary.active_residents||1700,1))*100))}%`}}/></div><div className="contribNumbers"><span>المساهمة الشهرية</span><b>{summary.active_residents?Math.round(summary.monthly_contributors/summary.active_residents*100):0}%</b></div></div>
          <div className="card"><div className="sectionTitle"><h3>اختصارات</h3></div><div className="quick"><button onClick={()=>setTab('المداخيل')}>💰<br/>المداخيل</button><button onClick={()=>setTab('المصاريف')}>🧾<br/>المصاريف</button><button onClick={()=>setTab('المساهمات')}>👥<br/>المساهمات</button><button onClick={()=>setTab('التقارير')}>📊<br/>التقارير</button></div></div>
          <div className="notice"><strong>الشفافية أولاً</strong>كل عملية مالية في النسخة الكاملة ستدعم إرفاق الفاتورة أو الوصل وتسجيل تاريخ العملية والجهة التي أدخلتها.</div>
        </aside>
      </section>
      <div className="footer">Ilot 2 — 1700 مسكن بوعنقود • بوينان، البليدة</div>
    </main>
  </div>
}
