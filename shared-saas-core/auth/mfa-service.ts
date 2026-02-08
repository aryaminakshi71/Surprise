import { v4 as uuidv4 } from 'uuid';
import speakeasy from 'speakeasy';

const MFA_SECRET = process.env.MFA_SECRET || 'your-mfa-secret-key';

export interface MFASetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface MFAVerifyResult {
  valid: boolean;
  backupUsed?: boolean;
}

export class MFAService {
  private backupCodes: Map<string, string[]> = new Map();

  generateSetup(email: string): MFASetup {
    const secret = speakeasy.generateSecret({
      name: `App:${email}`,
      issuer: 'Your App Name',
    });

    const backupCodes: string[] = [];
    for (let i = 0; i < 10; i++) {
      backupCodes.push(uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase());
    }

    return {
      secret: secret.ascii,
      qrCode: secret.otpauth_url!,
      backupCodes,
    };
  }

  verifyToken(secret: string, token: string): MFAVerifyResult {
    const valid = speakeasy.totp.verify({
      secret,
      encoding: 'ascii',
      token,
      window: 1,
    });

    return { valid: !!valid };
  }

  verifyBackupCode(userId: string, code: string): MFAVerifyResult {
    const userCodes = this.backupCodes.get(userId) || [];
    const index = userCodes.indexOf(code.toUpperCase());

    if (index > -1) {
      userCodes.splice(index, 1);
      this.backupCodes.set(userId, userCodes);
      return { valid: true, backupUsed: true };
    }

    return { valid: false };
  }

  setBackupCodes(userId: string, codes: string[]): void {
    this.backupCodes.set(userId, codes.map(c => c.toUpperCase()));
  }

  generateBackupCodes(userId: string): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      codes.push(uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase());
    }
    this.backupCodes.set(userId, codes);
    return codes;
  }
}

export const mfaService = new MFAService();
