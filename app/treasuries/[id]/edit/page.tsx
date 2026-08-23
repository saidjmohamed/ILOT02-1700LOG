'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {useParams,useRouter} from 'next/navigation';
import {supabase} from '../../../../lib/supabase';

export default function EditTreasury(){
 const {id}=useParams<{id:string}>(); const router=useRouter();
 const [f,setF]=useState({name:'',description:'',purpose:'',target_amount:''}); const [msg,setMsg]=useState(''); const [busy,setBusy]=useState(true);
 useEffect(()=>{(async()=>{const {data,error}=await supabase.from('treasuries').select('name,description,purpose,target_amount').eq('id',id).single(); if(error) setMsg('تعذر تحميل الخزينة.'); else setF({name:data.name||'',description:data.description||'',purpose:data.purpose||'',target_amount:String(data.target_amount??'')}); setBusy(false)})()},[id]);
 async function save(e:any){e.preventDefault();setBusy(true);const {error}=await supabase.from('treasuries').update({name:f.name,description:f.description||null,purpose:f.purpose||null,target_amount:Number(f.target_amount||0)}).eq('id',id);setMsg(error?`تعذر التعديل: ${error.message}`:'تم تعديل الخزينة بنجاح.');setBusy(false);if(!error)setTimeout(()=>router.push(`/treasuries/${id}`),500)}
 return <main className="wrap"><div className="sectionTitle"><h2>تعديل الخزينة</h2><Link href={`/treasuries/${id}`}>العودة</Link></div><form className="card formGrid" onSubmit={save}><label>اسم الخزينة<input required value={f.name} onChange={e=>setF({...f,name:e.target.value})}/></label><label>المبلغ المستهدف<input type="number" min="0" step="0.01" value={f.target_amount} onChange={e=>setF({...f,target_amount:e.target.value})}/></label><label>الهدف<textarea value={f.purpose} onChange={e=>setF({...f,purpose:e.target.value})}/></label><label>الوصف<textarea value={f.description} onChange={e=>setF({...f,description:e.target.value})}/></label><button className="primary" disabled={busy}>{busy?'جاري الحفظ...':'حفظ التعديلات'}</button>{msg&&<div className="notice">{msg}</div>}</form></main>
}
