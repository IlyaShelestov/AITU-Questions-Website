const pool = require("../config/db");

class File {
  static async create(file_name, size, type, path, user_name, user_surname) {
    const query = `
            INSERT INTO files (file_name, size, type, path, user_name, user_surname)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING file_id, file_name, size, type, path;
        `;
    const values = [file_name, size, type, path, user_name, user_surname];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async findById(id) {
    const query = `
            SELECT path
            FROM files
            WHERE file_id = $1;
        `;
    const values = [id];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async getFileInfo(id) {
    const query = `
            SELECT file_id, file_name, size, type, path
            FROM files
            WHERE file_id = $1;
        `;
    const values = [id];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async findByName(file_name) {
    const query = `
            SELECT file_id
            FROM files
            WHERE file_name = $1;
        `;
    const values = [file_name];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async findAll() {
    const query = `
            SELECT file_id, file_name, size, type, user_name, user_surname
            FROM files;
        `;
    const { rows } = await pool.query(query);
    return rows;
  }

  static async delete(id) {
    const query = `
            DELETE FROM files
            WHERE file_id = $1
            RETURNING file_id;
        `;
    const values = [id];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async update(id, file_name, size, type, path) {
    const query = `
            UPDATE files
            SET file_name = $1, size = $2, type = $3, path = $4
            WHERE file_id = $5
            RETURNING file_id, file_name, size, type, path;
        `;
    const values = [file_name, size, type, path, id];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }
}

module.exports = File;
