const { Pool } = require('pg');
require('dotenv').config();

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Para manatili itong compatible sa lumang queries mo
db.query = db.query.bind(db);

module.exports = pool;
