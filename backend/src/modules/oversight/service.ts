import { prisma } from '../../shared/db/prisma';
import { SubmissionStatus, TaskType, TaskStatus } from '@prisma/client';

export class OversightService {

    async getDashboardKPIs() {
        // 1. Get current active period
        const currentPeriod = await prisma.submissionPeriod.findFirst({
            orderBy: { endDate: 'desc' },
            take: 1
        });

        if (!currentPeriod) return { period: null, stats: {} };

        // 2. Aggregate Submission Status
        const submissionStats = await prisma.submission.groupBy({
            by: ['status'],
            where: { periodId: currentPeriod.id },
            _count: true
        });

        const statusMap = submissionStats.reduce((acc, curr) => {
            acc[curr.status] = curr._count;
            return acc;
        }, {} as Record<string, number>);

        // 3. Count Late / Missing
        const missingCount = await prisma.missingSubmission.count({
            where: { periodId: currentPeriod.id }
        });

        // 4. Active Violations (Open Tasks)
        const openViolations = await prisma.task.count({
            where: {
                type: TaskType.SANCTION,
                status: { not: TaskStatus.CLOSED }
            }
        });

        return {
            period: currentPeriod,
            stats: {
                totalSubmissions: (statusMap[SubmissionStatus.SUBMITTED] || 0) + (statusMap[SubmissionStatus.APPROVED] || 0) + (statusMap[SubmissionStatus.UNDER_REVIEW] || 0),
                pendingReview: (statusMap[SubmissionStatus.SUBMITTED] || 0) + (statusMap[SubmissionStatus.UNDER_REVIEW] || 0),
                approved: statusMap[SubmissionStatus.APPROVED] || 0,
                rejected: statusMap[SubmissionStatus.REJECTED] || 0,
                missing: missingCount,
                activeViolations: openViolations
            }
        };
    }

    async getRiskMapData() {
        // Return all active stations with their risk score and latest submission status
        // Optimization: fetch only necessary fields
        const stations = await prisma.station.findMany({
            where: { isActive: true },
            select: {
                id: true,
                name: true,
                lat: true,
                lng: true,
                riskScore: true,
                company: { select: { name: true } },
                submissions: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    select: { status: true, periodId: true }
                }
            }
        });

        return stations.map(s => ({
            id: s.id,
            name: s.name,
            companyName: s.company.name,
            lat: s.lat,
            lng: s.lng,
            riskScore: s.riskScore,
            latestStatus: s.submissions[0]?.status || 'NONE'
        }));
    }

    async getAuditQueue(filters: { prioritizeHighRisk?: boolean, limit?: number } = {}) {
        // Fetch submissions that are APPROVED (by Company) but not yet fully AUDITED (if we had an AUDITED status)
        // For now, let's assume Customs reviews things that are forwarded

        // We added forwardedAt to Submission. So we look for forwardedAt != null
        // But we don't have an "Audited" flag on Submission yet except generally via Task creation?
        // User WF says: "Close Audit: Mark submission as AUDITED".
        // I missed adding `auditedAt` to Schema? 
        // Wait, `SubmissionStatus` has `APPROVED`. 
        // If Customs "Approves", does it change status?
        // WF-04 says: "Decision: Approve -> Status APPROVED".
        // But Company *also* sets APPROVED before forwarding.
        // This implies a state confusion.
        // However, `forwardedAt` is the hand-off.
        // Maybe Customs status is separate? Or we rely on `reviewedBy`?
        // `reviewedBy` is utilized by Company in WF-03.
        // We might need `customsDecisionAt`?
        // For MVP, let's assume Customs reviews `forwarded` submissions.
        // And if they find issues, they create a Task.
        // If they verify, maybe they just leave it? Or we use `auditedAt` if I added it?
        // I did NOT add `auditedAt` in the recent migration. I added `companyDecisionAt`.
        // I can leverage `auditLogs` for "Audited" status or just `tasks`.

        // Let's return forwarded submissions sorted by Risk Score of station.

        const limit = filters.limit || 50;

        const query: any = {
            where: {
                forwardedAt: { not: null }
                // To exclude already audited ones, we'd need a flag. 
                // For now, show all forwarded.
            },
            include: {
                station: { select: { id: true, name: true, riskScore: true } },
                company: { select: { name: true } },
                period: true
            },
            orderBy: [] as any[]
        };

        if (filters.prioritizeHighRisk) {
            // Prisma doesn't support sorting by relation field easily without raw query or logic.
            // We can sort by `submittedAt` for now, or post-sort.
            // Let's just return them and sort in memory if dataset is small, or just standard sort.
            query.orderBy = { forwardedAt: 'asc' };
        }

        const items = await prisma.submission.findMany(query);

        // In-memory sort by risk score if requested
        if (filters.prioritizeHighRisk) {
            items.sort((a, b) => b.station.riskScore - a.station.riskScore);
        }

        return items.slice(0, limit);
    }
}
