const pool = require('../config/db');
const { addLoadHistory, getLoadHistoryByUser, getAllLoadHistory, getAllPrepaidTransactions, updateLoadStatus } = require('../models/loadModel');

async function addLoad(req, res) {
  try {
    const { accountNumber, loadAmount, description } = req.body;
    if (!accountNumber||!loadAmount) return res.status(400).json({ error: 'accountNumber and loadAmount required' });
    const id = await addLoadHistory({ user_id:req.user.id, accountNumber, loadAmount, description, status:'pending' });
    return res.status(201).json({ message: 'Load request submitted', requestId:id, status:'pending' });
  } catch(err) { return res.status(500).json({ error: 'Server error' }); }
}
async function getMyLoadHistory(req, res) {
  try { const history = await getLoadHistoryByUser(req.user.id); return res.json({ success:true, history }); }
  catch(err) { return res.status(500).json({ error: 'Server error' }); }
}
async function getAllLoadHistoryController(req, res) {
  try { const history = await getAllLoadHistory(); return res.json({ success:true, history }); }
  catch(err) { return res.status(500).json({ error: 'Server error' }); }
}
async function getPrepaidTransactionsController(req, res) {
  try { const transactions = await getAllPrepaidTransactions(); return res.json({ success:true, transactions }); }
  catch(err) { return res.status(500).json({ error: 'Server error' }); }
}
async function getPlansController(req, res) {
  try {
    const [plans] = await pool.query("SELECT * FROM prepaid_plans ORDER BY amount ASC");
    return res.json({ success:true, plans });
  } catch(err) { return res.status(500).json({ error: 'Server error' }); }
}
async function updateLoadStatusController(req, res) {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'status required' });
    await updateLoadStatus(req.params.id, status);
    return res.json({ success:true, message:'Load updated' });
  } catch(err) { return res.status(500).json({ error: 'Server error' }); }
}
module.exports = { addLoad, getMyLoadHistory, getAllLoadHistoryController, getPrepaidTransactionsController, getPlansController, updateLoadStatusController };
