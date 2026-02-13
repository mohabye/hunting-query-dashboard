import mysql from 'mysql2/promise';
import 'dotenv/config';

async function setup() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const connection = await mysql.createConnection(url);
  console.log("Connected to database");

  try {
    // Create users table if not exists (simplified version for init)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        openId VARCHAR(64) NOT NULL UNIQUE,
        name TEXT,
        email VARCHAR(320),
        loginMethod VARCHAR(64),
        role ENUM('user', 'admin') DEFAULT 'user' NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
        lastSignedIn TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);
    console.log("Users table checked/created");

    // Insert default admin user
    const [rows] = await connection.query('SELECT * FROM users WHERE email = ?', ['admin@example.com']);
    if (rows.length === 0) {
      await connection.query(\`
        INSERT INTO users (openId, name, email, loginMethod, role)
        VALUES ('admin_local', 'Admin User', 'admin@example.com', 'local', 'admin')
      \`);
      console.log("Default admin user created");
    } else {
      console.log("Admin user already exists");
    }

  } catch (error) {
    console.error("Error during setup:", error);
  } finally {
    await connection.end();
  }
}

setup();
