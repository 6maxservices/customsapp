import bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';
import { prisma } from '../../shared/db/prisma';
import { ValidationError, NotFoundError, PermissionError } from '../../shared/errors';
import { AuthenticatedUser } from '../../shared/auth/auth-provider';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface CreateUserInput {
  email: string;
  password: string;
  role: UserRole;
  companyId?: string | null;
  stationId?: string | null;
}

export interface UpdateUserInput {
  email?: string;
  password?: string;
  role?: UserRole;
  companyId?: string | null;
  stationId?: string | null;
}

export class IdentityService {
  async login(credentials: LoginCredentials) {
    const { email, password } = credentials;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { company: true },
    });

    if (!user) {
      throw new ValidationError('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new ValidationError('Invalid credentials');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      stationId: user.stationId,
    };
  }

  async getCurrentUser(userId: string): Promise<AuthenticatedUser> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { company: true },
    });

    if (!user) {
      throw new NotFoundError('User', userId);
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      stationId: user.stationId,
    };
  }

  async createUser(input: CreateUserInput, actor: AuthenticatedUser) {
    // Only SYSTEM_ADMIN can create users
    if (actor.role !== UserRole.SYSTEM_ADMIN) {
      throw new PermissionError('Only system administrators can create users');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        role: input.role,
        companyId: input.companyId,
        stationId: input.stationId,
      },
      include: { company: true, station: true },
    });

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      stationId: user.stationId,
      createdAt: user.createdAt,
    };
  }

  async getUserById(id: string, actor: AuthenticatedUser) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { company: true },
    });

    if (!user) {
      throw new NotFoundError('User', id);
    }

    // Users can view their own profile, SYSTEM_ADMIN can view all
    if (actor.id !== user.id && actor.role !== UserRole.SYSTEM_ADMIN) {
      throw new PermissionError('Permission denied');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      stationId: user.stationId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async getAllUsers(actor: AuthenticatedUser) {
    // Only SYSTEM_ADMIN can list all users
    if (actor.role !== UserRole.SYSTEM_ADMIN) {
      throw new PermissionError('Only system administrators can list users');
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        companyId: true,
        stationId: true,
        createdAt: true,
        updatedAt: true,
        company: { select: { id: true, name: true } },
        station: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return users;
  }

  async updateUser(id: string, input: UpdateUserInput, actor: AuthenticatedUser) {
    // Only SYSTEM_ADMIN can update users
    if (actor.role !== UserRole.SYSTEM_ADMIN) {
      throw new PermissionError('Only system administrators can update users');
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('User', id);
    }

    const updateData: any = {};
    if (input.email) updateData.email = input.email;
    if (input.role) updateData.role = input.role;
    if (input.companyId !== undefined) updateData.companyId = input.companyId;
    if (input.stationId !== undefined) updateData.stationId = input.stationId;
    if (input.password) {
      updateData.passwordHash = await bcrypt.hash(input.password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      include: { company: true, station: true },
    });

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      stationId: user.stationId,
      updatedAt: user.updatedAt,
    };
  }

  async deleteUser(id: string, actor: AuthenticatedUser) {
    // Only SYSTEM_ADMIN can delete users
    if (actor.role !== UserRole.SYSTEM_ADMIN) {
      throw new PermissionError('Only system administrators can delete users');
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('User', id);
    }

    // Hard delete for now; consider soft-delete with isActive flag
    await prisma.user.delete({ where: { id } });

    return { success: true };
  }
}
