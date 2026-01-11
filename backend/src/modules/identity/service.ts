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
}

export interface UpdateUserInput {
  email?: string;
  password?: string;
  role?: UserRole;
  companyId?: string | null;
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
      },
      include: { company: true },
    });

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
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
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

