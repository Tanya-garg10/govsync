export type Role = "citizen" | "official" | "admin";

export interface User {
  id: string;
  name: string;
  role: Role;
  citizen_id?: string | null;
  department?: string | null;
}

export interface Citizen {
  id: string;
  name: string;
  dob?: string;
  mobile?: string;
  gender?: string;
  address?: string;
  photo_initials?: string;
}

export interface DocumentItem {
  id: string;
  type: string;
  name: string;
  verified: boolean;
}

export interface Service {
  id: string;
  name: string;
  category?: string;
  department?: string;
  processing_time?: string;
  eligibility?: string;
  required_info: string[];
  required_docs: string[];
  integrated: boolean;
}

export interface Consent {
  id: string;
  citizen_id: string;
  data_requested: string[];
  purpose: string;
  department: string;
  timestamp: string;
  status: string;
  expiry?: string;
}

export interface WorkflowStep {
  step: string;
  system: string;
  status: "done" | "active" | "pending" | string;
  timestamp: string | null;
  duration: string | null;
}

export interface Application {
  id: string;
  citizen_id: string;
  service_id: string;
  service_name: string;
  department: string;
  status: string;
  current_stage: string;
  assigned_officer: string;
  sla_target_days: number;
  created_at: string;
  updated_at: string;
  timeline: WorkflowStep[];
}

export interface Connector {
  id: string;
  name: string;
  department?: string;
  endpoint?: string;
  auth_type?: string;
  status: string;
  last_sync: string;
  requests_today: number;
  error_count: number;
  connector_type: string;
}

export interface IntegrationRequestLog {
  api_name: string;
  status: string;
  detail: string;
  timestamp: string;
}

export interface AuditLogEntry {
  timestamp: string;
  user: string;
  action: string;
  purpose: string;
  system: string;
  consent: string;
  status: string;
}

export interface ExceptionItem {
  id: string;
  api_name: string;
  status: string;
  error: string;
  attempts: number;
  request_id: string;
  citizen_id?: string | null;
  queued: boolean;
}

export interface NotificationItem {
  id: number;
  citizen_id: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface Grievance {
  id: string;
  citizen_id: string;
  subject: string;
  department: string;
  status: string;
  submitted_at: string;
}

export interface DataQualitySummary {
  valid_pct: number;
  duplicate: number;
  missing: number;
  invalid: number;
  conflicting: number;
}

export interface DataQualityIssue {
  id: number;
  issue_type: string;
  description: string;
  record_a?: any;
  record_b?: any;
  similarity?: number | null;
  resolved: boolean;
}

export interface SLARow {
  service_name: string;
  target_days: number;
  average_days: number;
  compliance_pct: number;
}
