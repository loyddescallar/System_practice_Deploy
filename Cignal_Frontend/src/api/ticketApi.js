import axiosClient from './axiosClient';
const ticketApi = {
  createTicket: t=>axiosClient.post('/tickets',t),
  getMyTickets: ()=>axiosClient.get('/tickets/my'),
  getAdminTickets: ()=>axiosClient.get('/tickets/admin'),
  getTicket: id=>axiosClient.get('/tickets/'+id),
  getTicketMessages: id=>axiosClient.get('/tickets/'+id+'/messages'),
  sendTicketMessage: (id,m)=>axiosClient.post('/tickets/'+id+'/messages',{message:m}),
  sendTicketAttachment: (id,{file,message})=>{ const fd=new FormData(); if(message)fd.append('message',message); if(file)fd.append('attachment',file); return axiosClient.post('/tickets/'+id+'/messages',fd,{headers:{'Content-Type':'multipart/form-data'}}); },
  sendUserTyping: (id,t)=>axiosClient.post('/tickets/'+id+'/typing/user',{typing:t}),
  sendAdminTyping: (id,t)=>axiosClient.post('/tickets/'+id+'/typing/admin',{typing:t}),
  updateTicketStatus: (id,s)=>axiosClient.patch('/tickets/admin/'+id,{status:s}),
  deleteTicket: id=>axiosClient.delete('/tickets/admin/'+id),
};
export default ticketApi;
