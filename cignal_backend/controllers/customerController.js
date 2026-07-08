const { findByAccountIdOrCca, findById, getAllUsers, getCustomerStats, createUser, updateUser, deleteUser, checkDuplicate } = require('../models/userModel');
const pool = require('../config/db');

async function getCustomerByAccount(req, res) {
  try { const user = await findByAccountIdOrCca(req.params.accountId); if (!user) return res.status(404).json({ error: 'Customer not found' }); return res.json({ user }); }
  catch(err) { return res.status(500).json({ error: 'Server error' }); }
}
async function getCustomerById(req, res) {
  try { const customer = await findById(req.params.id); if (!customer) return res.status(404).json({ error: 'Customer not found' }); return res.json({ customer }); }
  catch(err) { return res.status(500).json({ error: 'Server error' }); }
}
async function getStats(req, res) {
  try { const stats = await getCustomerStats(); return res.json({ stats }); }
  catch(err) { return res.status(500).json({ error: 'Server error' }); }
}
async function listCustomers(req, res) {
  try { const customers = await getAllUsers(); return res.json({ customers }); }
  catch(err) { return res.status(500).json({ error: 'Server error' }); }
}
async function createCustomerController(req, res) {
  try {
    const { accountName, accountNumber, ccaNumber, address, phone, location, role } = req.body;
    if (!accountName||!accountNumber||!ccaNumber) return res.status(400).json({ error: 'Required fields missing' });
    const dup = await checkDuplicate(accountNumber.trim(), ccaNumber.trim());
    if (dup) return res.status(409).json({ error: 'Account number or CCA number already exists' });
    const id = await createUser({ accountName:accountName.trim(), accountNumber:accountNumber.trim(), ccaNumber:ccaNumber.trim(), address:address?.trim()||'', phone:phone?.trim()||'', location:location||'Balayan', role:role||'user' });
    return res.status(201).json({ message: 'Customer created', id });
  } catch(err) { return res.status(500).json({ error: 'Server error' }); }
}
async function updateCustomerController(req, res) {
  try {
    const { id } = req.params;
    const { accountName, accountNumber, ccaNumber, address, phone, location, role } = req.body;
    if (!accountName||!accountNumber||!ccaNumber) return res.status(400).json({ error: 'Required fields missing' });
    const dup = await checkDuplicate(accountNumber.trim(), ccaNumber.trim(), id);
    if (dup) return res.status(409).json({ error: 'Account number or CCA number already exists' });
    await updateUser(id, { accountName:accountName.trim(), accountNumber:accountNumber.trim(), ccaNumber:ccaNumber.trim(), address:address?.trim()||'', phone:phone?.trim()||'', location:location||'Balayan', role:role||'user' });
    return res.json({ message: 'Customer updated' });
  } catch(err) { return res.status(500).json({ error: 'Server error' }); }
}
async function deleteCustomerController(req, res) {
  try { await deleteUser(req.params.id); return res.json({ message: 'Customer deleted' }); }
  catch(err) { return res.status(500).json({ error: 'Server error' }); }
}
module.exports = { getCustomerByAccount, getCustomerById, getStats, listCustomers, createCustomerController, updateCustomerController, deleteCustomerController };
