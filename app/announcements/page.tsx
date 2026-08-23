'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {supabase} from '../../lib/supabase';
export default function Announcements(){
 const [rows,setRows]=useState<any[]>([]),[loading,setLoading]=useState(true);
 async function load(){setLoading(true);const {data}=await supabase.from('announcements').select('id,title,body,category,published,published_at,expires_at').eq('published',true).or('expires_at.is.null,expires_at.gt.'+new Date().toISOString()).order('published_at',{ascending:false});setRows(data||[]);setLoading(false)}
 useEffect(()=>{load()},[]);
 return <main className="wrap"><div className="sectionTitle"><div><h2>إعلانات الحي</h2><p className="muted">آخر الإعلانات والمعلومات الموجهة لسكان الحي.</p></div><Link href="/">الرئيسية</Link></div>{loading?<div className="card">جاري التحميل...</div>:rows.length===0?<div className="card empty">لا توجد إعلانات منشورة حاليًا.</div>:<div className="cardsGrid">{rows.map(a=><article className="card" key={a.id}><div className="sectionTitle"><span className="badge">{a.category||'عام'}</span><small className="muted">{new Date(a.published_at).toLocaleDateString('ar-DZ')}</small></div><h3>{a.title}</h3><p style={{whiteSpace:'pre-wrap',lineHeight:1.8}}>{a.body}</p></article>)}</div>}</main>}
