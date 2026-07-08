import axiosClient from './axiosClient';
const loadAdminApi = { getAll:()=>axiosClient.get('/load/admin'), create:p=>axiosClient.post('/load',p), getPlans:()=>axiosClient.get('/load/plans'), getTx:()=>axiosClient.get('/load/prepaid-transactions') };
export default loadAdminApi;
