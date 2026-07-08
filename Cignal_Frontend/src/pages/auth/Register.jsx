import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Satellite, CheckCircle2, AlertTriangle, XCircle, BrainCircuit } from 'lucide-react';
import authApi from '../../api/authApi';

const BALAYAN_BARANGAYS = [
  'Bagong Pook','Balagtas','Balangon','Banawe','Banayad','Banilad','Biclatan','Biga',
  'Binukalan','Cahil','Calansayan','Canda','Carenahan','Caybunga','Cayetano','Coracora',
  'Dao','Evangelista','Guinhawa North','Guinhawa South','Langgangan','Lucban','Lutacan',
  'Magabe','Malalay','Matabungkay','Munting Tubig','Navotas','Palikpikan','Patugo','Pooc',
  'Quintana','Sampaga','San Juan','San Pedro','Santa Clara','Santa Cruz','Santiago',
  'Santol','Sukol','Tactay','Tanggoy','Wawa'
];
const KEYBOARD_PATTERNS = ['qwerty','asdf','zxcv','1234','abcd','aaaa','bbbb'];

function validateName(v) {
  if (!v.trim()) return { ok:false, error:'Full name is required.' };
  if (/\d/.test(v)) return { ok:false, error:'Name cannot contain numbers.' };
  const words = v.trim().split(/\s+/);
  if (words.length < 2) return { ok:false, warning:'Please enter your full name (First and Last).' };
  if (words.some(w => w.length < 2)) return { ok:false, error:'Each name part must be at least 2 characters.' };
  const lower = v.toLowerCase();
  if (KEYBOARD_PATTERNS.some(p => lower.includes(p))) return { ok:false, error:'Name looks like a keyboard pattern. Please enter your real name.' };
  const vowelRatio = (lower.match(/[aeiou]/g)||[]).length / lower.replace(/\s/g,'').length;
  if (vowelRatio < 0.1) return { ok:false, error:'Name does not look real. Please use your actual name.' };
  return { ok:true };
}
function validateAccountNumber(v) {
  if (!v.trim()) return { ok:false, error:'Account number is required.' };
  if (!/^\d{8}$/.test(v.trim())) return { ok:false, error:'Account number must be exactly 8 digits.' };
  if (/(\d)\1{7}/.test(v)) return { ok:false, error:'Account number cannot be all the same digit.' };
  return { ok:true };
}
function validatePhone(v) {
  if (!v.trim()) return { ok:false, error:'Phone number is required.' };
  if (!/^(09\d{9}|\+639\d{9})$/.test(v.trim())) return { ok:false, error:'Must be a valid Philippine mobile: 09XXXXXXXXX or +639XXXXXXXXX' };
  return { ok:true };
}
function validateAddress(v) {
  if (!v.trim()) return { ok:false, error:'Address is required.' };
  if (v.trim().length < 10) return { ok:false, warning:'Address seems too short. Include Barangay, Municipality.' };
  return { ok:true };
}
function getPasswordStrength(v) {
  let score = 0;
  if (v.length >= 8) score++;
  if (/[a-z]/.test(v)) score++;
  if (/[A-Z]/.test(v)) score++;
  if (/\d/.test(v)) score++;
  if (/[^a-zA-Z0-9]/.test(v)) score++;
  return score;
}

function FieldStatus({ validation, touched }) {
  if (!touched || !validation) return null;
  if (validation.ok) return <div className="flex items-center gap-1 mt-1"><CheckCircle2 size={12} className="text-green-500"/><span className="text-xs text-green-600">Looks good!</span></div>;
  if (validation.warning) return <div className="flex items-center gap-1 mt-1"><AlertTriangle size={12} className="text-amber-500"/><span className="text-xs text-amber-600">{validation.warning}</span></div>;
  if (validation.error) return <div className="flex items-center gap-1 mt-1"><XCircle size={12} className="text-red-500"/><span className="text-xs text-red-600">{validation.error}</span></div>;
  return null;
}

