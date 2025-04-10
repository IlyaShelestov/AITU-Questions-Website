const pool = require("../config/db");

class User {
  static async create(email, hashedPassword, name, surname, role) {
    const query = `
            INSERT INTO users (email, password_hash, name, surname, role)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING user_id, email, name, surname, role;
        `;
    const values = [email, hashedPassword, name, surname, role];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async findByEmail(email) {
    const query = `
            SELECT *
            FROM users
            WHERE email = $1;
        `;
    const values = [email];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async findById(id) {
    const query = `
            SELECT user_id, email, name, surname, role, password_hash
            FROM users
            WHERE user_id = $1;
        `;
    const values = [id];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async update(id, email, name, surname, hashedPassword, role) {
    const query = `
            UPDATE users
            SET email = $1, name = $2, surname = $3, password_hash = $4, role = $5
            WHERE user_id = $6
            RETURNING user_id, email, name, surname;
        `;
    const values = [email, name, surname, hashedPassword, role, id];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async delete(id) {
    const query = `
            DELETE FROM users
            WHERE user_id = $1
            RETURNING user_id;
        `;
    const values = [id];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async findAll() {
    const query = `
            SELECT user_id, email, name, surname, role
            FROM users;
        `;
    const { rows } = await pool.query(query);
    return rows;
  }
}

module.exports = User;
