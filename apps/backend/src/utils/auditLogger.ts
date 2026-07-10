import { logger } from './logger';

/**
 * Interface defining the strict structure of an Immutable Audit Log event.
 */
export interface AuditEvent {
  action: 'DOCUMENT_UPLOADED' | 'DOCUMENT_DELETED' | 'VERIFICATION_CREATED' | 'ADMIN_ACTION';
  userId: string;
  resourceId: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}

/**
 * Audit Logger
 * 
 * NOTE: Currently this only emits to the standard logger for Sprint 0.5.
 * In a future sprint (Database Configuration), this service will WRITE 
 * immutably directly to an append-only `audit_logs` PostgreSQL table.
 */
export class AuditLogger {
  static async log(event: AuditEvent): Promise<void> {
    // 1. Log to standard stream (Console / Datadog / ELK)
    logger.info({
      type: 'AUDIT_EVENT',
      ...event,
    });

    // 2. Future: Prisma insert to an append-only table
    // await prisma.auditLog.create({ data: event });
  }
}
