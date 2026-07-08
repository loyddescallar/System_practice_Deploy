import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Paperclip, X, Flag, Clock, CheckCircle2 } from 'lucide-react';
import ticketApi from '../../api/ticketApi';

const STATUSES=['Open','In Progress','Resolved','Closed'];
const statusCfg={Open:'bg-red-100 text-red-700','In Progress':'bg-amber-100 text-amber-700',Resolved:'bg-green-100 text-green-700',Closed:'bg-slate-100 text-slate-600'};

export default function AdminChat() {
  const {ticketId}=useParams(); const navigate=useNavigate();
  const [ticket,setTicket]=useState(null); const [messages,setMessages]=useState([]); const [newMsg,setNewMsg]=useState(''); const [file,setFile]=useState(null); const [sending,setSending]=useState(false); const [updating,setUpdating]=useState(false);
  const messagesEndRef=useRef(null); const fileInputRef=useRef(null);

  const loadTicket=async()=>{ try{const r=await ticketApi.getTicket(ticketId);setTicket(r.data?.ticket||r.data);}catch(e){console.error(e);} };
  const loadMessages=async()=>{ try{const r=await ticketApi.getTicketMessages(ticketId);setMessages(r.data?.messages||[]);}catch(e){console.error(e);} };
  useEffect(()=>{loadTicket();loadMessages();const interval=setInterval(loadMessages,3000);return()=>clearInterval(interval);},[ticketId]);
  useEffect(()=>{messagesEndRef.current?.scrollIntoView({behavior:'smooth'});},[messages]);

  const sendMessage=async()=>{
    if(!newMsg.trim()&&!file)return; setSending(true);
    try{
      if(file){await ticketApi.sendTicketAttachment(ticketId,{file,message:newMsg.trim()});}
      else{await ticketApi.sendTicketMessage(ticketId,newMsg.trim());}
      setNewMsg('');setFile(null);if(fileInputRef.current)fileInputRef.current.value='';loadMessages();
    }catch(e){console.error(e);}finally{setSending(false);}
  };

  const updateStatus=async(status)=>{setUpdating(true);try{await ticketApi.updateTicketStatus(ticketId,status);setTicket(prev=>prev?{...prev,status}:prev);}catch(e){console.error(e);}finally{setUpdating(false);} };

  const isImage=url=>{if(!url)return false;return /\.(jpg|jpeg|png|gif|webp)$/i.test(url)||url.startsWith('data:image');};

  if(!ticket) return <div className="flex items-center justify-center h-64 text-gray-400"><div className="text-center"><div className="w-8 h-8 border-2 border-[#cc0000] border-t-transparent rounded-full animate-spin mx-auto mb-3"/><p className="text-sm">Loading ticket...</p></div></div>;

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-start gap-3 flex-shrink-0">
        <button onClick={()=>navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 flex-shrink-0 mt-0.5"><ArrowLeft size={18}/></button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-gray-400">#{ticket.id}</span>
            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${statusCfg[ticket.status]||'bg-gray-100 text-gray-600'}`}>{ticket.status}</span>
            {ticket.category&&<span className="text-xs text-gray-500">{ticket.category}</span>}
          </div>
          <p className="text-sm font-bold text-gray-800 mt-1 leading-snug truncate">{ticket.subject}</p>
          <p className="text-xs text-gray-500 mt-0.5">{ticket.accountName||ticket.user_id} {ticket.accountNumber?'· '+ticket.accountNumber:''}</p>
        </div>
      </div>

      {/* Status Buttons */}
      <div className="bg-white border-b border-gray-100 px-4 py-2 flex items-center gap-2 flex-shrink-0 flex-wrap">
        <p className="text-xs text-gray-500 mr-1">Update Status:</p>
        {STATUSES.map(s=><button key={s} disabled={updating} onClick={()=>updateStatus(s)} className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${ticket.status===s?'border-[#cc0000] bg-red-50 text-[#cc0000]':'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'}`}>{s}</button>)}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length===0?<p className="text-xs text-gray-400 text-center mt-10">No messages yet. Type a reply below.</p>
        :messages.map((m,i)=>{
          const isAdmin=m.sender_role==='admin';
          return(
            <div key={i} className={`flex ${isAdmin?'justify-end':'justify-start'}`}>
              {!isAdmin&&<div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-bold flex-shrink-0 mr-2 mt-1">{(m.accountName||'U').charAt(0).toUpperCase()}</div>}
              <div className={`max-w-[70%] ${isAdmin?'items-end':'items-start'} flex flex-col`}>
                <div className={`px-4 py-3 rounded-2xl text-xs shadow-sm ${isAdmin?'bg-[#cc0000] text-white rounded-br-sm':'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'}`}>
                  {m.message&&<p className="whitespace-pre-wrap break-words leading-relaxed">{m.message}</p>}
                  {m.attachment&&(isImage(m.attachment)?<img src={m.attachment.startsWith('http')?m.attachment:'/uploads/messages/'+m.attachment} alt="attachment" className="max-w-xs rounded-xl mt-1 cursor-pointer" onClick={()=>window.open(m.attachment.startsWith('http')?m.attachment:'/uploads/messages/'+m.attachment)}/>:<a href={m.attachment.startsWith('http')?m.attachment:'/uploads/messages/'+m.attachment} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-1 mt-1 underline text-xs ${isAdmin?'text-red-200':'text-blue-500'}`}><Paperclip size={11}/>Download attachment</a>)}
                  <p className={`text-right mt-1 ${isAdmin?'text-red-200':'text-gray-400'}`} style={{fontSize:'9px'}}>{(m.created_at||'').split('.')[0]}</p>
                </div>
              </div>
              {isAdmin&&<div className="w-7 h-7 rounded-full bg-[#cc0000] flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ml-2 mt-1">A</div>}
            </div>
          );
        })}
        <div ref={messagesEndRef}/>
      </div>

      {/* Composer */}
      <div className="bg-white border-t border-gray-200 p-3 flex-shrink-0">
        {file&&<div className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2 mb-2"><Paperclip size={12} className="text-blue-500"/><span className="text-xs text-blue-700 flex-1 truncate">{file.name}</span><button onClick={()=>{setFile(null);if(fileInputRef.current)fileInputRef.current.value='';}} className="text-blue-400 hover:text-blue-600"><X size={14}/></button></div>}
        <div className="flex gap-2">
          <button onClick={()=>fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"><Paperclip size={18}/></button>
          <input ref={fileInputRef} type="file" className="hidden" onChange={e=>{if(e.target.files[0])setFile(e.target.files[0]);}}/>
          <input type="text" value={newMsg} onChange={e=>setNewMsg(e.target.value)} onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&(e.preventDefault(),sendMessage())} placeholder="Type a reply..." className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-[#cc0000]"/>
          <button onClick={sendMessage} disabled={(!newMsg.trim()&&!file)||sending} className="bg-[#cc0000] hover:bg-red-700 text-white px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50 flex-shrink-0"><Send size={15}/></button>
        </div>
      </div>
    </div>
  );
}
