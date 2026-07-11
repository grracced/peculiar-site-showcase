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

// ---------------------------------------------------------------------------
// Security Audit Logger — Sprint 1.8
// ---------------------------------------------------------------------------

/**
 * Enumeration of security-relevant events that must be tracked for
 * compliance, incident response, and anomaly detection.
 */
export enum SecurityEvent {
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_UNLOCKED = 'ACCOUNT_UNLOCKED',
  INVALID_JWT = 'INVALID_JWT',
  INVALID_REFRESH_TOKEN = 'INVALID_REFRESH_TOKEN',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  PASSWORD_RESET_REQUESTED = 'PASSWORD_RESET_REQUESTED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
}

/**
 * Structured payload for a security audit event.
 */
export interface SecurityAuditEvent {
  event: SecurityEvent;
  userId?: string;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  correlationId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Security Audit Logger
 *
 * Dedicated logger for authentication and authorization events.
 * Emits structured JSON logs that can be consumed by SIEM systems,
 * ELK stacks, or Datadog for real-time security monitoring.
 *
 * NOTE: In a future sprint, this will also persist to the audit_logs table.
 */
export class SecurityAuditLogger {
  static log(event: SecurityAuditEvent): void {
    const logLevel = SecurityAuditLogger.getLogLevel(event.event);

    logger[logLevel]({
      type: 'SECURITY_EVENT',
      event: event.event,
      userId: event.userId,
      email: event.email,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      correlationId: event.correlationId,
      metadata: event.metadata,
    });
  }

  /**
   * Determines the appropriate log level based on the security event severity.
   */
  private static getLogLevel(event: SecurityEvent): 'info' | 'warn' | 'error' {
    switch (event) {
      case SecurityEvent.LOGIN_SUCCESS:
      case SecurityEvent.ACCOUNT_UNLOCKED:
      case SecurityEvent.PASSWORD_CHANGED:
      case SecurityEvent.PASSWORD_RESET_REQUESTED:
        return 'info';

      case SecurityEvent.LOGIN_FAILED:
      case SecurityEvent.INVALID_JWT:
      case SecurityEvent.INVALID_REFRESH_TOKEN:
      case SecurityEvent.PERMISSION_DENIED:
      case SecurityEvent.RATE_LIMIT_EXCEEDED:
        return 'warn';

      case SecurityEvent.ACCOUNT_LOCKED:
      case SecurityEvent.SUSPICIOUS_ACTIVITY:
        return 'error';

      default:
        return 'warn';
    }
  }
}
