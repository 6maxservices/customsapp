import { prisma } from '../../shared/db/prisma';
import { NotFoundError, PermissionError, ValidationError } from '../../shared/errors';
import { AuthenticatedUser } from '../../shared/auth/auth-provider';
import { SubmissionStatus, UserRole } from '@prisma/client';
import { AuditLogger } from '../../shared/audit/audit-logger';

export interface CreateSubmissionCheckInput {
  obligationId: string;
  value?: string;
  notes?: string;
}

export interface UpdateSubmissionCheckInput {
  value?: string;
  notes?: string;
}

export interface CreateSubmissionInput {
  periodId: string;
  stationId: string;
}

export interface UpdateSubmissionStatusInput {
  status: SubmissionStatus;
}

export class SubmissionsService {
  private auditLogger = new AuditLogger();

  /**
   * Generate submission periods for a given month/year
   * Periods: 1-10, 11-20, 21-end of month
   */
  async generatePeriodsForMonth(year: number, month: number) {
    const endOfMonth = new Date(year, month, 0);

    const periods = [
      {
        startDate: new Date(year, month - 1, 1),
        endDate: new Date(year, month - 1, 10),
        deadlineDate: this.addWorkingDays(new Date(year, month - 1, 10), 2),
        periodNumber: 1,
        month,
        year,
      },
      {
        startDate: new Date(year, month - 1, 11),
        endDate: new Date(year, month - 1, 20),
        deadlineDate: this.addWorkingDays(new Date(year, month - 1, 20), 2),
        periodNumber: 2,
        month,
        year,
      },
      {
        startDate: new Date(year, month - 1, 21),
        endDate: endOfMonth,
        deadlineDate: this.addWorkingDays(endOfMonth, 2),
        periodNumber: 3,
        month,
        year,
      },
    ];

    // Create or update periods
    const createdPeriods = [];
    for (const period of periods) {
      const existing = await prisma.submissionPeriod.findUnique({
        where: {
          periodNumber_month_year: {
            periodNumber: period.periodNumber,
            month: period.month,
            year: period.year,
          },
        },
      });

      if (existing) {
        createdPeriods.push(existing);
      } else {
        const created = await prisma.submissionPeriod.create({ data: period });
        createdPeriods.push(created);
      }
    }

    return createdPeriods;
  }

  async getPeriodById(id: string) {
    const period = await prisma.submissionPeriod.findUnique({
      where: { id },
      include: { submissions: true },
    });

    if (!period) {
      throw new NotFoundError('Submission period', id);
    }

    return period;
  }

  async getCurrentPeriod() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    let periodNumber = 1;
    let startD = 1;
    let endD = 10;

    if (day > 10 && day <= 20) {
      periodNumber = 2;
      startD = 11;
      endD = 20;
    } else if (day > 20) {
      periodNumber = 3;
      startD = 21;
      endD = new Date(year, month, 0).getDate();
    }

    // 1. Try to find the period by its unique business key
    let period = await prisma.submissionPeriod.findUnique({
      where: {
        periodNumber_month_year: {
          periodNumber,
          month,
          year,
        },
      },
    });

    // 2. If it doesn't exist, create it automatically
    if (!period) {
      const startDate = new Date(year, month - 1, startD);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(year, month - 1, endD);
      endDate.setHours(23, 59, 59, 999);
      const deadlineDate = this.addWorkingDays(endDate, 2);

      period = await prisma.submissionPeriod.create({
        data: {
          startDate,
          endDate,
          deadlineDate,
          periodNumber,
          month,
          year,
        },
      });
    }

