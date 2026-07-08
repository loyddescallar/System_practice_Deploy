import { useState } from 'react';
import { Search, Copy, Check, ChevronDown, ChevronUp, User, Tv, CreditCard, Wrench, Ticket, FileSearch, AlertTriangle } from 'lucide-react';
import UserLayout from '../../components/UserLayout';
import axiosClient from '../../api/axiosClient';

const STATUS_BADGE = { Received:'bg-blue-100 text-blue-700', 'Under Review':'bg-amber-100 text-amber-700', Attending:'bg-purple-100 text-purple-700', Completed:'bg-green-100 text-green-700', Rejected:'bg-red-100 text-red-700' };
const TECH_BADGE  = { Pending:'bg-amber-100 text-amber-700', Scheduled:'bg-blue-100 text-blue-700', Completed:'bg-green-100 text-green-700', Cancelled:'bg-slate-100 text-slate-600' };
const TICKET_BADGE= { Open:'bg-red-100 text-red-700', 'In Progress':'bg-amber-100 text-amber-700', Resolved:'bg-green-100 text-green-700', Closed:'bg-slate-100 text-slate-600' };

function formatDate(d) { if(!d) return '—'; return new Date(d).toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'}); }
function timeAgo(d) { if(!d) return '—'; const diff=(Date.now()-new Date(d).getTime())/1000; if(diff<60)return 'just now'; if(diff<3600)return Math.floor(diff/60)+'m ago'; if(diff<86400)return Math.floor(diff/3600)+'h ago'; return Math.floor(diff/86400)+'d ago'; }
function getActivityStatus(lastLoadDate) { if(!lastLoadDate)return 'Inactive'; const days=(Date.now()-new Date(lastLoadDate).getTime())/86400000; if(days<=30)return 'Active'; if(days<=60)return 'At Risk'; return 'Inactive'; }

export default function UserRetrieveInfo() {
  const [query,setQuery]     = useState('');
  const [result,setResult]   = useState(null);
  const [extraData,setExtra] = useState({});
  const [loading,setLoading] = useState(false);
  const [notFound,setNotFound] = useState(false);
  const [copied,setCopied]   = useState('');
  const [open,setOpen]       = useState({ account:true, status:true, load:true, loadReqs:false, tech:false, tickets:false });

  const copyText=(text,key)=>{ navigator.clipboard.writeText(text).then(()=>{setCopied(key);setTimeout(()=>setCopied(''),2000);}); };
  const toggle=key=>setOpen(p=>({...p,[key]:!p[key]}));

  const handleSearch=async e=>{
    e.preventDefault(); if(!query.trim())return;
    setLoading(true);setNotFound(false);setResult(null);setExtra({});
    try {
      const r=await axiosClient.get('/customers/'+query.trim());
      const c=r.data?.user||r.data;
      setResult(c);
      // Fetch extra data using the user's accountNumber
      if(c?.accountNumber){
        const [lrRes,techRes,ticketRes,loadRes]=await Promise.allSettled([
          axiosClient.get('/load-requests').catch(()=>({data:{requests:[]}})),
          axiosClient.get('/technicians/requests/my').catch(()=>({data:{requests:[]}})),
          axiosClient.get('/tickets/my').catch(()=>({data:{tickets:[]}})),
          axiosClient.get('/load/my').catch(()=>({data:{history:[]}})),
        ]);
        const allLoadReqs=(lrRes.status==='fulfilled'?lrRes.value.data?.requests||[]:[]). filter(r=>r.account_number===c.accountNumber);
        setExtra({
          loadRequests: allLoadReqs,
          techRequests: techRes.status==='fulfilled'?techRes.value.data?.requests||[]:[], 
          tickets:      ticketRes.status==='fulfilled'?ticketRes.value.data?.tickets||[]:[], 
          loadHistory:  loadRes.status==='fulfilled'?loadRes.value.data?.history||[]:[], 
        });
      }
    } catch { setNotFound(true); } finally { setLoading(false); }
  };

  const actStatus = result ? getActivityStatus(result.lastLoadDate) : null;
  const actColor = actStatus==='Active'?'bg-green-50 border-green-200 text-green-700':actStatus==='At Risk'?'bg-amber-50 border-amber-200 text-amber-700':'bg-red-50 border-red-200 text-red-700';

  const Section=({skey,label,icon,children})=>(
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <button onClick={()=>toggle(skey)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">{icon}{label}</div>
        {open[skey]?<ChevronUp size={16} className="text-gray-400"/>:<ChevronDown size={16} className="text-gray-400"/>}
      </button>
      {open[skey]&&<div className="px-4 pb-4 border-t border-gray-50">{children}</div>}
    </div>
  );

  return (
    <UserLayout>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center"><FileSearch size={18} className="text-[#cc0000]"/></div>
          <div><h1 className="text-xl font-bold text-gray-800">Account Inquiry</h1><p className="text-xs text-gray-500 mt-0.5">Look up subscriber information by account or CCA number</p></div>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Enter Account No. or CCA Number" className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#cc0000]"/>
          <button type="submit" disabled={loading} className="bg-[#cc0000] text-white px-5 py-3 rounded-xl hover:bg-red-700 font-semibold text-sm disabled:opacity-60">{loading?'...':'Search'}</button>
        </form>

        {notFound&&<div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-xs text-red-600">❌ No record found for "{query}"</div>}

        {result&&(
          <div className="space-y-3">
            {/* Copy Info */}
            <button onClick={()=>copyText(`Name: ${result.accountName}\nAccount: ${result.accountNumber}\nCCA: ${result.ccaNumber}\nPhone: ${result.phone}\nAddress: ${result.address}`,'all')}
              className="flex items-center gap-2 text-xs text-[#cc0000] border border-[#cc0000] px-3 py-1.5 rounded-xl hover:bg-red-50 font-semibold">
              {copied==='all'?<Check size={12}/>:<Copy size={12}/>}{copied==='all'?'Copied!':'Copy All Info'}
            </button>

            {/* 1. Account Credentials */}
            <Section skey="account" label="Account Credentials" icon={<User size={14} className="text-[#cc0000]"/>}>
              <div className="grid grid-cols-2 gap-3 mt-3">
                {[{label:'Account Name',value:result.accountName},{label:'Account No.',value:result.accountNumber},{label:'CCA No.',value:result.ccaNumber},{label:'Phone',value:result.phone},{label:'Location',value:result.location||'—'},{label:'Address',value:result.address}].map(f=>(
                  <div key={f.label}>
                    <p className="text-gray-400" style={{fontSize:'10px'}}>{f.label}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <p className="text-sm font-semibold text-gray-800">{f.value}</p>
                      <button onClick={()=>copyText(f.value,f.label)} className="text-gray-300 hover:text-[#cc0000]">{copied===f.label?<Check size={11}/>:<Copy size={11}/>}</button>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* 2. Account Status */}
            <Section skey="status" label="Account Status" icon={<Tv size={14} className="text-[#cc0000]"/>}>
              <div className={`mt-3 rounded-xl p-3 border ${actColor} flex items-center justify-between`}>
                <div><p className="text-xs font-semibold">{actStatus} Account</p><p className="text-xs opacity-80 mt-0.5">Last load: {result.lastLoadDate?formatDate(result.lastLoadDate):'No record'}</p></div>
                <span className={`text-lg font-bold ${actStatus==='Active'?'text-green-600':actStatus==='At Risk'?'text-amber-600':'text-red-600'}`}>{actStatus==='Active'?'✅':actStatus==='At Risk'?'⚠️':'❌'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                {[{label:'Status',value:result.status||'active'},{label:'Member Since',value:formatDate(result.created_at)},{label:'Coverage Area',value:result.location||'—'},{label:'Account Type',value:result.role}].map(f=>(
                  <div key={f.label} className="bg-gray-50 rounded-xl p-3"><p className="text-gray-400" style={{fontSize:'10px'}}>{f.label}</p><p className="text-sm font-semibold text-gray-800 mt-0.5">{f.value}</p></div>
                ))}
              </div>
            </Section>

            {/* 3. Load History */}
            <Section skey="load" label="Load Transaction History" icon={<CreditCard size={14} className="text-[#cc0000]"/>}>
              {extraData.loadHistory?.length===0?<p className="text-xs text-gray-400 py-4 text-center">No load transactions found.</p>:(
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead><tr className="border-b border-gray-100">{['Date','Amount','Description','Status'].map(h=><th key={h} className="text-left py-2 text-gray-400 font-semibold" style={{fontSize:'10px'}}>{h}</th>)}</tr></thead>
                    <tbody>{(extraData.loadHistory||[]).slice(0,5).map((t,i)=><tr key={i} className="border-b border-gray-50 last:border-0"><td className="py-2 text-gray-500">{formatDate(t.created_at)}</td><td className="py-2 font-bold text-[#cc0000]">₱{Number(t.loadAmount||0).toLocaleString()}</td><td className="py-2 text-gray-600">{t.description||'—'}</td><td className="py-2"><span className={`px-2 py-0.5 rounded-full font-semibold ${t.status==='completed'?'bg-green-100 text-green-700':'bg-amber-100 text-amber-700'}`}>{t.status}</span></td></tr>)}</tbody>
                  </table>
                </div>
              )}
            </Section>

            {/* 4. Remote Load Requests */}
            <Section skey="loadReqs" label="Remote Load Requests" icon={<CreditCard size={14} className="text-blue-500"/>}>
              {extraData.loadRequests?.length===0?<p className="text-xs text-gray-400 py-4 text-center">No load requests found.</p>:(
                <div className="mt-3 space-y-2">{(extraData.loadRequests||[]).slice(0,5).map((r,i)=>(
                  <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                    <div><p className="text-xs font-semibold text-gray-800">{r.plan_name} — ₱{Number(r.amount||0).toLocaleString()}</p><p className="text-xs text-gray-400 mt-0.5">{r.payment_method} · {r.reference_no} · {formatDate(r.created_at)}</p></div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${STATUS_BADGE[r.status]||'bg-gray-100 text-gray-600'}`}>{r.status}</span>
                  </div>
                ))}</div>
              )}
            </Section>

            {/* 5. Technician History */}
            <Section skey="tech" label="Technician / Repair History" icon={<Wrench size={14} className="text-blue-500"/>}>
              {extraData.techRequests?.length===0?<p className="text-xs text-gray-400 py-4 text-center">No technician requests found.</p>:(
                <div className="mt-3 space-y-2">{(extraData.techRequests||[]).slice(0,5).map((r,i)=>(
                  <div key={i} className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0"><p className="text-xs font-semibold text-gray-800 truncate">{r.issueDescription}</p><p className="text-xs text-gray-400 mt-0.5">Submitted: {formatDate(r.created_at)}{r.preferred_date?` · Scheduled: ${r.preferred_date}`:''}{r.technician_name?` · Tech: ${r.technician_name}`:''}</p></div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${TECH_BADGE[r.status]||'bg-gray-100 text-gray-600'}`}>{r.status}</span>
                    </div>
                  </div>
                ))}</div>
              )}
            </Section>

            {/* 6. Support Tickets */}
            <Section skey="tickets" label="Support Tickets Summary" icon={<Ticket size={14} className="text-purple-500"/>}>
              {extraData.tickets?.length===0?<p className="text-xs text-gray-400 py-4 text-center">No support tickets found.</p>:(
                <>
                  <div className="grid grid-cols-2 gap-2 mt-3 mb-3">
                    {[{label:'Total Tickets',value:extraData.tickets?.length||0},{label:'Open/In Progress',value:extraData.tickets?.filter(t=>['Open','In Progress'].includes(t.status)).length||0}].map(s=>(
                      <div key={s.label} className="bg-gray-50 rounded-xl p-3"><p className="text-gray-400" style={{fontSize:'10px'}}>{s.label}</p><p className="text-xl font-bold text-gray-800">{s.value}</p></div>
                    ))}
                  </div>
                  <div className="space-y-2">{(extraData.tickets||[]).slice(0,5).map((t,i)=>(
                    <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                      <div className="flex-1 min-w-0"><p className="text-xs font-semibold text-gray-800 truncate">{t.subject}</p><p className="text-xs text-gray-400 mt-0.5">#{t.id} · {t.category} · {timeAgo(t.created_at)}</p></div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${TICKET_BADGE[t.status]||'bg-gray-100 text-gray-600'}`}>{t.status}</span>
                    </div>
                  ))}</div>
                </>
              )}
            </Section>
          </div>
        )}
      </div>
    </UserLayout>
  );
}
