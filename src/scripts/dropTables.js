async function dropTables(pool) {
  try {
    await pool.query("BEGIN");
    await pool.query("DROP TABLE IF EXISTS files CASCADE;");
    await pool.query("DROP TABLE IF EXISTS users CASCADE;");
    await pool.query("DROP TABLE IF EXISTS user_actions CASCADE;");
    await pool.query("COMMIT");
    console.log("Tables dropped successfully.");
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Error dropping tables:", error);
  }
}

module.exports = dropTables;
