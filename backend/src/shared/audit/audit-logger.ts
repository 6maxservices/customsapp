import { prisma } from '../db/prisma';
import { AuthenticatedUser } from '../auth/auth-provider';

export interface AuditLogEntry {
  actorId: string;
  tenantId?: string | null;
  entityType: string;
  entityId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  diff?: Record<string, any>;
}

export class AuditLogger {
  /**
   * Log an audit event
   */
  async log(entry: AuditLogEntry): Promise<void> {
    await prisma.auditLog.create({
      data: {
        actorId: entry.actorId,
        tenantId: entry.tenantId,
        entityType: entry.entityType,
        entityId: entry.entityId,
        action: entry.action,
        diff: entry.diff ? JSON.stringify(entry.diff) : null,
      },
    });
  }

  /**
   * Get audit logs for an entity
   */
  async getLogsForEntity(entityType: string, entityId: string) {
    return prisma.auditLog.findMany({
      where: {
        entityType,
        entityId,
      },
      include: {
        actor: true,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });
  }

  /**
   * Get audit logs for a tenant
   */
  async getLogsForTenant(tenantId: string, limit: number = 100) {
    return prisma.auditLog.findMany({
      where: {
        tenantId,
      },
      include: {
        actor: true,
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
    });
  }

  /**
   * Get audit logs for an actor
   */
  async getLogsForActor(actorId: string, limit: number = 100) {
    return prisma.auditLog.findMany({
      where: {
        actorId,
      },
      include: {
        actor: true,
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
    });
  }
}

