import { z } from 'zod';

// Review Actions
export const returnSubmissionSchema = z.object({
    returnReason: z.string().min(5, "Return reason must be at least 5 characters"),
});

export const forwardSubmissionSchema = z.object({
    forwardedWithoutStationSubmit: z.boolean().optional(),
    forwardingExplanation: z.string().optional(),
}).refine(data => {
    if (data.forwardedWithoutStationSubmit && !data.forwardingExplanation) {
        return false;
    }
    return true;
}, {
    message: "Explanation is required when forwarding without station submission",
    path: ["forwardingExplanation"]
});

export const bulkForwardSchema = z.object({
    periodId: z.string().uuid(),
    mode: z.enum(['ONLY_APPROVED', 'INCLUDE_EDGE_CASES']),
    stationIds: z.array(z.string().uuid()).optional(), // If empty, forward all applicable
    perStationExplanation: z.record(z.string()).optional(), // map stationId -> explanation
});
