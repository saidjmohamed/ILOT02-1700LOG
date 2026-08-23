'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {useParams,useRouter} from 'next/navigation';
import {supabase} from '../../../../lib/supabase';

export default function EditResident(){
 const {id}=useParams<{id:string}>(); const router=useRouter();
 const [f,setF]=useState({building:'',apartment:'',first_name:'',last_name:'',phone:''}); const [msg,setMsg]=useState(''); const [busy,setBusy]=useState(true); const [authorized,setAuthorized]=useState(false);
 useEffect(()=>{(async()=>{const {data:permission}=await supabase.rpc('has_permission',{permission_key:'residents.update'});if(permission!==true){setAuthorized(false);setMsg('ليس لديك صلاحية تعديل بيانات الجيران.');setBusy(false);return}setAuthorized(true);const {data,error}=await supabase.from('residents').select('building,apartment,first_name,last_name,phone').eq('id',id).single();if(error)setMsg('تعذر تحميل بيانات الجار.');else setF({building:data.building||'',apartment:data.apartment||'',first_name:data.first_name||'',last_name:data.last_name||'',phone:data.phone||''});setBusy(false)})()},[id]);
 async function save(e:any){e.preventDefault();if(!authorized){setMsg('ليس لديك صلاحية تعديل بيانات الجيران.');return}setBusy(true);const full_name=`${f.first_name} ${f.last_name}`.trim();const {error}=await supabase.from('residents').update({...f,full_name,updated_at:new Date().toISOString()}).eq('id',id);setMsg(error?`تعذر التعديل: ${error.message}`:'تم تعديل بيانات الجار بنجاح.');setBusy(false);if(!error)setTimeout(()=>router.push(`/residents/${id}`),500)}
 if(!busy&&!authorized)return <main className="authScreen"><div className="card authCard"><div className="brandMark authMark">🔒</div><h1>غير مصرح</h1><p className="muted">هذا القسم مخصص لمسؤولي النظام فقط. لا يمكنك تعديل بيانات أي جار.</p><Link className="primary" href={`/residents/${id}`}>العودة</Link></div></main>;
 return <main className="wrap"><div className="sectionTitle"><h2>تعديل بيانات الجار</h2><Link href={`/residents/${id}`}>العودة</Link></div><form className="card formGrid" onSubmit={save}><label>العمارة<input required value={f.building} onChange={e=>setF({...f,building:e.target.value})}/></label><label>الشقة<input required value={f.apartment} onChange={e=>setF({...f,apartment:e.target.value})}/></label><label>الاسم<input required value={f.first_name} onChange={e=>setF({...f,first_name:e.target.value})}/></label><label>اللقب<input required value={f.last_name} onChange={e=>setF({...f,last_name:e.target.value})}/></label><label>رقم الهاتف<input inputMode="tel" value={f.phone} onChange={e=>setF({...f,phone:e.target.value})}/></label><button className="primary" disabled={busy}>{busy?'جاري الحفظ...':'حفظ التعديلات'}</button>{msg&&<div className="notice">{msg}</div>}</form></main>
}
