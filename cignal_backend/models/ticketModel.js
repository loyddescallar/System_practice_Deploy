const pool = require("../config/db");

async function createTicket(data) {
  const result = await pool.query(
    `INSERT INTO tickets (
      user_id,
      category,
      subject
    )
    VALUES ($1, $2, $3)
    RETURNING id`,
    [
      data.user_id,
      data.category,
      data.subject,
    ]
  );

  return result.rows[0].id;
}

async function getTicketsByUser(userId) {
  const result = await pool.query(
    `SELECT *
     FROM tickets
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );

  return result.rows;
}

async function getAllTickets() {
  const result = await pool.query(
    `SELECT
       t.*,
       u."accountName",
       u."accountNumber",
       u.location
     FROM tickets t
     LEFT JOIN users u
       ON u.id = t.user_id
     ORDER BY t.created_at DESC`
  );

  return result.rows;
}

async function getTicketById(id) {
  const result = await pool.query(
    `SELECT
       t.*,
       u."accountName",
       u."accountNumber"
     FROM tickets t
     LEFT JOIN users u
       ON u.id = t.user_id
     WHERE t.id = $1
     LIMIT 1`,
    [id]
  );

  return result.rows[0] || null;
}

async function updateTicketStatus(id, status) {
  await pool.query(
    `UPDATE tickets
     SET status = $1,
         updated_at = NOW()
     WHERE id = $2`,
    [status, id]
  );
}

async function deleteTicket(id) {
  await pool.query(
    "DELETE FROM tickets WHERE id = $1",
    [id]
  );
}

module.exports = {
  createTicket,
  getTicketsByUser,
  getAllTickets,
  getTicketById,
  updateTicketStatus,
  deleteTicket,
};
