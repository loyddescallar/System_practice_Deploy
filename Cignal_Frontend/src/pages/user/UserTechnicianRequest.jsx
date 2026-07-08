import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, X, Wrench, Info, Upload } from 'lucide-react';
import UserLayout from '../../components/UserLayout';
import axiosClient from '../../api/axiosClient';

const URGENCY  = ['Normal','Urgent','Emergency'];
const SERVICES = ['Signal / Dish Repair','Dish Realignment','Cable Replacement','Box Replacement','New Installation','Relocation','Other'];

export default function UserTechnicianRequest() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    contactName:     user.accountName || '',
    contactPhone:    user.phone || '',
    altContact:      '',
    address:         user.address || '',
    landmark:        '',
    serviceType:     'Signal / Dish Repair',
    urgency:         'Normal',
    preferredDate:   '',
    preferredTime:   '',
    issueDescription:'',
  });
  const [files,   setFiles]   = useState([]);
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const hc = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const addFiles = e => {
    const newFiles = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  const removeFile = i => setFiles(prev => prev.filter((_, idx) => idx !== i));
  const formatSize = bytes => bytes > 1024*1024 ? (bytes/1024/1024).toFixed(1)+'MB' : (bytes/1024).toFixed(0)+'KB';

  const validate = () => {
    const e = {};
    if (!form.contactName.trim())      e.contactName      = 'Full name is required.';
    if (!form.contactPhone.trim())     e.contactPhone     = 'Phone number is required.';
    if (!form.address.trim())          e.address          = 'Service address is required.';
    if (!form.issueDescription.trim()) e.issueDescription = 'Issue description is required.';
    return e;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate(); setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);
    try {
      await axiosClient.post('/technicians/requests', {
        accountNumber:    user.accountNumber || '',
        contactName:      form.contactName.trim(),
        contactPhone:     form.contactPhone.trim(),
        issueDescription: `[${form.urgency}] [${form.serviceType}] ${form.issueDescription.trim()}${form.altContact?` | Alt: ${form.altContact}`:''}${form.landmark?` | Landmark: ${form.landmark}`:''}`,
        preferred_date:   form.preferredDate || null,
        preferred_time:   form.preferredTime || null,
      });
      setSuccess(true);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const urgencyColor = { Normal:'bg-green-600', Urgent:'bg-amber-500', Emergency:'bg-red-600' };

  return (
    <UserLayout>
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center"><Wrench size={18} className="text-[#cc0000]"/></div>
          <div><h1 className="text-xl font-bold text-gray-800">Request Technician</h1><p className="text-xs text-gray-500 mt-0.5">Schedule a technician visit for your Cignal TV</p></div>
        </div>

        {/* Tip Banner */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-start gap-2 mb-4">
          <Info size={14} className="text-blue-500 flex-shrink-0 mt-0.5"/>
          <p className="text-xs text-blue-700 leading-relaxed">Our technician will contact you to confirm the schedule. Make sure your phone is reachable. Service is available Mon–Sat, 8AM–5PM.</p>
        </div>

        {/* Error Summary */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
            <p className="text-xs font-semibold text-red-700 mb-1">Please fix the following errors:</p>
            {Object.values(errors).map((e,i) => <p key={i} className="text-xs text-red-600">• {e}</p>)}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Section 1: Account & Contact */}
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Account & Contact</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name *</label>
                  <input name="contactName" value={form.contactName} onChange={hc} className={`w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-[#cc0000] ${errors.contactName?'border-red-400':'border-gray-200'}`}/>
                  {errors.contactName && <p className="text-xs text-red-600 mt-1">{errors.contactName}</p>}
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone Number *</label>
                  <input name="contactPhone" value={form.contactPhone} onChange={hc} placeholder="09XXXXXXXXX" className={`w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-[#cc0000] ${errors.contactPhone?'border-red-400':'border-gray-200'}`}/>
                  {errors.contactPhone && <p className="text-xs text-red-600 mt-1">{errors.contactPhone}</p>}
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Alternative Contact Number <span className="font-normal text-gray-400">(optional)</span></label>
                  <input name="altContact" value={form.altContact} onChange={hc} placeholder="09XXXXXXXXX" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#cc0000]"/>
                </div>
              </div>
            </div>

            {/* Section 2: Location */}
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Location</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Complete Service Address *</label>
                  <input name="address" value={form.address} onChange={hc} placeholder="House No., Street, Barangay, Municipality" className={`w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-[#cc0000] ${errors.address?'border-red-400':'border-gray-200'}`}/>
                  {errors.address && <p className="text-xs text-red-600 mt-1">{errors.address}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Landmark / Directions <span className="font-normal text-gray-400">(optional)</span></label>
                  <input name="landmark" value={form.landmark} onChange={hc} placeholder="e.g. Near the church, beside the blue gate" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#cc0000]"/>
                </div>
              </div>
            </div>

            {/* Section 3: Service Details */}
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Service Details</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Type of Service</label>
                  <select name="serviceType" value={form.serviceType} onChange={hc} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#cc0000] bg-white">
                    {SERVICES.map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">Urgency Level</label>
                  <div className="flex gap-2">{URGENCY.map(u=><button key={u} type="button" onClick={()=>setForm(p=>({...p,urgency:u}))} className={`flex-1 py-2.5 rounded-xl text-xs font-bold border-2 transition-colors ${form.urgency===u?`${urgencyColor[u]} text-white border-transparent`:'border-gray-200 text-gray-600 hover:border-gray-300'}`}>{u}</button>)}</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Preferred Date</label>
                    <input type="date" name="preferredDate" value={form.preferredDate} onChange={hc} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#cc0000]"/>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Preferred Time</label>
                    <input type="time" name="preferredTime" value={form.preferredTime} onChange={hc} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#cc0000]"/>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Issue Description *</label>
                  <textarea name="issueDescription" value={form.issueDescription} onChange={hc} rows={4} placeholder="Please describe the problem in detail. What have you already tried? When did it start?" className={`w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-[#cc0000] resize-none ${errors.issueDescription?'border-red-400':'border-gray-200'}`}/>
                  {errors.issueDescription && <p className="text-xs text-red-600 mt-1">{errors.issueDescription}</p>}
                </div>
              </div>
            </div>

            {/* Section 4: Attachments */}
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Attachments <span className="font-normal">(optional)</span></p>
              <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={addFiles}/>
              <button type="button" onClick={()=>fileInputRef.current?.click()} className="flex items-center gap-2 border-2 border-dashed border-gray-200 rounded-xl px-4 py-3 w-full text-sm text-gray-500 hover:border-[#cc0000] hover:text-[#cc0000] transition-colors">
                <Upload size={16}/> Attach photos or videos of the issue
              </button>
              {files.length > 0 && (
                <div className="mt-2 space-y-2">
                  {files.map((f,i)=>(
                    <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${f.type.startsWith('image')?'bg-blue-100 text-blue-700':'bg-purple-100 text-purple-700'}`}>{f.type.startsWith('image')?'Image':'Video'}</span>
                      <span className="flex-1 text-xs text-gray-700 truncate">{f.name}</span>
                      <span className="text-xs text-gray-400">{formatSize(f.size)}</span>
                      <button type="button" onClick={()=>removeFile(i)} className="text-gray-400 hover:text-red-500"><X size={14}/></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} className="w-full bg-[#cc0000] hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-60 text-sm">
              {loading ? 'Submitting...' : 'Submit Technician Request'}
            </button>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle2 size={32} className="text-green-600"/></div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Request Submitted!</h2>
            <p className="text-sm text-gray-500 mb-6">Your technician request has been received. Our team will contact you at <strong>{form.contactPhone}</strong> to confirm the schedule.</p>
            <div className="flex flex-col gap-2">
              <button onClick={()=>navigate('/user/tickets')} className="w-full bg-[#cc0000] hover:bg-red-700 text-white font-semibold py-3 rounded-xl">View My Tickets</button>
              <button onClick={()=>{setSuccess(false);setForm({contactName:user.accountName||'',contactPhone:user.phone||'',altContact:'',address:user.address||'',landmark:'',serviceType:'Signal / Dish Repair',urgency:'Normal',preferredDate:'',preferredTime:'',issueDescription:''});setFiles([]);}} className="w-full border border-gray-200 py-3 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Submit Another Request</button>
            </div>
          </div>
        </div>
      )}
    </UserLayout>
  );
}
