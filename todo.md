# Hunting Query Dashboard - Complete Requirements

## Phase 1: Authentication & User Management ⚙️
- [ ] Create secure login page with username/password fields
- [ ] Implement login/logout functionality
- [ ] Display top bar with logged-in user information
- [ ] Show login/logout status in UI
- [ ] Implement role-based access control (Admin, Analyst)
- [ ] Create user roles in database
- [ ] Assign permissions to roles

## Phase 2: Admin Dashboard 👨‍💼
- [ ] Build admin dashboard interface
- [ ] Create user management CRUD operations
- [ ] Implement user creation form
- [ ] Implement user update/edit functionality
- [ ] Implement user deletion functionality
- [ ] Add role assignment interface
- [ ] Add permission assignment interface
- [ ] Create user activity monitoring view
- [ ] Track who created/edited what

## Phase 3: Query Creation Interface 📝
- [ ] Add "Create Query" button to navigation bar
- [ ] Create dropdown menu with two options (Manual/AI)
- [ ] Build manual query creation form
- [ ] Build AI-assisted query creation form
- [ ] Implement form validation
- [ ] Add query submission functionality

## Phase 4: Query Metadata & Storage 💾
- [ ] Store query content
- [ ] Store MITRE Technique ID
- [ ] Store technology covered (ELK, CrowdStrike, Splunk, etc.)
- [ ] Allow manual data source input (not pre-filled)
- [ ] Add "Created by AI" tag for AI-generated queries
- [ ] Add "Created by <username>" tag for manual queries
- [ ] Track creation timestamp
- [ ] Track last active/last used timestamp
- [ ] Track number of times query was used in hunting
- [ ] Store additional DFIR metadata
- [ ] Auto-add created queries to user's query list

## Phase 5: AI Integration - Query Creation 🤖
- [ ] Integrate ChatGPT API for query generation
- [ ] Accept user message input
- [ ] Accept structured fields (query text, technique ID, technology)
- [ ] Generate threat hunting queries with AI
- [ ] Auto-tag AI-generated queries
- [ ] Auto-generate proper metadata
- [ ] Automatically store results in database

## Phase 6: AI Integration - Query Translation 🔄
- [ ] Accept single technique ID for conversion
- [ ] Accept bulk list of technique IDs
- [ ] Convert queries to ELK format
- [ ] Convert queries to CrowdStrike format
- [ ] Convert queries to Splunk format
- [ ] Convert queries to Sentinel format
- [ ] Convert queries to SumoLogic format
- [ ] Store conversion results in database
- [ ] Update query records with converted versions

## Phase 7: MITRE ATT&CK Coverage Dashboard 🎯
- [ ] Build visual MITRE ATT&CK navigation
- [ ] Display techniques covered
- [ ] Display procedures covered
- [ ] Show coverage count per technique
- [ ] Show coverage count per procedure
- [ ] Implement technique click to show related queries
- [ ] Display query usage statistics per technique
- [ ] Display last activity time per technique
- [ ] Create interactive technique browser

## Phase 8: Statistics & Analytics Dashboard 📊
- [ ] Display total number of queries
- [ ] Show queries created by AI count
- [ ] Show queries created manually count
- [ ] Display rules created per user
- [ ] Show most covered technologies
- [ ] Display MITRE ATT&CK technique coverage metrics
- [ ] Show query usage frequency
- [ ] Highlight most active queries
- [ ] Create visual charts and graphs
- [ ] Display coverage trends

## Phase 9: Data Source Flexibility 🔌
- [ ] Remove hardcoded data sources (Sysmon, ETW)
- [ ] Allow analysts to manually define data sources
- [ ] Allow custom data source entry
- [ ] Store custom data sources in database
- [ ] Enable data source customization per environment

## Phase 10: Additional Enhancements 🚀
- [ ] Implement audit logging system
- [ ] Track who changed what and when
- [ ] Implement query versioning
- [ ] Create query approval workflow (optional)
- [ ] Add export to JSON functionality
- [ ] Add export to YAML functionality
- [ ] Add export to CSV functionality
- [ ] Implement advanced search functionality
- [ ] Implement filtering across queries and techniques
- [ ] Add multi-criteria filtering

## System Architecture Requirements ✅
- [x] Real project (not simulation/mockup)
- [x] Persistent database (TiDB/MySQL)
- [x] Proper API backend (tRPC)
- [x] Secure authentication and authorization
- [x] Scalable design for future integrations

## Completed Features ✅
- [x] Basic database schema
- [x] tRPC API setup
- [x] User authentication with OAuth
- [x] Query CRUD operations
- [x] Basic dashboard layout
- [x] Database schema extended with roles, permissions, audit logs
- [x] User management helpers
- [x] AI query generation helpers
- [x] Query translation helpers
- [x] MITRE analytics components
- [x] Fixed routing issue

## Recently Implemented ✅
- [x] Login page with secure authentication
- [x] Top navigation bar with user info and logout
- [x] Admin user management dashboard
- [x] User creation, update, and deletion forms
- [x] Role-based access control (Admin/Analyst)
- [x] User activity monitoring
- [x] Protected routes based on authentication

## In Progress 🔄
- [ ] UI/UX Redesign - Professional color scheme
- [ ] Fix color scheme - professional cybersecurity theme
- [ ] Improve visual hierarchy and contrast
- [ ] Redesign card layouts and spacing
- [ ] Fix typography and font sizes
- [ ] Improve button styling and interactions
- [ ] Fix form input styling
- [ ] Improve chart colors and readability
- [ ] Test all pages for visual consistency
