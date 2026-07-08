import { useState, useEffect, useMemo } from 'react';
import { Search, Image, X } from 'lucide-react';
import UserLayout from '../../components/UserLayout';
import axiosClient from '../../api/axiosClient';

const STATUS_BADGE={Received:'bg-blue-100 text-blue-700','Under Review':'bg-amber-100 text-amber-700',Attending:'bg-purple-100 text-purple-700',Completed:'bg-green-100 text-green-700',Rejected:'bg-red-100 text-red-700'};
function formatDate(d){if(!d)return '—';return new Date(d).toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'});}

export default function UserLoadHistory() {
  const [requests,setRequests]=useState([]); const [loading,setLoading]=useState(true); const [search,setSearch]=useState(''); const [photo,setPhoto]=useState(null);
  useEffect(()=>{axiosClient.get('/load-requests/my').then(r=>setRequests(r.data?.requests||r.data||[])).catch(console.error).finally(()=>setLoading(false));},[]);
  const filtered=useMemo(()=>{const q=search.toLowerCase();return requests.filter(r=>r.plan_name?.toLowerCase().includes(q)||r.reference_no?.toLowerCase().includes(q)||r.status?.toLowerCase().includes(q));},[requests,search]);
  const total=requests.length; const pending=requests.filter(r=>!['Completed','Rejected'].includes(r.status)).length; const completed=requests.filter(r=>r.status==='Completed').length;
  return (
    <UserLayout>
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        <h1 className="text-xl font-bold text-gray-800">My Load Requests</h1>
        <div className="grid grid-cols-3 gap-3">{[{label:'Total Requests',value:total,color:'text-gray-800'},{label:'Pending Review',value:pending,color:'text-amber-600'},{label:'Completed',value:completed,color:'text-green-600'}].map(s=><div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"><p className="text-xs text-gray-500 mb-1">{s.label}</p><p className={`text-2xl font-bold ${s.color}`}>{loading?'...':s.value}</p></div>)}</div>
        <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-3 border border-gray-100 max-w-xs"><Search size={14} className="text-gray-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search plan, reference, status..." className="bg-transparent text-xs text-gray-600 outline-none w-full"/></div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-xs"><thead><tr className="border-b border-gray-100 bg-gray-50">{['Plan','Amount','Payment','Reference','Submitted','Status','Proof'].map(h=><th key={h} className="text-left py-2.5 px-4 text-gray-500 font-semibold uppercase" style={{fontSize:'10px'}}>{h}</th>)}</tr></thead>
          <tbody>
            {loading?<tr><td colSpan={7} className="py-10 text-center text-gray-400">Loading...</td></tr>
            :filtered.length===0?<tr><td colSpan={7} className="py-10 text-center text-gray-400">No load requests found.</td></tr>
            :filtered.map(r=><tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 last:border-0">
              <td className="py-3 px-4 font-semibold text-gray-800">{r.plan_name}</td>
              <td className="py-3 px-4 font-bold text-[#cc0000]">₱{Number(r.amount||0).toLocaleString()}</td>
              <td className="py-3 px-4 text-gray-600">{r.payment_method}</td>
              <td className="py-3 px-4 font-mono text-gray-400" style={{fontSize:'10px'}}>{r.reference_no}</td>
              <td className="py-3 px-4 text-gray-400">{formatDate(r.created_at)}</td>
              <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE[r.status]||'bg-gray-100 text-gray-600'}`}>{r.status}</span></td>
              <td className="py-3 px-4"><div className="flex gap-1.5">{r.receipt_photo&&<button onClick={()=>setPhoto({url:r.receipt_photo,label:'Receipt'})} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-lg flex items-center gap-1"><Image size={10}/>Receipt</button>}{r.screen_photo&&<button onClick={()=>setPhoto({url:r.screen_photo,label:'TV Screen'})} className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded-lg flex items-center gap-1"><Image size={10}/>Screen</button>}</div></td>
            </tr>)}
          </tbody></table>
        </div>
        {photo&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={()=>setPhoto(null)}><div className="bg-white rounded-2xl overflow-hidden max-w-md w-full" onClick={e=>e.stopPropagation()}><div className="flex items-center justify-between px-5 py-3 border-b border-gray-100"><h2 className="text-sm font-bold text-gray-800">{photo.label}</h2><button onClick={()=>setPhoto(null)} className="p-1 rounded-xl hover:bg-gray-100 text-gray-400"><X size={16}/></button></div><div className="p-4"><img src={photo.url} alt={photo.label} className="w-full max-h-96 object-contain rounded-xl border border-gray-200"/></div></div></div>}
      </div>
    </UserLayout>
  );
}
