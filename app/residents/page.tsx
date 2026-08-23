'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function Residents(){
 const [rows,setRows]=useState<any[]>([]),[q,setQ]=useState(''),[building,setBuilding]=useState(''),[loading,setLoading]=useState(true);
 async function load(){setLoading(true);let query=supabase.from('residents').select('id,building,apartment,full_name,is_active').eq('is_active',true).order('building').order('apartment'); if(building) query=query.eq('building',building); const {data}=await query; setRows(data||[]); setLoading(false)}
 useEffect(()=>{load()},[building]);
 const filtered=rows.filter(r=>`${r.full_name||''} ${r.building||''} ${r.apartment||''}`.toLowerCase().includes(q.toLowerCase()));
 async function remove(id:string){if(!confirm('سيتم إخفاء الجار من القائمة مع الحفاظ على سجله المالي. هل تريد المتابعة؟'))return;const {error}=await supabase.from('residents').update({is_active:false,updated_at:new Date().toISOString()}).eq('id',id);if(error)alert(`تعذر حذف الجار: ${error.message}`);else load()}
 return <main className="wrap"><div className="sectionTitle"><div><h2>الجيران</h2><p className="muted">إدارة الجيران: إضافة، تعديل وحذف مع الحفاظ على السجل المالي.</p></div><Link className="primary" href="/residents/new">إضافة جار</Link></div><div className="toolbar"><input placeholder="ابحث بالاسم أو العمارة أو الشقة" value={q} onChange={e=>setQ(e.target.value)}/><input placeholder="رقم العمارة" value={building} onChange={e=>setBuilding(e.target.value)}/></div>{loading?<div className="card">جاري التحميل...</div>:filtered.length===0?<div className="card empty">لا توجد بيانات تطابق البحث.</div>:<div className="card tableWrap"><table><thead><tr><th>الاسم</th><th>العمارة</th><th>الشقة</th><th>الإجراءات</th></tr></thead><tbody>{filtered.map(r=><tr key={r.id}><td>{r.full_name}</td><td>{r.building}</td><td>{r.apartment||'—'}</td><td><div className="actions"><Link href={`/residents/${r.id}`}>الملف</Link><Link className="secondary" href={`/residents/${r.id}/edit`}>تعديل</Link><button className="danger" onClick={()=>remove(r.id)}>حذف</button></div></td></tr>)}</tbody></table></div>}</main>
}
