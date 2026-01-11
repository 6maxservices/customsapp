import { prisma } from '../../shared/db/prisma';
import { NotFoundError, PermissionError } from '../../shared/errors';
import { AuthenticatedUser } from '../../shared/auth/auth-provider';
import { ObligationFrequency, UserRole } from '@prisma/client';

export interface ExpirationInfo {
  stationId: string;
  stationName: string;
  obligationId: string;
  obligationCode: string;
  obligationTitle: string;
  nextDueDate: Date | null;
  expiresOn: Date | null;
  isExpired: boolean;
  daysUntilDue: number | null;
}

export class DeadlinesService {
  /**
   * Calculate expiration dates for a station based on obligations
   */
  async calculateExpirationsForStation(stationId: string): Promise<ExpirationInfo[]> {
    const station = await prisma.station.findUnique({
      where: { id: stationId },
      include: { company: true },
    });

    if (!station) {
      throw new NotFoundError('Station', stationId);
    }

    // Get latest catalog version
    const catalogVersion = await prisma.obligationCatalogVersion.findFirst({
      orderBy: { effectiveDate: 'desc' },
      include: { obligations: true },
    });

    if (!catalogVersion) {
      return [];
    }

    // Get all annual/per-change obligations
    const obligations = catalogVersion.obligations.filter(
      (o) => o.frequency === ObligationFrequency.ANNUAL || o.frequency === ObligationFrequency.PER_CHANGE
    );

    // Get latest submission checks for this station to find last completion dates
    const submissions = await prisma.submission.findMany({
      where: { stationId },
      include: {
        checks: {
          include: { obligation: true },
          orderBy: { updatedAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit to recent submissions
    });

    const expirationInfos: ExpirationInfo[] = [];

    for (const obligation of obligations) {
      // Find the last completion date from submission checks
      let lastCompletionDate: Date | null = null;

      for (const submission of submissions) {
        const check = submission.checks.find((c) => c.obligationId === obligation.id);
        if (check && check.value && check.updatedAt) {
          lastCompletionDate = check.updatedAt;
          break;
        }
      }

      // Calculate next due date
      let nextDueDate: Date | null = null;
      let expiresOn: Date | null = null;

      if (lastCompletionDate) {
        if (obligation.frequency === ObligationFrequency.ANNUAL) {
          nextDueDate = new Date(lastCompletionDate);
          nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
          expiresOn = nextDueDate;
        }
        // PER_CHANGE obligations don't have a fixed expiration
      } else {
        // No completion found, consider it overdue
        expiresOn = new Date(); // Today
      }

      const isExpired = expiresOn ? expiresOn < new Date() : false;
      const daysUntilDue = nextDueDate
        ? Math.ceil((nextDueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : null;

      expirationInfos.push({
        stationId: station.id,
        stationName: station.name,
        obligationId: obligation.id,
        obligationCode: obligation.code,
        obligationTitle: obligation.title,
        nextDueDate,
        expiresOn,
        isExpired,
        daysUntilDue,
      });
    }

    return expirationInfos;
  }

  async getUpcomingExpirations(actor: AuthenticatedUser, daysAhead: number = 30) {
    let stations;

    if (actor.companyId) {
      stations = await prisma.station.findMany({
        where: { companyId: actor.companyId },
      });
    } else {
      // Customs users see all stations
      stations = await prisma.station.findMany();
    }

    const allExpirations: ExpirationInfo[] = [];

    for (const station of stations) {
      const expirations = await this.calculateExpirationsForStation(station.id);
      allExpirations.push(...expirations);
    }

    // Filter to upcoming expirations within daysAhead
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + daysAhead);

    const upcoming = allExpirations.filter((exp) => {
      if (!exp.expiresOn) return false;
      return exp.expiresOn <= cutoffDate && !exp.isExpired;
    });

    // Sort by expiration date
    upcoming.sort((a, b) => {
      if (!a.expiresOn) return 1;
      if (!b.expiresOn) return -1;
      return a.expiresOn.getTime() - b.expiresOn.getTime();
    });

    return upcoming;
  }

  async getExpiredItems(actor: AuthenticatedUser) {
    let stations;

    if (actor.companyId) {
      stations = await prisma.station.findMany({
        where: { companyId: actor.companyId },
      });
    } else {
      stations = await prisma.station.findMany();
    }

    const allExpirations: ExpirationInfo[] = [];

    for (const station of stations) {
      const expirations = await this.calculateExpirationsForStation(station.id);
      allExpirations.push(...expirations);
    }

    // Filter to expired items
    const expired = allExpirations.filter((exp) => exp.isExpired);

    // Sort by expiration date (most recently expired first)
    expired.sort((a, b) => {
      if (!a.expiresOn) return 1;
      if (!b.expiresOn) return -1;
      return b.expiresOn.getTime() - a.expiresOn.getTime();
    });

    return expired;
  }
}

