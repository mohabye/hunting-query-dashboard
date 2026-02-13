# Hunting Query Management Dashboard - Setup & Usage Guide

## Overview

The **Hunting Query Management Dashboard** is an interactive web-based application designed for threat hunting teams to manage, track, and visualize threat hunting queries mapped to MITRE ATT&CK procedures. The dashboard displays query details, data sources, threat levels, and hunt engagement metrics in a command-center-style interface.

## Features

- **Interactive Query Management**: Browse and filter hunting queries by threat level, data source type, and search terms
- **MITRE ATT&CK Integration**: Each query is mapped to specific MITRE ATT&CK procedures and tactics
- **Data Source Tracking**: Visualize which data sources (ETW, Sysmon, Network, Registry, File) are required for each query
- **Hunt Engagement Dashboard**: Track active and completed threat hunting campaigns with detection metrics
- **Advanced Filtering**: Filter queries by threat level (Critical, High, Medium, Low), enabled status, and search keywords
- **Coverage Metrics**: View query coverage percentages and detection counts
- **Responsive Design**: Works on desktop and tablet devices

## Quick Start

### Prerequisites

- Node.js 18+ (with pnpm package manager)
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation & Running

1. **Navigate to the project directory:**
   ```bash
   cd /home/ubuntu/hunting-query-dashboard
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Start the development server:**
   ```bash
   pnpm dev
   ```

4. **Access the dashboard:**
   - Open your browser and navigate to `http://localhost:3000`
   - The server will automatically reload on code changes

### Production Build

To create an optimized production build:

```bash
pnpm build
pnpm start
```

## Dashboard Interface

### Header Section

The header displays key metrics at a glance:
- **Total Queries**: Number of hunting queries in the system
- **Active**: Number of enabled queries currently in use
- **Critical**: Count of critical-severity queries
- **Detections**: Total number of detections across all queries
- **Active Hunts**: Number of ongoing hunt engagements

### Navigation Tabs

The dashboard has three main sections:

#### 1. Queries Tab
The primary view showing all hunting queries organized by MITRE ATT&CK procedure. Each procedure section displays:
- MITRE ID and procedure name
- Associated tactics (Execution, Persistence, Lateral Movement, etc.)
- Number of queries and severity breakdown
- Expandable query cards with detailed information

**Query Card Details:**
- Query name and threat level (hexagonal badge)
- Description and coverage percentage
- Detection count and last update date
- Expandable section showing:
  - Query syntax (WQL/SQL format)
  - Event IDs monitored
  - Required data sources with descriptions

**Filtering Options:**
- Search by query name
- Filter by threat level (Critical, High, Medium, Low)
- Show only active/enabled queries
- Combine multiple filters

#### 2. Hunts Tab
Displays active and completed threat hunting engagements:
- Hunt name and severity level
- Status (Active, Completed, Paused)
- Start and end dates
- Number of queries and total detections
- Procedures covered in the engagement

#### 3. Data Sources Tab
Lists all available data sources used by queries:
- Data source name and provider
- Type (ETW, Sysmon, Network, Registry, File)
- Description and status (Active/Inactive)
- Associated event IDs

## Data Structure

The dashboard loads data from `/hunting-data.json` containing:

### Procedures
MITRE ATT&CK procedures with:
- MITRE ID and name
- Description and associated tactics
- List of related query IDs

### Queries
Hunting queries with:
- Query name and description
- Threat level (critical, high, medium, low)
- Coverage percentage (0-100)
- Associated data sources
- Query syntax and event IDs
- Detection count and enabled status

### Data Sources
Data collection sources with:
- Type (ETW, Sysmon, Network, Registry, File)
- Provider and description
- Associated event IDs
- Enabled status

### Hunt Engagements
Threat hunting campaigns with:
- Engagement name and status
- Start/end dates
- Procedures covered
- Total queries and detections
- Severity level

## Customizing the Dashboard

### Adding New Queries

Edit `/client/public/hunting-data.json` and add a new query object to the `queries` array:

```json
{
  "id": "query_013",
  "name": "Your Query Name",
  "procedure_id": "proc_001",
  "description": "Description of what this query detects",
  "threat_level": "high",
  "coverage": 85,
  "data_sources": ["ds_001", "ds_003"],
  "query_syntax": "SELECT * FROM ...",
  "event_ids": ["4688"],
  "enabled": true,
  "last_updated": "2026-02-08",
  "detections": 0
}
```

### Adding New Procedures

Add a new procedure object to the `procedures` array:

```json
{
  "id": "proc_006",
  "name": "Procedure Name",
  "mitre_id": "T1234.567",
  "mitre_name": "MITRE ATT&CK Name",
  "description": "Description",
  "tactics": ["Tactic1", "Tactic2"],
  "queries": ["query_001", "query_002"]
}
```

### Adding New Data Sources

Add a new data source object to the `data_sources` array:

```json
{
  "id": "ds_009",
  "name": "Data Source Name",
  "type": "ETW",
  "description": "Description",
  "provider": "Provider Name",
  "event_ids": ["1234"],
  "enabled": true
}
```

## Design Philosophy

The dashboard follows a **Cybersecurity Command Center** design approach:

- **Dark Theme**: Reduces eye strain during extended monitoring sessions
- **Amber Accents**: Provides visual hierarchy and threat intelligence aesthetics
- **Hexagonal Threat Badges**: Distinctive visual elements for threat level indication
- **Monospace Fonts**: Technical data displayed in IBM Plex Mono for clarity
- **Modular Cards**: Clear separation of concerns with expandable details
- **Color Coding**: Threat levels use red (critical), orange (high), yellow (medium), blue (low)

## Browser Compatibility

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Considerations

- The dashboard loads data from a static JSON file for instant access
- Filtering and searching operations are performed client-side for responsiveness
- Smooth animations use CSS transitions and React's built-in animation support

## Troubleshooting

### Port Already in Use

If port 3000 is already in use, the dev server will automatically use port 3001. Check the console output for the actual port.

### Data Not Loading

1. Verify `/client/public/hunting-data.json` exists and is valid JSON
2. Check browser console for errors (F12 → Console tab)
3. Ensure the development server is running

### Styling Issues

1. Clear browser cache (Ctrl+Shift+Delete or Cmd+Shift+Delete)
2. Restart the development server
3. Check that Tailwind CSS is properly compiled

## API Integration (Future)

To connect to a real backend API:

1. Update the data fetching logic in `client/src/pages/Home.tsx`
2. Replace the static JSON fetch with API calls:
   ```typescript
   const response = await fetch('/api/hunting-data');
   ```

3. Implement backend endpoints for:
   - GET /api/hunting-data
   - POST /api/queries
   - PUT /api/queries/:id
   - DELETE /api/queries/:id

## Support & Development

For issues or feature requests, consider:
- Adding new query types (Windows Event Log, Linux auditd, etc.)
- Integrating with threat intelligence feeds
- Adding real-time detection updates
- Implementing user authentication and role-based access
- Creating export functionality (CSV, PDF reports)

## License

This project is provided as-is for threat hunting operations.
