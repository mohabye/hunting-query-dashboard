# Deployment Guide

Complete guide for deploying the Hunting Query Management Dashboard to production environments.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Deployment Options](#deployment-options)
4. [Post-Deployment](#post-deployment)
5. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Pre-Deployment Checklist

- [ ] All tests passing: `pnpm test`
- [ ] No TypeScript errors: `pnpm check`
- [ ] Environment variables configured
- [ ] Database backups created
- [ ] SSL/TLS certificates obtained
- [ ] Firewall rules configured
- [ ] Admin password changed from default
- [ ] OpenAI API key validated
- [ ] Database has sufficient storage
- [ ] Monitoring and logging configured

---

## Environment Setup

### Production Environment Variables

Create `.env.production`:

```env
# Server
NODE_ENV=production
PORT=3000

# Database (use strong credentials)
DATABASE_URL="mysql://prod_user:strong_password@db.example.com:3306/hunting_prod"

# Security
JWT_SECRET="generate-with-openssl-rand-base64-32"

# OpenAI
OPENAI_API_KEY="sk-..."

# Optional
LOG_LEVEL=info
CORS_ORIGINS="https://yourdomain.com"
```

### Generate Secure JWT Secret

```bash
openssl rand -base64 32
```

---

## Deployment Options

### Option 1: Traditional VPS (Ubuntu/Debian)

#### 1. Prepare Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm
npm install -g pnpm

# Install MySQL
sudo apt install -y mysql-server

# Install Nginx
sudo apt install -y nginx
```

#### 2. Clone and Setup

```bash
# Create app directory
sudo mkdir -p /var/www/hunting-dashboard
sudo chown $USER:$USER /var/www/hunting-dashboard

# Clone repository
cd /var/www/hunting-dashboard
git clone https://github.com/yourusername/hunting-query-dashboard.git .

# Install dependencies
pnpm install --prod

# Setup environment
cp .env.example .env.production
# Edit .env.production with production values
```

#### 3. Database Setup

```bash
# Create database
sudo mysql -u root -p << EOF
CREATE DATABASE hunting_prod;
CREATE USER 'hunting'@'localhost' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON hunting_prod.* TO 'hunting'@'localhost';
FLUSH PRIVILEGES;
EOF

# Run migrations
NODE_ENV=production pnpm db:push
```

#### 4. Build Application

```bash
pnpm build
```

#### 5. Setup Systemd Service

Create `/etc/systemd/system/hunting-dashboard.service`:

```ini
[Unit]
Description=Hunting Query Dashboard
After=network.target mysql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/hunting-dashboard
Environment="NODE_ENV=production"
EnvironmentFile=/var/www/hunting-dashboard/.env.production
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

Enable and start service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable hunting-dashboard
sudo systemctl start hunting-dashboard
sudo systemctl status hunting-dashboard
```

#### 6. Setup Nginx Reverse Proxy

Create `/etc/nginx/sites-available/hunting-dashboard`:

```nginx
upstream hunting_app {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL certificates (use Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    location / {
        proxy_pass http://hunting_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/hunting-dashboard /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 7. Setup SSL with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com
```

---

### Option 2: Docker Deployment

#### 1. Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --prod

# Copy source
COPY . .

# Build
RUN pnpm build

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start
CMD ["node", "dist/index.js"]
```

#### 2. Create docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DATABASE_URL: mysql://hunting:password@db:3306/hunting_prod
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - db
    restart: unless-stopped
    networks:
      - hunting-network

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: hunting_prod
      MYSQL_USER: hunting
      MYSQL_PASSWORD: password
    volumes:
      - db_data:/var/lib/mysql
    restart: unless-stopped
    networks:
      - hunting-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    restart: unless-stopped
    networks:
      - hunting-network

volumes:
  db_data:

networks:
  hunting-network:
    driver: bridge
```

#### 3. Deploy with Docker

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop
docker-compose down
```

---

### Option 3: Cloud Platforms

#### Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create hunting-dashboard

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set DATABASE_URL="mysql://..."
heroku config:set OPENAI_API_KEY="sk-..."
heroku config:set JWT_SECRET="..."

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

#### Railway.app

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy
railway up
```

#### Vercel (Frontend only)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in dashboard
```

---

## Post-Deployment

### 1. Verify Deployment

```bash
# Test application
curl https://yourdomain.com

# Check health endpoint
curl https://yourdomain.com/api/health

# View logs
tail -f /var/log/syslog | grep hunting-dashboard
```

### 2. Setup Backups

#### Automated MySQL Backups

Create `/usr/local/bin/backup-hunting-db.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/backups/hunting-db"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="hunting_prod"
DB_USER="hunting"
DB_PASS="password"

mkdir -p $BACKUP_DIR

mysqldump -u $DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/hunting_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "hunting_*.sql.gz" -mtime +30 -delete
```

Add to crontab:

```bash
0 2 * * * /usr/local/bin/backup-hunting-db.sh
```

### 3. Setup Monitoring

#### Using Prometheus + Grafana

```bash
# Install Prometheus
sudo apt install -y prometheus

# Configure /etc/prometheus/prometheus.yml
# Add hunting-dashboard job

# Install Grafana
sudo apt install -y grafana-server
sudo systemctl start grafana-server
```

#### Application Monitoring

Add monitoring endpoint to application:

```typescript
app.get('/api/metrics', (req, res) => {
  res.json({
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    queries: queryCount,
    users: userCount,
  });
});
```

---

## Monitoring & Maintenance

### Daily Tasks

- [ ] Check application logs
- [ ] Monitor database size
- [ ] Verify backups completed
- [ ] Check SSL certificate expiration

### Weekly Tasks

- [ ] Review error logs
- [ ] Check performance metrics
- [ ] Verify user activity
- [ ] Test backup restoration

### Monthly Tasks

- [ ] Update dependencies: `pnpm update`
- [ ] Security audit
- [ ] Database optimization
- [ ] Review and rotate logs

### Security Updates

```bash
# Check for vulnerabilities
pnpm audit

# Fix vulnerabilities
pnpm audit --fix

# Update dependencies
pnpm update

# Rebuild and redeploy
pnpm build
systemctl restart hunting-dashboard
```

---

## Troubleshooting

### Application Won't Start

```bash
# Check logs
systemctl status hunting-dashboard
journalctl -u hunting-dashboard -n 50

# Verify environment
cat /var/www/hunting-dashboard/.env.production

# Test database connection
mysql -u hunting -p -h localhost hunting_prod
```

### High Memory Usage

```bash
# Check process
ps aux | grep node

# Increase heap size
NODE_OPTIONS=--max-old-space-size=4096 node dist/index.js

# Monitor memory
watch -n 1 'ps aux | grep node'
```

### Database Connection Issues

```bash
# Test connection
mysql -u hunting -p -h db.example.com hunting_prod

# Check firewall
sudo ufw status
sudo ufw allow from 0.0.0.0/0 to any port 3306

# Verify credentials
cat /var/www/hunting-dashboard/.env.production | grep DATABASE_URL
```

---

## Rollback Procedure

```bash
# Stop application
sudo systemctl stop hunting-dashboard

# Backup current version
cp -r /var/www/hunting-dashboard /var/www/hunting-dashboard.backup

# Revert to previous commit
cd /var/www/hunting-dashboard
git checkout previous-commit-hash

# Reinstall dependencies
pnpm install --prod

# Rebuild
pnpm build

# Start application
sudo systemctl start hunting-dashboard

# Verify
curl https://yourdomain.com
```

---

## Performance Optimization

### Database

```sql
-- Add indexes
CREATE INDEX idx_queries_category ON hunting_queries(category);
CREATE INDEX idx_queries_technique ON hunting_queries(techniqueId);
CREATE INDEX idx_queries_created ON hunting_queries(createdAt);

-- Optimize tables
OPTIMIZE TABLE hunting_queries;
OPTIMIZE TABLE users;
```

### Application

```typescript
// Enable caching
app.use(compression());
app.use(cors());

// Connection pooling
const pool = mysql.createPool({
  min: 5,
  max: 20,
  idleTimeoutMillis: 30000,
});
```

---

**Deployment complete! 🚀**

Your application is now running in production.
