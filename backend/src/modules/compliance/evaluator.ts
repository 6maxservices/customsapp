
import { prisma } from '../../shared/db/prisma';
import { Station, Submission, SubmissionCheck, Obligation } from '@prisma/client';

export interface ComplianceResult {
    status: 'COMPLIANT' | 'NON_COMPLIANT';
    badges: string[];
    violations: string[];
    lastFinishedPeriodId?: string;
}

export class ComplianceEvaluator {
    /**
     * Evaluates the compliance status of a station.
     * Logic:
     * 1. Find the "Last Finished Period" (Deadline < Now).
     * 2. Check if a Submission exists for that period.
     * 3. If exists, check status (must be SUBMITTED or APPROVED, not DRAFT).
     * 4. Check all Critical Obligations (OBL-001 to OBL-007).
     */
    async evaluateStation(stationId: string): Promise<ComplianceResult> {
        const badges: string[] = [];
        const violations: string[] = [];

        // 1. Get Last Finished Period
        // optimization: iterate periods or find one where deadline < now, sort by recent
        const lastFinishedPeriod = await prisma.submissionPeriod.findFirst({
            where: {
                endDate: { lt: new Date() }
            },
            orderBy: { endDate: 'desc' }
        });

        if (!lastFinishedPeriod) {
            // System just started, no history? Assume Compliant or handle grace period
            return { status: 'COMPLIANT', badges: [], violations: [] }; // or 'Unknown'
        }

        // 2. Get Submission for that period
        const submission = await prisma.submission.findUnique({
            where: {
                periodId_stationId: {
                    periodId: lastFinishedPeriod.id,
                    stationId: stationId
                }
            },
            include: {
                checks: { include: { obligation: true } }
            }
        });

        // 3. Evaluation
        if (!submission) {
            violations.push(`Missing submission for period ${lastFinishedPeriod.periodNumber}/${lastFinishedPeriod.month}`);
            return {
                status: 'NON_COMPLIANT',
                badges: [],
                violations,
                lastFinishedPeriodId: lastFinishedPeriod.id
            };
        }

        if (submission.status === 'DRAFT' || submission.status === 'REJECTED') {
            violations.push(`Submission status is ${submission.status}`);
            return {
                status: 'NON_COMPLIANT',
                badges: [],
                violations,
                lastFinishedPeriodId: lastFinishedPeriod.id
            };
        }

        // 4. Check Obligations
        // We expect OBL-001 to OBL-007 to be present and valid
        const requiredCodes = ['OBL-001', 'OBL-002', 'OBL-003', 'OBL-004', 'OBL-005', 'OBL-006', 'OBL-007'];

        for (const code of requiredCodes) {
            const check = submission.checks.find(c => c.obligation.code === code);

            if (!check) {
                violations.push(`Missing check for ${code}`);
                continue;
            }

            // Check Value (Expect "YES" or JSON "YES")
            let isYes = false;
            let validUntil: Date | null = null;

            try {
                // Try parsing JSON first
                const json = JSON.parse(check.value || '{}');
                if (json.answer === 'YES') isYes = true;
                if (json.validUntil) validUntil = new Date(json.validUntil);
            } catch (e) {
                // Fallback to simple string
                if (check.value === 'YES' || check.value === 'true') isYes = true;
            }

            if (!isYes) {
                violations.push(`${code}: Value is NO or Invalid`);
            }

            // Check Expiry (if applicable)
            if (validUntil && validUntil < new Date()) {
                violations.push(`${code}: Certificate expired on ${validUntil.toISOString().split('T')[0]}`);
            }
        }

        // 5. Check Active Period Pending (Badge Logic)
        // This is separate from "Status" (which is about past performance)
        const currentPeriod = await prisma.submissionPeriod.findFirst({
            where: {
                startDate: { lte: new Date() },
                endDate: { gte: new Date() }
            }
        });

        if (currentPeriod) {
            const activeSub = await prisma.submission.findUnique({
                where: {
                    periodId_stationId: {
                        periodId: currentPeriod.id,
                        stationId: stationId
                    }
                }
            });

            if (!activeSub || activeSub.status === 'DRAFT') {
                badges.push('PENDING_REPORT');
            }
        }


        const status = violations.length === 0 ? 'COMPLIANT' : 'NON_COMPLIANT';

        return {
            status,
            badges,
            violations,
            lastFinishedPeriodId: lastFinishedPeriod.id
        };
    }
}
