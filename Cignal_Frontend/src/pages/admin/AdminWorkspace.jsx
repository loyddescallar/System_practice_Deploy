import { useState, useRef, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, ArrowLeftRight, Ticket, Wrench, Bell, ChevronDown, AlignJustify, X, Satellite, LogOut, ShieldCheck, Clock, AlertTriangle, AlertCircle, Info, Wifi, User, Tv, BarChart2, Smartphone, Settings, Activity } from 'lucide-react';
import { getAllLoadRequests } from '../../api/loadRequestApi';

import AdminDashboard from './AdminDashboard';
import AdminCustomers from './AdminCustomers';
import AdminCustomerProfile from './AdminCustomerProfile';
import AdminTickets from './AdminTickets';
import AdminTechnicianRequests from './AdminTechnicianRequests';
import AdminPOS from './AdminPOS';
import AdminPlans from './AdminPlans';
import AdminTransactions from './AdminTransactions';
import AdminLoadRequests from './AdminLoadRequests';
import AdminAnalytics from './AdminAnalytics';

const navGroups = [
  { group:'Overview',    items:[{ icon:LayoutDashboard, label:'Dashboard',            path:'/admin-dashboard',    key:'dashboard' }] },
  { group:'Subscriber Management', items:[
    { icon:Users,   label:'Customers',           path:'/admin/customers',    key:'customers' },
    { icon:Ticket,  label:'Tickets',             path:'/admin/tickets',      key:'tickets' },
    { icon:Wrench,  label:'Technician Requests', path:'/admin/technicians',  key:'technicians' },
  ]},
  { group:'Prepaid & Billing', items:[
    { icon:Tv,             label:'Plans',         path:'/admin/plans',         key:'plans' },
    { icon:CreditCard,     label:'POS / Prepaid', path:'/admin/pos',           key:'pos' },
    { icon:ArrowLeftRight, label:'Transactions',  path:'/admin/transactions',  key:'transactions' },
    { icon:Smartphone,     label:'Load Requests', path:'/admin/load-requests', key:'load-requests' },
  ]},
  { group:'Analytics', items:[{ icon:BarChart2, label:'Analytics', path:'/admin/analytics', key:'analytics' }] },
];

function getSectionFromPath(pathname) {
  if (/^\/admin\/customers\/\d+$/.test(pathname)) return 'customer-profile';
  for (const g of navGroups) { const f = g.items.find(i => i.path === pathname); if (f) return f.key; }
  return 'dashboard';
}

function useLiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id); }, []);
  return now;
}
function useOutsideClick(ref, cb) {
  useEffect(() => { function h(e) { if (ref.current && !ref.current.contains(e.target)) cb(); } document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, [ref, cb]);
}

const notifIcon = { critical:{ icon:AlertTriangle, color:'text-red-500 bg-red-50' }, warning:{ icon:AlertCircle, color:'text-orange-500 bg-orange-50' }, info:{ icon:Info, color:'text-blue-500 bg-blue-50' } };

export default function AdminWorkspace() {
  const location = useLocation();
  const navigate  = useNavigate();
  const now       = useLiveClock();
  const activeSection = useMemo(() => getSectionFromPath(location.pathname), [location.pathname]);

  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [notifOpen,    setNotifOpen]    = useState(false);
  const [profileOpen,  setProfileOpen]  = useState(false);
  const [newLoadCount, setNewLoadCount] = useState(0);
  const [notifList, setNotifList] = useState([
    { id:1, type:'critical', title:'High Churn Risk Detected',     desc:'One or more accounts have high churn risk. Check at-risk panel.',  time:'2 min ago',  read:false },
    { id:2, type:'critical', title:'New High-Priority Ticket',      desc:'A new unassigned signal loss ticket needs attention.',             time:'8 min ago',  read:false },
    { id:3, type:'warning',  title:'Technician Requests Pending',   desc:'Technician requests are awaiting admin approval.',                 time:'25 min ago', read:false },
    { id:4, type:'info',     title:'New Subscriber Registered',     desc:'A new account has been added to CignalCare+.',                    time:'2 hr ago',   read:true  },
    { id:5, type:'info',     title:'Ticket Resolved',               desc:'A support issue has been resolved by the team.',                  time:'3 hr ago',   read:true  },
  ]);

  const notifRef   = useRef(null);
  const profileRef = useRef(null);
  useOutsideClick(notifRef,   () => setNotifOpen(false));
  useOutsideClick(profileRef, () => setProfileOpen(false));

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user  = JSON.parse(localStorage.getItem('adminUser') || '{}');
    if (!token || user.role !== 'admin') navigate('/admin-login', { replace: true });
  }, [navigate]);

  useEffect(() => {
    getAllLoadRequests().then(r => {
      const reqs = r.data?.requests || r.data || [];
      setNewLoadCount(reqs.filter(r => r.status === 'Received').length);
    }).catch(() => {});
  }, [location.pathname]);

  const adminUser    = JSON.parse(localStorage.getItem('adminUser') || '{}');
  const adminName    = adminUser.accountName || 'Admin';
  const adminInitials= adminName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const unread       = notifList.filter(n => !n.read).length;
  const dateStr = now.toLocaleDateString('en-PH', { weekday:'short', month:'short', day:'numeric', year:'numeric' });
  const timeStr = now.toLocaleTimeString('en-PH', { hour:'2-digit', minute:'2-digit', second:'2-digit' });
  const logout = () => { localStorage.clear(); navigate('/admin-login'); };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':        return <AdminDashboard />;
      case 'customers':        return <AdminCustomers />;
      case 'customer-profile': return <AdminCustomerProfile />;
      case 'tickets':          return <AdminTickets />;
      case 'technicians':      return <AdminTechnicianRequests />;
      case 'plans':            return <AdminPlans />;
      case 'pos':              return <AdminPOS />;
      case 'transactions':     return <AdminTransactions />;
      case 'load-requests':    return <AdminLoadRequests />;
      case 'analytics':        return <AdminAnalytics />;
      default:                 return <AdminDashboard />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-100">
      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-60 flex flex-col bg-[#0d1117] transition-transform duration-300 lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-2 bg-[#cc0000] px-4 py-4">
          <Satellite className="text-white" size={22} />
          <div className="flex flex-col leading-tight"><span className="text-white text-sm font-bold tracking-wide">CignalCare+</span><span className="text-red-200 text-xs leading-tight">Descallar Satellite Services</span></div>
          <button className="ml-auto lg:hidden text-white" onClick={() => setSidebarOpen(false)}><X size={18} /></button>
        </div>
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
          <div className="w-9 h-9 rounded-full bg-[#cc0000] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">{adminInitials}</div>
          <div><p className="text-white text-sm font-semibold">{adminName}</p><div className="flex items-center gap-1 mt-0.5"><ShieldCheck size={10} className="text-[#cc0000]" /><p className="text-gray-400 text-xs">Super Administrator</p></div></div>
        </div>
        <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-4">
          {navGroups.map(group => (
            <div key={group.group}>
              <p className="text-gray-500 uppercase px-3 mb-1.5" style={{ fontSize:'9px', fontWeight:700, letterSpacing:'0.1em' }}>{group.group}</p>
              <div className="space-y-0.5">
                {group.items.map(item => {
                  const badge = item.key === 'load-requests' && newLoadCount > 0 ? newLoadCount : 0;
                  const isActive = activeSection === item.key || (item.key === 'customers' && activeSection === 'customer-profile');
                  return (
                    <button key={item.key} onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${isActive ? 'bg-[#cc0000] text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}>
                      <div className="relative flex-shrink-0">
                        <item.icon size={17} />
                        {badge > 0 && <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-yellow-400 text-gray-900 rounded-full text-[8px] font-black flex items-center justify-center animate-pulse">{badge}</span>}
                      </div>
                      <span className="flex-1 text-left">{item.label}</span>
                      {badge > 0 && <span className="bg-yellow-400 text-gray-900 text-[9px] font-black px-1.5 py-0.5 rounded-full">{badge}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="px-4 py-3 border-t border-white/10 space-y-2">
          <button onClick={() => navigate('/user-dashboard')} className="w-full flex items-center gap-2 bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white text-xs px-3 py-2 rounded-lg transition-colors font-medium"><User size={13} /> Switch to User View</button>
          <button onClick={logout} className="w-full flex items-center gap-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 hover:text-red-300 text-xs px-3 py-2 rounded-lg transition-colors font-medium"><LogOut size={13} /> Logout</button>
          <p className="text-gray-600 text-xs">© 2026 · Balayan, Batangas</p>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* MAIN */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <header className="flex items-center gap-3 bg-white border-b border-gray-200 px-4 py-2.5 flex-shrink-0">
          <button className="lg:hidden text-gray-500 hover:text-gray-700 p-1" onClick={() => setSidebarOpen(true)}><AlignJustify size={20} /></button>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-600">
            <Clock size={12} className="text-gray-400" />
            <span className="font-medium tabular-nums">{timeStr}</span>
            <span className="text-gray-400 ml-1.5">{dateStr}</span>
          </div>
          <div className="flex-1" />

          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <button onClick={() => setNotifOpen(!notifOpen)} className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell size={18} className="text-gray-600" />
              {unread > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-[#cc0000] text-white rounded-full text-[9px] font-black flex items-center justify-center">{unread}</span>}
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-800">Notifications</p>
                  <button onClick={() => setNotifList(prev => prev.map(n => ({ ...n, read: true })))} className="text-xs text-[#cc0000] hover:underline">Mark all read</button>
                </div>
                <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                  {notifList.map(n => {
                    const cfg = notifIcon[n.type] || notifIcon.info;
                    const Icon = cfg.icon;
                    return (
                      <div key={n.id} onClick={() => setNotifList(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}
                        className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 ${!n.read ? 'bg-blue-50/30' : ''}`}>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.color}`}><Icon size={13} /></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800">{n.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.desc}</p>
                          <p className="text-gray-400 mt-1" style={{ fontSize:'10px' }}>{n.time}</p>
                        </div>
                        {!n.read && <div className="w-2 h-2 bg-[#cc0000] rounded-full flex-shrink-0 mt-1" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div ref={profileRef} className="relative">
            <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 hover:bg-gray-100 rounded-md px-2 py-1.5 transition-colors">
              <div className="w-7 h-7 rounded-full bg-[#cc0000] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{adminInitials}</div>
              <ChevronDown size={13} className="text-gray-400" />
            </button>
            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden py-1">
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <p className="text-xs font-semibold text-gray-800">{adminName}</p>
                  <div className="flex items-center gap-1 mt-0.5"><ShieldCheck size={10} className="text-[#cc0000]" /><span className="text-xs text-[#cc0000] font-medium">Super Administrator</span></div>
                </div>
                <button onClick={logout} className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-red-50 transition-colors text-left">
                  <LogOut size={14} className="text-red-500" /><span className="text-xs text-red-500 font-medium">Logout</span>
                </button>
              </div>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-3 lg:p-4">{renderContent()}</main>
      </div>
    </div>
  );
}
