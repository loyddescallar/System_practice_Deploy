import { useState, useEffect, useMemo } from 'react';
import { Search, X, MapPin, Image } from 'lucide-react';
import { getAllLoadRequests, updateLoadStatus } from '../../api/loadRequestApi';
import { useNavigate } from 'react-router-dom';
import customerApi from '../../api/customerApi';

const STATUSES=['Received','Under Review','Attending','Completed','Rejected'];
const LOCATIONS=['Balayan','Calaca','Lian','Calatagan','Nasugbu','Lemery'];
const sCfg={Received:{badge:'bg-blue-100 text-blue-700',dot:'bg-blue-500'},'Under Review':{badge:'bg-amber-100 text-amber-700',dot:'bg-amber-400'},Attending:{badge:'bg-purple-100 text-purple-700',dot:'bg-purple-500'},Completed:{badge:'bg-green-100 text-green-700',dot:'bg-green-500'},Rejected:{badge:'bg-red-100 text-red-700',dot:'bg-red-500'}};

export default function AdminLoadRequests() {
  const navigate=useNavigate();
  const [requests,setRequests]=useState([]); const [loading,setLoading]=useState(true);
  const [search,setSearch]=useState(''); const [statusF,setStatusF]=useState('All'); const [locF,setLocF]=useState('All');
  const [selected,setSelected]=useState(null); const [adminNote,setAdminNote]=useState(''); const [newStatus,setNewStatus]=useState(''); const [saving,setSaving]=useState(false);
  const [photoModal,setPhoto]=useState(null);

  const load=async()=>{ setLoading(true); try{const r=await getAllLoadRequests(); setRequests(r.data?.requests||r.data||[]);}catch(e){console.error(e);}finally{setLoading(false);} };
  useEffect(()=>{load();},[]);

  const filtered=useMemo(()=>{ const q=search.toLowerCase(); return requests.filter(r=>statusF==='All'||r.status===statusF).filter(r=>locF==='All'||r.location===locF).filter(r=>r.account_name?.toLowerCase().includes(q)||r.account_number?.toLowerCase().includes(q)||r.reference_no?.toLowerCase().includes(q)); },[requests,search,statusF,locF]);
  const kpis=[{label:'Total',value:requests.length,dot:'bg-gray-400',color:'text-gray-800'},{label:'Received',value:requests.filter(r=>r.status==='Received').length,dot:'bg-blue-500',color:'text-blue-600'},{label:'Under Review',value:requests.filter(r=>r.status==='Under Review').length,dot:'bg-amber-400',color:'text-amber-600'},{label:'Completed',value:requests.filter(r=>r.status==='Completed').length,dot:'bg-green-500',color:'text-green-600'},{label:'Rejected',value:requests.filter(r=>r.status==='Rejected').length,dot:'bg-red-500',color:'text-red-600'}];
  const openModal=r=>{setSelected(r);setNewStatus(r.status);setAdminNote(r.admin_note||'');};
  const handleSave=async()=>{ setSaving(true); try{await updateLoadStatus(selected.id,newStatus,adminNote); setRequests(prev=>prev.map(r=>r.id===selected.id?{...r,status:newStatus,admin_note:adminNote}:r)); setSelected(null);}catch(e){console.error(e);}finally{setSaving(false);} };
  const navigateToCustomer=async(accountNumber)=>{ try{const r=await customerApi.getCustomerLookup(accountNumber); if(r.data?.user?.id)navigate('/admin/customers/'+r.data.user.id);}catch(e){console.error(e);} };
  function formatDate(d){if(!d)return '—'; return new Date(d).toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'});}

  return (
    <div className="space-y-4">
      <div><h1 className="text-lg font-bold text-gray-800">Load Requests</h1><p className="text-xs text-gray-500 mt-0.5">Remote prepaid load requests submitted by subscribers</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">{kpis.map(s=><div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"><div className="flex items-center gap-2 mb-2"><div className={`w-2 h-2 rounded-full ${s.dot}`}/><p className="text-xs text-gray-500">{s.label}</p></div><p className={`text-2xl font-bold ${s.color}`}>{loading?'...':s.value}</p></div>)}</div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2 flex-1 max-w-xs"><Search size={14} className="text-gray-400"/><input type="text" placeholder="Search name, account, reference..." value={search} onChange={e=>setSearch(e.target.value)} className="bg-transparent text-xs text-gray-600 placeholder-gray-400 outline-none w-full"/></div>
          <div className="flex gap-1.5 flex-wrap">{['All',...LOCATIONS].map(loc=><button key={loc} onClick={()=>setLocF(loc)} className={`text-xs px-2.5 py-1.5 rounded-xl font-medium transition-colors ${locF===loc?'bg-[#cc0000] text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{loc}</button>)}</div>
          <div className="flex gap-1.5 flex-wrap">{['All',...STATUSES].map(s=><button key={s} onClick={()=>setStatusF(s)} className={`text-xs px-2.5 py-1.5 rounded-xl font-medium transition-colors ${statusF===s?'bg-slate-700 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s}</button>)}</div>
          <span className="text-xs text-gray-400 ml-auto">{filtered.length} requests</span>
        </div>
        <div className="overflow-x-auto"><table className="w-full text-xs">
          <thead><tr className="border-b border-gray-100 bg-gray-50">{['#','Account Name','Account No.','Plan','Amount','Payment','Reference','Location','Status','Date','Photos','Actions'].map(h=><th key={h} className="text-left py-2.5 px-3 text-gray-500 font-semibold uppercase tracking-wide" style={{fontSize:'10px'}}>{h}</th>)}</tr></thead>
          <tbody>
            {loading?<tr><td colSpan={12} className="py-10 text-center text-gray-400">Loading...</td></tr>
            :filtered.length===0?<tr><td colSpan={12} className="py-10 text-center text-gray-400">No load requests found.</td></tr>
            :filtered.map(r=>{const s=sCfg[r.status]||sCfg.Received;return(
              <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 last:border-0">
                <td className="py-2 px-3 font-mono text-gray-400">{r.id}</td>
                <td className="py-2 px-3"><button onClick={()=>navigateToCustomer(r.account_number)} className="font-semibold text-gray-800 hover:text-[#cc0000] hover:underline text-left">{r.account_name}</button></td>
                <td className="py-2 px-3 font-mono text-gray-600">{r.account_number}</td>
                <td className="py-2 px-3 text-gray-600">{r.plan_name}</td>
                <td className="py-2 px-3 font-semibold text-[#cc0000]">₱{Number(r.amount||0).toLocaleString()}</td>
                <td className="py-2 px-3 text-gray-500">{r.payment_method}</td>
                <td className="py-2 px-3 font-mono text-gray-400" style={{fontSize:'10px'}}>{r.reference_no}</td>
                <td className="py-2 px-3"><div className="flex items-center gap-1"><MapPin size={10} className="text-gray-400"/><span className="text-gray-500">{r.location||'—'}</span></div></td>
                <td className="py-2 px-3"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.badge}`}>{r.status}</span></td>
                <td className="py-2 px-3 text-gray-400">{formatDate(r.created_at)}</td>
                <td className="py-2 px-3"><div className="flex items-center gap-1.5">
                  {r.receipt_photo&&<button onClick={()=>setPhoto({url:r.receipt_photo,label:'Receipt Photo'})} className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium flex items-center gap-1"><Image size={10}/>Receipt</button>}
                  {r.screen_photo&&<button onClick={()=>setPhoto({url:r.screen_photo,label:'TV Screen Photo'})} className="text-xs px-2 py-1 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 font-medium flex items-center gap-1"><Image size={10}/>Screen</button>}
                  {!r.receipt_photo&&!r.screen_photo&&<span className="text-gray-300 text-xs">None</span>}
                </div></td>
                <td className="py-2 px-3"><button onClick={()=>openModal(r)} className="text-xs px-3 py-1 bg-[#cc0000] text-white rounded-xl hover:bg-red-700 font-semibold">Review</button></td>
              </tr>
            );})}
          </tbody>
        </table></div>
      </div>
      {photoModal&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={()=>setPhoto(null)}><div className="bg-white rounded-2xl overflow-hidden max-w-lg w-full shadow-2xl" onClick={e=>e.stopPropagation()}><div className="flex items-center justify-between px-5 py-3 border-b border-gray-100"><h2 className="text-sm font-bold text-gray-800">{photoModal.label}</h2><button onClick={()=>setPhoto(null)} className="p-1 rounded-xl hover:bg-gray-100 text-gray-400"><X size={16}/></button></div><div className="p-4"><img src={photoModal.url} alt={photoModal.label} className="w-full max-h-96 object-contain rounded-xl border border-gray-200"/></div></div></div>}
      {selected&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100"><h2 className="text-sm font-bold text-gray-800">Review Load Request #{selected.id}</h2><button onClick={()=>setSelected(null)} className="p-1 rounded-xl hover:bg-gray-100 text-gray-400"><X size={16}/></button></div>
          <div className="p-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">{[{label:'Account Name',value:selected.account_name},{label:'Account No.',value:selected.account_number},{label:'Plan',value:selected.plan_name},{label:'Amount',value:'₱'+Number(selected.amount||0).toLocaleString()},{label:'Payment',value:selected.payment_method},{label:'Reference No.',value:selected.reference_no},{label:'Location',value:selected.location||'—'},{label:'Diagnostic',value:selected.diagnostic_result||'—'}].map(f=><div key={f.label} className="bg-gray-50 rounded-xl p-3"><p className="text-gray-400 font-semibold" style={{fontSize:'10px'}}>{f.label}</p><p className="text-xs font-semibold text-gray-800 mt-1">{f.value}</p></div>)}</div>
            {(selected.receipt_photo||selected.screen_photo)&&<div className="flex gap-3">{selected.receipt_photo&&<div><p className="text-xs text-gray-400 mb-1" style={{fontSize:'10px'}}>RECEIPT</p><img src={selected.receipt_photo} alt="Receipt" onClick={()=>setPhoto({url:selected.receipt_photo,label:'Receipt Photo'})} className="w-24 h-20 object-cover rounded-xl border border-gray-200 cursor-pointer hover:opacity-80"/></div>}{selected.screen_photo&&<div><p className="text-xs text-gray-400 mb-1" style={{fontSize:'10px'}}>TV SCREEN</p><img src={selected.screen_photo} alt="Screen" onClick={()=>setPhoto({url:selected.screen_photo,label:'TV Screen Photo'})} className="w-24 h-20 object-cover rounded-xl border border-gray-200 cursor-pointer hover:opacity-80"/></div>}</div>}
            <div><label className="block text-xs text-gray-500 font-medium mb-1" style={{fontSize:'10px'}}>Update Status</label><select value={newStatus} onChange={e=>setNewStatus(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#cc0000]">{STATUSES.map(s=><option key={s}>{s}</option>)}</select></div>
            <div><label className="block text-xs text-gray-500 font-medium mb-1" style={{fontSize:'10px'}}>Admin Note</label><textarea value={adminNote} onChange={e=>setAdminNote(e.target.value)} rows={2} placeholder="Optional note..." className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#cc0000] resize-none"/></div>
            <div className="flex gap-2"><button onClick={handleSave} disabled={saving} className="flex-1 bg-[#cc0000] hover:bg-red-700 text-white text-xs py-2.5 rounded-xl font-semibold disabled:opacity-60">{saving?'Saving...':'Update Request'}</button><button onClick={()=>setSelected(null)} className="flex-1 border border-gray-200 text-xs py-2.5 rounded-xl text-gray-600 hover:bg-gray-50">Cancel</button></div>
          </div>
        </div>
      </div>}
    </div>
  );
}
