import { prisma } from '../../shared/db/prisma';
import { AuthenticatedUser } from '../../shared/auth/auth-provider';
import { NotFoundError, UnauthorizedError } from '../../shared/errors';
import { SubmissionsService } from '../submissions/service';

export class DashboardService {
    private submissionsService = new SubmissionsService();

    async getStationDashboard(user: AuthenticatedUser) {
        if (!user.stationId) {
            throw new UnauthorizedError('User is not assigned to a station');
        }

        const station = await prisma.station.findUnique({
            where: { id: user.stationId },
            select: { id: true, name: true, amdika: true, isActive: true }
        });

        if (!station) throw new NotFoundError('Station not found');

        // 1. Get Last Finalized Submission
        const lastSubmission = await prisma.submission.findFirst({
            where: {
                stationId: station.id,
                status: { in: ['SUBMITTED', 'APPROVED', 'REJECTED', 'UNDER_REVIEW'] }
            },
            orderBy: { period: { endDate: 'desc' } },
            include: {
                period: true,
                checks: { include: { obligation: true } }
            }
        });

        // 2. Get Notifications (Pending Deadlines, Open Tasks)
        const pendingTasks = await prisma.task.findMany({
            where: {
                stationId: station.id,
                status: { in: ['AWAITING_COMPANY', 'ESCALATED'] },
            }
        });

        // 3. Current Period Info - USE SINGLE SOURCE OF TRUTH
        const currentPeriod = await this.submissionsService.getCurrentPeriod();

        // 3b. Try to find the ACTUAL Active Submission for this period
        let activeSubmission = null;

        if (currentPeriod) {
            activeSubmission = await prisma.submission.findUnique({
                where: {
                    periodId_stationId: {
                        periodId: currentPeriod.id,
                        stationId: station.id
                    }
                },
                include: {
                    checks: { include: { obligation: true } }
                }
            });
        }

        return {
            station: {
                id: station.id,
                name: station.name,
                amdika: station.amdika,
                status: station.isActive ? 'ACTIVE' : 'INACTIVE'
            },
            lastSubmission: lastSubmission ? {
                period: { start: lastSubmission.period.startDate, end: lastSubmission.period.endDate },
                status: lastSubmission.status,
                checks: lastSubmission.checks.reduce((acc, check) => {
                    acc[check.obligation.title] = check.value;
                    return acc;
                }, {} as Record<string, any>)
            } : undefined,
            currentPeriod: {
                id: currentPeriod?.id || 'current',
                start: currentPeriod.startDate,
                end: currentPeriod.endDate,
                deadline: currentPeriod.deadlineDate
            },
            currentSubmission: activeSubmission ? {
                id: activeSubmission.id,
                status: activeSubmission.status,
                checks: activeSubmission.checks.map(c => ({
                    obligationId: c.obligationId,
                    title: c.obligation.title,
                    code: c.obligation.code,
                    value: c.value,
                    notes: c.notes,
                    fieldType: c.obligation.fieldType
                }))
            } : null,
            notifications: [
                ...pendingTasks.map(t => ({
                    id: t.id,
                    type: t.severity === 'CRITICAL' ? 'ERROR' : 'WARNING',
                    message: `Ticket: ${t.title}`
                })),
                { id: '1', type: 'INFO', message: `Deadline for current period is in ${Math.ceil((currentPeriod.deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days` }
            ]
        };
    }
}
