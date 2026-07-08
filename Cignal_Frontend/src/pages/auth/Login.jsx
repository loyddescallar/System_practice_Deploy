import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Satellite, X, Search, User, Hash, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import authApi from '../../api/authApi';
import axiosClient from '../../api/axiosClient';

function getActivityStatus(lastLoadDate) {
  if (!lastLoadDate) return 'Inactive';
  const days = (Date.now() - new Date(lastLoadDate).getTime()) / 86400000;
  if (days <= 30) return 'Active'; if (days <= 60) return 'At Risk'; return 'Inactive';
}
const STATUS_COLORS = { Active:'bg-green-100 text-green-700 border-green-200', 'At Risk':'bg-amber-100 text-amber-700 border-amber-200', Inactive:'bg-red-100 text-red-700 border-red-200' };

export default function Login() {
  const navigate = useNavigate();
  const [accountName, setAccountName] = useState('');
  const [accountId,   setAccountId]   = useState('');
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');

  const [prepaidModal, setPrepaidModal] = useState(false);
  const [ccaModal,     setCcaModal]     = useState(false);
  const [inquiryInput, setInquiryInput] = useState('');
  const [inquiryResult,setInquiryResult]= useState(null);
  const [inquiryLoading,setInquiryLoading]=useState(false);

  const handleLogin = async e => {
    e.preventDefault();
    if (!accountName.trim() || !accountId.trim()) { setError('All fields are required.'); return; }
    setLoading(true); setError('');
    try {
      const r = await authApi.login({ accountName:accountName.trim(), accountId:accountId.trim() });
      const { token, user } = r.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      if (user.role === 'admin') { localStorage.setItem('adminUser', JSON.stringify(user)); navigate('/admin-dashboard'); }
      else navigate('/user-dashboard');
    } catch(e) { setError(e.response?.data?.error || 'Invalid credentials. Please try again.'); }
    finally { setLoading(false); }
  };

  const handleInquiry = async e => {
    e.preventDefault();
    if (!inquiryInput.trim()) return;
    setInquiryLoading(true); setInquiryResult(null);
    try {
      const r = await axiosClient.get('/customers/' + inquiryInput.trim());
      const c = r.data?.user || r.data;
      // Get subscription details
      let prepaidInfo = null;
      if (c?.lastLoadDate) {
        const exp = new Date(c.lastLoadDate); exp.setDate(exp.getDate() + 30);
        const daysLeft = Math.ceil((exp.getTime() - Date.now()) / 86400000);
        prepaidInfo = { daysLeft, expiry: exp.toLocaleDateString('en-PH'), status: daysLeft > 7 ? 'Active' : daysLeft > 0 ? 'Expiring' : 'Expired' };
      }
      setInquiryResult({ found:true, data:c, prepaid:prepaidInfo });
    } catch { setInquiryResult({ found:false }); }
    finally { setInquiryLoading(false); }
  };

  const closeModal = () => { setPrepaidModal(false); setCcaModal(false); setInquiryInput(''); setInquiryResult(null); };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex w-2/5 bg-gradient-to-br from-[#cc0000] to-[#880000] flex-col justify-between p-12 text-white">
        <div className="flex items-center gap-3"><Satellite size={36}/><div><p className="text-2xl font-bold">CignalCare+</p><p className="text-red-200 text-sm">Descallar Satellite Services</p></div></div>
        <div>
          <h1 className="text-4xl font-bold leading-tight mb-4">Your Cignal TV<br/>Subscriber Portal</h1>
          <p className="text-red-200 text-sm mb-2">📍 Langgangan, Balayan, Batangas</p>
          <p className="text-red-200 text-sm mb-8">📞 0975-571-8056 / 0917-511-9647</p>
          <div className="flex flex-col gap-3">
            <button onClick={() => { setPrepaidModal(true); setInquiryInput(''); setInquiryResult(null); }} className="bg-white text-[#cc0000] font-semibold px-6 py-3 rounded-xl hover:bg-red-50 transition-colors text-sm flex items-center gap-2"><Search size={16}/>Prepaid Account Inquiry</button>
            <button onClick={() => { setCcaModal(true); setInquiryInput(''); setInquiryResult(null); }} className="border-2 border-white text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors text-sm flex items-center gap-2"><Search size={16}/>CCA Inquiry</button>
          </div>
        </div>
        <p className="text-red-300 text-xs">© 2026 Descallar Satellite Services. All rights reserved.</p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8"><Satellite size={28} className="text-[#cc0000]"/><p className="text-xl font-bold text-gray-800">CignalCare+</p></div>
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center gap-2 mb-6"><div className="w-1 h-6 bg-[#cc0000] rounded-full"/><h2 className="text-xl font-bold text-gray-800">User Login</h2></div>
            {error && <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-xl mb-4">{error}</div>}
            <form onSubmit={handleLogin} className="space-y-4">
              <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">ACCOUNT NAME</label>
                <div className="relative"><User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/><input value={accountName} onChange={e=>setAccountName(e.target.value)} placeholder="Enter your account name" className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm outline-none focus:border-[#cc0000]"/></div>
              </div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">ACCOUNT NUMBER / CCA NUMBER</label>
                <div className="relative"><Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/><input value={accountId} onChange={e=>setAccountId(e.target.value)} placeholder="Account or CCA number" className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm outline-none focus:border-[#cc0000]"/></div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-[#cc0000] hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60">{loading?'Logging in...':'Login'}</button>
            </form>
            <div className="flex items-center justify-between mt-4">
              <button onClick={() => navigate('/register')} className="text-xs text-gray-500 hover:text-[#cc0000]">Don't have an account? <span className="font-semibold">Register</span></button>
              <button onClick={() => navigate('/admin-login')} className="text-xs text-blue-600 hover:underline font-semibold">Admin Login</button>
            </div>
            {/* Demo hint */}
            <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-1 font-semibold">Demo Credentials:</p>
              <p className="text-xs font-mono text-gray-700">Name: <span className="text-[#cc0000]">loyd descallar</span></p>
              <p className="text-xs font-mono text-gray-700">Account No: <span className="text-[#cc0000]">88773322</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Inquiry Modals */}
      {(prepaidModal || ccaModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className={`flex items-center justify-between px-5 py-4 text-white flex-shrink-0 ${prepaidModal?'bg-gradient-to-r from-[#cc0000] to-[#880000]':'bg-gray-900'}`}>
              <h2 className="text-sm font-bold">{prepaidModal?'Prepaid Account Inquiry':'CCA Inquiry'}</h2>
              <button onClick={closeModal} className="p-1 rounded-xl hover:bg-white/20"><X size={16}/></button>
            </div>
            <div className="p-5 overflow-y-auto flex-1">
              <p className="text-xs text-gray-500 mb-3">{prepaidModal?'Check your prepaid account and subscription status.':'Look up subscriber information.'}</p>
              <form onSubmit={handleInquiry} className="flex gap-2 mb-3">
                <input value={inquiryInput} onChange={e=>setInquiryInput(e.target.value)} placeholder={prepaidModal?'Enter Account Number':'Enter Account No. or CCA No.'} className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-[#cc0000]"/>
                <button type="submit" disabled={inquiryLoading} className="bg-[#cc0000] text-white text-xs px-5 py-2.5 rounded-xl hover:bg-red-700 font-semibold disabled:opacity-60">{inquiryLoading?'...':'Search'}</button>
              </form>
              {inquiryResult && !inquiryResult.found && <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-xs text-red-600">❌ No record found for "{inquiryInput}"</div>}
              {inquiryResult?.found && inquiryResult.data && (
                <div className="space-y-3">
                  {/* Activity Status */}
                  {(() => {
                    const s = getActivityStatus(inquiryResult.data.lastLoadDate);
                    return <div className={`rounded-xl p-3 border ${STATUS_COLORS[s]} flex items-center gap-2`}>
                      {s==='Active'?<CheckCircle2 size={16}/>:s==='At Risk'?<AlertTriangle size={16}/>:<XCircle size={16}/>}
                      <div><p className="text-xs font-bold">{s} Account</p><p className="text-xs opacity-80">Last load: {inquiryResult.data.lastLoadDate?new Date(inquiryResult.data.lastLoadDate).toLocaleDateString('en-PH'):'No record'}</p></div>
                    </div>;
                  })()}

                  {/* Account details */}
                  <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3">
                    <p className="text-xs text-green-700 font-semibold mb-2">✅ Record Found</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[{label:'Account Name',value:inquiryResult.data.accountName},{label:'Account No.',value:inquiryResult.data.accountNumber},{label:'CCA No.',value:inquiryResult.data.ccaNumber},{label:'Phone',value:inquiryResult.data.phone},{label:'Location',value:inquiryResult.data.location||'—'},{label:'Status',value:inquiryResult.data.status||'active'}].map(f=>(
                        <div key={f.label}><p className="text-gray-400" style={{fontSize:'9px'}}>{f.label}</p><p className="text-xs text-gray-800 font-semibold mt-0.5">{f.value}</p></div>
                      ))}
                    </div>
                  </div>

                  {/* Subscription Info (prepaid modal) */}
                  {prepaidModal && inquiryResult.prepaid && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 space-y-2">
                      <p className="text-xs font-semibold text-blue-700 mb-1">📺 Subscription Details</p>
                      {[{label:'Status',value:inquiryResult.prepaid.status},{label:'Days Remaining',value:inquiryResult.prepaid.daysLeft > 0 ? inquiryResult.prepaid.daysLeft+' days' : 'Expired'},{label:'Expiry Date',value:inquiryResult.prepaid.expiry}].map(f=>(
                        <div key={f.label} className="flex justify-between text-xs"><span className="text-gray-500">{f.label}</span><span className="font-semibold text-gray-800">{f.value}</span></div>
                      ))}
                    </div>
                  )}

                  {prepaidModal && !inquiryResult.prepaid && (
                    <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                      <p className="text-xs text-amber-700 font-semibold">⚠️ No Active Subscription</p>
                      <p className="text-xs text-amber-600 mt-1">This account has no recorded load transactions. Please contact Descallar Satellite Services.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
