// Types & Results
export * from "./types/result.type";

// Core DDD Constructs
export * from "./errors/domain.error";
export * from "./events/domain.event";
export * from "./value-objects/base.value-object";
export * from "./entities/base.entity";
export * from "./aggregates/aggregate-root";
export * from "./repositories/base.repository";

// Incident Domain
export * from "./aggregates/incident/incident-status.enum";
export * from "./aggregates/incident/incident-priority.enum";
export * from "./aggregates/incident/incident.aggregate";
export * from "./value-objects/geo-location.vo";
export * from "./events/incident/incident-reported.event";
export * from "./events/incident/incident-status-changed.event";
export * from "./repositories/incident.repository.port";

// Incident Analysis Domain (AI)
export * from "./aggregates/incident-analysis/ai-analysis.vo";
export * from "./aggregates/incident-analysis/incident-analysis.aggregate";
export * from "./repositories/incident-analysis.repository.port";
export * from "./services/ai.service.port";

// Agent Orchestration Domain (AI)
export * from "./aggregates/agent-session/agent.vo";
export * from "./aggregates/agent-session/agent-session.aggregate";
export * from "./repositories/agent-session.repository.port";
export * from "./services/agent-orchestrator.service.port";

// Communication & Collaboration Domain
export * from "./aggregates/communication/communication.vo";
export * from "./aggregates/communication/communication.aggregate";
export * from "./repositories/communication.repository.port";
export * from "./services/real-time.gateway.port";

// Offline Synchronization Domain
export * from "./aggregates/sync/sync.vo";
export * from "./aggregates/sync/sync.aggregate";
export * from "./repositories/sync.repository.port";
export * from "./services/sync.service.port";

// Resource Domain
export * from "./value-objects/resource-category.enum";
export * from "./value-objects/maintenance-status.enum";
export * from "./value-objects/resource-quantity.vo";
export * from "./entities/resource/reservation.entity";
export * from "./entities/resource/maintenance-record.entity";
export * from "./aggregates/resource/inventory-item.aggregate";
export * from "./aggregates/resource/resource-allocation.aggregate";
export * from "./events/resource/inventory-updated.event";
export * from "./events/resource/resource-allocated.event";
export * from "./repositories/inventory.repository.port";
export * from "./repositories/allocation.repository.port";

// Workforce Domain
export * from "./value-objects/responder-status.enum";
export * from "./value-objects/availability.vo";
export * from "./value-objects/contact-info.vo";
export * from "./entities/workforce/shift.entity";
export * from "./entities/workforce/certification.entity";
export * from "./aggregates/workforce/responder.aggregate";
export * from "./aggregates/workforce/team.aggregate";
export * from "./aggregates/workforce/organization.aggregate";
export * from "./events/workforce/responder-checked-in.event";
export * from "./events/workforce/team-dispatched.event";
export * from "./repositories/responder.repository.port";
export * from "./repositories/team.repository.port";
export * from "./repositories/organization.repository.port";

// Mission Domain
export * from "./value-objects/mission-status.enum";
export * from "./value-objects/task-status.enum";
export * from "./value-objects/priority.enum";
export * from "./value-objects/objective.vo";
export * from "./value-objects/deadline.vo";
export * from "./value-objects/task-dependency.vo";
export * from "./aggregates/mission/checklist-item.entity";
export * from "./aggregates/mission/task.entity";
export * from "./aggregates/mission/mission.aggregate";
export * from "./events/mission/mission-created.event";
export * from "./events/mission/task-assigned.event";
export * from "./events/mission/task-completed.event";
export * from "./repositories/mission.repository.port";

