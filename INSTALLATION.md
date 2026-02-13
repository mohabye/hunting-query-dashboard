# Installation Guide

Complete step-by-step guide to set up the Hunting Query Management Dashboard on your system.

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Prerequisites Installation](#prerequisites-installation)
3. [Project Setup](#project-setup)
4. [Database Setup](#database-setup)
5. [Configuration](#configuration)
6. [Running the Application](#running-the-application)
7. [Verification](#verification)
8. [Troubleshooting](#troubleshooting)

---

## System Requirements

### Minimum Requirements
- **CPU**: 2 cores
- **RAM**: 4 GB
- **Storage**: 10 GB
- **OS**: Linux, macOS, or Windows (with WSL2)

### Recommended Requirements
- **CPU**: 4+ cores
- **RAM**: 8+ GB
- **Storage**: 50 GB SSD
- **OS**: Ubuntu 20.04+ / macOS 11+ / Windows 11 with WSL2

---

## Prerequisites Installation

### 1. Install Node.js (v18+)

#### Ubuntu/Debian
```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### macOS
```bash
# Using Homebrew
brew install node@18
brew link node@18
```

#### Windows
Download from [nodejs.org](https://nodejs.org/) and run installer

#### Verify Installation
```bash
node --version  # Should be v18.0.0 or higher
npm --version   # Should be v9.0.0 or higher
```

### 2. Install pnpm (Package Manager)

```bash
npm install -g pnpm
pnpm --version  # Should be v8.0.0 or higher
```

### 3. Install MySQL/TiDB

#### Option A: MySQL (Local)

**Ubuntu/Debian**
```bash
sudo apt-get update
sudo apt-get install -y mysql-server
sudo mysql_secure_installation
```

**macOS**
```bash
brew install mysql
brew services start mysql
mysql_secure_installation
```

**Windows**
Download from [mysql.com](https://dev.mysql.com/downloads/mysql/) and run installer

**Verify Installation**
```bash
mysql --version
mysql -u root -p  # Test login
```

#### Option B: TiDB (Docker)

```bash
# Install Docker first, then:
docker run -d \
  --name tidb \
  -p 4000:4000 \
  -p 10080:10080 \
  pingcap/tidb:latest
```

#### Option C: Cloud Database

- **AWS RDS**: Create MySQL instance
- **Google Cloud SQL**: Create MySQL instance
- **Azure Database**: Create MySQL instance
- **PlanetScale**: Free MySQL-compatible hosting

### 4. Install Git

```bash
# Ubuntu/Debian
sudo apt-get install -y git

# macOS
brew install git

# Windows
Download from https://git-scm.com/
```

### 5. Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API Keys
4. Create new secret key
5. Copy and save securely

---

## Project Setup

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/hunting-query-dashboard.git
cd hunting-query-dashboard
```

### 2. Install Dependencies

```bash
# Using pnpm (recommended)
pnpm install

# Or using npm
npm install

# Or using yarn
yarn install
```

**Expected output**: Should complete without errors and create `node_modules` folder

### 3. Verify Installation

```bash
pnpm --version
node --version
npm --version
```

---

## Database Setup

### Step 1: Create Database

#### Using MySQL CLI

```bash
# Connect to MySQL
mysql -u root -p

# In MySQL prompt, run:
CREATE DATABASE hunting_queries;
CREATE USER 'hunting'@'localhost' IDENTIFIED BY 'secure_password_here';
GRANT ALL PRIVILEGES ON hunting_queries.* TO 'hunting'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### Using MySQL Workbench

1. Open MySQL Workbench
2. Create new connection
3. Right-click "Databases" → "Create Database"
4. Name: `hunting_queries`
5. Click "Apply"

#### Using TiDB

```bash
# Connect to TiDB
mysql -h 127.0.0.1 -P 4000 -u root

# In TiDB prompt, run:
CREATE DATABASE hunting_queries;
CREATE USER 'hunting'@'%' IDENTIFIED BY 'secure_password_here';
GRANT ALL PRIVILEGES ON hunting_queries.* TO 'hunting'@'%';
FLUSH PRIVILEGES;
EXIT;
```

### Step 2: Configure Connection

Create `.env` file in project root:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
# For local MySQL
DATABASE_URL="mysql://hunting:secure_password_here@localhost:3306/hunting_queries"

# For TiDB
DATABASE_URL="mysql://hunting:secure_password_here@127.0.0.1:4000/hunting_queries"

# For cloud database
DATABASE_URL="mysql://user:password@db.example.com:3306/hunting_queries"
```

### Step 3: Run Migrations

```bash
# Generate and apply migrations
pnpm db:push

# Expected output:
# ✓ Your SQL migration file ➜ drizzle/0001_*.sql
# ✓ Migrations applied successfully
```

### Step 4: Verify Database

```bash
# Connect to database
mysql -u hunting -p hunting_queries

# List tables (should show 12 tables)
SHOW TABLES;

# Exit
EXIT;
```

---

## Configuration

### 1. Environment Variables

Edit `.env` file:

```env
# Required
DATABASE_URL="mysql://hunting:password@localhost:3306/hunting_queries"
OPENAI_API_KEY="sk-..."
JWT_SECRET="your-secret-key"

# Optional
NODE_ENV="development"
PORT=3000
```

### 2. Initial Admin User

The system creates an admin user automatically:

- **Username**: `admin`
- **Password**: `admin123`
- **Role**: Admin

**⚠️ IMPORTANT**: Change password after first login!

### 3. Verify Configuration

```bash
# Check environment variables are loaded
pnpm check

# Should show no errors
```

---

## Running the Application

### Development Mode

```bash
# Start development server with hot reload
pnpm dev

# Expected output:
# ✓ Server running at http://localhost:3000
# ✓ Ready for requests
```

### Production Mode

```bash
# Build application
pnpm build

# Start production server
pnpm start

# Expected output:
# ✓ Server running at http://localhost:3000
# ✓ Production mode enabled
```

### Docker Deployment

```bash
# Build Docker image
docker build -t hunting-dashboard .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="mysql://..." \
  -e OPENAI_API_KEY="sk-..." \
  hunting-dashboard
```

---

## Verification

### 1. Access Application

Open browser and navigate to:
```
http://localhost:3000
```

### 2. Login

Use credentials:
- **Username**: `admin`
- **Password**: `admin123`

### 3. Test Features

- [ ] Dashboard loads without errors
- [ ] Can create new query
- [ ] Can view MITRE Navigator
- [ ] Can access AI Tools
- [ ] Can access Admin panel

### 4. Check Logs

```bash
# View server logs
tail -f .manus-logs/devserver.log

# View browser console
# Open DevTools (F12) → Console tab
```

---

## Troubleshooting

### Database Connection Error

**Error**: `connect ECONNREFUSED 127.0.0.1:3306`

**Solutions**:
1. Verify MySQL is running:
   ```bash
   # macOS
   brew services list | grep mysql
   
   # Ubuntu
   sudo systemctl status mysql
   
   # Windows
   # Check Services app
   ```

2. Check DATABASE_URL is correct:
   ```bash
   # Test connection
   mysql -u hunting -p -h localhost hunting_queries
   ```

3. Verify user has permissions:
   ```bash
   mysql -u root -p
   SHOW GRANTS FOR 'hunting'@'localhost';
   ```

### OpenAI API Error

**Error**: `401 Unauthorized`

**Solutions**:
1. Verify API key is valid:
   ```bash
   # Check .env file
   cat .env | grep OPENAI_API_KEY
   ```

2. Check API key has credits:
   - Go to [OpenAI Platform](https://platform.openai.com/account/billing/overview)
   - Verify account has usage quota

3. Regenerate API key if needed

### Port Already in Use

**Error**: `listen EADDRINUSE :::3000`

**Solutions**:
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 pnpm dev
```

### Node Modules Issues

**Error**: `Cannot find module`

**Solutions**:
```bash
# Clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Or
pnpm install --force
```

### TypeScript Errors

**Error**: `TS2451: Cannot redeclare block-scoped variable`

**Solutions**:
```bash
# Type check
pnpm check

# Fix errors
pnpm check --fix

# Or rebuild
pnpm build
```

### Database Migration Issues

**Error**: `Migration failed`

**Solutions**:
```bash
# Check migration status
pnpm db:push --verbose

# Reset migrations (⚠️ deletes data)
rm -rf drizzle/migrations
pnpm db:push

# Or rollback to previous state
git checkout drizzle/migrations
```

### Memory Issues

**Error**: `JavaScript heap out of memory`

**Solutions**:
```bash
# Increase Node memory
NODE_OPTIONS=--max-old-space-size=4096 pnpm dev

# Or in .env
NODE_OPTIONS="--max-old-space-size=4096"
```

---

## Next Steps

After successful installation:

1. **Change Admin Password**
   - Login with admin/admin123
   - Go to User Management
   - Change password

2. **Create Additional Users**
   - Admin panel → User Management
   - Add team members with Analyst role

3. **Configure AI Features**
   - Verify OpenAI API key works
   - Test query generation

4. **Import Queries**
   - Create sample queries
   - Map to MITRE techniques
   - Test MITRE Navigator

5. **Set Up Backups**
   - Schedule database backups
   - Test restore procedure

6. **Deploy to Production**
   - Follow deployment guide
   - Set up SSL/TLS
   - Configure firewall rules

---

## Getting Help

- Check [README.md](README.md) for feature documentation
- Review [Troubleshooting](#troubleshooting) section
- Check application logs
- Open GitHub issue with:
  - Error message
  - Steps to reproduce
  - Environment details

---

**Installation complete! 🎉**

Your Hunting Query Management Dashboard is ready to use.
