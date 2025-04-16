async function createTables(pool) {
  try {
    await pool.query("BEGIN");
    await pool.query("SET client_encoding = 'UTF8';");
    await pool.query(`
        CREATE OR REPLACE FUNCTION update_modified_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE 'plpgsql';
      `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          user_id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          surname VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'user',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS files (
          file_id SERIAL PRIMARY KEY,
          file_name VARCHAR(255) NOT NULL,
          type VARCHAR(255) NOT NULL,
          size INT NOT NULL,
          path VARCHAR(255) NOT NULL,
          audience VARCHAR(20) NOT NULL DEFAULT 'both',
          user_name VARCHAR(255) NOT NULL,
          user_surname VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS user_actions (
          action_id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(user_id),
          user_name VARCHAR(255) NOT NULL,
          user_surname VARCHAR(255) NOT NULL,
          action_type VARCHAR(50) NOT NULL,
          resource_type VARCHAR(50) NOT NULL,
          resource_id INTEGER,
          resource_name VARCHAR(255),
          details TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
    await pool.query(`
        CREATE TRIGGER set_modified_users
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE PROCEDURE update_modified_column();
      `);
    await pool.query(`
        CREATE TRIGGER set_modified_files
        BEFORE UPDATE ON files
        FOR EACH ROW
        EXECUTE PROCEDURE update_modified_column();
      `);
    await pool.query("COMMIT");
    console.log("Tables created successfully.");
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Error creating tables:", error);
  }
}

module.exports = createTables;
