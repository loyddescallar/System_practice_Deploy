const pool = require('../config/db');
async function createLoadRequest(data) {
  const [r]=await pool.query(
    "INSERT INTO load_requests (user_id,account_number,account_name,plan_name,amount,payment_method,reference_no,receipt_photo,screen_photo,diagnostic_result,location) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
    [data.user_id,data.account_number,data.account_name,data.plan_name,data.amount,data.payment_method,data.reference_no,data.receipt_photo||null,data.screen_photo||null,data.diagnostic_result||null,data.location||'Balayan']);
  return r.insertId;
}
async function getLoadRequestsByUser(userId) {
  const [rows]=await pool.query("SELECT * FROM load_requests WHERE user_id=? ORDER BY created_at DESC",[userId]);
  return rows;
}
async function getAllLoadRequests() {
  const [rows]=await pool.query("SELECT * FROM load_requests ORDER BY created_at DESC");
  return rows;
}
async function updateLoadRequestStatus(id,status,adminNote) {
  await pool.query("UPDATE load_requests SET status=?,admin_note=?,updated_at=NOW() WHERE id=?",[status,adminNote||null,id]);
}
module.exports={createLoadRequest,getLoadRequestsByUser,getAllLoadRequests,updateLoadRequestStatus};
