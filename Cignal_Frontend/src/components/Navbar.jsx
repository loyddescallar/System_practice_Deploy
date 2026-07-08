import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Satellite, Menu, X, LogOut, Flag, Ticket, Wrench, Smartphone, FileSearch, Stethoscope } from 'lucide-react';

const NAV_LINKS = [
  { label:'Report a Problem',    path:'/user/report-problem',      icon:Flag },
  { label:'My Tickets',          path:'/user/tickets',             icon:Ticket },
  { label:'Request Technician',  path:'/user/technician-request',  icon:Wrench },
  { label:'Troubleshoot',        path:'/troubleshoot',             icon:Stethoscope },
  { label:'Load Request',        path:'/user/load-request',        icon:Smartphone },
  { label:'CCA Inquiry',         path:'/user/retrieve-info',       icon:FileSearch },
];

export default function Navbar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [hidden,   setHidden]   = useState(false);
  const [lastY,    setLastY]    = useState(0);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    setUsername(u.accountName || 'User');
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastY && currentY > 80) setHidden(true);
      else setHidden(false);
      setLastY(currentY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastY]);

  const logout = () => { localStorage.clear(); navigate('/login'); };
  const isActive = (path) => location.pathname.startsWith(path);

  const navBtn = "relative group flex items-center gap-2 text-white font-semibold text-[13px] cursor-pointer transition-all duration-150 hover:scale-110 whitespace-nowrap";

  const hidePaths = ['/login','/register','/admin-login'];
  if (hidePaths.includes(location.pathname)) return null;

  return (
    <>
      <header className={`w-full fixed top-0 left-0 z-50 bg-cignalRed text-white shadow-md transition-all duration-500 ease-in-out ${hidden?'-translate-y-24 opacity-0':'translate-y-0 opacity-100'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-20">

          {/* Logo */}
          <button onClick={() => navigate('/user-dashboard')} className="flex items-center gap-2">
            <Satellite size={28} className="text-white"/>
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-base">CignalCare+</span>
              <span className="text-red-200 text-xs">Descallar Satellite Services</span>
            </div>
          </button>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-6">
            <div className="flex items-center gap-2 text-[15px] font-semibold border-r-2 border-white/50 pr-5 whitespace-nowrap">
              <span>Welcome,</span>
              <span className="font-bold capitalize">{username}</span>
              <span>😊</span>
            </div>
            {NAV_LINKS.map(l => {
              const Icon = l.icon;
              return (
                <button key={l.path} onClick={() => navigate(l.path)} className={navBtn}>
                  <Icon size={14}/>
                  <span>{l.label}</span>
                  {isActive(l.path) && <div className="absolute left-0 -bottom-1 w-full h-[3px] bg-white rounded-full"/>}
                </button>
              );
            })}
            <button onClick={logout} className={navBtn}>
              <LogOut size={14}/> Logout
            </button>
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden text-white">
            {menuOpen ? <X size={28}/> : <Menu size={28}/>}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden bg-cignalRed px-6 py-5 space-y-3 shadow-md border-t border-white/20">
            <p className="font-semibold text-sm">Welcome, {username} 😊</p>
            {NAV_LINKS.map(l => (
              <button key={l.path} onClick={() => { navigate(l.path); setMenuOpen(false); }}
                className="flex items-center gap-2 text-white font-semibold text-sm w-full text-left">
                {l.label}
              </button>
            ))}
            <button onClick={logout} className="flex items-center gap-2 text-white font-semibold text-sm">
              <LogOut size={14}/> Logout
            </button>
          </div>
        )}
      </header>

      {/* Spacer */}
      <div className="h-20"/>
    </>
  );
}
