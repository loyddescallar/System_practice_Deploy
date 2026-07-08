import { useState, useEffect } from 'react';
import { X, Tv } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

const CIGNAL_CHANNELS = { Entertainment:['GMA','ABS-CBN','TV5','ONE','GTV','A2Z','PTV','GMA Life TV'], News:['CNN Philippines','One News','GMA News TV','DZMM TeleRadyo'], Sports:['One Sports','ESPN5','Cignal Sports','Fox Sports Philippines'], Movies:['CineMo','Star Movies','Cinema One','Max (HBO)','Cinemax'], Kids:['Cartoon Network','Disney Channel','Nickelodeon','Nick Jr.'], Religious:['EWTN','CBN Asia','Net 25','SMNI'], Educational:['Discovery Channel','National Geographic','History Channel','AXN'], Music:['MTV','MYX','2nd Avenue'], Others:['Shop TV','Balls Channel','NBA TV'] };
const ALL_CATS = Object.keys(CIGNAL_CHANNELS);
const PLAN_CATS = { 'Load 200':['Entertainment','News','Religious'], 'Load 300':['Entertainment','News','Religious','Kids','Music'], 'Load 450':['Entertainment','News','Religious','Kids','Music','Educational'], 'Load 500':['Entertainment','News','Religious','Kids','Music','Educational','Sports'], 'Load 600':['Entertainment','News','Religious','Kids','Music','Educational','Sports','Movies'], 'Load 800':['Entertainment','News','Religious','Kids','Music','Educational','Sports','Movies','Others'], 'Load 1000':ALL_CATS };

export default function AdminPlans() {
  const [plans,setPlans]=useState([]); const [loading,setLoading]=useState(true); const [selectedPlan,setModal]=useState(null); const [channelCat,setCat]=useState('All');
  useEffect(()=>{ async function load(){setLoading(true);try{const r=await axiosClient.get('/load/plans');setPlans(r.data?.plans||[]);}catch{setPlans([]);}finally{setLoading(false);}};load(); },[]);

  const getPlanChannels=planName=>{ const cats=PLAN_CATS[planName]||ALL_CATS; const ch={}; cats.forEach(cat=>{ch[cat]=CIGNAL_CHANNELS[cat]||[];}); return ch; };
  const getFiltered=planName=>{ const all=getPlanChannels(planName); if(channelCat==='All')return all; return {[channelCat]:all[channelCat]||[]}; };
  const getTotal=planName=>Object.values(getPlanChannels(planName)).reduce((s,ch)=>s+ch.length,0);

  return (
    <div className="space-y-4">
      <div><h1 className="text-lg font-bold text-gray-800">Prepaid Plans</h1><p className="text-xs text-gray-500 mt-0.5">Available Cignal prepaid load packages — click a plan to view channels</p></div>
      <div className="grid grid-cols-3 gap-3">{[{label:'Total Plans',value:loading?'...':plans.length,color:'text-gray-800'},{label:'Active Plans',value:loading?'...':plans.filter(p=>p.status==='active').length,color:'text-green-600'},{label:'Inactive Plans',value:loading?'...':plans.filter(p=>p.status!=='active').length,color:'text-gray-400'}].map(s=><div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"><p className="text-xs text-gray-500 mb-2">{s.label}</p><p className={`text-2xl font-bold ${s.color}`}>{s.value}</p></div>)}</div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">All Plans <span className="text-gray-400 font-normal text-xs">(click to see channels)</span></h2>
        {loading?<div className="py-8 text-center text-xs text-gray-400">Loading plans...</div>:plans.length===0?<div className="py-8 text-center text-xs text-gray-400">No plans found. Run the SQL seed to add plans.</div>:(
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {plans.map(p=><button key={p.id} onClick={()=>{setModal(p);setCat('All');}} className={`text-left p-4 rounded-xl border transition-all hover:shadow-md hover:border-[#cc0000]/30 ${p.status==='active'?'border-gray-200 bg-white':'border-gray-100 bg-gray-50 opacity-60'}`}>
              <div className="flex items-start justify-between mb-2"><div><p className="text-sm font-bold text-gray-800">{p.plan_name}</p><p className="text-sm font-bold text-[#cc0000] mt-0.5">₱{Number(p.amount).toLocaleString()}</p></div><span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${p.status==='active'?'bg-green-100 text-green-700':'bg-gray-100 text-gray-500'}`}>{p.status}</span></div>
              <p className="text-xs text-gray-500 mb-1">{p.validity_days} days validity</p>
              {(p.hd_channels>0||p.sd_channels>0)&&<p className="text-gray-400" style={{fontSize:'10px'}}>{p.hd_channels} HD · {p.sd_channels} SD channels</p>}
              {p.benefits_text&&<p className="text-xs text-gray-400 mt-1.5 leading-relaxed">{p.benefits_text}</p>}
              <div className="mt-2 flex items-center gap-1 text-[#cc0000]"><Tv size={10}/><span style={{fontSize:'10px'}} className="font-semibold">{getTotal(p.plan_name)} channels included</span></div>
            </button>)}
          </div>
        )}
      </div>
      {selectedPlan&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-[#880000] to-[#cc0000] text-white flex-shrink-0">
              <div><h2 className="text-sm font-bold">{selectedPlan.plan_name} — Channel Lineup</h2><p className="text-xs text-white/80 mt-0.5">₱{Number(selectedPlan.amount).toLocaleString()} · {selectedPlan.validity_days} days · {getTotal(selectedPlan.plan_name)} channels</p></div>
              <button onClick={()=>setModal(null)} className="p-1 rounded-xl hover:bg-white/20"><X size={18}/></button>
            </div>
            <div className="px-5 py-3 border-b border-gray-100 flex gap-1.5 flex-wrap flex-shrink-0">
              {['All',...Object.keys(getPlanChannels(selectedPlan.plan_name))].map(cat=><button key={cat} onClick={()=>setCat(cat)} className={`text-xs px-3 py-1 rounded-xl font-medium transition-colors ${channelCat===cat?'bg-[#cc0000] text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{cat}</button>)}
            </div>
            <div className="p-5 overflow-y-auto">
              {Object.entries(getFiltered(selectedPlan.plan_name)).map(([cat,channels])=>(
                <div key={cat} className="mb-4"><p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">{cat}</p>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">{channels.map(ch=><div key={ch} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2"><div className="w-6 h-6 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0"><Tv size={10} className="text-[#cc0000]"/></div><p className="text-xs text-gray-700 font-medium">{ch}</p></div>)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
