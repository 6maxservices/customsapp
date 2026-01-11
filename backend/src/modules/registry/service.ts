import { prisma } from '../../shared/db/prisma';
import { NotFoundError, PermissionError } from '../../shared/errors';
import { AuthenticatedUser } from '../../shared/auth/auth-provider';
import { TaskStatus, UserRole } from '@prisma/client';
import { AuditLogger } from '../../shared/audit/audit-logger';
import { ComplianceEvaluator } from '../../modules/compliance/evaluator';

export interface CreateCompanyInput {
  name: string;
  taxId: string;
}

export interface UpdateCompanyInput {
  name?: string;
  taxId?: string;
}

export interface CreateStationInput {
  companyId: string;
  name: string;
  address?: string;
  lat?: number;
  lng?: number;
  amdika?: string;
  prefecture?: string;
  city?: string;
  installationType?: string;
}

export interface UpdateStationInput {
  name?: string;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  amdika?: string | null;
  prefecture?: string | null;
  city?: string | null;
  installationType?: string | null;
}

export class RegistryService {
  private auditLogger = new AuditLogger();

  // Company operations
  async getCompanyById(id: string, actor: AuthenticatedUser) {
    const company = await prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      throw new NotFoundError('Company', id);
    }

    // Check tenant access
    if (actor.companyId !== company.id && !this.isCustomsUser(actor)) {
      throw new PermissionError('Permission denied');
    }

