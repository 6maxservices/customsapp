import { UserRole } from '@prisma/client';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  companyId: string | null;
}

export interface AuthResult {
  success: boolean;
  user?: AuthenticatedUser;
  error?: string;
}

/**
 * Abstract base class for authentication providers.
 * Allows swapping implementations (SessionAuthProvider → OidcAuthProvider) without changing business logic.
 */
export abstract class AuthProvider {
  /**
   * Authenticate a user (login)
   */
  abstract authenticate(credentials: unknown): Promise<AuthResult>;

  /**
   * Get the current authenticated user from the request context
   */
  abstract getCurrentUser(req: unknown): Promise<AuthenticatedUser | null>;

  /**
   * Check if user has a specific role
   */
  abstract hasRole(user: AuthenticatedUser | null, role: UserRole): boolean;

  /**
   * Check if user has any of the specified roles
   */
  abstract hasAnyRole(user: AuthenticatedUser | null, roles: UserRole[]): boolean;

  /**
   * Check if user has permission to access a tenant (company)
   */
  abstract hasTenantAccess(user: AuthenticatedUser | null, tenantId: string | null): boolean;

  /**
   * Check if user is a customs user (can access all tenants)
   */
  isCustomsUser(user: AuthenticatedUser | null): boolean {
    if (!user) return false;
    return [
      UserRole.CUSTOMS_REVIEWER,
      UserRole.CUSTOMS_SUPERVISOR,
      UserRole.CUSTOMS_DIRECTOR,
      UserRole.SYSTEM_ADMIN,
    ].includes(user.role);
  }

  /**
   * Check if user is a system admin
   */
  isSystemAdmin(user: AuthenticatedUser | null): boolean {
    if (!user) return false;
    return user.role === UserRole.SYSTEM_ADMIN;
  }
}

