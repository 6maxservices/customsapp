import { prisma } from '../../shared/db/prisma';
import { NotFoundError, PermissionError, ValidationError } from '../../shared/errors';
import { AuthenticatedUser } from '../../shared/auth/auth-provider';
import { SubmissionStatus, UserRole } from '@prisma/client';

export class CompanyService {

    async getDashboardStats(companyId: string) {
        // 1. Get current active period
        const currentPeriod = await prisma.submissionPeriod.findFirst({
            orderBy: { endDate: 'desc' },
            take: 1
        });

        if (!currentPeriod) return { total: 0, compliant: 0, pending: 0, missing: 0 };

        // 2. Count Submissions by Status for this company in current period
        const submissions = await prisma.submission.groupBy({
            by: ['status'],
            where: {
                companyId,
                periodId: currentPeriod.id
            },
            _count: true
        });

        // 3. Count Missing Submissions
        const missingCount = await prisma.missingSubmission.count({
            where: {
                companyId,
                periodId: currentPeriod.id
            }
        });

        // 4. Count Total Stations
        const totalStations = await prisma.station.count({
            where: { companyId, isActive: true }
        });

        const statusMap = submissions.reduce((acc, curr) => {
            acc[curr.status] = curr._count;
            return acc;
        }, {} as Record<string, number>);

        return {
            period: currentPeriod,
            totalStations,
            stats: {
                submitted: statusMap[SubmissionStatus.SUBMITTED] || 0,
                underReview: statusMap[SubmissionStatus.UNDER_REVIEW] || 0,
                approved: statusMap[SubmissionStatus.APPROVED] || 0,
                missing: missingCount,
                rejected: statusMap[SubmissionStatus.REJECTED] || 0
            }
        };
    }

    async getReviewQueue(companyId: string, periodId?: string) {
        const where: any = {
            companyId,
            status: {
                in: [SubmissionStatus.SUBMITTED, SubmissionStatus.UNDER_REVIEW, SubmissionStatus.APPROVED]
            }
        };

        if (periodId) {
            where.periodId = periodId;
        }

        return prisma.submission.findMany({
            where,
            include: {
                station: { select: { id: true, name: true, city: true } },
                period: true,
                submittedBy: { select: { email: true } }
            },
            orderBy: [
                { status: 'asc' }, // SUBMITTED first, then UNDER_REVIEW
                { submittedAt: 'asc' }
            ]
        });
    }

    async startReview(submissionId: string, actor: AuthenticatedUser) {
        const submission = await this.validateAccess(submissionId, actor);

        if (submission.status !== SubmissionStatus.SUBMITTED) {
            throw new ValidationError(`Cannot start review on ${submission.status} submission`);
        }

        return prisma.submission.update({
            where: { id: submissionId },
            data: {
                status: SubmissionStatus.UNDER_REVIEW,
                reviewedAt: new Date(),
                reviewedById: actor.id
            }
        });
    }

    async returnSubmission(submissionId: string, actor: AuthenticatedUser, reason: string) {
        const submission = await this.validateAccess(submissionId, actor);

        if (!([SubmissionStatus.SUBMITTED, SubmissionStatus.UNDER_REVIEW] as string[]).includes(submission.status)) {
            throw new ValidationError(`Cannot return ${submission.status} submission`);
        }

        return prisma.submission.update({
            where: { id: submissionId },
            data: {
                status: SubmissionStatus.DRAFT,
                returnReason: reason,
                companyDecisionAt: new Date(),
                companyDecisionById: actor.id,
                // Audit log would be handled by middleware or separate call
            }
        });
    }

    async approveSubmission(submissionId: string, actor: AuthenticatedUser) {
        const submission = await this.validateAccess(submissionId, actor);

        if (!([SubmissionStatus.SUBMITTED, SubmissionStatus.UNDER_REVIEW] as string[]).includes(submission.status)) {
            throw new ValidationError(`Cannot approve ${submission.status} submission`);
        }

        return prisma.submission.update({
            where: { id: submissionId },
            data: {
                status: SubmissionStatus.APPROVED,
                companyDecisionAt: new Date(),
                companyDecisionById: actor.id
            }
        });
    }

