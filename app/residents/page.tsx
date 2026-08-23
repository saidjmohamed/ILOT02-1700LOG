'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
export default function Residents(){
 const [rows,setRows]=useState<any[]>([]),[q,setQ]=useState(''),[building,setBuilding]=useState(''),[loading,setLoading]=useState(true);
 async function load(){setLoading(true);let query=supabase.from('residents').select('id,building,apartment,full_name,first_name,last_name,phone,is_active').eq('is_active',true).order('building').order('apartment'); if(building) query=query.eq('building',building); const {data}=await query; setRows(data||[]); setLoading(false)}
 useEffect(()=>{load()},[building]); const filtered=rows.filter(r=>`${r.full_name||''} ${r.first_name||''} ${r.last_name||''} ${r.phone||''} ${r.building||''} ${r.apartment||''}`.toLowerCase().includes(q.toLowerCase()));
 return <main className="wrap"><div className="sectionTitle"><div><h2>الجيران</h2><p className="muted">قاعدة بيانات سكان حي 1700 مسكن بوعنقود — إيلو 02</p></div><Link className="primary" href="/residents/new">إضافة جار</Link></div><div className="toolbar"><input placeholder="ابحث بالاسم أو الهاتف أو العمارة أو الشقة" value={q} onChange={e=>setQ(e.target.value)}/><input placeholder="رقم العمارة" value={building} onChange={e=>setBuilding(e.target.value)}/></div>{loading?<div className="card">جاري التحميل...</div>:filtered.length===0?<div className="card empty">لا توجد بيانات تطابق البحث.</div>:<div className="card tableWrap"><table><thead><tr><th>الاسم</th><th>العمارة</th><th>الشقة</th><th>الهاتف</th><th></th></tr></thead><tbody>{filtered.map(r=><tr key={r.id}><td>{r.full_name||`${r.first_name||''} ${r.last_name||''}`}</td><td>{r.building}</td><td>{r.apartment||'—'}</td><td>{r.phone||'—'}</td><td><Link href={`/residents/${r.id}`}>الملف</Link></td></tr>)}</tbody></table></div>}</main>
}
