import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { boxModels } from '../../data/troubleshootData';
import UserLayout from '../../components/UserLayout';

export default function TroubleshootModel() {
  const { modelId } = useParams();
  const navigate = useNavigate();
  const model = boxModels.find(m => m.id === modelId);
  const [selectedIssue, setSelectedIssue] = useState(null);

  if (!model) return (
    <UserLayout>
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Box model not found.</p>
          <button onClick={() => navigate('/troubleshoot')} className="text-cignalRed hover:underline text-sm">← Back to Troubleshoot</button>
        </div>
      </div>
    </UserLayout>
  );

  const issue = model.issues.find(i => i.id === selectedIssue);

  return (
    <UserLayout>
      <div className="w-full bg-white min-h-screen px-4 sm:px-8 lg:px-20 py-10">
        {/* Back */}
        <button onClick={() => navigate('/troubleshoot')} className="text-cignalRed text-sm mb-4 block hover:underline">
          ← Back to Box Models
        </button>

        {/* Header */}
        <div className="flex items-center gap-6 mb-10">
          <div className="w-20 h-20 bg-red-50 rounded-xl border border-red-100 flex items-center justify-center flex-shrink-0">
            <img src={model.image} alt={model.name} className="w-16 h-16 object-contain"
              onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }}/>
            <span style={{display:'none'}} className="text-3xl">📺</span>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-red-600 tracking-tight">{model.name}</h1>
            <p className="text-gray-500 text-sm mt-1">{model.issues.length} troubleshooting guides</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT PANEL — Issue list */}
          <div className={`transition-all duration-700 ease-in-out ${selectedIssue?'lg:w-[40%]':'lg:w-[55%]'} w-full`}>
            <div className="space-y-4">
              {model.issues.map(iss => (
                <button key={iss.id} onClick={() => setSelectedIssue(iss.id === selectedIssue ? null : iss.id)}
                  className={`group flex items-center justify-between w-full px-7 py-7 rounded-2xl cursor-pointer relative overflow-hidden backdrop-blur-md bg-gradient-to-br from-gray-100/60 to-white/80 border border-gray-300 shadow-[0_4px_14px_rgba(0,0,0,0.08)] transition-all duration-500 ease-in-out text-left
                    ${selectedIssue===iss.id?'ring-2 ring-red-500 scale-[1.03] shadow-[0_6px_20px_rgba(255,0,0,0.25)]':'hover:scale-[1.02] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)]'}`}>
                  <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition duration-500 rounded-2xl"/>
                  <div className="flex flex-col text-left relative z-10">
                    <p className="text-xl font-bold text-gray-900">{iss.shortTitle}</p>
                    <p className="text-sm text-gray-600">{iss.description}</p>
                  </div>
                  <ChevronRight className={`text-gray-500 transition-transform duration-500 relative z-10 flex-shrink-0 ml-3 ${selectedIssue===iss.id?'rotate-90':''}`} size={22}/>
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT PANEL — Steps */}
          <div className={`transition-all duration-700 ease-in-out rounded-xl border border-gray-200 bg-white shadow-xl p-7 origin-right transform overflow-hidden
            ${selectedIssue?'lg:w-[55%] w-full opacity-100 translate-x-0 scale-100':'lg:w-0 w-full opacity-0 translate-x-10 scale-95 pointer-events-none'}`}>
            {issue && (
              <div>
                <button onClick={() => setSelectedIssue(null)} className="text-blue-600 text-sm mb-4 hover:underline">
                  ← Back to Issues
                </button>

                <h2 className="text-3xl font-bold text-gray-900 mb-6">{issue.shortTitle}</h2>

                {issue.sections.map((section, idx) => (
                  <div key={idx} className="mb-8">
                    <h3 className="text-xl font-semibold mb-3 text-gray-800">{section.title}</h3>
                    <ol className="list-decimal ml-6 space-y-2 text-gray-700 leading-relaxed">
                      {section.steps.map((step, i) => <li key={i}>{step}</li>)}
                    </ol>
                  </div>
                ))}

                <p className="text-gray-600 italic mb-6">{issue.note}</p>

                <div className="text-center mt-8">
                  <p className="text-gray-700 mb-3 font-medium">If issue persists, contact us for further assistance</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button onClick={() => navigate('/user/report-problem', { state:{ prefillSubject:`${model.name} — ${issue.shortTitle}` } })}
                      className="px-8 py-3 rounded-full font-bold text-white bg-gradient-to-r from-pink-600 to-red-600 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-300 text-sm">
                      📋 CONTACT SUPPORT
                    </button>
                    <button onClick={() => navigate('/user/technician-request')}
                      className="px-8 py-3 rounded-full font-bold text-white bg-slate-700 hover:bg-slate-800 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-sm">
                      🔧 REQUEST TECHNICIAN
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
