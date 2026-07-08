import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { boxModels } from '../../data/troubleshootData';
import UserLayout from '../../components/UserLayout';

export default function Troubleshoot() {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 50); }, []);

  return (
    <UserLayout>
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto p-6">
          <h1 className="text-3xl font-bold text-cignalRed mb-2">Troubleshoot Your Box</h1>
          <p className="text-slate-500 mb-8 text-sm">Select your Cignal box model to get step-by-step troubleshooting help.</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {boxModels.map((model, index) => (
              <div key={model.id} onClick={() => navigate(`/troubleshoot/${model.id}`)}
                className={`relative cursor-pointer rounded-2xl p-6 backdrop-blur-md bg-white/70 border border-gray-200 shadow-[0_4px_15px_rgba(0,0,0,0.08)] transition-all duration-500 ease-out transform hover:scale-[1.05] hover:shadow-[0_8px_25px_rgba(0,0,0,0.15)] hover:border-red-400 hover:bg-white/90 ${loaded?'opacity-100 translate-y-0':'opacity-0 translate-y-5'}`}
                style={{ transitionDelay:`${index * 80}ms` }}>
                <span className="absolute inset-0 rounded-2xl opacity-0 bg-gradient-to-br from-red-200/40 to-white/10 group-hover:opacity-100 transition duration-500"/>

                {/* Box image / placeholder */}
                <div className="w-full h-32 flex items-center justify-center mb-4 relative z-10">
                  <img src={model.image} alt={model.name} className="w-full h-32 object-contain"
                    onError={e => {
                      e.target.style.display='none';
                      e.target.nextSibling.style.display='flex';
                    }}/>
                  <div style={{display:'none'}} className="w-24 h-24 bg-red-50 rounded-2xl flex items-center justify-center">
                    <span className="text-4xl">📺</span>
                  </div>
                </div>

                <p className="font-semibold text-slate-800 relative z-10 text-lg">{model.name}</p>
                <p className="text-sm text-gray-500 mt-1 relative z-10">{model.issues.length} common issues</p>
                <p className="text-xs text-cignalRed font-semibold mt-2 relative z-10">View troubleshooting →</p>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
            <p className="text-gray-700 font-medium mb-3">Can't find a solution? Our support team is here to help.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => navigate('/user/report-problem')}
                className="px-6 py-3 rounded-full font-bold text-white bg-gradient-to-r from-pink-600 to-red-600 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-sm">
                📋 File a Support Ticket
              </button>
              <button onClick={() => navigate('/user/technician-request')}
                className="px-6 py-3 rounded-full font-bold text-white bg-slate-700 hover:bg-slate-800 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-sm">
                🔧 Request a Technician
              </button>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
