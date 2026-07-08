import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Paperclip, X } from 'lucide-react';
import UserLayout from '../../components/UserLayout';
import ticketApi from '../../api/ticketApi';

export default function UserChat() {
  const {ticketId}=useParams(); const navigate=useNavigate();
  const [ticket,setTicket]=useState(null); const [messages,setMessages]=useState([]); const [newMsg,setNewMsg]=useState(''); const [file,setFile]=useState(null); const [sending,setSending]=useState(false);
  const bottomRef=useRef(null); const fileInputRef=useRef(null);
  const loadMessages=async()=>{ try{const r=await ticketApi.getTicketMessages(ticketId);setMessages(r.data?.messages||[]);}catch(e){console.error(e);} };
  useEffect(()=>{ticketApi.getTicket(ticketId).then(r=>setTicket(r.data?.ticket||r.data)).catch(console.error);loadMessages();const i=setInterval(loadMessages,3000);return()=>clearInterval(i);},[ticketId]);
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:'smooth'});},[messages]);
  const sendMessage=async()=>{ if(!newMsg.trim()&&!file)return;setSending(true);try{if(file){await ticketApi.sendTicketAttachment(ticketId,{file,message:newMsg.trim()});}else{await ticketApi.sendTicketMessage(ticketId,newMsg.trim());}setNewMsg('');setFile(null);if(fileInputRef.current)fileInputRef.current.value='';loadMessages();}catch(e){console.error(e);}finally{setSending(false);}};
  const isImage=url=>/\.(jpg|jpeg|png|gif|webp)$/i.test(url||'')||url?.startsWith('data:image');
  return (
    <UserLayout>
      <div className="flex flex-col" style={{height:'calc(100vh - 80px)'}}>
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 flex-shrink-0">
          <button onClick={()=>navigate('/user/tickets')} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"><ArrowLeft size={18}/></button>
          <div className="flex-1 min-w-0"><p className="text-sm font-bold text-gray-800 truncate">{ticket?.subject||'Loading...'}</p><div className="flex items-center gap-2"><span className="text-xs text-gray-400">#{ticketId}</span>{ticket?.status&&<span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">{ticket.status}</span>}</div></div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {messages.length===0?<p className="text-xs text-gray-400 text-center mt-10">No messages yet.</p>
          :messages.map((m,i)=>{const isUser=m.sender_role==='user';return(
            <div key={i} className={`flex ${isUser?'justify-end':'justify-start'}`}>
              {!isUser&&<div className="w-7 h-7 rounded-full bg-[#cc0000] flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mr-2 mt-1">S</div>}
              <div className={`max-w-[70%] px-4 py-3 rounded-2xl text-xs shadow-sm ${isUser?'bg-blue-600 text-white rounded-br-sm':'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'}`}>
                {m.message&&<p className="whitespace-pre-wrap break-words leading-relaxed">{m.message}</p>}
                {m.attachment&&(isImage(m.attachment)?<img src={'/uploads/messages/'+m.attachment} alt="attachment" className="max-w-xs rounded-xl mt-1"/>:<a href={'/uploads/messages/'+m.attachment} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-1 mt-1 underline ${isUser?'text-blue-200':'text-blue-500'}`} style={{fontSize:'11px'}}><Paperclip size={11}/>Attachment</a>)}
                <p className={`text-right mt-1 ${isUser?'text-blue-200':'text-gray-400'}`} style={{fontSize:'9px'}}>{(m.created_at||'').split('.')[0]}</p>
              </div>
            </div>
          );})}
          <div ref={bottomRef}/>
        </div>
        {ticket?.status!=='Resolved'&&ticket?.status!=='Closed'&&(
          <div className="bg-white border-t border-gray-200 p-3 flex-shrink-0">
            {file&&<div className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2 mb-2"><Paperclip size={12} className="text-blue-500"/><span className="text-xs text-blue-700 flex-1 truncate">{file.name}</span><button onClick={()=>{setFile(null);if(fileInputRef.current)fileInputRef.current.value='';}} className="text-blue-400"><X size={14}/></button></div>}
            <div className="flex gap-2"><button onClick={()=>fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"><Paperclip size={18}/></button><input ref={fileInputRef} type="file" className="hidden" onChange={e=>{if(e.target.files[0])setFile(e.target.files[0]);}}/><input type="text" value={newMsg} onChange={e=>setNewMsg(e.target.value)} onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&(e.preventDefault(),sendMessage())} placeholder="Type a message..." className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-[#cc0000]"/><button onClick={sendMessage} disabled={(!newMsg.trim()&&!file)||sending} className="bg-[#cc0000] hover:bg-red-700 text-white px-4 py-2.5 rounded-xl disabled:opacity-50"><Send size={15}/></button></div>
          </div>
        )}
        {(ticket?.status==='Resolved'||ticket?.status==='Closed')&&<div className="bg-green-50 border-t border-green-100 px-4 py-3 text-center text-xs text-green-700 font-semibold flex-shrink-0">✅ This ticket has been {ticket.status.toLowerCase()}.</div>}
      </div>
    </UserLayout>
  );
}
