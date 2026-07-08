import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Send, ChevronRight, MapPin, CheckCircle2, Clock, Flag, ExternalLink } from 'lucide-react';
import ticketApi from '../../api/ticketApi';
import customerApi from '../../api/customerApi';

const LOCATIONS  = ['Balayan','Calaca','Lian','Calatagan','Nasugbu','Lemery'];
const STATUSES   = ['Open','In Progress','Resolved','Closed'];
const CATEGORIES = ['Billing Concern','Technical Problem','Connection Issue','Technician Request','Other'];

const statusStyle = { Open:'bg-red-100 text-red-700', 'In Progress':'bg-amber-100 text-amber-700', Resolved:'bg-green-100 text-green-700', Closed:'bg-slate-100 text-slate-600' };
const statusIcon  = { Open:<Flag size={10} className="text-red-500"/>, 'In Progress':<Clock size={10} className="text-amber-500"/>, Resolved:<CheckCircle2 size={10} className="text-green-500"/>, Closed:<CheckCircle2 size={10} className="text-slate-400"/> };
const categoryBadge = { 'Billing Concern':'bg-purple-50 text-purple-700', 'Technical Problem':'bg-blue-50 text-blue-700', 'Connection Issue':'bg-orange-50 text-orange-700', 'Technician Request':'bg-red-50 text-red-700' };

