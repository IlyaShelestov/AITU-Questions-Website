require("../config/environment.js");

const pool = require("../config/db");
const bcrypt = require("bcrypt");

async function seedTestUsers() {
  const client = await pool.connect();
  try {
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash("admin", salt);

    await client.query(
      `
      INSERT INTO users (email, password_hash, name, surname, role)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO UPDATE 
      SET password_hash = $2, name = $3, surname = $4, role = $5
    `,
      ["admin@test.com", adminPassword, "Admin", "User", "admin"]
    );

    const userPassword = await bcrypt.hash("user", salt);
    await client.query(
      `
      INSERT INTO users (email, password_hash, name, surname, role)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO UPDATE 
      SET password_hash = $2, name = $3, surname = $4, role = $5
    `,
      ["user@test.com", userPassword, "Regular", "User", "user"]
    );

    const managerPassword = await bcrypt.hash("manager", salt);
    await client.query(
      `
      INSERT INTO users (email, password_hash, name, surname, role)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO UPDATE 
      SET password_hash = $2, name = $3, surname = $4, role = $5
    `,
      ["manager@test.com", managerPassword, "Regular", "Manager", "manager"]
    );

    console.log("Test users created successfully:");
    console.log("- Admin: admin@test.com / admin");
    console.log("- User: user@test.com / user");
    console.log("- User: manager@test.com / manager");
  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    client.release();
    pool.end();
  }
}

seedTestUsers();
