import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Satellite } from 'lucide-react';
import authApi from '../../api/authApi';

export default function AdminLogin() {
  const navigate=useNavigate();
  const [accountName,setAccountName]=useState(''); const [accountId,setAccountId]=useState('');
  const [loading,setLoading]=useState(false); const [error,setError]=useState('');

  const handleLogin=async e=>{ e.preventDefault(); if(!accountName.trim()||!accountId.trim()){setError('All fields are required.');return;} setLoading(true);setError('');
    try{const r=await authApi.login({accountName:accountName.trim(),accountId:accountId.trim()}); const {token,user}=r.data;
      if(user.role!=='admin'){setError('Access denied. Admin credentials required.');return;}
      localStorage.setItem('token',token); localStorage.setItem('adminUser',JSON.stringify(user)); localStorage.setItem('user',JSON.stringify(user)); navigate('/admin-dashboard');
    }catch(e){setError(e.response?.data?.error||'Invalid credentials.');}finally{setLoading(false);} };

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-[#cc0000] rounded-xl flex items-center justify-center"><Satellite size={24} className="text-white"/></div>
          <div><p className="text-xl font-bold text-white">CignalCare+</p><p className="text-gray-400 text-xs">Admin Portal · Descallar Satellite Services</p></div>
        </div>
        <div className="bg-[#161b22] rounded-2xl shadow-2xl p-8 border border-white/10">
          <div className="flex items-center gap-2 mb-6"><ShieldCheck size={18} className="text-[#cc0000]"/><h2 className="text-lg font-bold text-white">Admin Login</h2></div>
          {error&&<div className="bg-red-900/30 border border-red-800 text-red-400 text-xs px-4 py-3 rounded-xl mb-4">{error}</div>}
          <form onSubmit={handleLogin} className="space-y-4">
            <div><label className="block text-xs font-semibold text-gray-400 mb-1.5">ADMIN USERNAME</label><input value={accountName} onChange={e=>setAccountName(e.target.value)} placeholder="admin" className="w-full bg-[#0d1117] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#cc0000]"/></div>
            <div><label className="block text-xs font-semibold text-gray-400 mb-1.5">ADMIN ID / ACCOUNT NUMBER</label><input value={accountId} onChange={e=>setAccountId(e.target.value)} placeholder="admin" className="w-full bg-[#0d1117] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#cc0000]"/></div>
            <button type="submit" disabled={loading} className="w-full bg-[#cc0000] hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60">{loading?'Logging in...':'Login as Admin'}</button>
          </form>
          <button onClick={()=>navigate('/login')} className="w-full text-center mt-4 text-xs text-gray-500 hover:text-gray-300">← Back to User Login</button>
        </div>
      </div>
    </div>
  );
}