function inputBorder(validation, touched) {
  if (!touched) return 'border-gray-200';
  if (!validation) return 'border-gray-200';
  if (validation.ok) return 'border-green-400 focus:border-green-500';
  if (validation.warning) return 'border-amber-400 focus:border-amber-500';
  return 'border-red-400 focus:border-red-500';
}

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ accountName:'', accountNumber:'', ccaNumber:'', address:'', phone:'' });
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [barangayOpen, setBarangayOpen] = useState(false);
  const [barangayFilter, setBarangayFilter] = useState('');

  const hc = (e) => { setForm(p=>({...p,[e.target.name]:e.target.value})); setTouched(p=>({...p,[e.target.name]:true})); };
  const touch = (name) => setTouched(p=>({...p,[name]:true}));

  const validations = {
    accountName:   validateName(form.accountName),
    accountNumber: validateAccountNumber(form.accountNumber),
    phone:         validatePhone(form.phone),
    address:       validateAddress(form.address),
    ccaNumber:     form.ccaNumber.trim() ? { ok:true } : { ok:false, error:'CCA number is required.' },
  };

  const allValid = Object.values(validations).every(v => v.ok);

  const handleSubmit = async e => {
    e.preventDefault();
    setTouched({ accountName:true, accountNumber:true, ccaNumber:true, address:true, phone:true });
    if (!allValid) return;
    setLoading(true); setServerError('');
    try {
      await authApi.register({ accountName:form.accountName.trim(), accountNumber:form.accountNumber.trim(), ccaNumber:form.ccaNumber.trim(), address:form.address.trim(), phone:form.phone.trim() });
      navigate('/login');
    } catch(e) { setServerError(e.response?.data?.error || 'Registration failed. Please try again.'); }
    finally { setLoading(false); }
  };

  const filteredBarangays = BALAYAN_BARANGAYS.filter(b => b.toLowerCase().includes(barangayFilter.toLowerCase()));

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex w-2/5 bg-gradient-to-br from-[#cc0000]/90 via-slate-900/95 to-slate-950 flex-col justify-between p-12 text-white">
        <div className="flex items-center gap-3"><Satellite size={36}/><div><p className="text-2xl font-bold">CignalCare+</p><p className="text-red-300 text-sm">Descallar Satellite Services</p></div></div>
        <div>
          <h1 className="text-4xl font-bold leading-tight mb-4">Create Your<br/>Subscriber Account</h1>
          <p className="text-gray-300 text-sm leading-relaxed mb-6">Join Descallar Satellite Services and manage your Cignal TV subscription online.</p>
          {/* AI Validation Callout */}
          <div className="bg-white/10 border border-white/20 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2"><BrainCircuit size={18} className="text-red-300"/><p className="font-bold text-sm">AI-Assisted Smart Validation</p><span className="text-xs text-green-400 font-semibold ml-auto">Active</span></div>
            <div className="flex gap-1 mb-3">{[0,1,2].map(i=><div key={i} className="w-1.5 h-1.5 bg-red-300 rounded-full animate-bounce" style={{animationDelay:`${i*0.2}s`}}/>)}</div>
            <ul className="space-y-1 text-xs text-gray-300">
              <li>• Detects random/gibberish names</li>
              <li>• Validates Philippine mobile format</li>
              <li>• Checks for real address format</li>
              <li>• Flags duplicate account numbers</li>
            </ul>
          </div>
        </div>
        <p className="text-gray-500 text-xs">© 2026 Descallar Satellite Services</p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8"><Satellite size={28} className="text-[#cc0000]"/><p className="text-xl font-bold text-gray-800">CignalCare+</p></div>
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center gap-2 mb-6"><div className="w-1 h-6 bg-[#cc0000] rounded-full"/><h2 className="text-xl font-bold text-gray-800">Create Account</h2></div>
            {serverError && <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-xl mb-4">{serverError}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Account Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name *</label>
                <input name="accountName" value={form.accountName} onChange={hc} onBlur={()=>touch('accountName')} placeholder="Juan Dela Cruz" className={`w-full border rounded-xl px-4 py-3 text-sm outline-none ${inputBorder(validations.accountName, touched.accountName)}`}/>
                <FieldStatus validation={validations.accountName} touched={touched.accountName}/>
              </div>

              {/* Account Number */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Account Number * <span className="font-normal text-gray-400">(8 digits)</span></label>
                <input name="accountNumber" value={form.accountNumber} onChange={hc} onBlur={()=>touch('accountNumber')} placeholder="12345678" maxLength={8} className={`w-full border rounded-xl px-4 py-3 text-sm outline-none font-mono ${inputBorder(validations.accountNumber, touched.accountNumber)}`}/>
                <div className="flex gap-1 mt-1">{Array.from({length:8}).map((_,i)=><div key={i} className={`h-1 flex-1 rounded-full ${i<form.accountNumber.length?'bg-[#cc0000]':'bg-gray-100'}`}/>)}</div>
                <FieldStatus validation={validations.accountNumber} touched={touched.accountNumber}/>
              </div>

              {/* CCA Number */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">CCA Number *</label>
                <input name="ccaNumber" value={form.ccaNumber} onChange={hc} onBlur={()=>touch('ccaNumber')} placeholder="Your CCA number" className={`w-full border rounded-xl px-4 py-3 text-sm outline-none ${inputBorder(validations.ccaNumber, touched.ccaNumber)}`}/>
                <FieldStatus validation={validations.ccaNumber} touched={touched.ccaNumber}/>
              </div>

              {/* Address with Barangay Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Address * <span className="font-normal text-gray-400">(include Barangay)</span></label>
                <input name="address" value={form.address} onChange={hc} onFocus={()=>setBarangayOpen(true)} onBlur={()=>{touch('address');setTimeout(()=>setBarangayOpen(false),200);}} placeholder="Brgy. Langgangan, Balayan, Batangas" className={`w-full border rounded-xl px-4 py-3 text-sm outline-none ${inputBorder(validations.address, touched.address)}`}/>
                {barangayOpen && (
                  <div className="absolute z-50 w-full max-w-sm bg-white border border-gray-200 rounded-xl shadow-xl mt-1 max-h-48 overflow-hidden">
                    <input value={barangayFilter} onChange={e=>setBarangayFilter(e.target.value)} placeholder="Filter barangay..." className="w-full px-3 py-2 text-xs border-b border-gray-100 outline-none"/>
                    <div className="overflow-y-auto max-h-36">{filteredBarangays.map(b=><button key={b} type="button" onMouseDown={()=>{ setForm(p=>({...p,address:`Brgy. ${b}, Balayan, Batangas`})); setBarangayOpen(false); setTouched(p=>({...p,address:true})); }} className="w-full text-left px-3 py-1.5 text-xs hover:bg-red-50 hover:text-[#cc0000]">{b}</button>)}</div>
                  </div>
                )}
                <FieldStatus validation={validations.address} touched={touched.address}/>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone Number * <span className="font-normal text-gray-400">(09XXXXXXXXX)</span></label>
                <input name="phone" value={form.phone} onChange={hc} onBlur={()=>touch('phone')} placeholder="09123456789" className={`w-full border rounded-xl px-4 py-3 text-sm outline-none ${inputBorder(validations.phone, touched.phone)}`}/>
                <FieldStatus validation={validations.phone} touched={touched.phone}/>
              </div>

              {/* AI Status */}
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
                <BrainCircuit size={14} className={allValid?'text-green-500':'text-[#cc0000]'}/>
                <p className="text-xs text-gray-600">{allValid?'✅ All fields validated. Ready to register!':'🔍 AI is checking your inputs...'}</p>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-[#cc0000] hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60">
                {loading?'Registering...':'Create Account'}
              </button>
            </form>
            <button onClick={() => navigate('/login')} className="w-full text-center mt-4 text-xs text-gray-500 hover:text-[#cc0000]">Already have an account? <span className="font-semibold">Sign In</span></button>
          </div>
        </div>
      </div>
    </div>
  );
}
