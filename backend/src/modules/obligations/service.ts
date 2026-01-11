import { prisma } from '../../shared/db/prisma';
import { NotFoundError, PermissionError } from '../../shared/errors';
import { AuthenticatedUser } from '../../shared/auth/auth-provider';
import { UserRole, ObligationFieldType, ObligationFrequency, ObligationCriticality } from '@prisma/client';

export interface CreateObligationInput {
  code: string;
  title: string;
  description?: string;
  fieldType: ObligationFieldType;
  frequency: ObligationFrequency;
  criticality: ObligationCriticality;
  catalogVersionId: string;
  triggerAction?: string;
  legalReference?: string;
}

export interface UpdateObligationInput {
  title?: string;
  description?: string;
  fieldType?: ObligationFieldType;
  frequency?: ObligationFrequency;
  criticality?: ObligationCriticality;
  triggerAction?: string;
  legalReference?: string;
}

export interface CreateCatalogVersionInput {
  version: string;
  effectiveDate: Date;
}

export class ObligationsService {
  async getCatalogVersionById(id: string) {
    const version = await prisma.obligationCatalogVersion.findUnique({
      where: { id },
      include: { obligations: true },
    });

    if (!version) {
      throw new NotFoundError('Catalog version', id);
    }

    return version;
  }

  async getLatestCatalogVersion() {
    const version = await prisma.obligationCatalogVersion.findFirst({
      orderBy: { effectiveDate: 'desc' },
      include: { obligations: true },
    });

    return version;
  }

  async getAllCatalogVersions() {
    return prisma.obligationCatalogVersion.findMany({
      orderBy: { effectiveDate: 'desc' },
    });
  }

  async createCatalogVersion(input: CreateCatalogVersionInput, actor: AuthenticatedUser) {
    // Only SYSTEM_ADMIN can create catalog versions
    if (actor.role !== UserRole.SYSTEM_ADMIN) {
      throw new PermissionError('Only system administrators can create catalog versions');
    }

    return prisma.obligationCatalogVersion.create({
      data: input,
    });
  }

  async getObligationById(id: string) {
    const obligation = await prisma.obligation.findUnique({
      where: { id },
      include: { catalogVersion: true },
    });

    if (!obligation) {
      throw new NotFoundError('Obligation', id);
    }

    return obligation;
  }

  async getObligationsByCatalogVersion(catalogVersionId: string) {
    return prisma.obligation.findMany({
      where: { catalogVersionId },
      include: { catalogVersion: true },
      orderBy: { code: 'asc' },
    });
  }

  async getAllObligations() {
    return prisma.obligation.findMany({
      include: { catalogVersion: true },
      orderBy: [{ catalogVersion: { effectiveDate: 'desc' } }, { code: 'asc' }],
    });
  }

  async createObligation(input: CreateObligationInput, actor: AuthenticatedUser) {
    // Only SYSTEM_ADMIN can create obligations
    if (actor.role !== UserRole.SYSTEM_ADMIN) {
      throw new PermissionError('Only system administrators can create obligations');
    }

    // Verify catalog version exists
    const catalogVersion = await prisma.obligationCatalogVersion.findUnique({
      where: { id: input.catalogVersionId },
    });

    if (!catalogVersion) {
      throw new NotFoundError('Catalog version', input.catalogVersionId);
    }

    return prisma.obligation.create({
      data: input,
      include: { catalogVersion: true },
    });
  }

  async updateObligation(id: string, input: UpdateObligationInput, actor: AuthenticatedUser) {
    // Only SYSTEM_ADMIN can update obligations
    if (actor.role !== UserRole.SYSTEM_ADMIN) {
      throw new PermissionError('Only system administrators can update obligations');
    }

    const obligation = await this.getObligationById(id);

    return prisma.obligation.update({
      where: { id },
      data: input,
      include: { catalogVersion: true },
    });
  }

  async deleteObligation(id: string, actor: AuthenticatedUser) {
    // Only SYSTEM_ADMIN can delete obligations
    if (actor.role !== UserRole.SYSTEM_ADMIN) {
      throw new PermissionError('Only system administrators can delete obligations');
    }

    const obligation = await this.getObligationById(id);

    return prisma.obligation.delete({
      where: { id },
    });
  }
}

