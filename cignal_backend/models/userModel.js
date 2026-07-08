const pool = require('../config/db');

async function findByAccountName(accountName) {
  // Ginagamitan ng double quotes ang camelCase columns sa Postgres, at $1 placeholder
  const result = await pool.query('SELECT * FROM users WHERE "accountName" = $1 LIMIT 1', [accountName]);
  return result.rows[0] || null;
}

async function findById(id) {
  const result = await pool.query(
    `SELECT u.*, lx.last_load as "lastLoadDate" FROM users u
     LEFT JOIN (SELECT account_number, MAX(transaction_date) as last_load FROM prepaid_transactions WHERE status='completed' GROUP BY account_number) lx ON lx.account_number = u."accountNumber"
     WHERE u.id = $1 LIMIT 1`, [id]);
  return result.rows[0] || null;
}

async function findByAccountIdOrCca(accountId) {
  const result = await pool.query(
    `SELECT u.*, lx.last_load as "lastLoadDate" FROM users u
     LEFT JOIN (SELECT account_number, MAX(transaction_date) as last_load FROM prepaid_transactions WHERE status='completed' GROUP BY account_number) lx ON lx.account_number = u."accountNumber"
     WHERE u."accountNumber" = $1 OR u."ccaNumber" = $2 LIMIT 1`, [accountId, accountId]);
  return result.rows[0] || null;
}

async function getAllUsers() {
  const result = await pool.query(
    `SELECT u.*, lx.last_load as "lastLoadDate" FROM users u
     LEFT JOIN (SELECT account_number, MAX(transaction_date) as last_load FROM prepaid_transactions WHERE status='completed' GROUP BY account_number) lx ON lx.account_number = u."accountNumber"
     WHERE u.role = 'user' ORDER BY u.created_at DESC`);
  return result.rows;
}

async function getCustomerStats() {
  const now = new Date();
  const thisMonth = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0');
  const result = await pool.query(
    `SELECT COUNT(*) as total,
     SUM(CASE WHEN TO_CHAR(u.created_at, 'YYYY-MM') = $1 THEN 1 ELSE 0 END) as "thisMonth",
     SUM(CASE WHEN lx.last_load >= NOW() - INTERVAL '30 days' THEN 1 ELSE 0 END) as "activeCount",
     SUM(CASE WHEN lx.last_load >= NOW() - INTERVAL '60 days' AND lx.last_load < NOW() - INTERVAL '30 days' THEN 1 ELSE 0 END) as "atRiskCount",
     SUM(CASE WHEN lx.last_load IS NULL OR lx.last_load < NOW() - INTERVAL '60 days' THEN 1 ELSE 0 END) as "inactiveCount"
     FROM users u
     LEFT JOIN (SELECT account_number, MAX(transaction_date) as last_load FROM prepaid_transactions WHERE status='completed' GROUP BY account_number) lx ON lx.account_number = u."accountNumber"
     WHERE u.role='user'`, [thisMonth]);
  return result.rows[0];
}

async function createUser(data) {
  const result = await pool.query(
    `INSERT INTO users ("accountName", "accountNumber", "ccaNumber", address, phone, location, role) 
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [data.accountName, data.accountNumber, data.ccaNumber, data.address, data.phone, data.location || 'Balayan', data.role || 'user']);
  return result.rows[0].id; // Postgres gumagamit ng RETURNING id imbes na insertId
}

async function updateUser(id, data) {
  await pool.query(
    `UPDATE users SET "accountName"=$1, "accountNumber"=$2, "ccaNumber"=$3, address=$4, phone=$5, location=$6, role=$7 
     WHERE id=$8`,
    [data.accountName, data.accountNumber, data.ccaNumber, data.address, data.phone, data.location || 'Balayan', data.role || 'user', id]);
}

async function deleteUser(id) { 
  await pool.query("DELETE FROM users WHERE id=$1", [id]); 
}

async function checkDuplicate(accountNumber, ccaNumber, excludeId=null) {
  let sql = `SELECT id FROM users WHERE ("accountNumber"=$1 OR "ccaNumber"=$2)`;
  const params = [accountNumber, ccaNumber];
  if(excludeId){
    sql += ` AND id<>$3`;
    params.push(excludeId);
  }
  const result = await pool.query(sql, params); 
  return result.rows[0] || null;
}

module.exports = { findByAccountName, findById, findByAccountIdOrCca, getAllUsers, getCustomerStats, createUser, updateUser, deleteUser, checkDuplicate };
