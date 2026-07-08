import axios from 'axios';
const axiosClient = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api', headers: {'Content-Type':'application/json'} });
axiosClient.interceptors.request.use(config => { const t=localStorage.getItem('token'); if(t) config.headers.Authorization='Bearer '+t; return config; });
axiosClient.interceptors.response.use(r=>r, err=>{ if(err.response?.status===401){localStorage.clear();window.location.href='/login';} return Promise.reject(err); });
export default axiosClient;
