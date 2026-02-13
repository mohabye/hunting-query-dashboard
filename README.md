# Hunting Query Management Dashboard

**A comprehensive, production-ready DFIR (Digital Forensics and Incident Response) platform for managing threat hunting queries with MITRE ATT&CK integration and AI-powered query generation.**

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)

---

## 🎯 Overview

The **Hunting Query Management Dashboard** is a fully independent, self-hosted platform designed for security teams to:

- 📋 **Create and manage threat hunting queries** with custom data sources
- 🎯 **Map queries to MITRE ATT&CK techniques** for comprehensive coverage tracking
- 🤖 **Generate queries using AI** (ChatGPT integration) with automatic database updates
- 🔄 **Convert queries** between multiple security platforms (ELK, CrowdStrike, Splunk)
- 📊 **Track MITRE ATT&CK coverage** with detailed statistics and visualizations
- 👥 **Role-based access control** (Admin/Analyst) with audit logging
- 💾 **Persistent storage** with MySQL/TiDB database
- 🔐 **Secure authentication** with local login system

---

## ✨ Key Features

### Dashboard Management
- ✅ Create, edit, and delete hunting queries
- ✅ Bulk operations (select multiple queries for batch actions)
- ✅ Real-time dashboard updates
- ✅ Advanced search and filtering by category, technique, threat level
- ✅ Custom data source input (no predefined lists)
- ✅ Event ID tracking for Windows event log queries

### MITRE ATT&CK Integration
- ✅ Automatic technique mapping
- ✅ Coverage statistics (Tactics, Techniques, Procedures)
- ✅ Visual MITRE Navigator with coverage heatmap
- ✅ Procedure-level tracking and analytics
- ✅ Real-time coverage percentage calculation

### AI-Powered Features
- ✅ **Query Generator**: Create queries from natural language descriptions
- ✅ **Query Converter**: Transform queries for different SIEM platforms
- ✅ **Automatic Database Updates**: AI-generated queries saved directly to database
- ✅ **Structured Input**: Technique ID, technique name, and description prompts

### Security & Compliance
- ✅ Role-based access control (RBAC)
- ✅ Comprehensive audit logging
- ✅ User activity tracking
- ✅ Admin dashboard for user management
- ✅ Session-based authentication

### Query Statistics
- ✅ Execution count tracking
- ✅ False positive rate monitoring
- ✅ Detection effectiveness metrics
- ✅ Query usage analytics
- ✅ Performance trending

### Query Templates
- ✅ Pre-configured templates for common attack patterns
- ✅ Clone and customize existing templates
- ✅ Public and private template sharing
- ✅ Template usage tracking

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0 (or npm/yarn)
- **MySQL** >= 5.7 or **TiDB** >= 5.0
- **OpenAI API Key** (for AI features)

### Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/mohabye/hunting-query-dashboard.git
cd hunting-query-dashboard
```

#### 2. Install Dependencies
```bash
pnpm install
# or
npm install
```

#### 3. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database Configuration
DATABASE_URL="mysql://username:password@localhost:3306/hunting_queries"

# OpenAI API (for AI features)
OPENAI_API_KEY="sk-..."

# Server Configuration
NODE_ENV="development"
PORT=3000

# JWT Secret (for session management)
JWT_SECRET="your-secret-key-here"
```

#### 4. Setup Database

```bash
# Generate and run migrations
pnpm db:push
```

#### 5. Seed Initial Data (Optional)

The database will be created with default tables. You can manually add:
- **Admin User**: username: `admin`, password: `admin123`
- **Sample Queries**: Use the UI to create queries

#### 6. Start Development Server

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

---

## 📖 Usage Guide

### Login
1. Navigate to `http://localhost:3000/login`
2. Use credentials:
   - **Username**: `admin`
   - **Password**: `admin123`
3. Change password after first login (recommended)

### Create a Query
1. Go to **Dashboard**
2. Click **"+ Create New Query"**
3. Fill in:
   - **Query Name**: Descriptive name
   - **Category**: MITRE ATT&CK tactic
   - **Technique ID**: MITRE technique ID (e.g., T1595)
   - **Technique Name**: Full technique name
   - **Threat Level**: Critical/High/Medium/Low
   - **Data Sources**: Custom input (comma-separated)
   - **Event IDs**: Windows event IDs (comma-separated)
   - **Query Syntax**: Your hunting query
4. Click **Save**

### Use AI to Generate Queries
1. Go to **AI Tools** → **Query Generator**
2. Enter:
   - **Technique ID**: e.g., T1595
   - **Technique Name**: e.g., Active Scanning
   - **Description**: What you want to hunt for
3. Click **Generate**
4. Review and save to database

### Convert Queries Between Platforms
1. Go to **AI Tools** → **Query Converter**
2. Select a query from the dashboard
3. Choose target platform (ELK, CrowdStrike, Splunk)
4. Click **Convert**
5. Review converted query in popup

### View MITRE Coverage
1. Go to **MITRE Navigator**
2. See:
   - Total queries created
   - Techniques covered
   - Coverage percentage
   - Procedure-level statistics
3. Click on techniques to see related queries

### Admin Functions
1. Click user dropdown → **User Management**
2. Create new users
3. Assign roles (Admin/Analyst)
4. View activity logs

---

## 🏗️ Project Structure

