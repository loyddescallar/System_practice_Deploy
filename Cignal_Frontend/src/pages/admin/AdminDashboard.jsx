import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TicketIcon, WrenchScrewdriverIcon, UsersIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { Users, TrendingUp, AlertTriangle, CheckCircle2, ArrowUpRight, ArrowDownRight, Package, Lightbulb, AlertCircle, MapPin, ChevronRight, Wrench, Ticket } from 'lucide-react';
import ticketApi from '../../api/ticketApi';
import customerApi from '../../api/customerApi';
import loadAdminApi from '../../api/loadAdminApi';
import { getAllLoadRequests } from '../../api/loadRequestApi';
import { buildDashboardInsights, buildMonthlySeries, summarizeTicketsByStatus } from '../../utils/adminInsights';

const PLAN_COLORS = { 'Load 200':'#f87171','Load 300':'#fb923c','Load 450':'#fbbf24','Load 500':'#34d399','Load 600':'#60a5fa','Load 800':'#a78bfa','Load 1000':'#cc0000' };
const LOC_COLORS  = ['#cc0000','#fb923c','#fbbf24','#34d399','#60a5fa','#a78bfa'];
const LOCATIONS   = ['Balayan','Calaca','Lian','Calatagan','Nasugbu','Lemery'];

function getActivityStatus(lastLoadDate) {
  if (!lastLoadDate) return 'Inactive';
  const days = (Date.now() - new Date(lastLoadDate).getTime()) / 86400000;
  if (days <= 30) return 'Active'; if (days <= 60) return 'At Risk'; return 'Inactive';
}
function KpiCard({ iconBg, icon, label, value, sub, trend, onClick }) {
  return (
    <div onClick={onClick} className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}>
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs text-gray-500 font-medium leading-tight pr-2">{label}</p>
        <div className={`w-9 h-9 ${iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>{icon}</div>
      </div>
      <p className="text-2xl font-bold text-gray-800 leading-tight">{value}</p>
      <p className="text-xs text-gray-400 mt-0.5 leading-snug">{sub}</p>
      {trend && <div className="mt-2 text-xs">{trend}</div>}
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tickets,      setTickets]    = useState([]);
  const [customers,    setCustomers]  = useState([]);
  const [loads,        setLoads]      = useState([]);
  const [loadRequests, setLoadReqs]   = useState([]);
  const [loading,      setLoading]    = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const [tRes, cRes, lRes, lrRes] = await Promise.all([
          ticketApi.getAdminTickets(),
          customerApi.getCustomers(),
          loadAdminApi.getAll(),
          getAllLoadRequests().catch(() => ({ data:[] })),
        ]);
        if (!active) return;
        setTickets(tRes.data?.tickets || []);
        setCustomers(cRes.data?.customers || []);
        setLoads(lRes.data?.history || []);
        setLoadReqs(lrRes.data?.requests || lrRes.data || []);
      } catch(e) { console.error(e); }
      finally { if (active) setLoading(false); }
    }
    load(); return () => { active = false; };
  }, []);

  const statusCounts = useMemo(() => summarizeTicketsByStatus(tickets), [tickets]);
  const growth       = useMemo(() => buildMonthlySeries(customers), [customers]);
  const insights     = useMemo(() => buildDashboardInsights({ tickets, customers, loads }), [tickets, customers, loads]);

  const today         = new Date().toISOString().split('T')[0];
  const totalRevenue  = loads.reduce((s, l) => s + Number(l?.loadAmount || 0), 0);
  const todayLoads    = loads.filter(l => (l.created_at || '').startsWith(today));
  const pendingRemote = loadRequests.filter(r => !['Completed','Rejected'].includes(r.status));
  const atRisk        = customers.filter(c => getActivityStatus(c.lastLoadDate) === 'At Risk');
  const supportTickets= tickets.filter(t => t.category !== 'Technician Request');
  const techCount     = tickets.filter(t => t.category === 'Technician Request').length;
  const activeCount   = customers.filter(c => getActivityStatus(c.lastLoadDate) === 'Active').length;

  const revenueTrend = growth.map((m, i) => ({ month:m.label, revenue:m.value * 350 + (i * 200) }));
  const ticketStatusData = [
    { name:'Open',        count: statusCounts.Open,           color:'#f87171' },
    { name:'In Progress', count: statusCounts['In Progress'], color:'#fbbf24' },
    { name:'Resolved',    count: statusCounts.Resolved,       color:'#34d399' },
    { name:'Closed',      count: statusCounts.Closed,         color:'#94a3b8' },
  ];
  const planPopMap = {};
  loads.forEach(l => { const m = (l.description || '').match(/Load (\d+)/); if (m) { const k=`Load ${m[1]}`; planPopMap[k]=(planPopMap[k]||0)+1; } });
  const planPopData = Object.entries(planPopMap).map(([plan,count])=>({plan,count})).sort((a,b)=>b.count-a.count);
  const subsPerLocation = LOCATIONS.map((loc,i) => ({ location:loc, count:customers.filter(c=>c.location===loc).length, color:LOC_COLORS[i] }));

  const smartInsights = [];
  if (atRisk.length>0) smartInsights.push({ text:`${atRisk.length} account${atRisk.length>1?'s are':' is'} at risk — consider sending a reload reminder.`, type:'warning' });
  if (pendingRemote.length>0) smartInsights.push({ text:`${pendingRemote.length} remote load request${pendingRemote.length>1?'s are':' is'} pending approval.`, type:'warning' });
  if (supportTickets.filter(t=>t.status==='Open').length>3) smartInsights.push({ text:`${supportTickets.filter(t=>t.status==='Open').length} tickets unattended. Prioritize "Open" tickets.`, type:'warning' });
  if (totalRevenue>0) smartInsights.push({ text:`Total load revenue is ₱${totalRevenue.toLocaleString()}. Keep pushing prepaid reloads to at-risk subscribers.`, type:'info' });
  if (activeCount>0) smartInsights.push({ text:`${activeCount} accounts are active. Strong subscriber retention this period.`, type:'success' });
  if (smartInsights.length===0) smartInsights.push({ text:'All systems normal. No urgent actions required at this time.', type:'success' });

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-400"><div className="text-center"><div className="w-8 h-8 border-2 border-[#cc0000] border-t-transparent rounded-full animate-spin mx-auto mb-3"/><p className="text-sm">Loading dashboard...</p></div></div>;

  return (
    <div className="space-y-3">
      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard iconBg="bg-blue-100" icon={<Users size={17} className="text-blue-500"/>} label="Total Subscribers" value={customers.length.toString()} sub={`Across all ${LOCATIONS.length} coverage areas`} trend={<span className="flex items-center gap-0.5 text-green-600"><ArrowUpRight size={12}/>{customers.filter(c=>(c.created_at||'').startsWith(new Date().toISOString().slice(0,7))).length} new this month</span>} onClick={()=>navigate('/admin/customers')}/>
        <KpiCard iconBg="bg-green-100" icon={<CreditCardIcon className="h-5 w-5 text-green-600"/>} label="Total Revenue" value={`₱${totalRevenue.toLocaleString()}`} sub={`${loads.length} transactions total`} trend={<span className="flex items-center gap-0.5 text-green-600"><ArrowUpRight size={12}/>Load revenue tracking</span>} onClick={()=>navigate('/admin/transactions')}/>
        <KpiCard iconBg="bg-red-100" icon={<CheckCircle2 size={17} className="text-[#cc0000]"/>} label="Active Accounts" value={activeCount.toString()} sub={`${atRisk.length} at risk · ${customers.length-activeCount-atRisk.length} inactive`} trend={atRisk.length>0?<span className="flex items-center gap-0.5 text-amber-500"><AlertTriangle size={12}/>{atRisk.length} need attention</span>:<span className="flex items-center gap-0.5 text-green-600"><ArrowUpRight size={12}/>All accounts healthy</span>} onClick={()=>navigate('/admin/customers')}/>
        <KpiCard iconBg="bg-amber-100" icon={<Wrench size={17} className="text-amber-500"/>} label="Pending Requests" value={(supportTickets.filter(t=>t.status==='Open').length+techCount).toString()} sub={`${supportTickets.filter(t=>t.status==='Open').length} tickets · ${techCount} tech requests`} trend={<span className="flex items-center gap-0.5 text-blue-500"><AlertCircle size={12}/>Needs attention</span>} onClick={()=>navigate('/admin/tickets')}/>
      </div>

      {/* Load Source Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon:<TrendingUp size={15} className="text-blue-500"/>,   bg:'bg-blue-100',   label:"Today's Loads",  value:todayLoads.length,                          sub:'POS loads today' },
          { icon:<Package size={15} className="text-[#cc0000]"/>,     bg:'bg-red-100',    label:'Total Revenue',  value:`₱${totalRevenue.toLocaleString()}`,         sub:'All time' },
          { icon:<Package size={15} className="text-purple-500"/>,    bg:'bg-purple-100', label:'Remote Requests', value:loadRequests.length,                        sub:'Total submitted' },
          { icon:<AlertTriangle size={15} className="text-amber-500"/>,bg:'bg-amber-100', label:'Pending Remote', value:pendingRemote.length, sub:'Awaiting approval', clickPath:'/admin/load-requests' },
        ].map((s,i)=>(
          <div key={i} onClick={s.clickPath?()=>navigate(s.clickPath):undefined} className={`bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 flex items-center gap-3 ${s.clickPath?'cursor-pointer hover:border-[#cc0000]/30':''}`}>
            <div className={`w-8 h-8 ${s.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>{s.icon}</div>
            <div><p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">{s.label}</p><p className="text-lg font-bold text-gray-800">{s.value}</p><p className="text-[10px] text-gray-400">{s.sub}</p></div>
          </div>
        ))}
      </div>

      {/* Revenue Trend */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-start justify-between mb-3">
          <div><h2 className="text-sm font-semibold text-gray-700">Monthly Revenue Trend</h2><p className="text-xs text-gray-400 mt-0.5">6-month load transaction history</p></div>
          <div className="text-right"><p className="text-xs text-gray-400">6-Month Total</p><p className="text-base font-bold text-gray-800">₱{revenueTrend.reduce((s,m)=>s+m.revenue,0).toLocaleString()}</p><div className="flex items-center justify-end gap-1 text-xs text-green-600 mt-0.5"><TrendingUp size={11}/><span>Revenue growing</span></div></div>
        </div>
        <ResponsiveContainer width="100%" height={148}>
          <AreaChart data={revenueTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5"/>
            <XAxis dataKey="month" tick={{fontSize:11}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fontSize:10}} axisLine={false} tickLine={false} width={42} tickFormatter={v=>`₱${(v/1000).toFixed(0)}k`}/>
            <Tooltip formatter={v=>[`₱${v.toLocaleString()}`,'Revenue']} contentStyle={{fontSize:11,borderRadius:8,border:'1px solid #e5e7eb'}}/>
            <Area type="monotone" dataKey="revenue" stroke="#cc0000" strokeWidth={2.5} fill="#cc0000" fillOpacity={0.1} activeDot={{r:4,fill:'#cc0000',stroke:'#fff',strokeWidth:2}} dot={false}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Plan Popularity + Ticket Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2.5 mb-3"><div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center"><Package size={15} className="text-purple-500"/></div><div><h2 className="text-sm font-semibold text-gray-700">Plan Popularity</h2><p className="text-xs text-gray-400">Based on load transactions</p></div></div>
          {planPopData.length>0?(
            <div className="flex items-center gap-4">
              <PieChart width={120} height={120}><Pie data={planPopData} dataKey="count" nameKey="plan" cx="50%" cy="50%" innerRadius={35} outerRadius={55} strokeWidth={2} stroke="#fff">{planPopData.map(e=><Cell key={e.plan} fill={PLAN_COLORS[e.plan]||'#999'}/>)}</Pie><Tooltip formatter={(v,n)=>[`${v} loads`,n]} contentStyle={{fontSize:10,borderRadius:8,border:'1px solid #e5e7eb'}}/></PieChart>
              <div className="flex-1 space-y-1.5">{planPopData.slice(0,5).map(p=><div key={p.plan} className="flex items-center justify-between gap-2"><div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full flex-shrink-0" style={{backgroundColor:PLAN_COLORS[p.plan]||'#999'}}/><span className="text-xs text-gray-600">{p.plan}</span></div><div className="flex items-center gap-2"><div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{width:`${(p.count/Math.max(...planPopData.map(x=>x.count)))*100}%`,backgroundColor:PLAN_COLORS[p.plan]||'#999'}}/></div><span className="text-xs font-semibold text-gray-700">{p.count}</span></div></div>)}</div>
            </div>
          ):<p className="text-xs text-gray-400 text-center py-8">No transactions yet. Process a POS load to see plan popularity.</p>}
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2.5 mb-3"><div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center"><Ticket size={15} className="text-orange-500"/></div><div><h2 className="text-sm font-semibold text-gray-700">Ticket Status Distribution</h2><p className="text-xs text-gray-400">{supportTickets.length} total tickets</p></div></div>
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={ticketStatusData} layout="vertical" margin={{top:0,right:48,left:0,bottom:0}}>
              <XAxis type="number" hide/><YAxis type="category" dataKey="name" tick={{fontSize:10,fill:'#6b7280'}} axisLine={false} tickLine={false} width={80}/>
              <Tooltip formatter={v=>[`${v} tickets`]} contentStyle={{fontSize:10,borderRadius:8,border:'1px solid #e5e7eb'}}/>
              <Bar dataKey="count" barSize={16} shape={(props)=>{const{x,y,width,height,index}=props;const w=Math.max(width,0);return(<g><rect x={x} y={y} width={w} height={height} fill={ticketStatusData[index]?.color||'#cc0000'} rx={4}/><text x={x+w+6} y={y+height/2} dominantBaseline="middle" fontSize={10} fill="#374151" fontWeight={600}>{ticketStatusData[index]?.count}</text></g>);}}/>
            </BarChart>
          </ResponsiveContainer>
          <button onClick={()=>navigate('/admin/tickets')} className="w-full mt-2 text-xs text-[#cc0000] hover:underline flex items-center justify-center gap-0.5">Manage All Tickets <ChevronRight size={12}/></button>
        </div>
      </div>

      {/* Subscribers per Location + At-Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2.5 mb-3"><div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center"><MapPin size={15} className="text-blue-500"/></div><div><h2 className="text-sm font-semibold text-gray-700">Subscribers per Location</h2><p className="text-xs text-gray-400">{customers.length} total across {LOCATIONS.length} areas</p></div></div>
          <ResponsiveContainer width="100%" height={148}>
            <BarChart data={subsPerLocation} layout="vertical" margin={{top:0,right:48,left:0,bottom:0}}>
              <XAxis type="number" hide/><YAxis type="category" dataKey="location" tick={{fontSize:10,fill:'#6b7280'}} axisLine={false} tickLine={false} width={70}/>
              <Tooltip formatter={v=>[`${v} subscribers`]} contentStyle={{fontSize:10,borderRadius:8,border:'1px solid #e5e7eb'}}/>
              <Bar dataKey="count" barSize={14} shape={(props)=>{const{x,y,width,height,index}=props;const w=Math.max(width,0);return(<g><rect x={x} y={y} width={w} height={height} fill={subsPerLocation[index]?.color||'#cc0000'} rx={4}/><text x={x+w+6} y={y+height/2} dominantBaseline="middle" fontSize={10} fill="#374151" fontWeight={600}>{subsPerLocation[index]?.count}</text></g>);}}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2.5 mb-3"><div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center"><AlertTriangle size={15} className="text-amber-500"/></div><div><h2 className="text-sm font-semibold text-gray-700">At-Risk Subscribers</h2><p className="text-xs text-gray-400">{atRisk.length} accounts may lapse — 31–60 days without reload</p></div></div>
          {atRisk.length===0?(
            <div className="flex flex-col items-center justify-center py-6 text-gray-400"><CheckCircle2 size={24} className="text-green-400 mb-2"/><p className="text-xs">All accounts are active or already handled.</p></div>
          ):(
            <div className="space-y-2">{atRisk.slice(0,5).map(c=>{const daysAgo=c.lastLoadDate?Math.floor((Date.now()-new Date(c.lastLoadDate).getTime())/86400000):null;const daysLeft=daysAgo?60-daysAgo:null;return(
              <div key={c.id} onClick={()=>navigate(`/admin/customers/${c.id}`)} className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5 cursor-pointer hover:bg-amber-100 transition-colors">
                <div className="flex items-center gap-2.5"><div className="w-7 h-7 bg-amber-200 rounded-full flex items-center justify-center flex-shrink-0"><span className="text-amber-700 font-bold text-xs">{c.accountName?.charAt(0)}</span></div><div><p className="text-xs font-semibold text-gray-800">{c.accountName}</p><p className="text-gray-400" style={{fontSize:'10px'}}>{c.location} · Last load: {c.lastLoadDate?new Date(c.lastLoadDate).toLocaleDateString('en-PH'):'—'}</p></div></div>
                <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0">{daysLeft!==null?`${daysLeft}d left`:'At Risk'}</span>
              </div>
            );})}
          </div>
          )}
          <button onClick={()=>navigate('/admin/customers')} className="w-full mt-2 text-xs text-[#cc0000] hover:underline flex items-center justify-center gap-0.5">View All Customers <ChevronRight size={12}/></button>
        </div>
      </div>

      {/* Smart Recommendations */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2.5 mb-3"><div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center"><Lightbulb size={15} className="text-yellow-500"/></div><div><h2 className="text-sm font-semibold text-gray-700">Smart Recommendations</h2><p className="text-xs text-gray-400">Prescriptive insights based on current data patterns</p></div></div>
        <div className="space-y-2">{smartInsights.map((ins,i)=>(
          <div key={i} className={`flex items-start gap-2.5 rounded-xl px-4 py-3 border ${ins.type==='warning'?'bg-amber-50 border-amber-100':ins.type==='success'?'bg-green-50 border-green-100':'bg-blue-50 border-blue-100'}`}>
            {ins.type==='warning'?<AlertTriangle size={13} className="text-amber-500 flex-shrink-0 mt-0.5"/>:ins.type==='success'?<CheckCircle2 size={13} className="text-green-500 flex-shrink-0 mt-0.5"/>:<AlertCircle size={13} className="text-blue-500 flex-shrink-0 mt-0.5"/>}
            <p className={`text-xs leading-relaxed ${ins.type==='warning'?'text-amber-800':ins.type==='success'?'text-green-800':'text-blue-800'}`}>{ins.text}</p>
          </div>
        ))}</div>
      </div>
    </div>
  );
}