    async bulkForward(
        periodId: string,
        mode: 'ONLY_APPROVED' | 'INCLUDE_EDGE_CASES',
        stationIds: string[] | undefined,
        perStationExplanation: Record<string, string> | undefined,
        actor: AuthenticatedUser
    ) {
        if (!actor.companyId) throw new PermissionError("User must belong to a company");

        // 1. Identify target stations
        let targetStationIds = stationIds;
        if (!targetStationIds || targetStationIds.length === 0) {
            const allStations = await prisma.station.findMany({
                where: { companyId: actor.companyId, isActive: true },
                select: { id: true }
            });
            targetStationIds = allStations.map(s => s.id);
        }

        // 2. Create Batch Record
        const batch = await prisma.bulkForwardBatch.create({
            data: {
                companyId: actor.companyId,
                periodId,
                createdById: actor.id,
                mode
            }
        });

        const results = [];

        // 3. Process each station
        for (const stationId of targetStationIds) {
            const submission = await prisma.submission.findUnique({
                where: { periodId_stationId: { periodId, stationId } }
            });

            // CASE A: APPROVED Submission -> Always Forward
            if (submission && submission.status === SubmissionStatus.APPROVED) {
                if (submission.forwardedAt) {
                    results.push({ stationId, status: 'SKIPPED', message: 'Already forwarded' });
                    continue;
                }

                await prisma.submission.update({
                    where: { id: submission.id },
                    data: {
                        forwardedAt: new Date(),
                        forwardedById: actor.id
                    }
                });

                await prisma.bulkForwardItem.create({
                    data: { batchId: batch.id, stationId, submissionId: submission.id, resultStatus: 'SUCCESS' }
                });
                results.push({ stationId, status: 'SUCCESS' });
                continue;
            }

            // CASE B: Not Approved (Missing or Wrong Status)
            if (mode === 'ONLY_APPROVED') {
                await prisma.bulkForwardItem.create({
                    data: { batchId: batch.id, stationId, resultStatus: 'SKIPPED', message: 'Not approved' }
                });
                results.push({ stationId, status: 'SKIPPED', message: 'Not approved' });
                continue;
            }

            // CASE C: Edge Case (Mode = INCLUDE_EDGE_CASES)
            // Must have explanation
            const explanation = perStationExplanation?.[stationId];
            if (!explanation || explanation.trim().length < 5) {
                await prisma.bulkForwardItem.create({
                    data: { batchId: batch.id, stationId, resultStatus: 'FAILED', message: 'Missing explanation for edge case' }
                });
                results.push({ stationId, status: 'FAILED', message: 'Missing explanation' });
                continue;
            }

            // If submission exists but not approved, update it
            if (submission) {
                await prisma.submission.update({
                    where: { id: submission.id },
                    data: {
                        forwardedAt: new Date(),
                        forwardedById: actor.id,
                        forwardedWithoutStationSubmit: true, // It's "without submit" in the sense of without "valid" submit
                        forwardingExplanation: explanation
                    }
                });
            } else {
                // No submission exists! logic specific: do we create a shell? 
                // For now, let's assume we can't forward a non-existent submission record easily 
                // unless we create a stub. 
                // Decision: Create a stub submission with status DRAFT/SPECIAL and forwarded flags
                await prisma.submission.create({
                    data: {
                        periodId,
                        stationId,
                        companyId: actor.companyId,
                        status: SubmissionStatus.DRAFT, // Or some other status? DRAFT is safe.
                        forwardedAt: new Date(),
                        forwardedById: actor.id,
                        forwardedWithoutStationSubmit: true,
                        forwardingExplanation: explanation
                    }
                });
            }

            await prisma.bulkForwardItem.create({
                data: {
                    batchId: batch.id,
                    stationId,
                    resultStatus: 'SUCCESS',
                    message: 'Forwarded as edge case',
                    usedExplanation: explanation
                }
            });
            results.push({ stationId, status: 'SUCCESS', message: 'Edge case handled' });
        }

        return { batchId: batch.id, results };
    }

    private async validateAccess(submissionId: string, actor: AuthenticatedUser) {
        const submission = await prisma.submission.findUnique({
            where: { id: submissionId }
        });

        if (!submission) throw new NotFoundError('Submission', submissionId);

        // Check if user belongs to the company of the submission
        if (actor.companyId !== submission.companyId) {
            throw new PermissionError('Access denied');
        }

        return submission;
    }
}
