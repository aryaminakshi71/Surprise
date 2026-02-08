import { getDatabase } from '../db/database';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  plan: 'free' | 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'suspended' | 'cancelled';
  settings: TenantSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantSettings {
  maxUsers: number;
  maxStorage: number;
  features: string[];
  branding?: {
    logo?: string;
    primaryColor?: string;
    favicon?: string;
  };
}

export interface TenantUser {
  id: string;
  tenantId: string;
  userId: string;
  role: 'owner' | 'admin' | 'manager' | 'user' | 'viewer';
  invitedAt: Date;
  joinedAt?: Date;
  status: 'pending' | 'active' | 'removed';
}

const tenants = new Map<string, Tenant>();
const tenantUsers = new Map<string, TenantUser[]>();
const tenantBySlug = new Map<string, string>();
const tenantByDomain = new Map<string, string>();

export class MultiTenantService {
  async createTenant(data: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tenant> {
    const db = getDatabase();
    
    const tenant: Tenant = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db('tenants').insert(tenant);
    tenants.set(tenant.id, tenant);
    tenantBySlug.set(tenant.slug, tenant.id);
    if (tenant.domain) {
      tenantByDomain.set(tenant.domain, tenant.id);
    }

    return tenant;
  }

  async getTenant(id: string): Promise<Tenant | null> {
    if (tenants.has(id)) {
      return tenants.get(id)!;
    }

    const db = getDatabase();
    const tenant = await db('tenants').where({ id }).first();
    
    if (tenant) {
      tenants.set(id, tenant);
      tenantBySlug.set(tenant.slug, id);
      if (tenant.domain) {
        tenantByDomain.set(tenant.domain, id);
      }
    }

    return tenant || null;
  }

  async getTenantBySlug(slug: string): Promise<Tenant | null> {
    const id = tenantBySlug.get(slug);
    if (id) {
      return this.getTenant(id);
    }

    const db = getDatabase();
    const tenant = await db('tenants').where({ slug }).first();
    
    if (tenant) {
      await this.getTenant(tenant.id);
      return tenant;
    }

    return null;
  }

  async getTenantByDomain(domain: string): Promise<Tenant | null> {
    const id = tenantByDomain.get(domain);
    if (id) {
      return this.getTenant(id);
    }

    const db = getDatabase();
    const tenant = await db('tenants').where({ domain }).first();
    
    if (tenant) {
      await this.getTenant(tenant.id);
      return tenant;
    }

    return null;
  }

  async updateTenant(id: string, data: Partial<Tenant>): Promise<Tenant | null> {
    const tenant = await this.getTenant(id);
    if (!tenant) return null;

    const updated = { ...tenant, ...data, updatedAt: new Date() };
    
    const db = getDatabase();
    await db('tenants').where({ id }).update(updated);
    
    tenants.set(id, updated);
    
    return updated;
  }

  async addUserToTenant(tenantId: string, userId: string, role: TenantUser['role']): Promise<TenantUser> {
    const db = getDatabase();
    
    const tenantUser: TenantUser = {
      id: crypto.randomUUID(),
      tenantId,
      userId,
      role,
      invitedAt: new Date(),
      status: 'pending',
    };

    await db('tenant_users').insert(tenantUser);
    
    const users = tenantUsers.get(tenantId) || [];
    users.push(tenantUser);
    tenantUsers.set(tenantId, users);

    return tenantUser;
  }

  async getTenantUsers(tenantId: string): Promise<TenantUser[]> {
    if (tenantUsers.has(tenantId)) {
      return tenantUsers.get(tenantId)!;
    }

    const db = getDatabase();
    const users = await db('tenant_users').where({ tenantId });
    
    tenantUsers.set(tenantId, users);
    return users;
  }

  async isUserInTenant(tenantId: string, userId: string): Promise<boolean> {
    const users = await this.getTenantUsers(tenantId);
    return users.some(u => u.userId === userId && u.status === 'active');
  }

  async getUserTenants(userId: string): Promise<Tenant[]> {
    const db = getDatabase();
    const relations = await db('tenant_users').where({ userId, status: 'active' });
    
    const userTenants: Tenant[] = [];
    for (const relation of relations) {
      const tenant = await this.getTenant(relation.tenantId);
      if (tenant) {
        userTenants.push(tenant);
      }
    }

    return userTenants;
  }

  async removeUserFromTenant(tenantId: string, userId: string): Promise<boolean> {
    const db = getDatabase();
    const result = await db('tenant_users')
      .where({ tenantId, userId })
      .update({ status: 'removed' });

    const users = tenantUsers.get(tenantId) || [];
    const filtered = users.filter(u => u.userId !== userId);
    tenantUsers.set(tenantId, filtered);

    return result > 0;
  }

  async checkFeatureAccess(tenantId: string, feature: string): Promise<boolean> {
    const tenant = await this.getTenant(tenantId);
    if (!tenant) return false;

    if (tenant.plan === 'enterprise') return true;
    if (tenant.plan === 'professional' && !feature.includes('advanced')) return true;
    if (tenant.plan === 'starter' && ['basic', 'contacts'].includes(feature)) return true;

    return tenant.settings.features.includes(feature);
  }

  async checkUsageLimit(tenantId: string, type: 'users' | 'storage'): Promise<{ allowed: boolean; current: number; limit: number }> {
    const tenant = await this.getTenant(tenantId);
    if (!tenant) return { allowed: false, current: 0, limit: 0 };

    let current = 0;

    if (type === 'users') {
      const users = await this.getTenantUsers(tenantId);
      current = users.filter(u => u.status === 'active').length;
    }

    const limit = type === 'users' ? tenant.settings.maxUsers : tenant.settings.maxStorage;

    return {
      allowed: current < limit,
      current,
      limit,
    };
  }
}

export const multiTenantService = new MultiTenantService();

export function withTenant<T>(
  handler: (tenant: Tenant, req: Request) => Promise<T>
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.headers['x-tenant-id'] as string ||
                     req.query.tenantId as string;

    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID required' });
    }

    const tenant = await multiTenantService.getTenant(tenantId);
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    if (tenant.status !== 'active') {
      return res.status(403).json({ error: 'Tenant is not active' });
    }

    try {
      req.state = { ...req.state, tenant };
      next();
    } catch (error) {
      next(error);
    }
  };
}
