const pool = require("../config/db");

class Request {
  static async create(userId, userName, telegramId, message, status = "new") {
    const query = `
      INSERT INTO requests (user_id, user_name, telegram_id, message, status, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING request_id;
    `;
    const values = [userId, userName, telegramId, message, status];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async findAll(limit = 100, offset = 0, status = null) {
    let query = `
      SELECT request_id, user_name, telegram_id, message, status, created_at, updated_at
      FROM requests
      WHERE 1=1
    `;

    const values = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND status = $${paramIndex}`;
      values.push(status);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${
      paramIndex + 1
    }`;
    values.push(limit, offset);

    const { rows } = await pool.query(query, values);
    return rows;
  }

  static async updateStatus(requestId, status) {
    const query = `
      UPDATE requests
      SET status = $1, updated_at = NOW()
      WHERE request_id = $2
      RETURNING *;
    `;
    const values = [status, requestId];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async findById(requestId) {
    const query = `
      SELECT *
      FROM requests
      WHERE request_id = $1;
    `;
    const values = [requestId];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async countAll(status = null) {
    let query = "SELECT COUNT(*) FROM requests WHERE 1=1";
    const values = [];

    if (status) {
      query += " AND status = $1";
      values.push(status);
    }

    const { rows } = await pool.query(query, values);
    return parseInt(rows[0].count);
  }
}

module.exports = Request;
