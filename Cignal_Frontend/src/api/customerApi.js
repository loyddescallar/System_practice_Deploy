import axiosClient from './axiosClient';
const customerApi = {
  getCustomers: ()=>axiosClient.get('/customers'),
  getStats: ()=>axiosClient.get('/customers/stats'),
  getCustomerById: id=>axiosClient.get('/customers/id/'+id),
  getCustomerLookup: id=>axiosClient.get('/customers/'+id),
  createCustomer: d=>axiosClient.post('/customers',d),
  updateCustomer: (id,d)=>axiosClient.put('/customers/id/'+id,d),
  deleteCustomer: id=>axiosClient.delete('/customers/id/'+id),
};
export default customerApi;
