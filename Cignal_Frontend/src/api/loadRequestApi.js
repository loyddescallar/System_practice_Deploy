import axiosClient from './axiosClient';
export const createLoadRequest = d=>axiosClient.post('/load-requests',d);
export const getMyLoadRequests = ()=>axiosClient.get('/load-requests/my');
export const getAllLoadRequests = ()=>axiosClient.get('/load-requests');
export const updateLoadStatus = (id,s,note)=>axiosClient.patch('/load-requests/'+id,{status:s,admin_note:note});
