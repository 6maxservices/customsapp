# Architecture Decision Records (ADR)

This document records significant architectural decisions, their context, and consequences.

## [ADR-001] "Return to Correction" via Draft State
*   **Status**: Accepted
*   **Date**: 2026-02-07
*   **Context**: When a Company Admin finds errors in a Station Submission, they need a way to request changes.
*   **Decision**: We will **not** introduce a dedicated `CORRECTION_REQUESTED` status enum. Instead, we will:
    1.  Transition the submission status back to `DRAFT`.
    2.  Set a `returnReason` field (mandatory).
    3.  Log a "RETURNED" event in the audit log.
*   **Consequences**: The Station Operator can simply edit the submission again as normal. The UI needs to show the "Returned" reason clearly to distinguishing it from a fresh draft.

## [ADR-002] Decoupled "Forwarding" from "Approval" Status
*   **Status**: Accepted
*   **Date**: 2026-02-07
*   **Context**: Companies must approve submissions before sending them to Customs. However, "Forwarded" is an action/event, not just a status.
*   **Decision**: We will treat "Forwarding" as a separate state flag, not a `SubmissionStatus` enum value.
    *   `SubmissionStatus`: `SUBMITTED` -> `UNDER_REVIEW` -> `APPROVED`.
    *   `Forwarding`: Derived from `forwardedAt != null` field.
*   **Consequences**: A submission can be `APPROVED` but not yet `FORWARDED`. Once `FORWARDED`, it should be locked from further Company changes.

## [ADR-003] Strict Station Explanations for Bulk Forwarding
*   **Status**: Accepted
*   **Date**: 2026-02-07
*   **Context**: When forwarding multiple stations, some may be edge cases (no submission, not approved).
*   **Decision**: We adopt "Option B" (Strict Compliance).
    *   Regular stations (Approved) -> Forward automatically.
    *   Edge cases -> Require a **per-station** text explanation in the payload.
    *   If explanation is missing -> The individual station fails/skips; it does *not* fail the whole batch, but returns a per-item result.

## [ADR-004] Submission Deadlines
*   **Status**: Accepted
*   **Date**: 2026-02-07
*   **Context**: Deadlines were previously calculated by adding working days.
*   **Decision**: The deadline is strictly defined as `endDate` at 23:59:59 (Europe/Athens time).
