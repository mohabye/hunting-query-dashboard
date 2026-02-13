#!/usr/bin/env node

/**
 * Database Initialization Script
 * 
 * This script initializes the database with default admin user
 * and other required data.
 * 
 * Usage: node scripts/init-db.js
 */

const mysql = require('mysql2/promise');
const readline = require('readline');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function initializeDatabase() {
  try {
    console.log('\n🚀 Hunting Query Dashboard - Database Initialization\n');
    console.log('=' .repeat(50));

    // Get database URL from environment
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.error('❌ DATABASE_URL not found in .env file');
      process.exit(1);
    }

    // Parse database URL
    const url = new URL(`mysql://${databaseUrl.replace('mysql://', '')}`);
    const config = {
      host: url.hostname,
      port: url.port || 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
    };

    console.log('\n📊 Database Configuration:');
    console.log(`  Host: ${config.host}:${config.port}`);
    console.log(`  Database: ${config.database}`);
    console.log(`  User: ${config.user}`);

    // Connect to database
    console.log('\n🔗 Connecting to database...');
    const connection = await mysql.createConnection(config);
    console.log('✅ Connected successfully\n');

    // Check if admin user exists
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE role = ?',
      ['admin']
    );

    if (users.length > 0) {
      console.log('ℹ️  Admin user already exists');
      console.log(`   Name: ${users[0].name}`);
      console.log(`   Email: ${users[0].email}`);
      
      const update = await question('\n❓ Do you want to update admin user? (y/n): ');
      if (update.toLowerCase() !== 'y') {
        console.log('\n✅ Database initialization skipped\n');
        await connection.end();
        process.exit(0);
      }
    }

    // Get admin user details
    console.log('\n📝 Enter Admin User Details:');
    const adminName = await question('  Admin Name (default: admin): ') || 'admin';
    const adminEmail = await question('  Admin Email (default: admin@example.com): ') || 'admin@example.com';
    const adminPassword = await question('  Admin Password (default: admin123): ') || 'admin123';

    // Create or update admin user
    if (users.length === 0) {
      await connection.execute(
        `INSERT INTO users (openId, name, email, loginMethod, role, createdAt, updatedAt, lastSignedIn)
         VALUES (?, ?, ?, ?, ?, NOW(), NOW(), NOW())`,
        [`admin-${Date.now()}`, adminName, adminEmail, 'local', 'admin']
      );
      console.log('\n✅ Admin user created successfully');
    } else {
      await connection.execute(
        'UPDATE users SET name = ?, email = ? WHERE role = ?',
        [adminName, adminEmail, 'admin']
      );
      console.log('\n✅ Admin user updated successfully');
    }

    // Create sample analyst user
    const createAnalyst = await question('\n❓ Create sample analyst user? (y/n): ');
    if (createAnalyst.toLowerCase() === 'y') {
      const analystName = await question('  Analyst Name (default: analyst): ') || 'analyst';
      const analystEmail = await question('  Analyst Email (default: analyst@example.com): ') || 'analyst@example.com';

      const [existing] = await connection.execute(
        'SELECT * FROM users WHERE email = ?',
        [analystEmail]
      );

      if (existing.length === 0) {
        await connection.execute(
          `INSERT INTO users (openId, name, email, loginMethod, role, createdAt, updatedAt, lastSignedIn)
           VALUES (?, ?, ?, ?, ?, NOW(), NOW(), NOW())`,
          [`analyst-${Date.now()}`, analystName, analystEmail, 'local', 'user']
        );
        console.log('✅ Analyst user created successfully');
      } else {
        console.log('ℹ️  Analyst user already exists');
      }
    }

    // Display summary
    console.log('\n' + '='.repeat(50));
    console.log('\n✨ Database initialization complete!\n');
    console.log('📋 Next Steps:');
    console.log('  1. Start the application: pnpm dev');
    console.log('  2. Open http://localhost:3000');
    console.log(`  3. Login with: ${adminName} / ${adminPassword}`);
    console.log('  4. Change password after first login\n');

    await connection.end();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('  1. Verify DATABASE_URL in .env file');
    console.error('  2. Ensure database server is running');
    console.error('  3. Check database credentials');
    console.error('  4. Run migrations first: pnpm db:push\n');
    process.exit(1);
  }
}

// Run initialization
initializeDatabase().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
