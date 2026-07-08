import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tv, CreditCard, ReceiptText, CheckCircle2, ArrowLeft, Copy, Check, X, Signal, AlertTriangle } from 'lucide-react';
import { prepaidPlans } from '../../data/prepaidPlans';
import { createLoadRequest } from '../../api/loadRequestApi';

// Use real plan data from prepaidPlans
const PLANS = Object.values(prepaidPlans).map(p => ({
  id: p.id,
  name: p.name,
  amount: p.amount,
  duration: '30 days',
  description: p.description,
  channels: p.channels?.length || 0,
  channelData: p.channels || [],
}));

const ERROR_CARDS = [
  { id:'no_signal',   label:'No Signal',        desc:'Black or blank screen',      fixable:true,  icon:'📡' },
  { id:'weak_signal', label:'Weak Signal',       desc:'Pixelated or freezing image', fixable:true,  icon:'📶' },
  { id:'smartcard',   label:'Smartcard Error',   desc:'E4/E5 error code shown',     fixable:true,  icon:'💳' },
  { id:'subscribe',   label:'Please Subscribe',  desc:'Subscription has expired',    fixable:false, icon:'📺' },
  { id:'unknown',     label:'Something Else',    desc:'Other / unknown issue',       fixable:true,  icon:'❓' },
];

const CHANNEL_CATEGORIES = ['All','Entertainment','Movies','News','Sports','Kids','Educational','Religious','Shopping','Radio','Others'];
const ACCOUNT = { name:'Descallar Satellite Services', number:'09755718056' };

// Helper to convert File to base64
async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = e => resolve(e.target.result);
    reader.onerror = e => reject(e);
    reader.readAsDataURL(file);
  });
}

const STEP_LABELS = [
  { num:1, label:'Signal Check',  icon:'📡' },
  { num:2, label:'Pick a Plan',   icon:'📺' },
  { num:3, label:'Payment',       icon:'💳' },
  { num:4, label:'Submit Proof',  icon:'🧾' },
];