export default function AdminTickets() {
  const navigate = useNavigate();
  const [tickets, setTickets]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatus]     = useState('All');
  const [catFilter, setCat]           = useState('All');
  const [locTab, setLocTab]           = useState('All');
  const [selectedTicket, setSelected] = useState(null);
  const [messages, setMessages]       = useState([]);
  const [newMsg, setNewMsg]           = useState('');
  const [sending, setSending]         = useState(false);
  const [updating, setUpdating]       = useState(null);
  const [deleteTarget, setDelete]     = useState(null);
  const messagesEndRef = useRef(null);

  const loadTickets = async () => { setLoading(true); try { const r = await ticketApi.getAdminTickets(); setTickets(r.data?.tickets || []); } catch(e) { console.error(e); } finally { setLoading(false); } };
  useEffect(() => { loadTickets(); }, []);

  const loadMessages = async (ticketId) => { try { const r = await ticketApi.getTicketMessages(ticketId); setMessages(r.data?.messages || []); } catch(e) { console.error(e); } };

  useEffect(() => {
    if (selectedTicket) {
      loadMessages(selectedTicket.id);
      const interval = setInterval(() => loadMessages(selectedTicket.id), 4000);
      return () => clearInterval(interval);
    }
  }, [selectedTicket]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);

  const supportTickets = tickets.filter(t => t.category !== 'Technician Request');
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return supportTickets
      .filter(t => locTab === 'All' || t.location === locTab)
      .filter(t => statusFilter === 'All' || t.status === statusFilter)
      .filter(t => catFilter === 'All' || t.category === catFilter)
      .filter(t => t.subject?.toLowerCase().includes(q) || String(t.id).includes(q) || t.accountName?.toLowerCase().includes(q) || t.accountNumber?.toLowerCase().includes(q));
  }, [supportTickets, search, statusFilter, catFilter, locTab]);

  const counts = useMemo(() => {
    const scoped = locTab === 'All' ? supportTickets : supportTickets.filter(t => t.location === locTab);
    return { Open:scoped.filter(t=>t.status==='Open').length, 'In Progress':scoped.filter(t=>t.status==='In Progress').length, Resolved:scoped.filter(t=>t.status==='Resolved').length, Closed:scoped.filter(t=>t.status==='Closed').length };
  }, [supportTickets, locTab]);

  const openTicket = (t) => { setSelected(t); setNewMsg(''); setMessages([]); };

  const handleUpdateStatus = async (ticketId, status) => {
    setUpdating(ticketId);
    try { await ticketApi.updateTicketStatus(ticketId, status); setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status } : t)); if (selectedTicket?.id === ticketId) setSelected(prev => prev ? { ...prev, status } : prev); }
    catch(e) { console.error(e); } finally { setUpdating(null); }
  };

  const sendMessage = async () => {
    if (!newMsg.trim() || !selectedTicket) return;
    setSending(true);
    try { await ticketApi.sendTicketMessage(selectedTicket.id, newMsg.trim()); setNewMsg(''); loadMessages(selectedTicket.id); }
    catch(e) { console.error(e); } finally { setSending(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await ticketApi.deleteTicket(deleteTarget.id); setTickets(prev => prev.filter(t => t.id !== deleteTarget.id)); if (selectedTicket?.id === deleteTarget.id) setSelected(null); setDelete(null); }
    catch(e) { console.error(e); }
  };

  const navigateToCustomer = async (accountNumber) => {
    if (!accountNumber) return;
    try { const r = await customerApi.getCustomerLookup(accountNumber); if (r.data?.user?.id) navigate(`/admin/customers/${r.data.user.id}`); }
    catch(e) { console.error(e); }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between"><div><h1 className="text-lg font-bold text-gray-800">Support Tickets</h1><p className="text-xs text-gray-500 mt-0.5">View, manage, and respond to subscriber support tickets</p></div></div>

      {/* KPI Cards — clickable to filter */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STATUSES.map(s => (
          <div key={s} onClick={() => setStatus(statusFilter === s ? 'All' : s)}
            className={`bg-white rounded-xl p-4 shadow-sm border cursor-pointer hover:shadow-md transition-all ${statusFilter === s ? 'border-[#cc0000] ring-1 ring-red-100' : 'border-gray-100'}`}>
            <div className="flex items-center gap-2 mb-2"><div className={`w-6 h-6 rounded flex items-center justify-center ${s==='Open'?'bg-red-50':s==='In Progress'?'bg-amber-50':s==='Resolved'?'bg-green-50':'bg-slate-50'}`}>{statusIcon[s]}</div><p className="text-xs text-gray-500">{s}</p></div>
            <p className={`text-2xl font-bold ${s==='Open'?'text-red-600':s==='In Progress'?'text-amber-600':s==='Resolved'?'text-green-600':'text-slate-500'}`}>{counts[s]}</p>
            {locTab !== 'All' && <p className="text-gray-400 mt-0.5" style={{fontSize:'10px'}}>{locTab} only</p>}
          </div>
        ))}
      </div>

      {/* Location Tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {['All', ...LOCATIONS].map(loc => (
          <button key={loc} onClick={() => setLocTab(loc)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1 ${locTab === loc ? 'bg-[#cc0000] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-red-200 hover:text-red-600'}`}>
            {loc !== 'All' && <MapPin size={10}/>}{loc}
            {loc !== 'All' && <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold ${locTab===loc?'bg-white/20':'bg-gray-100 text-gray-500'}`}>{supportTickets.filter(t=>t.location===loc).length}</span>}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-3">
        {/* Ticket List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 flex-1 max-w-xs"><Search size={13} className="text-gray-400"/><input type="text" placeholder="Search subject, ID, account..." value={search} onChange={e=>setSearch(e.target.value)} className="bg-transparent text-xs text-gray-600 placeholder-gray-400 outline-none w-full"/></div>
            <div className="flex gap-1.5 flex-wrap">{['All',...STATUSES].map(f=><button key={f} onClick={()=>setStatus(f)} className={`text-xs px-2.5 py-1.5 rounded-md transition-colors ${statusFilter===f?'bg-[#cc0000] text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{f}</button>)}</div>
            <select value={catFilter} onChange={e=>setCat(e.target.value)} className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-700 outline-none bg-white ml-auto"><option value="All">All Categories</option>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select>
          </div>
          <div className="overflow-x-auto"><table className="w-full text-xs">
            <thead><tr className="border-b border-gray-100 bg-gray-50">{['ID','Account','Subject','Category','Location','Status','Created',''].map(h=><th key={h} className="text-left py-2.5 px-3 text-gray-500 font-semibold uppercase tracking-wide" style={{fontSize:'10px'}}>{h}</th>)}</tr></thead>
            <tbody>
              {loading?<tr><td colSpan={8} className="py-10 text-center text-gray-400">Loading tickets...</td></tr>
              :filtered.length===0?<tr><td colSpan={8} className="py-10 text-center text-gray-400">No tickets found.</td></tr>
              :filtered.map(t=>(
                <tr key={t.id} onClick={()=>openTicket(t)} className={`border-b border-gray-50 hover:bg-gray-50 last:border-0 cursor-pointer ${selectedTicket?.id===t.id?'bg-red-50/40':''}`}>
                  <td className="py-2 px-3 font-mono font-semibold text-gray-700">#{t.id}</td>
                  <td className="py-2 px-3"><button onClick={e=>{e.stopPropagation();navigateToCustomer(t.accountNumber);}} className="text-left hover:text-[#cc0000] transition-colors"><p className="font-medium text-gray-800 whitespace-nowrap">{t.accountName||'—'}</p>{t.accountNumber&&<p className="text-gray-400 font-mono" style={{fontSize:'10px'}}>{t.accountNumber}</p>}</button></td>
                  <td className="py-2 px-3 text-gray-600 max-w-[130px] truncate">{t.subject}</td>
                  <td className="py-2 px-3"><span className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${categoryBadge[t.category]||'bg-gray-100 text-gray-600'}`}>{t.category}</span></td>
                  <td className="py-2 px-3"><div className="flex items-center gap-1"><MapPin size={9} className="text-gray-400"/><span className="text-gray-500 whitespace-nowrap">{t.location||'—'}</span></div></td>
                  <td className="py-2 px-3"><div className="flex items-center gap-1">{statusIcon[t.status]}<span className={`px-2 py-0.5 rounded text-xs font-semibold ${statusStyle[t.status]}`}>{t.status}</span></div></td>
                  <td className="py-2 px-3 text-gray-400 whitespace-nowrap" style={{fontSize:'10px'}}>{(t.created_at||'').split(' ')[0]}</td>
                  <td className="py-2 px-3"><ChevronRight size={13} className="text-gray-300"/></td>
                </tr>
              ))}
            </tbody>
          </table></div>
          <p className="text-xs text-gray-400 mt-2">{filtered.length} ticket{filtered.length!==1?'s':''} shown</p>
        </div>

        {/* Detail + Chat Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden" style={{minHeight:'400px'}}>
          {!selectedTicket ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-6 text-center"><Search size={32} className="text-gray-200 mb-3"/><p className="text-xs font-medium text-gray-500">Select a ticket to view details and respond</p></div>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-gray-100 flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap"><span className="text-xs font-mono text-gray-400">#{selectedTicket.id}</span><div className="flex items-center gap-1">{statusIcon[selectedTicket.status]}<span className={`px-2 py-0.5 rounded text-xs font-semibold ${statusStyle[selectedTicket.status]}`}>{selectedTicket.status}</span></div>{selectedTicket.location&&<div className="flex items-center gap-1"><MapPin size={9} className="text-gray-400"/><span className="text-xs text-gray-500">{selectedTicket.location}</span></div>}</div>
                  <p className="text-xs font-bold text-gray-800 mt-1 leading-snug">{selectedTicket.subject}</p>
                  <div className="flex items-center gap-2 mt-0.5"><p className="text-gray-500" style={{fontSize:'10px'}}>{selectedTicket.accountName} · {selectedTicket.accountNumber}</p><button onClick={()=>navigateToCustomer(selectedTicket.accountNumber)} className="flex items-center gap-0.5 text-[#cc0000] hover:underline" style={{fontSize:'10px'}}><ExternalLink size={9}/> View Profile</button></div>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${categoryBadge[selectedTicket.category]||'bg-gray-100 text-gray-600'}`}>{selectedTicket.category}</span>
                </div>
                <button onClick={()=>setSelected(null)} className="text-gray-400 hover:text-gray-600 p-1"><X size={14}/></button>
              </div>
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-xs text-gray-500 mb-1.5">Update Status:</p>
                <div className="flex gap-1.5 flex-wrap">{STATUSES.map(s=><button key={s} disabled={updating===selectedTicket.id} onClick={()=>handleUpdateStatus(selectedTicket.id,s)} className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${selectedTicket.status===s?'border-[#cc0000] bg-red-50 text-[#cc0000]':'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'}`}>{s}</button>)}</div>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50/50" style={{maxHeight:'240px'}}>
                {messages.length===0?<p className="text-xs text-gray-400 text-center mt-6">No messages yet.</p>
                :messages.map((m,i)=>{const isAdmin=m.sender_role==='admin';return(
                  <div key={i} className={`flex ${isAdmin?'justify-end':'justify-start'}`}>
                    <div className={`max-w-[80%] px-3 py-2 rounded-xl text-xs ${isAdmin?'bg-[#cc0000] text-white rounded-br-sm':'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'}`}>
                      <p className="whitespace-pre-wrap break-words leading-relaxed">{m.message}</p>
                      <p className={`text-right mt-1 ${isAdmin?'text-red-200':'text-gray-400'}`} style={{fontSize:'9px'}}>{(m.created_at||'').split('.')[0]}</p>
                    </div>
                  </div>
                );})}
                <div ref={messagesEndRef}/>
              </div>
              <div className="p-3 border-t border-gray-100 space-y-2">
                <div className="flex gap-1.5"><button onClick={()=>navigate(`/admin/chat/${selectedTicket.id}`)} className="text-xs text-[#cc0000] border border-[#cc0000] px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors font-medium">Open Full Chat</button><button onClick={()=>setDelete(selectedTicket)} className="text-xs text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors font-medium ml-auto">Delete</button></div>
                <div className="flex gap-2"><input type="text" value={newMsg} onChange={e=>setNewMsg(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendMessage()} placeholder="Type a reply..." className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#cc0000]"/><button onClick={sendMessage} disabled={!newMsg.trim()||sending} className="bg-[#cc0000] hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-colors disabled:opacity-50"><Send size={13}/></button></div>
              </div>
            </>
          )}
        </div>
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100"><h2 className="text-sm font-bold text-gray-800">Delete Ticket</h2><button onClick={()=>setDelete(null)} className="p-1 rounded-xl hover:bg-gray-100 text-gray-400"><X size={16}/></button></div>
            <div className="p-5"><p className="text-xs text-gray-600 leading-relaxed">Delete ticket <span className="font-semibold">#{deleteTarget.id}</span> — "{deleteTarget.subject}"? This cannot be undone.</p><div className="flex gap-2 mt-4"><button onClick={handleDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs py-2.5 rounded-xl font-semibold">Delete</button><button onClick={()=>setDelete(null)} className="flex-1 border border-gray-200 text-xs py-2.5 rounded-xl text-gray-600 hover:bg-gray-50">Cancel</button></div></div>
          </div>
        </div>
      )}
    </div>
  );
}
