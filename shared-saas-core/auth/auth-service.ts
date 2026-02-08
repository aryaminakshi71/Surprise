import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { cache } from '../cache/redis-cache';

// CRITICAL: JWT secrets MUST be provided via environment variables
// There is NO fallback - missing secrets will cause startup failure
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

// Validate that secrets are provided
if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error(
    'CRITICAL SECURITY ERROR: JWT_SECRET and JWT_REFRESH_SECRET environment variables must be set.\n' +
    'These MUST be strong, unique secrets (minimum 32 characters).\n' +
    'DO NOT use default or placeholder values in production.'
  );
}

// Type assertions - we know these are strings after the validation above
const JWT_SECRET_KEY: string = JWT_SECRET;
const JWT_REFRESH_SECRET_KEY: string = JWT_REFRESH_SECRET;
const JWT_EXPIRY = '15m';
const REFRESH_EXPIRY = '7d';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  companyId?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface User {
  id: string;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  role: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Refresh token storage key prefix
const REFRESH_TOKEN_PREFIX = 'refresh_token:';
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

interface RefreshTokenData {
  userId: string;
  email: string;
  role: string;
  expiresAt: number; // Unix timestamp
}

export class AuthService {
  // In-memory cache for rate-limited token operations (not for persistence)
  private operationLocks: Map<string, boolean> = new Map();

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: JWT_EXPIRY });
  }

  async generateRefreshToken(payload: TokenPayload): Promise<string> {
    const refreshToken = uuidv4();
    const expiresAt = Date.now() + REFRESH_TOKEN_TTL * 1000;
    
    const tokenData: RefreshTokenData = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      expiresAt
    };
    
    // Store in Redis for persistence across server restarts and instances
    await cache.set(`${REFRESH_TOKEN_PREFIX}${refreshToken}`, tokenData, REFRESH_TOKEN_TTL);

    return refreshToken;
  }

  generateTokens(payload: TokenPayload): AuthTokens {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: '', // Must call generateRefreshToken separately for proper storage
      expiresIn: 15 * 60
    };
  }

  // Convenience method that generates both tokens properly
  async generateTokenPair(payload: TokenPayload): Promise<AuthTokens> {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: await this.generateRefreshToken(payload),
      expiresIn: 15 * 60
    };
  }

  verifyAccessToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET_KEY) as TokenPayload;
    } catch {
      return null;
    }
  }

  async verifyRefreshToken(refreshToken: string): Promise<RefreshTokenData | null> {
    try {
      const tokenData = await cache.get<RefreshTokenData>(`${REFRESH_TOKEN_PREFIX}${refreshToken}`);
      
      if (!tokenData || tokenData.expiresAt < Date.now()) {
        // Clean up expired token
        await this.revokeRefreshToken(refreshToken);
        return null;
      }
      
      return tokenData;
    } catch (error) {
      console.error('Refresh token verification failed:', error);
      return null;
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<AuthTokens | null> {
    const tokenData = await this.verifyRefreshToken(refreshToken);
    
    if (!tokenData) {
      return null;
    }

    const payload: TokenPayload = {
      userId: tokenData.userId,
      email: tokenData.email,
      role: tokenData.role
    };

    return this.generateTokenPair(payload);
  }

  async revokeRefreshToken(refreshToken: string): Promise<void> {
    try {
      await cache.delete(`${REFRESH_TOKEN_PREFIX}${refreshToken}`);
    } catch (error) {
      console.error('Failed to revoke refresh token:', error);
    }
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    try {
      // Find all tokens for this user and revoke them
      const pattern = `${REFRESH_TOKEN_PREFIX}*`;
      const keys = await getAllKeys(pattern);
      
      for (const key of keys) {
        const tokenData = await cache.get<RefreshTokenData>(key);
        if (tokenData && tokenData.userId === userId) {
          await cache.delete(key);
        }
      }
    } catch (error) {
      console.error('Failed to revoke user tokens:', error);
    }
  }

  validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  generateSecureRandomToken(length: number = 32): string {
    return uuidv4();
  }
}

// Helper function to get all keys matching a pattern
async function getAllKeys(pattern: string): Promise<string[]> {
  try {
    // Use Redis KEYS command with pattern
    const redis = (cache as any).client;
    if (redis) {
      return await redis.keys(pattern);
    }
    return [];
  } catch (error) {
    console.error('Failed to get keys:', error);
    return [];
  }
}

export const authService = new AuthService();
