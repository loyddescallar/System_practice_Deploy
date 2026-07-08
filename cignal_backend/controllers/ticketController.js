const { createTicket, getTicketsByUser, getAllTickets, getTicketById, updateTicketStatus, deleteTicket } = require('../models/ticketModel');
const ALLOWED = ['Open','In Progress','Resolved','Closed'];

async function createTicketController(req, res) {
  try {
    const { category, subject } = req.body;
    if (!category||!subject) return res.status(400).json({ error: 'category and subject are required' });
    const id = await createTicket({ user_id:req.user.id, category, subject });
    return res.status(201).json({ message: 'Ticket created', id });
  } catch(err) { return res.status(500).json({ error: 'Server error' }); }
}
async function getMyTicketsController(req, res) {
  try { const tickets = await getTicketsByUser(req.user.id); return res.json({ tickets }); }
  catch(err) { return res.status(500).json({ error: 'Server error' }); }
}
async function getAllTicketsController(req, res) {
  try { const tickets = await getAllTickets(); return res.json({ tickets }); }
  catch(err) { return res.status(500).json({ error: 'Server error' }); }
}
async function getTicketByIdController(req, res) {
  try { const ticket = await getTicketById(req.params.id); if (!ticket) return res.status(404).json({ error: 'Ticket not found' }); return res.json({ ticket }); }
  catch(err) { return res.status(500).json({ error: 'Server error' }); }
}
async function updateTicketStatusController(req, res) {
  try {
    const { status } = req.body;
    if (!ALLOWED.includes(status)) return res.status(400).json({ error: 'Invalid status' });
    await updateTicketStatus(req.params.id, status);
    return res.json({ message: 'Status updated' });
  } catch(err) { return res.status(500).json({ error: 'Server error' }); }
}
async function deleteTicketController(req, res) {
  try { await deleteTicket(req.params.id); return res.json({ message: 'Ticket deleted' }); }
  catch(err) { return res.status(500).json({ error: 'Server error' }); }
}
module.exports = { createTicketController, getMyTicketsController, getAllTicketsController, getTicketByIdController, updateTicketStatusController, deleteTicketController };
