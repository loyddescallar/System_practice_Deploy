import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flag } from 'lucide-react';
import UserLayout from '../../components/UserLayout';
import ticketApi from '../../api/ticketApi';

const CATEGORIES=['Connection Issue','Technical Problem','Billing Concern','Channel Concern','Technician Request','Other'];

export default function UserReportProblem() {
  const navigate=useNavigate();
  const [form,setForm]=useState({category:'Connection Issue',subject:'',description:''});
  const [loading,setLoading]=useState(false); const [error,setError]=useState('');
  const hc=e=>setForm(p=>({...p,[e.target.name]:e.target.value}));
  const handleSubmit=async e=>{ e.preventDefault(); if(!form.subject.trim()){setError('Subject is required.');return;} setLoading(true);setError('');
    try{await ticketApi.createTicket({category:form.category,subject:form.subject.trim(),description:form.description.trim()});navigate('/user/tickets');}
    catch(e){setError(e.response?.data?.error||'Failed to submit. Please try again.');}finally{setLoading(false);}};
  return (
    <UserLayout>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6"><div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center"><Flag size={18} className="text-[#cc0000]"/></div><div><h1 className="text-xl font-bold text-gray-800">Report a Problem</h1><p className="text-xs text-gray-500 mt-0.5">File a support ticket and our team will assist you</p></div></div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          {error&&<div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-xl mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Category</label><select name="category" value={form.category} onChange={hc} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#cc0000] bg-white">{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Subject *</label><input name="subject" value={form.subject} onChange={hc} placeholder="Brief description of the issue" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#cc0000]"/></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Description</label><textarea name="description" value={form.description} onChange={hc} rows={5} placeholder="Provide more details about your problem..." className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#cc0000] resize-none"/></div>
            <button type="submit" disabled={loading} className="w-full bg-[#cc0000] hover:bg-red-700 text-white font-semibold py-3 rounded-xl disabled:opacity-60">{loading?'Submitting...':'Submit Ticket'}</button>
          </form>
        </div>
      </div>
    </UserLayout>
  );
}
