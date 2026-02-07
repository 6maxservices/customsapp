import { Request } from 'express';
import { UserRole } from '@prisma/client';
import { AuthProvider, AuthenticatedUser, AuthResult } from './auth-provider';
import { prisma } from '../db/prisma';
import bcrypt from 'bcrypt';

interface LoginCredentials {
  email: string;
  password: string;
}

interface SessionData {
  userId: string;
}

export class SessionAuthProvider extends AuthProvider {
  async authenticate(credentials: unknown): Promise<AuthResult> {
    const creds = credentials as LoginCredentials;
    if (!creds.email || !creds.password) {
      return { success: false, error: 'Email and password are required' };
    }

    const user = await prisma.user.findUnique({
      where: { email: creds.email },
      include: { company: true },
    });

    if (!user) {
      return { success: false, error: 'Invalid credentials' };
    }

    const isValid = await bcrypt.compare(creds.password, user.passwordHash);
    if (!isValid) {
      return { success: false, error: 'Invalid credentials' };
    }

    const authUser: AuthenticatedUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      stationId: user.stationId,
    };

    return { success: true, user: authUser };
  }

  async getCurrentUser(req: unknown): Promise<AuthenticatedUser | null> {
    const expressReq = req as Request;
    const session = expressReq.session as any;

    if (!session?.userId) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { company: true },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      stationId: user.stationId,
    };
  }

  hasRole(user: AuthenticatedUser | null, role: UserRole): boolean {
    if (!user) return false;
    return user.role === role;
  }

  hasAnyRole(user: AuthenticatedUser | null, roles: UserRole[]): boolean {
    if (!user) return false;
    return roles.includes(user.role);
  }

  hasTenantAccess(user: AuthenticatedUser | null, tenantId: string | null): boolean {
    if (!user) return false;

    // Customs users can access all tenants
    if (this.isCustomsUser(user)) {
      return true;
    }

    // Company users can only access their own tenant
    if (tenantId === null) {
      return user.companyId === null;
    }
    return user.companyId === tenantId;
  }
}

