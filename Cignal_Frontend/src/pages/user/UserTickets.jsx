import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, Wrench, ChevronRight, AlertTriangle, Clock, Flag, CheckCircle2 } from 'lucide-react';
import UserLayout from '../../components/UserLayout';
import ticketApi from '../../api/ticketApi';
import axiosClient from '../../api/axiosClient';

const STATUS_BADGE  = { Open:'bg-red-100 text-red-700', 'In Progress':'bg-amber-100 text-amber-700', Resolved:'bg-green-100 text-green-700', Closed:'bg-slate-100 text-slate-600' };
const STATUS_ICON   = { Open:<Flag size={11} className="text-red-500"/>, 'In Progress':<Clock size={11} className="text-amber-500"/>, Resolved:<CheckCircle2 size={11} className="text-green-500"/>, Closed:<CheckCircle2 size={11} className="text-slate-400"/> };
const TECH_BADGE    = { Pending:'bg-amber-100 text-amber-700', Scheduled:'bg-blue-100 text-blue-700', Completed:'bg-green-100 text-green-700', Cancelled:'bg-slate-100 text-slate-600' };
const CAT_BADGE     = { 'Billing Concern':'bg-purple-50 text-purple-700', 'Technical Problem':'bg-blue-50 text-blue-700', 'Connection Issue':'bg-orange-50 text-orange-700', 'Technician Request':'bg-red-50 text-red-700' };

function timeAgo(d) { if(!d)return '—'; const diff=(Date.now()-new Date(d).getTime())/1000; if(diff<60)return 'just now'; if(diff<3600)return Math.floor(diff/60)+'m ago'; if(diff<86400)return Math.floor(diff/3600)+'h ago'; return Math.floor(diff/86400)+'d ago'; }

const READ_KEY = 'cignalcare_read_tickets';
function getReadSet() { try { return new Set(JSON.parse(localStorage.getItem(READ_KEY)||'[]')); } catch { return new Set(); } }
function markRead(id) { const s=getReadSet(); s.add(id); localStorage.setItem(READ_KEY,JSON.stringify([...s])); }