    return period;
  }

  async getUpcomingPeriods(limit: number = 3) {
    const now = new Date();
    return prisma.submissionPeriod.findMany({
      where: {
        startDate: { gte: now },
      },
      orderBy: { startDate: 'asc' },
      take: limit,
    });
  }

  async getSubmissionById(id: string, actor: AuthenticatedUser) {
    const submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        period: true,
        station: { include: { company: true } },
        company: true,
        submittedBy: true,
        reviewedBy: true,
        checks: { include: { obligation: true } },
      },
    });

    if (!submission) {
      throw new NotFoundError('Submission', id);
    }

    // Check tenant access
    if (actor.companyId !== submission.companyId && !this.isCustomsUser(actor)) {
      throw new PermissionError('Permission denied');
    }

    return submission;
  }

  async getSubmissionsByPeriod(periodId: string, actor: AuthenticatedUser) {
    await this.getPeriodById(periodId);

    if (actor.companyId) {
      // Company users see only their submissions
      return prisma.submission.findMany({
        where: {
          periodId,
          companyId: actor.companyId,
        },
        include: {
          station: true,
          submittedBy: true,
          reviewedBy: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    // Customs users see all submissions
    return prisma.submission.findMany({
      where: { periodId },
      include: {
        station: { include: { company: true } },
        company: true,
        submittedBy: true,
        reviewedBy: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllSubmissions(actor: AuthenticatedUser) {
    if (actor.companyId) {
      return prisma.submission.findMany({
        where: { companyId: actor.companyId },
        include: {
          period: true,
          station: true,
          submittedBy: true,
          reviewedBy: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return prisma.submission.findMany({
      include: {
        period: true,
        station: { include: { company: true } },
        company: true,
        submittedBy: true,
        reviewedBy: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createSubmission(input: CreateSubmissionInput, actor: AuthenticatedUser) {
    await this.getPeriodById(input.periodId);
    const station = await this.resolveStation(input.stationId);

    // Check tenant access
    if (actor.companyId !== station.companyId && !this.isCustomsUser(actor)) {
      throw new PermissionError('Permission denied');
    }

    // Check if submission already exists
    const existing = await prisma.submission.findUnique({
      where: {
        periodId_stationId: {
          periodId: input.periodId,
          stationId: station.id,
        },
      },
    });

    if (existing) {
      throw new ValidationError('Submission already exists for this period and station');
    }

    const submission = await prisma.submission.create({
      data: {
        periodId: input.periodId,
        stationId: station.id,
        companyId: station.companyId,
      },
      include: {
        period: true,
        station: { include: { company: true } },
        company: true,
      },
    });

    await this.auditLogger.log({
      actorId: actor.id,
      tenantId: station.companyId,
      entityType: 'Submission',
      entityId: submission.id,
      action: 'CREATE',
      diff: { periodId: input.periodId, stationId: station.id },
    });

    return submission;
  }

  async ensureActiveSubmission(stationIdOrSlug: string, actor: AuthenticatedUser) {
    // 1. Check tenant access & station existence first
    const station = await this.resolveStation(stationIdOrSlug);

    if (actor.companyId !== station.companyId && !this.isCustomsUser(actor)) {
      throw new PermissionError('Permission denied');
    }

    // 2. Get Current Period
    const period = await this.getCurrentPeriod();

    if (!period) {
      throw new Error('Could not establish current submission period');
    }

    // 3. Check if submission already exists for the CURRENT period
    const existing = await prisma.submission.findUnique({
      where: {
        periodId_stationId: {
          periodId: period.id,
          stationId: station.id,
        },
      },
      include: {
        period: true,
        station: { include: { company: true } },
        checks: { include: { obligation: true } },
      },
    });

    if (existing) {
      return existing;
    }

    // 4. Find previous submission for Auto-fill
    // We want the most recent submission (DRAFT, SUBMITTED, APPROVED doesn't matter, usually the last one worked on)
    const previousSubmission = await prisma.submission.findFirst({
      where: {
        stationId: station.id,
        period: {
          startDate: { lt: period.startDate }, // Strictly before current
        },
      },
      orderBy: {
        period: { startDate: 'desc' },
      },
      include: {
        checks: true,
        evidence: true,
      },
    });

    // 5. Create new DRAFT submission with copied checks
    const submission = await prisma.submission.create({
      data: {
        periodId: period.id,
        stationId: station.id,
        companyId: station.companyId,
        status: SubmissionStatus.DRAFT,
        checks: previousSubmission?.checks
          ? {
            create: previousSubmission.checks.map((check) => ({
              obligationId: check.obligationId,
              value: check.value,
              notes: check.notes,
            })),
          }
          : undefined,
      },
      include: {
        period: true,
        station: { include: { company: true } },
        company: true,
        checks: { include: { obligation: true } },
      },
    });

    // 6. Carry over evidence (Smart Referencing - points to the same physical file)
    if (previousSubmission?.evidence?.length) {
      for (const evidence of previousSubmission.evidence) {
        try {
          await prisma.evidence.create({
            data: {
              submissionId: submission.id,
              stationId: station.id,
              obligationId: evidence.obligationId,
              filename: evidence.filename,
              mimeType: evidence.mimeType,
              size: evidence.size,
              storagePath: evidence.storagePath, // Reference the SAME storage path
              uploadedById: evidence.uploadedById,
            }
          });
        } catch (copyError) {
          console.error(`Failed to carry over evidence ${evidence.id}:`, copyError);
        }
      }
    }

    await this.auditLogger.log({
      actorId: actor.id,
      tenantId: station.companyId,
      entityType: 'Submission',
      entityId: submission.id,
      action: 'CREATE',
      diff: {
        periodId: period.id,
        autoFilledFrom: previousSubmission?.id || 'none',
        checkCount: previousSubmission?.checks?.length || 0,
      },
    });

    return submission;
  }

  async submitSubmission(id: string, actor: AuthenticatedUser) {
    const submission = await this.getSubmissionById(id, actor);

    // Only company users can submit
    if (this.isCustomsUser(actor)) {
      throw new PermissionError('Only company users can submit submissions');
    }

    if (submission.status !== SubmissionStatus.DRAFT) {
      throw new ValidationError('Only draft submissions can be submitted');
    }

    const updated = await prisma.submission.update({
      where: { id },
      data: {
        status: SubmissionStatus.SUBMITTED,
        submittedAt: new Date(),
        submittedById: actor.id,
      },
      include: {
        period: true,
        station: { include: { company: true } },
        company: true,
        submittedBy: true,
      },
    });

    await this.auditLogger.log({
      actorId: actor.id,
      tenantId: updated.companyId,
      entityType: 'Submission',
      entityId: id,
      action: 'UPDATE',
      diff: { status: SubmissionStatus.SUBMITTED, submittedAt: updated.submittedAt },
    });

    return updated;
  }

  async reopenSubmission(id: string, actor: AuthenticatedUser) {
    const submission = await this.getSubmissionById(id, actor);

    // Only company users can reopen (Customs users use updateSubmissionStatus)
    if (this.isCustomsUser(actor)) {
      throw new PermissionError('Customs users should use the status update endpoint');
    }

    if (submission.status !== SubmissionStatus.SUBMITTED) {
      throw new ValidationError('Only submitted (but not reviewed) submissions can be reopened');
    }

    const updated = await prisma.submission.update({
      where: { id },
      data: {
        status: SubmissionStatus.DRAFT,
        submittedAt: null,
        submittedById: null,
      },
      include: {
        period: true,
        station: { include: { company: true } },
        company: true,
      },
    });

    await this.auditLogger.log({
      actorId: actor.id,
      tenantId: updated.companyId,
      entityType: 'Submission',
      entityId: id,
      action: 'UPDATE',
      diff: { status: SubmissionStatus.DRAFT, previousStatus: SubmissionStatus.SUBMITTED },
    });

    return updated;
  }

  async updateSubmissionStatus(
    id: string,
    input: UpdateSubmissionStatusInput,
    actor: AuthenticatedUser
  ) {
    // Only customs users can change submission status
    if (!this.isCustomsUser(actor)) {
      throw new PermissionError('Only customs users can change submission status');
    }

    await this.getSubmissionById(id, actor);

    const updateData: any = {
      status: input.status,
      reviewedAt: new Date(),
      reviewedById: actor.id,
    };

    const updated = await prisma.submission.update({
      where: { id },
      data: updateData,
      include: {
        period: true,
        station: { include: { company: true } },
        company: true,
        reviewedBy: true,
      },
    });

    await this.auditLogger.log({
      actorId: actor.id,
      tenantId: updated.companyId,
      entityType: 'Submission',
      entityId: id,
      action: 'UPDATE',
      diff: { status: input.status, reviewedAt: updated.reviewedAt },
    });

    return updated;
  }

  async getSubmissionCheck(submissionId: string, obligationId: string, actor: AuthenticatedUser) {
    await this.getSubmissionById(submissionId, actor);

    const check = await prisma.submissionCheck.findUnique({
      where: {
        submissionId_obligationId: {
          submissionId,
          obligationId,
        },
      },
      include: { obligation: true },
    });

    return check;
  }

  async createOrUpdateSubmissionCheck(
    submissionId: string,
    input: CreateSubmissionCheckInput,
    actor: AuthenticatedUser
  ) {
    const submission = await this.getSubmissionById(submissionId, actor);

    // Only company users can create/update checks on draft submissions
    if (this.isCustomsUser(actor) && submission.status !== SubmissionStatus.DRAFT) {
      throw new PermissionError('Cannot modify checks on submitted submissions');
    }

    if (submission.status !== SubmissionStatus.DRAFT && !this.isCustomsUser(actor)) {
      throw new PermissionError('Cannot modify checks on submitted submissions');
    }

    const check = await prisma.submissionCheck.upsert({
      where: {
        submissionId_obligationId: {
          submissionId,
          obligationId: input.obligationId,
        },
      },
      create: {
        submissionId,
        obligationId: input.obligationId,
        value: input.value,
        notes: input.notes,
      },
      update: {
        value: input.value,
        notes: input.notes,
      },
      include: { obligation: true },
    });

    await this.auditLogger.log({
      actorId: actor.id,
      tenantId: submission.companyId,
      entityType: 'SubmissionCheck',
      entityId: check.id,
      action: 'UPDATE',
      diff: {
        obligationId: input.obligationId,
        value: input.value,
        notes: input.notes,
      },
    });

    return check;
  }

  private async resolveStation(idOrSlug: string) {
    const station = await prisma.station.findFirst({
      where: {
        OR: [
          { id: idOrSlug },
          { slug: idOrSlug }
        ]
      },
      include: { company: true },
    });

    if (!station) {
      throw new NotFoundError('Station', idOrSlug);
    }

    return station;
  }

  private isCustomsUser(actor: AuthenticatedUser): boolean {
    const customsRoles: string[] = [
      UserRole.CUSTOMS_REVIEWER,
      UserRole.CUSTOMS_SUPERVISOR,
      UserRole.CUSTOMS_DIRECTOR,
      UserRole.SYSTEM_ADMIN,
    ];
    return customsRoles.includes(actor.role);
  }

  private addWorkingDays(date: Date, days: number): Date {
    const result = new Date(date);
    let added = 0;
    while (added < days) {
      result.setDate(result.getDate() + 1);
      // Skip weekends (Saturday = 6, Sunday = 0)
      if (result.getDay() !== 0 && result.getDay() !== 6) {
        added++;
      }
    }
    return result;
  }
}
