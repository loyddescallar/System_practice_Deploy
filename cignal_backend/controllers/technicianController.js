const { createRequest, getRequestsByUser, getAllRequests, updateRequestStatus } = require('../models/technicianModel');

async function createTechnicianRequest(req, res) {
  try {
    const { accountNumber, contactName, contactPhone, issueDescription, preferred_date, preferred_time } = req.body;
    if (!accountNumber||!contactName||!contactPhone||!issueDescription) return res.status(400).json({ error: 'Required fields missing' });
    const id = await createRequest({ user_id:req.user.id, accountNumber, contactName, contactPhone, issueDescription, preferred_date, preferred_time });
    return res.status(201).json({ message: 'Request submitted', id });
  } catch(err) { return res.status(500).json({ error: 'Server error' }); }
}
async function getMyTechnicianRequests(req, res) {
  try { const requests = await getRequestsByUser(req.user.id); return res.json({ requests }); }
  catch(err) { return res.status(500).json({ error: 'Server error' }); }
}
async function getAllTechnicianRequests(req, res) {
  try { const requests = await getAllRequests(); return res.json({ requests }); }
  catch(err) { return res.status(500).json({ error: 'Server error' }); }
}
async function updateTechnicianRequestStatus(req, res) {
  try {
    const { status, technician_name, admin_note } = req.body;
    if (!status) return res.status(400).json({ error: 'status is required' });
    await updateRequestStatus(req.params.id, status, technician_name||null, admin_note||null);
    return res.json({ message: 'Request updated' });
  } catch(err) { return res.status(500).json({ error: 'Server error' }); }
}
module.exports = { createTechnicianRequest, getMyTechnicianRequests, getAllTechnicianRequests, updateTechnicianRequestStatus };