export default function UserTickets() {
  const navigate = useNavigate();
  const [tickets,   setTickets]   = useState([]);
  const [techReqs,  setTechReqs]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [statusFilter, setStatus] = useState('All');
  const [sortOrder, setSort]      = useState('newest');
  const [readSet,   setReadSet]   = useState(getReadSet());

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [tr, tc] = await Promise.all([
          ticketApi.getMyTickets(),
          axiosClient.get('/technicians/requests/my').catch(() => ({ data:{ requests:[] } })),
        ]);
        setTickets(tr.data?.tickets || []);
        setTechReqs(tc.data?.requests || []);
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    let t = tickets.filter(t => statusFilter === 'All' || t.status === statusFilter);
    return sortOrder === 'newest'
      ? [...t].sort((a,b) => new Date(b.created_at) - new Date(a.created_at))
      : [...t].sort((a,b) => new Date(a.created_at) - new Date(b.created_at));
  }, [tickets, statusFilter, sortOrder]);

  const counts = { Open:tickets.filter(t=>t.status==='Open').length, 'In Progress':tickets.filter(t=>t.status==='In Progress').length, Resolved:tickets.filter(t=>t.status==='Resolved').length, Closed:tickets.filter(t=>t.status==='Closed').length };
  const pendingTech = techReqs.filter(r => !['Completed','Cancelled'].includes(r.status)).length;

  const handleTicketClick = (t) => { markRead(t.id); setReadSet(getReadSet()); navigate('/user/chat/'+t.id); };

  return (
    <UserLayout>
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        <h1 className="text-xl font-bold text-gray-800">My Support Tickets</h1>

        {/* KPI Status Cards — clickable */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {['Open','In Progress','Resolved','Closed'].map(s => (
            <div key={s} onClick={() => setStatus(statusFilter === s ? 'All' : s)}
              className={`bg-white rounded-xl p-4 shadow-sm border cursor-pointer hover:shadow-md transition-all ${statusFilter===s?'border-[#cc0000] ring-1 ring-red-100':'border-gray-100'}`}>
              <div className="flex items-center gap-2 mb-1">{STATUS_ICON[s]}<p className="text-xs text-gray-500">{s}</p></div>
              <p className={`text-2xl font-bold ${s==='Open'?'text-red-600':s==='In Progress'?'text-amber-600':s==='Resolved'?'text-green-600':'text-slate-500'}`}>{counts[s]}</p>
            </div>
          ))}
        </div>

        {/* Filters + New Ticket Button */}
        <div className="flex items-center gap-3 flex-wrap">
          <select value={statusFilter} onChange={e=>setStatus(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-600 outline-none focus:border-[#cc0000] bg-white">
            <option value="All">All Status</option>{['Open','In Progress','Resolved','Closed'].map(s=><option key={s}>{s}</option>)}
          </select>
          <select value={sortOrder} onChange={e=>setSort(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-600 outline-none focus:border-[#cc0000] bg-white">
            <option value="newest">Newest First</option><option value="oldest">Oldest First</option>
          </select>
          <span className="text-xs text-gray-400">{filtered.length} ticket{filtered.length!==1?'s':''}</span>
          <button onClick={() => navigate('/user/report-problem')} className="ml-auto bg-[#cc0000] hover:bg-red-700 text-white text-xs px-4 py-2 rounded-xl font-semibold">+ New Ticket</button>
        </div>

        {/* Ticket List */}
        <div className="space-y-2">
          {loading ? <div className="text-center text-gray-400 py-8 text-sm">Loading...</div>
          : filtered.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400">
              <Ticket size={32} className="mx-auto mb-2 opacity-30"/>
              <p className="text-sm">No tickets found.</p>
              <button onClick={() => navigate('/user/report-problem')} className="mt-3 text-xs text-[#cc0000] hover:underline font-semibold">File your first ticket →</button>
            </div>
          ) : filtered.map(t => {
            const isNew = !readSet.has(t.id) && t.status !== 'Resolved' && t.status !== 'Closed';
            return (
              <div key={t.id} onClick={() => handleTicketClick(t)}
                className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between gap-3 group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-mono text-gray-400">#{t.id}</span>
                    <div className="flex items-center gap-1">{STATUS_ICON[t.status]}<span className={`px-2 py-0.5 rounded text-xs font-semibold ${STATUS_BADGE[t.status]||'bg-gray-100 text-gray-600'}`}>{t.status}</span></div>
                    {t.category && <span className={`px-2 py-0.5 rounded text-xs font-medium ${CAT_BADGE[t.category]||'bg-gray-100 text-gray-600'}`}>{t.category}</span>}
                    {isNew && <span className="bg-[#cc0000] text-white text-xs px-2 py-0.5 rounded-full font-bold animate-pulse">NEW</span>}
                  </div>
                  <p className="text-sm font-semibold text-gray-800 truncate">{t.subject}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{timeAgo(t.created_at)}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-[#cc0000] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">View ticket</span>
                  <ChevronRight size={16} className="text-gray-300"/>
                </div>
              </div>
            );
          })}
        </div>

        {/* Technician Requests Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Wrench size={18} className="text-gray-600"/>
              <h2 className="text-lg font-bold text-gray-800">My Technician Requests</h2>
              {pendingTech > 0 && <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full font-bold">{pendingTech} pending</span>}
            </div>
            <button onClick={() => navigate('/user/technician-request')} className="bg-[#cc0000] hover:bg-red-700 text-white text-xs px-4 py-2 rounded-xl font-semibold">+ New Request</button>
          </div>

          {/* Pending alert */}
          {pendingTech > 0 && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-start gap-2 mb-3">
              <AlertTriangle size={14} className="text-amber-500 flex-shrink-0 mt-0.5"/>
              <p className="text-xs text-amber-700">You have {pendingTech} pending technician request{pendingTech>1?'s':''} awaiting confirmation. Our team will contact you shortly.</p>
            </div>
          )}

          <div className="space-y-2">
            {loading ? <div className="text-center text-gray-400 py-6 text-sm">Loading...</div>
            : techReqs.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-6 text-center text-gray-400">
                <Wrench size={24} className="mx-auto mb-2 opacity-30"/>
                <p className="text-sm">No technician requests yet.</p>
              </div>
            ) : techReqs.map(r => (
              <div key={r.id} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Wrench size={12} className="text-blue-500 flex-shrink-0"/>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${TECH_BADGE[r.status]||'bg-gray-100 text-gray-600'}`}>{r.status}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800 truncate">{r.issueDescription}</p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <p className="text-xs text-gray-400">Submitted: {new Date(r.created_at||'').toLocaleDateString('en-PH')}</p>
                      {r.preferred_date && <p className="text-xs text-blue-600 font-semibold">📅 Scheduled: {r.preferred_date}</p>}
                      {r.technician_name && <p className="text-xs text-gray-500">👤 {r.technician_name}</p>}
                    </div>
                    {r.admin_note && <p className="text-xs text-gray-500 mt-1 bg-gray-50 rounded-lg px-2 py-1">Admin note: {r.admin_note}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
