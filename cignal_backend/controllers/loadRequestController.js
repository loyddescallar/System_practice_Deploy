const { createLoadRequest, getLoadRequestsByUser, getAllLoadRequests, updateLoadRequestStatus } = require('../models/loadRequestModel');

async function createLoadRequestController(req, res) {
  try {
    const { account_number, account_name, plan_name, amount, payment_method, reference_no, receipt_photo, screen_photo, diagnostic_result, location } = req.body;
    if (!account_number||!plan_name||!amount||!payment_method||!reference_no) return res.status(400).json({ error: 'Required fields missing' });
    const id = await createLoadRequest({ user_id:req.user.id, account_number, account_name:account_name||'', plan_name, amount, payment_method, reference_no, receipt_photo:receipt_photo||null, screen_photo:screen_photo||null, diagnostic_result:diagnostic_result||null, location:location||'Balayan' });
    return res.status(201).json({ message: 'Load request submitted', id });
  } catch(err) { console.error(err); return res.status(500).json({ error: 'Server error' }); }
}
async function getMyLoadRequestsController(req, res) {
  try { const requests = await getLoadRequestsByUser(req.user.id); return res.json({ requests }); }
  catch(err) { return res.status(500).json({ error: 'Server error' }); }
}
async function getAllLoadRequestsController(req, res) {
  try { const requests = await getAllLoadRequests(); return res.json({ requests }); }
  catch(err) { return res.status(500).json({ error: 'Server error' }); }
}
async function updateLoadStatusController(req, res) {
  try {
    const { status, admin_note } = req.body;
    if (!status) return res.status(400).json({ error: 'status required' });
    await updateLoadRequestStatus(req.params.id, status, admin_note||null);
    return res.json({ message: 'Load request updated' });
  } catch(err) { return res.status(500).json({ error: 'Server error' }); }
}
module.exports = { createLoadRequestController, getMyLoadRequestsController, getAllLoadRequestsController, updateLoadStatusController };