    return company;
  }

  async getAllCompanies(actor: AuthenticatedUser) {
    // Only customs users can see all companies
    if (!this.isCustomsUser(actor)) {
      throw new PermissionError('Permission denied');
    }

    return prisma.company.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async createCompany(input: CreateCompanyInput, actor: AuthenticatedUser) {
    // Only SYSTEM_ADMIN can create companies
    if (actor.role !== UserRole.SYSTEM_ADMIN) {
      throw new PermissionError('Only system administrators can create companies');
    }

    const company = await prisma.company.create({
      data: input,
    });

    await this.auditLogger.log({
      actorId: actor.id,
      entityType: 'Company',
      entityId: company.id,
      action: 'CREATE',
      diff: input,
    });

    return company;
  }

  async updateCompany(id: string, input: UpdateCompanyInput, actor: AuthenticatedUser) {
    // Only SYSTEM_ADMIN can update companies
    if (actor.role !== UserRole.SYSTEM_ADMIN) {
      throw new PermissionError('Only system administrators can update companies');
    }

    await this.getCompanyById(id, actor);

    const updated = await prisma.company.update({
      where: { id },
      data: input,
    });

    await this.auditLogger.log({
      actorId: actor.id,
      entityType: 'Company',
      entityId: id,
      action: 'UPDATE',
      diff: input,
    });

    return updated;
  }

  async getStationById(id: string, actor: AuthenticatedUser) {
    const station = await prisma.station.findUnique({
      where: { id },
      include: { company: true },
    });

    if (!station) {
      throw new NotFoundError('Station', id);
    }

    // Check tenant access
    if (actor.companyId !== station.companyId && !this.isCustomsUser(actor)) {
      throw new PermissionError('Permission denied');
    }

    return station;
  }

  async getStationBySlug(slug: string, actor: AuthenticatedUser) {
    const station = await prisma.station.findUnique({
      where: { slug },
      include: { company: true },
    });

    if (!station) {
      throw new NotFoundError('Station', slug);
    }

    // Check tenant access - security crucial here
    if (actor.companyId !== station.companyId && !this.isCustomsUser(actor)) {
      throw new PermissionError('Permission denied');
    }

    return station;
  }

  async getStationsByCompany(companyId: string, actor: AuthenticatedUser) {
    // Check tenant access
    if (actor.companyId !== companyId && !this.isCustomsUser(actor)) {
      throw new PermissionError('Permission denied');
    }

    const stations = await prisma.station.findMany({
      where: { companyId },
      orderBy: { name: 'asc' },
      include: {
        company: true,
        _count: {
          select: { tasks: { where: { status: 'OPEN' } } }
        }
      },
    });

    // Evaluate Compliance for each station
    const evaluator = new ComplianceEvaluator();
    const stationsWithCompliance = await Promise.all(
      stations.map(async (station) => {
        const compliance = await evaluator.evaluateStation(station.id);
        return { ...station, compliance };
      })
    );

    return stationsWithCompliance;
  }

  async getAllStations(actor: AuthenticatedUser) {
    // Company users can only see their own stations
    if (actor.companyId) {
      return this.getStationsByCompany(actor.companyId, actor);
    }

    // Customs users can see all stations
    const stations = await prisma.station.findMany({
      orderBy: { name: 'asc' },
      include: {
        company: true,
        _count: {
          select: { tasks: { where: { status: { not: TaskStatus.CLOSED } } } }
        }
      },
    });

    // Evaluate Compliance for each station
    const evaluator = new ComplianceEvaluator();
    const stationsWithCompliance = await Promise.all(
      stations.map(async (station) => {
        const compliance = await evaluator.evaluateStation(station.id);
        return { ...station, compliance };
      })
    );

    return stationsWithCompliance;
  }

  async createStation(input: CreateStationInput, actor: AuthenticatedUser) {
    // Check tenant access
    if (actor.companyId !== input.companyId && !this.isCustomsUser(actor)) {
      throw new PermissionError('Permission denied');
    }

    // Restrict COMPANY_OPERATOR
    if (actor.role === UserRole.COMPANY_OPERATOR) {
      throw new PermissionError('Company Operators cannot create stations');
    }

    // Verify company exists
    const company = await prisma.company.findUnique({
      where: { id: input.companyId },
    });

    if (!company) {
      throw new NotFoundError('Company', input.companyId);
    }

    const slug = await this.generateSlug(input.name);

    const station = await prisma.station.create({
      data: {
        ...input,
        slug,
        isActive: true, // Default to active
      },
      include: { company: true },
    });

    await this.auditLogger.log({
      actorId: actor.id,
      tenantId: station.companyId,
      entityType: 'Station',
      entityId: station.id,
      action: 'CREATE',
      diff: input,
    });

    return station;
  }

  async updateStation(id: string, input: UpdateStationInput, actor: AuthenticatedUser) {
    const station = await this.getStationById(id, actor);

    // Company users can only update their own stations
    if (actor.companyId !== station.companyId && !this.isCustomsUser(actor)) {
      throw new PermissionError('Permission denied');
    }

    // Operators cannot update station details (they only do submissions)
    if (actor.role === UserRole.COMPANY_OPERATOR) {
      throw new PermissionError('Company Operators cannot update station details');
    }

    const updated = await prisma.station.update({
      where: { id },
      data: input,
      include: { company: true },
    });

    await this.auditLogger.log({
      actorId: actor.id,
      tenantId: updated.companyId,
      entityType: 'Station',
      entityId: id,
      action: 'UPDATE',
      diff: input,
    });

    return updated;
  }

  async toggleStationStatus(id: string, isActive: boolean, actor: AuthenticatedUser) {
    const station = await this.getStationById(id, actor);

    // Check permissions
    if (actor.companyId !== station.companyId && !this.isCustomsUser(actor)) {
      throw new PermissionError('Permission denied');
    }

    if (actor.role === UserRole.COMPANY_OPERATOR) {
      throw new PermissionError('Company Operators cannot change station status');
    }

    const updated = await prisma.station.update({
      where: { id },
      data: { isActive },
      include: { company: true },
    });

    await this.auditLogger.log({
      actorId: actor.id,
      tenantId: updated.companyId,
      entityType: 'Station',
      entityId: id,
      action: 'UPDATE', // Or STATION_STATUS_CHANGE
      diff: { isActive },
    });

    return updated;
  }

  async deleteStation(id: string, actor: AuthenticatedUser) {
    const station = await this.getStationById(id, actor);

    // Only SYSTEM_ADMIN can delete stations
    if (actor.role !== UserRole.SYSTEM_ADMIN) {
      throw new PermissionError('Only system administrators can delete stations');
    }

    await prisma.station.delete({
      where: { id },
    });

    await this.auditLogger.log({
      actorId: actor.id,
      tenantId: station.companyId,
      entityType: 'Station',
      entityId: id,
      action: 'DELETE',
    });

    return station;
  }

  private isCustomsUser(actor: AuthenticatedUser): boolean {
    const customsRoles: UserRole[] = [
      UserRole.CUSTOMS_REVIEWER,
      UserRole.CUSTOMS_SUPERVISOR,
      UserRole.CUSTOMS_DIRECTOR,
      UserRole.SYSTEM_ADMIN,
    ];
    return customsRoles.includes(actor.role);
  }

  private async generateSlug(name: string): Promise<string> {
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    let slug = baseSlug;
    let counter = 1;

    // Check for collisions
    while (true) {
      const existing = await prisma.station.findUnique({
        where: { slug },
      });

      if (!existing) break;

      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }
}

