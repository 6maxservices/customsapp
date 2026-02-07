import { prisma } from '../../shared/db/prisma';
import { NotFoundError, PermissionError } from '../../shared/errors';
import { AuthenticatedUser } from '../../shared/auth/auth-provider';
import { UserRole } from '@prisma/client';

export interface ExportOptions {
  periodId?: string;
  companyId?: string;
  stationId?: string;
  format: 'csv' | 'json';
}

export class ReportingService {
  async exportSubmissions(options: ExportOptions, actor: AuthenticatedUser) {
    // Build where clause based on permissions
    const where: any = {};

    if (options.periodId) {
      where.periodId = options.periodId;
    }

    if (options.stationId) {
      where.stationId = options.stationId;
    } else if (options.companyId) {
      where.companyId = options.companyId;
    } else if (actor.companyId) {
      // Company users can only export their own data
      where.companyId = actor.companyId;
    } else if (!this.isCustomsUser(actor)) {
      throw new PermissionError('Permission denied');
    }

    const submissions = await prisma.submission.findMany({
      where,
      include: {
        period: true,
        station: { include: { company: true } },
        company: true,
        submittedBy: true,
        reviewedBy: true,
        checks: {
          include: { obligation: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (options.format === 'csv') {
      return this.exportSubmissionsToCSV(submissions);
    } else {
      return JSON.stringify(submissions, null, 2);
    }
  }

  private exportSubmissionsToCSV(submissions: any[]): string {
    if (submissions.length === 0) {
      return 'No data';
    }

    // Build CSV header
    const headers = [
      'Period',
      'Company',
      'Station',
      'Status',
      'Submitted At',
      'Submitted By',
      'Reviewed At',
      'Reviewed By',
    ];

    // Build CSV rows
    const rows = submissions.map((submission) => {
      return [
        `${submission.period.startDate.toISOString().split('T')[0]} - ${submission.period.endDate.toISOString().split('T')[0]}`,
        submission.company.name,
        submission.station.name,
        submission.status,
        submission.submittedAt?.toISOString() || '',
        submission.submittedBy?.email || '',
        submission.reviewedAt?.toISOString() || '',
        submission.reviewedBy?.email || '',
      ];
    });

    // Combine headers and rows
    const csvRows = [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))];

    return csvRows.join('\n');
  }

  private isCustomsUser(actor: AuthenticatedUser): boolean {
    const customsRoles = new Set<UserRole>([
      UserRole.CUSTOMS_REVIEWER,
      UserRole.CUSTOMS_SUPERVISOR,
      UserRole.CUSTOMS_DIRECTOR,
      UserRole.SYSTEM_ADMIN,
    ]);
    return customsRoles.has(actor.role);
  }
}

