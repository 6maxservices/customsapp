import { prisma } from '../../shared/db/prisma';
import { NotFoundError, PermissionError } from '../../shared/errors';
import { AuthenticatedUser } from '../../shared/auth/auth-provider';
import { StorageProvider } from '../../shared/storage/storage-provider';
import { UserRole } from '@prisma/client';

export interface CreateEvidenceInput {
  submissionId?: string;
  stationId: string;
  obligationId?: string;
  filename: string;
  mimeType: string;
  size: number;
  file: Buffer;
}

export class EvidenceService {
  constructor(private storageProvider: StorageProvider) { }

  async getEvidenceById(id: string, actor: AuthenticatedUser) {
    const evidence = await prisma.evidence.findUnique({
      where: { id },
      include: {
        submission: true,
        station: { include: { company: true } },
        obligation: true,
        uploadedBy: true,
      },
    });

    if (!evidence) {
      throw new NotFoundError('Evidence', id);
    }

    // Check tenant access
    const station = await prisma.station.findUnique({
      where: { id: evidence.stationId },
      include: { company: true },
    });

    if (!station) {
      throw new NotFoundError('Station', evidence.stationId);
    }

    if (actor.companyId !== station.companyId && !this.isCustomsUser(actor)) {
      throw new PermissionError('Permission denied');
    }

    return evidence;
  }

  async getEvidenceBySubmission(submissionId: string, actor: AuthenticatedUser) {
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { company: true },
    });

    if (!submission) {
      throw new NotFoundError('Submission', submissionId);
    }

    // Check tenant access
    if (actor.companyId !== submission.companyId && !this.isCustomsUser(actor)) {
      throw new PermissionError('Permission denied');
    }

    return prisma.evidence.findMany({
      where: { submissionId },
      include: {
        station: { include: { company: true } },
        obligation: true,
        uploadedBy: true,
      },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  async getEvidenceByStation(stationIdOrSlug: string, actor: AuthenticatedUser) {
    const station = await this.resolveStation(stationIdOrSlug);

    // Check tenant access
    if (actor.companyId !== station.companyId && !this.isCustomsUser(actor)) {
      throw new PermissionError('Permission denied');
    }

    return prisma.evidence.findMany({
      where: { stationId: station.id },
      include: {
        submission: true,
        obligation: true,
        uploadedBy: true,
      },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  async createEvidence(input: CreateEvidenceInput, actor: AuthenticatedUser) {
    // Verify station exists and check access
    const station = await this.resolveStation(input.stationId);

    // Check tenant access
    if (actor.companyId !== station.companyId && !this.isCustomsUser(actor)) {
      throw new PermissionError('Permission denied');
    }

    // Verify submission if provided
    if (input.submissionId) {
      const submission = await prisma.submission.findUnique({
        where: { id: input.submissionId },
      });

      if (!submission) {
        throw new NotFoundError('Submission', input.submissionId);
      }
    }

    // Verify obligation if provided
    if (input.obligationId) {
      const obligation = await prisma.obligation.findUnique({
        where: { id: input.obligationId },
      });

      if (!obligation) {
        throw new NotFoundError('Obligation', input.obligationId);
      }
    }

    // Generate storage path
    const timestamp = Date.now();
    const sanitizedFilename = input.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `evidence/${input.stationId}/${timestamp}-${sanitizedFilename}`;

    // Store file
    const storedPath = await this.storageProvider.store(input.file, input.filename, storagePath);

    // Create evidence record
    return prisma.evidence.create({
      data: {
        submissionId: input.submissionId,
        stationId: station.id, // Use resolved ID
        obligationId: input.obligationId,
        filename: input.filename,
        mimeType: input.mimeType,
        size: input.size,
        storagePath: storedPath,
        uploadedById: actor.id,
      },
      include: {
        submission: true,
        station: { include: { company: true } },
        obligation: true,
        uploadedBy: true,
      },
    });
  }

  async deleteEvidence(id: string, actor: AuthenticatedUser) {
    const evidence = await this.getEvidenceById(id, actor);

    // Only the uploader or customs users can delete
    if (evidence.uploadedById !== actor.id && !this.isCustomsUser(actor)) {
      throw new PermissionError('Permission denied');
    }

    // Delete from storage
    await this.storageProvider.delete(evidence.storagePath);

    // Delete record
    return prisma.evidence.delete({
      where: { id },
    });
  }

  async getEvidenceFile(id: string, actor: AuthenticatedUser): Promise<{ buffer: Buffer; filename: string; mimeType: string }> {
    const evidence = await this.getEvidenceById(id, actor);

    const buffer = await this.storageProvider.retrieve(evidence.storagePath);

    return {
      buffer,
      filename: evidence.filename,
      mimeType: evidence.mimeType,
    };
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
}

