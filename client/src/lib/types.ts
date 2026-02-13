/**
 * Hunting Query Dashboard - Data Types
 * Defines TypeScript interfaces for threat hunting queries, procedures, and data sources
 */

export interface DataSource {
  id: string;
  name: string;
  type: 'ETW' | 'Sysmon' | 'Network' | 'Registry' | 'File';
  description: string;
  provider: string;
  event_ids: string[];
  enabled: boolean;
}

export interface Query {
  id: string;
  name: string;
  procedure_id: string;
  description: string;
  threat_level: 'critical' | 'high' | 'medium' | 'low';
  coverage: number; // 0-100 percentage
  data_sources: string[]; // IDs of data sources
  query_syntax: string;
  event_ids: string[];
  enabled: boolean;
  last_updated: string;
  detections: number;
}

export interface Procedure {
  id: string;
  name: string;
  mitre_id: string;
  mitre_name: string;
  description: string;
  tactics: string[];
  queries: string[]; // Query IDs
}

export interface HuntEngagement {
  id: string;
  name: string;
  start_date: string;
  end_date: string | null;
  status: 'active' | 'completed' | 'paused';
  procedures_covered: string[]; // Procedure IDs
  total_queries: number;
  detections_found: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface HuntingData {
  procedures: Procedure[];
  queries: Query[];
  data_sources: DataSource[];
  hunt_engagements: HuntEngagement[];
}

export interface FilterState {
  threat_level: string[];
  data_source_type: string[];
  enabled_only: boolean;
  search_query: string;
}
