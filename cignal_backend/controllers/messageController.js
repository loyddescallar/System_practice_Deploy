const pool = require('../config/db');
const path = require('path');

async function sendMessageController(req, res) {
  try {
    const { id } = req.params;
    const { message } = req.body;
    let attachment = null;
    let attachment_type = null;
    if (req.files && req.files.attachment) {
      const file = req.files.attachment;
      const filename = Date.now() + '-' + file.name;
      const uploadPath = path.join(__dirname, '..', 'uploads', 'messages', filename);
      await file.mv(uploadPath);
      attachment = filename;
      attachment_type = file.mimetype;
    }
    const [result] = await pool.query(
      "INSERT INTO ticket_messages (ticket_id,sender_id,sender_role,message,attachment,attachment_type) VALUES (?,?,?,?,?,?)",
      [id, req.user.id, req.user.role, message||null, attachment, attachment_type]);
    const [rows] = await pool.query("SELECT * FROM ticket_messages WHERE id=?", [result.insertId]);
    return res.status(201).json({ message: rows[0] });
  } catch(err) { console.error(err); return res.status(500).json({ error: 'Server error' }); }
}

async function getMessagesController(req, res) {
  try {
    const [rows] = await pool.query(
      "SELECT tm.*,u.accountName FROM ticket_messages tm LEFT JOIN users u ON u.id=tm.sender_id WHERE tm.ticket_id=? ORDER BY tm.created_at ASC",
      [req.params.id]);
    return res.json({ messages: rows });
  } catch(err) { return res.status(500).json({ error: 'Server error' }); }
}
module.exports = { sendMessageController, getMessagesController };