export default function UserLoadRequest() {
  const navigate = useNavigate();

  // Step: 1 | '1b' | 2 | 3 | 4 | 5
  const [step,          setStep]          = useState(1);
  const [lang,          setLang]          = useState('en');
  const [showWarning,   setShowWarning]   = useState(false);
  const [screenFile,    setScreenFile]    = useState(null);  // actual File object
  const [selectedError, setSelectedError] = useState(null);
  const [selectedPlan,  setSelectedPlan]  = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [channelModal,  setChannelModal]  = useState(null);
  const [channelCat,    setChannelCat]    = useState('All');
  const [receiptFile,   setReceiptFile]   = useState(null);  // actual File object
  const [referenceNo,   setRefNo]         = useState('');
  const [adminNote,     setAdminNote]     = useState('');
  const [copied,        setCopied]        = useState('');
  const [submitting,    setSubmitting]    = useState(false);
  const [submitError,   setSubmitError]   = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Progress bar — treat '1b' as between step 1 and 2
  const stepProgress = step === 5 ? 4 : step === '1b' ? 1 : typeof step === 'number' ? step : 1;

  const copyText = (text, key) => {
    navigator.clipboard.writeText(text).then(() => { setCopied(key); setTimeout(() => setCopied(''), 2000); });
  };

  const handleSubmit = async () => {
    if (!selectedPlan || !paymentMethod || !referenceNo.trim()) {
      setSubmitError('Please fill in all required fields (plan, payment method, reference number).');
      return;
    }
    setSubmitting(true); setSubmitError('');
    try {
      // Convert files to base64
      const receiptBase64 = receiptFile ? await fileToBase64(receiptFile) : null;
      const screenBase64  = screenFile  ? await fileToBase64(screenFile)  : null;

      await createLoadRequest({
        account_number:    user.accountNumber || '',
        account_name:      user.accountName   || '',
        plan_name:         selectedPlan.name,
        amount:            selectedPlan.amount,
        payment_method:    paymentMethod,
        reference_no:      referenceNo.trim(),
        receipt_photo:     receiptBase64,
        screen_photo:      screenBase64,
        diagnostic_result: selectedError?.id  || null,
        location:          user.location      || 'Balayan',
      });

      setStep(5);
    } catch(e) {
      console.error(e);
      setSubmitError(e.response?.data?.error || 'Failed to submit. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredChannels = channelModal
    ? (channelCat === 'All' ? channelModal.channelData : channelModal.channelData.filter(ch => ch.category === channelCat))
    : [];

  const T = {
    en: {
      title: 'Remote Prepaid Loading',
      sub: 'Reload your Cignal account from home',
      signalQ: 'Does Channel 1 on your TV have a picture right now?',
      signalSub: 'Check Channel 1 before proceeding with your load request.',
      yesBtn: '✅ Yes, Channel 1 has a picture',
      noBtn: '❌ No, Channel 1 has no picture',
      warnTitle: 'Important Notice',
      warnBody: 'All load requests are non-refundable once processed. Make sure your details are correct before submitting.',
      warnProceed: 'Proceed to Reload',
      warnBack: 'Go Back',
      whatScreen: 'What does your TV screen show?',
      diagSub: 'Select the option that best describes what you see.',
      proceedPlan: 'Proceed to Plan Selection →',
      techBtn: 'Request a Technician →',
      planTitle: 'Select Your Plan',
      planSub: 'Click a plan to view included channels.',
      viewChannels: 'View channels →',
      selectPlan: 'Select This Plan →',
      payTitle: 'Payment Method',
      paidBtn: "I've Paid — Continue →",
      submitTitle: 'Submit Payment Proof',
      receiptLabel: 'Receipt Photo *',
      receiptUpload: 'Click to upload receipt photo',
      refLabel: 'Reference Number *',
      refPlaceholder: 'Enter GCash/Maya reference number',
      noteLabel: 'Admin Note (optional)',
      submitBtn: 'Submit Load Request →',
      successTitle: 'Request Submitted!',
      successMsg: 'Your load request has been received. Our team will process it and update you shortly.',
    },
    fil: {
      title: 'Remote Prepaid Loading',
      sub: 'Mag-reload ng iyong Cignal account mula sa bahay',
      signalQ: 'May larawan ba sa Channel 1 ng iyong TV ngayon?',
      signalSub: 'Suriin ang Channel 1 bago mag-request ng load.',
      yesBtn: '✅ Oo, may larawan sa Channel 1',
      noBtn: '❌ Wala, walang larawan sa Channel 1',
      warnTitle: 'Mahalagang Paunawa',
      warnBody: 'Lahat ng load request ay hindi na maisasauli kapag naiproseso na. Siguraduhing tama ang iyong mga detalye.',
      warnProceed: 'Magpatuloy sa Pag-reload',
      warnBack: 'Bumalik',
      whatScreen: 'Ano ang nakikita sa screen ng iyong TV?',
      diagSub: 'Piliin ang pinakamalapitang paglalarawan sa iyong sitwasyon.',
      proceedPlan: 'Pumili ng Plan →',
      techBtn: 'Humiling ng Technician →',
      planTitle: 'Pumili ng Plan',
      planSub: 'I-click ang plan para makita ang mga channels.',
      viewChannels: 'Tingnan ang channels →',
      selectPlan: 'Piliin ang Plan na Ito →',
      payTitle: 'Paraan ng Bayad',
      paidBtn: 'Nagbayad na Ako — Magpatuloy →',
      submitTitle: 'I-submit ang Patunay ng Bayad',
      receiptLabel: 'Larawan ng Resibo *',
      receiptUpload: 'I-click para mag-upload ng resibo',
      refLabel: 'Reference Number *',
      refPlaceholder: 'Ilagay ang reference number ng GCash/Maya',
      noteLabel: 'Tandaan para sa Admin (opsyonal)',
      submitBtn: 'I-submit ang Load Request →',
      successTitle: 'Na-submit na ang Request!',
      successMsg: 'Natanggap na ang iyong load request. Ipoproseso ito ng aming team at aabisuhan ka.',
    },
  }[lang];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-gradient-to-r from-[#880000] to-[#cc0000] text-white px-4 py-5">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => navigate('/user-dashboard')} className="flex items-center gap-1 text-white/80 hover:text-white text-sm">
              <ArrowLeft size={16}/> Back
            </button>
            <div className="flex gap-1">
              {['en','fil'].map(l => (
                <button key={l} onClick={() => setLang(l)} className={`text-xs px-2.5 py-1 rounded-lg font-semibold ${lang===l?'bg-white text-[#cc0000]':'text-white/70 hover:text-white'}`}>
                  {l==='en'?'ENG':'FIL'}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Signal size={28}/>
            <div>
              <h1 className="text-lg font-bold">{T.title}</h1>
              <p className="text-white/80 text-xs">{T.sub}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {step !== 5 && (
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-xl mx-auto flex items-center gap-2">
            {STEP_LABELS.map((s, i) => {
              const done   = stepProgress > s.num;
              const active = stepProgress === s.num;
              return (
                <div key={i} className="flex items-center flex-1">
                  <div className={`flex items-center gap-1.5 ${active?'text-[#cc0000]':done?'text-green-600':'text-gray-300'}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${active?'bg-[#cc0000] text-white':done?'bg-green-500 text-white':'bg-gray-100 text-gray-400'}`}>
                      {done ? '✓' : s.num}
                    </div>
                    <span className="text-xs font-medium hidden sm:block">{s.label}</span>
                  </div>
                  {i < STEP_LABELS.length-1 && <div className={`flex-1 h-0.5 mx-2 ${stepProgress > s.num ? 'bg-green-500':'bg-gray-200'}`}/>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="max-w-xl mx-auto px-4 py-6">

        {/* ── STEP 1: Signal Check ── */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-bold text-gray-800 mb-2">{T.signalQ}</h2>
            <p className="text-xs text-gray-500 mb-5">{T.signalSub}</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => setShowWarning(true)}
                className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-4 rounded-xl font-bold text-sm hover:from-green-700 hover:to-green-600 transition-all">
                {T.yesBtn}
              </button>
              <button onClick={() => setStep('1b')}
                className="w-full bg-gradient-to-r from-[#cc0000] to-[#880000] text-white py-4 rounded-xl font-bold text-sm hover:opacity-90 transition-all">
                {T.noBtn}
              </button>
            </div>
            {showWarning && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <AlertTriangle size={24} className="text-amber-500 flex-shrink-0"/>
                    <div>
                      <h3 className="font-bold text-gray-800 mb-1">{T.warnTitle}</h3>
                      <p className="text-xs text-gray-600 leading-relaxed">{T.warnBody}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setShowWarning(false); setStep(2); }} className="flex-1 bg-[#cc0000] text-white py-2.5 rounded-xl text-sm font-semibold">{T.warnProceed}</button>
                    <button onClick={() => setShowWarning(false)} className="flex-1 border border-gray-200 py-2.5 rounded-xl text-sm text-gray-600">{T.warnBack}</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 1b: Screen Diagnosis ── */}
        {step === '1b' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-base font-bold text-gray-800 mb-1">{T.whatScreen}</h2>
              <p className="text-xs text-gray-500 mb-4">{T.diagSub}</p>
              <div className="grid grid-cols-1 gap-2">
                {ERROR_CARDS.map(card => (
                  <div key={card.id} onClick={() => setSelectedError(card)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedError?.id===card.id?'border-[#cc0000] bg-red-50':'border-gray-100 hover:border-gray-200'}`}>
                    <span className="text-2xl flex-shrink-0">{card.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">{card.label}</p>
                      <p className="text-xs text-gray-500">{card.desc}</p>
                    </div>
                    {selectedError?.id === card.id && <CheckCircle2 size={18} className="text-[#cc0000] flex-shrink-0"/>}
                  </div>
                ))}
              </div>

              {/* Optional: upload screen photo */}
              {selectedError && (
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <p className="text-xs font-semibold text-gray-600 mb-2">Upload TV screen photo (optional)</p>
                  {screenFile ? (
                    <div className="relative">
                      <img src={URL.createObjectURL(screenFile)} alt="Screen" className="w-full max-h-32 object-contain rounded-xl border border-gray-200"/>
                      <button onClick={() => setScreenFile(null)} className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1"><X size={12}/></button>
                    </div>
                  ) : (
                    <label className="flex items-center gap-2 border border-dashed border-gray-300 rounded-xl px-3 py-2 cursor-pointer hover:border-[#cc0000] text-xs text-gray-500">
                      <span>📷</span> Click to take or upload a photo of your screen
                      <input type="file" accept="image/*" capture="environment" className="hidden" onChange={e => setScreenFile(e.target.files[0])}/>
                    </label>
                  )}
                </div>
              )}

              {selectedError && (
                <div className="mt-4">
                  {selectedError.fixable ? (
                    <button onClick={() => setStep(2)} className="w-full bg-[#cc0000] text-white py-3 rounded-xl font-bold text-sm">{T.proceedPlan}</button>
                  ) : (
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center">
                      <p className="text-xs text-amber-700 mb-2">This issue may need a technician to fix before reloading.</p>
                      <button onClick={() => navigate('/user/technician-request')} className="text-xs text-[#cc0000] font-semibold hover:underline">{T.techBtn}</button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <button onClick={() => setStep(1)} className="text-xs text-gray-500 hover:text-[#cc0000]">← Back to Signal Check</button>
          </div>
        )}

        {/* ── STEP 2: Plan Selection ── */}
        {step === 2 && (
          <div className="space-y-3">
            <h2 className="text-base font-bold text-gray-800">{T.planTitle}</h2>
            <p className="text-xs text-gray-500">{T.planSub}</p>
            <div className="grid grid-cols-1 gap-3">
              {PLANS.map(p => (
                <div key={p.id} onClick={() => setSelectedPlan(p)}
                  className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition-all hover:shadow-md ${selectedPlan?.id===p.id?'border-[#cc0000] bg-red-50':'border-gray-100'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-bold text-gray-800">{p.name}</p>
                    <div className="flex items-center gap-2">
                      <button onClick={e=>{e.stopPropagation();setChannelModal(p);setChannelCat('All');}} className="text-xs text-[#cc0000] hover:underline">{T.viewChannels}</button>
                      {selectedPlan?.id===p.id && <CheckCircle2 size={18} className="text-[#cc0000]"/>}
                    </div>
                  </div>
                  <p className="text-xl font-bold text-[#cc0000]">₱{p.amount.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{p.duration} · {p.channels} channels</p>
                  <p className="text-xs text-gray-400 mt-0.5">{p.description}</p>
                </div>
              ))}
            </div>
            {selectedPlan && (
              <button onClick={() => setStep(3)} className="w-full bg-[#cc0000] hover:bg-red-700 text-white py-3 rounded-xl font-bold text-sm">
                {T.selectPlan.replace('This Plan', selectedPlan.name)} — ₱{selectedPlan.amount}
              </button>
            )}
            <button onClick={() => setStep(selectedError ? '1b' : 1)} className="text-xs text-gray-500 hover:text-[#cc0000]">← Back</button>
          </div>
        )}

        {/* ── STEP 3: Payment ── */}
        {step === 3 && selectedPlan && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <h2 className="text-sm font-bold text-gray-800 mb-1">Payment Summary</h2>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Plan</span><span className="font-bold">{selectedPlan.name}</span></div>
              <div className="flex justify-between text-sm mt-1"><span className="text-gray-500">Amount</span><span className="font-bold text-[#cc0000]">₱{selectedPlan.amount.toLocaleString()}</span></div>
            </div>

            <h2 className="text-sm font-semibold text-gray-700">{T.payTitle}</h2>
            <div className="flex gap-3">
              {['GCash','Maya'].map(m => (
                <button key={m} onClick={() => setPaymentMethod(m)}
                  className={`flex-1 py-4 rounded-xl border-2 font-bold text-sm transition-all ${paymentMethod===m?m==='GCash'?'border-blue-600 bg-blue-50 text-blue-600':'border-emerald-600 bg-emerald-50 text-emerald-600':'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                  {m}
                </button>
              ))}
            </div>

            {paymentMethod && (
              <div className={`rounded-xl p-5 ${paymentMethod==='GCash'?'bg-blue-50 border border-blue-100':'bg-emerald-50 border border-emerald-100'}`}>
                {/* QR Placeholder */}
                <div className="flex justify-center mb-4">
                  <div className="w-36 h-36 border-4 border-gray-800 rounded-xl p-2 bg-white">
                    <div className="w-full h-full grid grid-cols-5 gap-0.5">
                      {Array.from({length:25}).map((_,i)=>(
                        <div key={i} className={`rounded-sm ${[0,1,2,3,4,5,9,10,14,15,19,20,21,22,23,24,7,13].includes(i)?'bg-gray-800':'bg-white'}`}/>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-center text-xs text-gray-500 mb-4">Scan with {paymentMethod} app</p>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">ACCOUNT NAME</p>
                    <p className="text-sm font-bold text-gray-800">{ACCOUNT.name}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">{paymentMethod} NUMBER</p>
                      <p className="text-sm font-bold font-mono text-gray-800">{ACCOUNT.number}</p>
                    </div>
                    <button onClick={() => copyText(ACCOUNT.number,'number')}
                      className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-semibold text-white ${paymentMethod==='GCash'?'bg-blue-600':'bg-emerald-600'}`}>
                      {copied==='number'?<Check size={12}/>:<Copy size={12}/>}{copied==='number'?'Copied!':'Copy'}
                    </button>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-200 pt-2">
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">AMOUNT TO SEND</p>
                      <p className="text-xl font-bold text-[#cc0000]">₱{selectedPlan.amount.toLocaleString()}</p>
                    </div>
                    <button onClick={() => copyText(String(selectedPlan.amount),'amount')}
                      className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-semibold text-white ${paymentMethod==='GCash'?'bg-blue-600':'bg-emerald-600'}`}>
                      {copied==='amount'?<Check size={12}/>:<Copy size={12}/>}{copied==='amount'?'Copied!':'Copy'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {paymentMethod && (
              <button onClick={() => setStep(4)} className="w-full bg-[#cc0000] hover:bg-red-700 text-white py-3 rounded-xl font-bold text-sm">
                {T.paidBtn}
              </button>
            )}
            <button onClick={() => setStep(2)} className="text-xs text-gray-500 hover:text-[#cc0000]">← Back to Plan Selection</button>
          </div>
        )}

        {/* ── STEP 4: Submit Receipt ── */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-gray-800">{T.submitTitle}</h2>
            {submitError && <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-xl">{submitError}</div>}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Subscriber Name</label>
                <input value={user.accountName || ''} readOnly className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 text-gray-600"/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Account Number</label>
                <input value={user.accountNumber || ''} readOnly className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 text-gray-600"/>
              </div>

              {/* Receipt Photo */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{T.receiptLabel}</label>
                {receiptFile ? (
                  <div className="relative">
                    <img src={URL.createObjectURL(receiptFile)} alt="Receipt" className="w-full max-h-48 object-contain rounded-xl border border-gray-200"/>
                    <button onClick={() => setReceiptFile(null)} className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1"><X size={14}/></button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-[#cc0000] hover:bg-red-50 transition-colors">
                    <ReceiptText size={24} className="text-gray-400 mb-2"/>
                    <p className="text-xs text-gray-500">{T.receiptUpload}</p>
                    <input type="file" accept="image/*" className="hidden" onChange={e => setReceiptFile(e.target.files[0])}/>
                  </label>
                )}
              </div>

              {/* Reference Number */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{T.refLabel}</label>
                <input value={referenceNo} onChange={e => setRefNo(e.target.value)} placeholder={T.refPlaceholder}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#cc0000]"/>
              </div>

              {/* Admin Note */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{T.noteLabel}</label>
                <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)} rows={2} placeholder="Any additional notes..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#cc0000] resize-none"/>
              </div>

              <button onClick={handleSubmit} disabled={!referenceNo.trim() || submitting}
                className="w-full bg-[#cc0000] hover:bg-red-700 text-white py-3 rounded-xl font-bold text-sm disabled:opacity-60">
                {submitting ? 'Submitting...' : T.submitBtn}
              </button>
            </div>
            <button onClick={() => setStep(3)} className="text-xs text-gray-500 hover:text-[#cc0000]">← Back to Payment</button>
          </div>
        )}

        {/* ── STEP 5: Success ── */}
        {step === 5 && (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={40} className="text-green-600"/>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{T.successTitle}</h2>
            <p className="text-sm text-gray-500 mb-6">{T.successMsg}</p>
            <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 mb-6">
              {[
                { label:'Plan',          value:selectedPlan?.name },
                { label:'Amount',        value:selectedPlan ? `₱${selectedPlan.amount.toLocaleString()}` : '' },
                { label:'Payment',       value:paymentMethod },
                { label:'Reference No.', value:referenceNo },
                { label:'Status',        value:'✅ Received' },
              ].map(f => (
                <div key={f.label} className="flex justify-between text-sm">
                  <span className="text-gray-500">{f.label}</span>
                  <span className="font-semibold text-gray-800">{f.value}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={() => navigate('/user/load-history')} className="w-full bg-[#cc0000] hover:bg-red-700 text-white py-3 rounded-xl font-bold text-sm">View Load History</button>
              <button onClick={() => navigate('/user-dashboard')} className="w-full border border-gray-200 py-3 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Back to Dashboard</button>
            </div>
          </div>
        )}
      </div>

      {/* Channel Modal */}
      {channelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-[#880000] to-[#cc0000] text-white flex-shrink-0">
              <div>
                <h2 className="text-sm font-bold">{channelModal.name} Channels</h2>
                <p className="text-xs text-white/80">{channelModal.channels} channels included</p>
              </div>
              <button onClick={() => setChannelModal(null)} className="p-1 rounded-xl hover:bg-white/20"><X size={18}/></button>
            </div>
            <div className="px-5 py-3 border-b border-gray-100 flex gap-1.5 flex-wrap flex-shrink-0">
              {CHANNEL_CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setChannelCat(cat)}
                  className={`text-xs px-3 py-1 rounded-xl font-medium transition-colors ${channelCat===cat?'bg-[#cc0000] text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {cat}
                </button>
              ))}
            </div>
            <div className="p-5 overflow-y-auto">
              {filteredChannels.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-6">No channels in this category.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {filteredChannels.map((ch, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl px-3 py-2">
                      <p className="text-sm font-bold text-gray-800">{ch.name}</p>
                      <p className="text-xs text-gray-500">{ch.category}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-100 flex-shrink-0">
              <button onClick={() => { setChannelModal(null); setSelectedPlan(channelModal); }}
                className="w-full bg-[#cc0000] text-white py-3 rounded-xl text-sm font-bold">
                Select {channelModal.name} — ₱{channelModal.amount}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