```
hunting-query-dashboard/
├── client/                      # React frontend
│   ├── src/
│   │   ├── pages/              # Page components
│   │   │   ├── Home.tsx        # Dashboard
│   │   │   ├── Login.tsx       # Login page
│   │   │   ├── MitreNavigator.tsx
│   │   │   ├── AIQueryTools.tsx
│   │   │   └── AdminUsers.tsx
│   │   ├── components/         # Reusable components
│   │   ├── lib/                # Utilities
│   │   └── App.tsx             # Main app
│   └── public/                 # Static assets
│
├── server/                      # Express backend
│   ├── routers.ts              # tRPC routes
│   ├── queries.ts              # Database queries
│   ├── ai-service.ts           # ChatGPT integration
│   ├── local-auth-router.ts    # Authentication
│   ├── db.ts                   # Database helpers
│   └── _core/                  # Core server logic
│
├── drizzle/                     # Database schema
│   ├── schema.ts               # Table definitions
│   └── migrations/             # Migration files
│
├── shared/                      # Shared types and constants
│
├── .env.example                # Environment template
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
└── README.md                   # This file
```

---

## 🔧 Configuration

### Database Setup

#### MySQL
```bash
mysql -u root -p
CREATE DATABASE hunting_queries;
CREATE USER 'hunting'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON hunting_queries.* TO 'hunting'@'localhost';
FLUSH PRIVILEGES;
```

#### TiDB
```bash
tidb-server --port 4000
mysql -u root -h 127.0.0.1 -P 4000
CREATE DATABASE hunting_queries;
```

### OpenAI API Setup

1. Get API key from [OpenAI](https://platform.openai.com/api-keys)
2. Add to `.env`:
   ```env
   OPENAI_API_KEY="sk-..."
   ```

---

## 📊 Database Schema

### Core Tables

- **users**: User accounts and roles
- **hunting_queries**: Threat hunting queries
- **query_statistics**: Execution metrics and effectiveness
- **query_templates**: Pre-configured query templates
- **audit_logs**: User activity tracking
- **user_roles**: Role assignments
- **permissions**: Fine-grained access control

---

## 🤖 AI Integration

### Query Generation
```
User Input:
- Technique ID: T1595
- Technique Name: Active Scanning
- Description: Detect reconnaissance scanning activity

AI Output:
- Complete hunting query
- Mapped to technique
- Auto-saved to database
```

### Query Conversion
```
Input Query + Target Platform → AI → Converted Query
```

Supported platforms:
- ELK Query Syntax
- CrowdStrike Query Language
- Splunk SPL
- Custom platforms

---

## 🔐 Security

### Authentication
- Local username/password authentication
- Session-based with JWT tokens
- Automatic session expiration (24 hours)

### Authorization
- Role-based access control (RBAC)
- Admin-only features protected
- Audit logging of all actions

### Best Practices
- Change default admin password immediately
- Use strong database credentials
- Keep OpenAI API key secure
- Enable HTTPS in production
- Use environment variables for secrets

---

## 📈 Performance

### Optimization Tips
1. **Database Indexing**: Indexes on frequently queried fields
2. **Query Caching**: Cache MITRE technique data
3. **Pagination**: Implement pagination for large query lists
4. **Lazy Loading**: Load components on demand

### Scaling
- **Horizontal**: Add load balancer for multiple instances
- **Vertical**: Increase server resources
- **Database**: Use read replicas for analytics

---

## 🐛 Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
**Solution**: Ensure MySQL/TiDB is running and DATABASE_URL is correct

### OpenAI API Error
```
Error: 401 Unauthorized
```
**Solution**: Verify OPENAI_API_KEY is valid and has sufficient credits

### Port Already in Use
```
Error: listen EADDRINUSE :::3000
```
**Solution**: Change PORT in .env or kill process using port 3000

### TypeScript Errors
```bash
pnpm check
```

### Database Migration Issues
```bash
# Reset migrations (careful - deletes data)
rm -rf drizzle/migrations
pnpm db:push
```

---

## 📝 API Documentation

### tRPC Endpoints

#### Authentication
- `localAuth.login` - Login with credentials
- `localAuth.logout` - Logout user
- `localAuth.verifySession` - Verify session token

#### Queries
- `queries.list` - Get all queries
- `queries.create` - Create new query
- `queries.update` - Update query
- `queries.delete` - Delete query
- `queries.getTechniqueCoverage` - Get queries by technique

#### AI
- `ai.generateQuery` - Generate query with ChatGPT
- `ai.convertQuery` - Convert query to platform format

#### Admin
- `admin.users.list` - List all users
- `admin.users.create` - Create user
- `admin.users.update` - Update user
- `admin.users.delete` - Delete user

---

## 🧪 Testing

```bash
# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Watch mode
pnpm test:watch
```

---

## 📦 Deployment

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN pnpm install
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

### Production Build
```bash
pnpm build
pnpm start
```

### Environment Variables (Production)
```env
NODE_ENV=production
DATABASE_URL="mysql://prod_user:secure_password@db.example.com:3306/hunting"
OPENAI_API_KEY="sk-..."
JWT_SECRET="very-secure-random-string"
```

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙋 Support

For issues, questions, or suggestions:

1. Check [Troubleshooting](#-troubleshooting) section
2. Search existing GitHub issues
3. Create a new GitHub issue with:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details

---

## 🎓 Learning Resources

- [MITRE ATT&CK Framework](https://attack.mitre.org/)
- [Threat Hunting Guide](https://www.threathunting.net/)
- [DFIR Training](https://www.sans.org/cyber-aces/)

---

## 📞 Contact

- **Author**: Muhab Yahia
- **GitHub**: [@MuhapYahya](https://github.com/mohabye)

---

**Made with ❤️ for the security community**
