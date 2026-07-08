const pool = require("../config/db");

async function createRequest(data) {
  const result = await pool.query(
    `INSERT INTO technician_requests (
      user_id,
      "accountNumber",
      "contactName",
      "contactPhone",
      "issueDescription",
      preferred_date,
      preferred_time
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id`,
    [
      data.user_id,
      data.accountNumber,
      data.contactName,
      data.contactPhone,
      data.issueDescription,
      data.preferred_date || null,
      data.preferred_time || null,
    ]
  );

  return result.rows[0].id;
}

async function getRequestsByUser(userId) {
  const result = await pool.query(
    `SELECT *
     FROM technician_requests
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );

  return result.rows;
}

async function getAllRequests() {
  const result = await pool.query(
    `SELECT
       tr.*,
       u.location
     FROM technician_requests tr
     LEFT JOIN users u
       ON u."accountNumber" = tr."accountNumber"
     ORDER BY tr.created_at DESC`
  );

  return result.rows;
}

async function updateRequestStatus(
  id,
  status,
  technicianName = null,
  adminNote = null
) {
  await pool.query(
    `UPDATE technician_requests
     SET status = $1,
         technician_name =
           CASE
             WHEN $2::text IS NULL THEN technician_name
             ELSE $2
           END,
         admin_note =
           CASE
             WHEN $3::text IS NULL THEN admin_note
             ELSE $3
           END,
         updated_at = NOW()
     WHERE id = $4`,
    [
      status,
      technicianName,
      adminNote,
      id,
    ]
  );
}

module.exports = {
  createRequest,
  getRequestsByUser,
  getAllRequests,
  updateRequestStatus,
};
