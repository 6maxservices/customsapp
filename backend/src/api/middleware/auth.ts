import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { SessionAuthProvider } from '../../shared/auth/session-auth-provider';
import { AuthenticatedUser } from '../../shared/auth/auth-provider';

// Singleton auth provider instance
const authProvider = new SessionAuthProvider();

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Middleware to require authentication
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    // Log session info for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('Auth check - Session ID:', req.sessionID);
      console.log('Auth check - Session:', req.session);
      console.log('Auth check - Cookies:', req.headers.cookie);
    }

    const user = await authProvider.getCurrentUser(req);

    if (!user) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Auth check failed - no user found');
      }
      return res.status(401).json({ error: 'Authentication required' });
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
}

/**
 * Middleware to require specific role(s)
 */
export function requireRole(...roles: UserRole[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (!authProvider.hasAnyRole(req.user, roles)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
}

/**
 * Middleware to enforce tenant isolation
 * Ensures company users can only access their own company data
 * Customs users can access all companies
 */
export function enforceTenantIsolation(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Customs users can access all tenants
  if (authProvider.isCustomsUser(req.user)) {
    return next();
  }

  // For company users, we'll check tenant access in route handlers
  // based on the resource's companyId
  next();
}

/**
 * Helper to check if user has access to a specific tenant
 */
export function checkTenantAccess(user: AuthenticatedUser, tenantId: string | null): boolean {
  return authProvider.hasTenantAccess(user, tenantId);
}

/**
 * Helper to check if user has access to a specific station
 */
export function checkStationAccess(user: AuthenticatedUser, stationId: string): boolean {
  // Customs can access all stations
  if (authProvider.isCustomsUser(user)) return true;

  // Station Operators can only access their specific station
  if (user.role === UserRole.STATION_OPERATOR) {
    return user.stationId === stationId;
  }

  // Company users can access any station in their company
  // This requires a fetch in the service, but here we just check if they belong to A company
  // (Specific company-station ownership is checked in the service layer)
  return !!user.companyId;
}

/**
 * Get the current auth provider instance
 */
export function getAuthProvider() {
  return authProvider;
}

