const pool = require("../config/db");

class UserAction {
  static async create(
    userId,
    userName,
    userSurname,
    actionType,
    resourceType,
    resourceId,
    resourceName,
    details
  ) {
    const query = `
            INSERT INTO user_actions (user_id, user_name, user_surname, action_type, resource_type, resource_id, resource_name, details)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING action_id;
        `;
    const values = [
      userId,
      userName,
      userSurname,
      actionType,
      resourceType,
      resourceId,
      resourceName,
      details,
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async findAll(limit = 100, offset = 0, filters = {}) {
    let query = `
            SELECT action_id, user_id, user_name, user_surname, action_type, 
                   resource_type, resource_id, resource_name, details, created_at
            FROM user_actions
            WHERE 1=1
        `;

    const values = [];
    let paramIndex = 1;

    if (filters.actionType) {
      query += ` AND action_type = $${paramIndex}`;
      values.push(filters.actionType);
      paramIndex++;
    }

    if (filters.userId) {
      query += ` AND user_id = $${paramIndex}`;
      values.push(filters.userId);
      paramIndex++;
    }

    if (filters.resourceType) {
      query += ` AND resource_type = $${paramIndex}`;
      values.push(filters.resourceType);
      paramIndex++;
    }

    if (filters.startDate && filters.endDate) {
      query += ` AND created_at BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
      values.push(filters.startDate, filters.endDate);
      paramIndex += 2;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${
      paramIndex + 1
    }`;
    values.push(limit, offset);

    const { rows } = await pool.query(query, values);
    return rows;
  }

  static async countAll(filters = {}) {
    let query = `
            SELECT COUNT(*) as total
            FROM user_actions
            WHERE 1=1
        `;

    const values = [];
    let paramIndex = 1;

    if (filters.actionType) {
      query += ` AND action_type = $${paramIndex}`;
      values.push(filters.actionType);
      paramIndex++;
    }

    if (filters.userId) {
      query += ` AND user_id = $${paramIndex}`;
      values.push(filters.userId);
      paramIndex++;
    }

    if (filters.resourceType) {
      query += ` AND resource_type = $${paramIndex}`;
      values.push(filters.resourceType);
      paramIndex++;
    }

    if (filters.startDate && filters.endDate) {
      query += ` AND created_at BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
      values.push(filters.startDate, filters.endDate);
      paramIndex += 2;
    }

    const { rows } = await pool.query(query, values);
    return parseInt(rows[0].total);
  }
}

module.exports = UserAction;
