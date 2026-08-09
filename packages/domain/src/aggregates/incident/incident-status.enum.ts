export enum IncidentStatus {
  DRAFT = "DRAFT",             // Offline only
  REPORTED = "REPORTED",       // Initial state, awaiting triage
  ASSESSED = "ASSESSED",       // Triage complete
  ACTIVE = "ACTIVE",           // Responders engaged
  RESOLVED = "RESOLVED",       // Mitigated, awaiting commander review
  CLOSED = "CLOSED",           // Archived
}
