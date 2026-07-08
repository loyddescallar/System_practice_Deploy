const pool = require("../config/db");

/*
|--------------------------------------------------------------------------
| Reusable customer query
|--------------------------------------------------------------------------
| Gets the latest completed load transaction for each account.
*/
const CUSTOMER_SELECT = `
  SELECT
    u.*,
    load_summary.last_load AS "lastLoadDate"
  FROM users u
  LEFT JOIN (
    SELECT
      account_number,
      MAX(transaction_date) AS last_load
    FROM prepaid_transactions
    WHERE status = 'completed'
    GROUP BY account_number
  ) AS load_summary
    ON load_summary.account_number = u."accountNumber"
`;

/*
|--------------------------------------------------------------------------
| Find user by account name
|--------------------------------------------------------------------------
*/
async function findByAccountName(accountName) {
  const result = await pool.query(
    `
      SELECT *
      FROM users
      WHERE LOWER(TRIM("accountName")) = LOWER(TRIM($1))
      LIMIT 1
    `,
    [accountName]
  );

  return result.rows[0] || null;
}

/*
|--------------------------------------------------------------------------
| Find user by database ID
|--------------------------------------------------------------------------
*/
async function findById(id) {
  const result = await pool.query(
    `
      ${CUSTOMER_SELECT}
      WHERE u.id = $1
      LIMIT 1
    `,
    [id]
  );

  return result.rows[0] || null;
}

/*
|--------------------------------------------------------------------------
| Find customer by account number or CCA number
|--------------------------------------------------------------------------
*/
async function findByAccountIdOrCca(accountId) {
  const cleanAccountId = String(accountId || "").trim();

  const result = await pool.query(
    `
      ${CUSTOMER_SELECT}
      WHERE TRIM(u."accountNumber") = $1
         OR TRIM(u."ccaNumber") = $1
      LIMIT 1
    `,
    [cleanAccountId]
  );

  return result.rows[0] || null;
}

/*
|--------------------------------------------------------------------------
| Get all customer accounts
|--------------------------------------------------------------------------
*/
async function getAllUsers() {
  const result = await pool.query(
    `
      ${CUSTOMER_SELECT}
      WHERE u.role = 'user'
      ORDER BY u.created_at DESC
    `
  );

  return result.rows;
}

/*
|--------------------------------------------------------------------------
| Get customer dashboard statistics
|--------------------------------------------------------------------------
*/
async function getCustomerStats() {
  const result = await pool.query(
    `
      SELECT
        COUNT(*)::INTEGER AS total,

        COUNT(*) FILTER (
          WHERE DATE_TRUNC('month', u.created_at)
                = DATE_TRUNC('month', CURRENT_DATE)
        )::INTEGER AS "thisMonth",

        COUNT(*) FILTER (
          WHERE load_summary.last_load >= NOW() - INTERVAL '30 days'
        )::INTEGER AS "activeCount",

        COUNT(*) FILTER (
          WHERE load_summary.last_load >= NOW() - INTERVAL '60 days'
            AND load_summary.last_load < NOW() - INTERVAL '30 days'
        )::INTEGER AS "atRiskCount",

        COUNT(*) FILTER (
          WHERE load_summary.last_load IS NULL
             OR load_summary.last_load < NOW() - INTERVAL '60 days'
        )::INTEGER AS "inactiveCount"

      FROM users u

      LEFT JOIN (
        SELECT
          account_number,
          MAX(transaction_date) AS last_load
        FROM prepaid_transactions
        WHERE status = 'completed'
        GROUP BY account_number
      ) AS load_summary
        ON load_summary.account_number = u."accountNumber"

      WHERE u.role = 'user'
    `
  );

  return (
    result.rows[0] || {
      total: 0,
      thisMonth: 0,
      activeCount: 0,
      atRiskCount: 0,
      inactiveCount: 0,
    }
  );
}

/*
|--------------------------------------------------------------------------
| Create user
|--------------------------------------------------------------------------
*/
async function createUser(data) {
  const result = await pool.query(
    `
      INSERT INTO users (
        "accountName",
        "accountNumber",
        "ccaNumber",
        address,
        phone,
        location,
        role
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `,
    [
      data.accountName?.trim(),
      data.accountNumber?.trim(),
      data.ccaNumber?.trim(),
      data.address?.trim() || null,
      data.phone?.trim() || null,
      data.location?.trim() || "Balayan",
      data.role || "user",
    ]
  );

  return result.rows[0].id;
}

/*
|--------------------------------------------------------------------------
| Update user
|--------------------------------------------------------------------------
*/
async function updateUser(id, data) {
  const result = await pool.query(
    `
      UPDATE users
      SET
        "accountName" = $1,
        "accountNumber" = $2,
        "ccaNumber" = $3,
        address = $4,
        phone = $5,
        location = $6,
        role = $7,
        updated_at = NOW()
      WHERE id = $8
      RETURNING *
    `,
    [
      data.accountName?.trim(),
      data.accountNumber?.trim(),
      data.ccaNumber?.trim(),
      data.address?.trim() || null,
      data.phone?.trim() || null,
      data.location?.trim() || "Balayan",
      data.role || "user",
      id,
    ]
  );

  return result.rows[0] || null;
}

/*
|--------------------------------------------------------------------------
| Delete user
|--------------------------------------------------------------------------
*/
async function deleteUser(id) {
  const result = await pool.query(
    `
      DELETE FROM users
      WHERE id = $1
      RETURNING id
    `,
    [id]
  );

  return result.rows[0] || null;
}

/*
|--------------------------------------------------------------------------
| Check duplicate account number or CCA number
|--------------------------------------------------------------------------
*/
async function checkDuplicate(
  accountNumber,
  ccaNumber,
  excludeId = null
) {
  const params = [
    String(accountNumber || "").trim(),
    String(ccaNumber || "").trim(),
  ];

  let sql = `
    SELECT
      id,
      "accountNumber",
      "ccaNumber"
    FROM users
    WHERE (
      TRIM("accountNumber") = $1
      OR TRIM("ccaNumber") = $2
    )
  `;

  if (excludeId !== null && excludeId !== undefined) {
    sql += ` AND id <> $3`;
    params.push(excludeId);
  }

  sql += ` LIMIT 1`;

  const result = await pool.query(sql, params);

  return result.rows[0] || null;
}

module.exports = {
  findByAccountName,
  findById,
  findByAccountIdOrCca,
  getAllUsers,
  getCustomerStats,
  createUser,
  updateUser,
  deleteUser,
  checkDuplicate,
};
