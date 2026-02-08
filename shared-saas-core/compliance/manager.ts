// Compliance Manager - GDPR, CCPA, and International Compliance

import type {ConsentRecord, DataRequest, AuditLogEntry} from '../../types/common'

// ============================================================================
// Compliance Configuration
// ============================================================================

export interface ComplianceConfig {
  // GDPR settings
  gdprEnabled: boolean
  gdprRetentionDays: number
  gdprDataRequestDays: number // 30 days for GDPR
  
  // CCPA settings
  ccpaEnabled: boolean
  ccpaOptOutCategories: string[]
  
  // Data residency
  allowedDataResidency: string[]
  defaultDataResidency: string
  
  // Consent requirements
  requiredConsents: string[]
  
  // Audit requirements
  auditRetentionDays: number
  logAllActions: boolean
}

export type ComplianceConsentType = 'gdpr' | 'ccpa' | 'hipaa' | 'marketing' | 'analytics' | 'terms' | 'privacy'

export const defaultComplianceConfig: ComplianceConfig = {
  gdprEnabled: true,
  gdprRetentionDays: 365 * 2, // 2 years after account closure
  gdprDataRequestDays: 30,
  ccpaEnabled: true,
  ccpaOptOutCategories: ['marketing', 'analytics', 'sale'],
  allowedDataResidency: ['eu', 'us', 'global'],
  defaultDataResidency: 'eu',
  requiredConsents: ['terms', 'privacy'],
  auditRetentionDays: 365 * 7, // 7 years for audit logs
  logAllActions: true,
}

// ============================================================================
// Consent Manager
// ============================================================================

export class ConsentManager {
  private config: ComplianceConfig
  
  constructor(config: Partial<ComplianceConfig> = {}) {
    this.config = {...defaultComplianceConfig, ...config}
  }
  
  /**
   * Check if consent is required for a specific type
   */
  isConsentRequired(type: ComplianceConsentType): boolean {
    return this.config.requiredConsents.includes(type)
  }
  
  /**
   * Validate consent record
   */
  validateConsent(record: Partial<ConsentRecord>): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    
    if (!record.userId) {
      errors.push('User ID is required')
    }
    
    if (!record.type) {
      errors.push('Consent type is required')
    }
    
    if (typeof record.granted !== 'boolean') {
      errors.push('Grant status is required')
    }
    
    return {
      valid: errors.length === 0,
      errors,
    }
  }
  
  /**
   * Check if user has valid consent
   */
  hasValidConsent(
    userConsents: ConsentRecord[],
    requiredType: ComplianceConsentType
  ): boolean {
    const latestConsent = userConsents
      .filter(c => c.type === requiredType)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
    
    if (!latestConsent) return false
    if (!latestConsent.granted) return false
    
    // Check if consent version has changed
    // In real implementation, check against current policy version
    
    return true
  }
  
  /**
   * Create consent record
   */
  createConsentRecord(
    userId: string,
    type: ComplianceConsentType,
    granted: boolean,
    options?: {
      tenantId?: string
      ipAddress?: string
      userAgent?: string
      version?: string
    }
  ): ConsentRecord {
    return {
      userId,
      tenantId: options?.tenantId,
      type,
      granted,
      timestamp: new Date(),
      ipAddress: options?.ipAddress,
      userAgent: options?.userAgent,
      version: options?.version || '1.0',
    }
  }
}

// ============================================================================
// Data Request Handler
// ============================================================================

export class DataRequestHandler {
  private config: ComplianceConfig
  
  constructor(config: Partial<ComplianceConfig> = {}) {
    this.config = {...defaultComplianceConfig, ...config}
  }
  
  /**
   * Create a new data request
   */
  createDataRequest(
    userId: string,
    type: DataRequest['type'],
    options?: {
      tenantId?: string
      format?: string
      notes?: string
    }
  ): Omit<DataRequest, 'id' | 'status' | 'requestedAt'> {
    const now = new Date()
    const dueDate = new Date(now)
    dueDate.setDate(dueDate.getDate() + this.config.gdprDataRequestDays)
    
    return {
      userId,
      tenantId: options?.tenantId,
      type,
      notes: options?.notes,
      format: options?.format,
      priority: 'normal',
      dueAt: dueDate,
    }
  }
  
  /**
   * Check if request can be processed
   */
  canProcessRequest(request: DataRequest): { allowed: boolean; reason?: string } {
    if (request.status === 'completed') {
      return {allowed: false, reason: 'Request already completed'}
    }
    
    if (request.status === 'rejected') {
      return {allowed: false, reason: 'Request was rejected'}
    }
    
    if (request.status === 'cancelled') {
      return {allowed: false, reason: 'Request was cancelled'}
    }
    
    return {allowed: true}
  }
  
  /**
   * Check if request is overdue
   */
  isOverdue(request: DataRequest): boolean {
    if (request.status !== 'pending' && request.status !== 'processing') {
      return false
    }
    
    return new Date() > new Date(request.dueAt)
  }
  
  /**
   * Get data export formats
   */
  getExportFormats(): Array<{ value: string; label: string }> {
    return [
      {value: 'json', label: 'JSON'},
      {value: 'csv', label: 'CSV'},
      {value: 'xml', label: 'XML'},
      {value: 'pdf', label: 'PDF'},
    ]
  }
}

// ============================================================================
// Audit Logger
// ============================================================================

export class AuditLogger {
  private config: ComplianceConfig
  
  constructor(config: Partial<ComplianceConfig> = {}) {
    this.config = {...defaultComplianceConfig, ...config}
  }
  
  /**
   * Log an action
   */
  log(params: {
    userId?: string
    tenantId?: string
    action: string
    entityType: string
    entityId?: string
    oldValue?: Record<string, unknown>
    newValue?: Record<string, unknown>
    ipAddress?: string
    userAgent?: string
    requestId?: string
    endpoint?: string
    method?: string
  }): AuditLogEntry {
    return {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: params.userId,
      tenantId: params.tenantId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      oldValue: params.oldValue,
      newValue: params.newValue,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      location: undefined, // Would be derived from IP
      timestamp: new Date(),
    }
  }
  
  /**
   * Actions that should always be logged
   */
  getRequiredAuditActions(): string[] {
    return [
      // Authentication
      'login',
      'logout',
      'password_change',
      'password_reset',
      'two_factor_enable',
      'two_factor_disable',
      
      // Data access
      'data_export',
      'data_download',
      'data_access',
      
      // Data modifications
      'create',
      'update',
      'delete',
      'bulk_delete',
      
      // Compliance
      'consent_granted',
      'consent_revoked',
      'data_request_create',
      'data_request_complete',
      'data_deletion',
      
      // Administrative
      'role_change',
      'permission_change',
      'settings_change',
      'api_key_create',
      'api_key_revoke',
    ]
  }
  
  /**
   * Should this action be logged?
   */
  shouldLog(action: string): boolean {
    if (!this.config.logAllActions) {
      return this.getRequiredAuditActions().includes(action)
    }
    return true
  }
}

// ============================================================================
// Data Residency Manager
// ============================================================================

export class DataResidencyManager {
  private config: ComplianceConfig
  
  constructor(config: Partial<ComplianceConfig> = {}) {
    this.config = {...defaultComplianceConfig, ...config}
  }
  
  /**
   * Check if data residency is valid
   */
  isValidResidency(region: string): boolean {
    return this.config.allowedDataResidency.includes(region)
  }
  
  /**
   * Get database connection parameters for a region
   */
  getConnectionConfig(region: string): {
    host: string
    port: number
    database: string
    schema?: string
  } {
    const configs: Record<string, { host: string; port: number; database: string; schema?: string }> = {
      eu: {
        host: process.env.DATABASE_EU_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_EU_PORT || '5432'),
        database: process.env.DATABASE_EU_NAME || 'app_eu',
      },
      us: {
        host: process.env.DATABASE_US_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_US_PORT || '5432'),
        database: process.env.DATABASE_US_NAME || 'app_us',
      },
      global: {
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT || '5432'),
        database: process.env.DATABASE_NAME || 'app',
      },
    }
    
    return configs[region] || configs[this.config.defaultDataResidency]
  }
}

// ============================================================================
// Compliance Checker
// ============================================================================

export class ComplianceChecker {
  private consentManager: ConsentManager
  private dataRequestHandler: DataRequestHandler
  private auditLogger: AuditLogger
  private residencyManager: DataResidencyManager
  private config: ComplianceConfig
  
  constructor(config: Partial<ComplianceConfig> = {}) {
    this.config = {...defaultComplianceConfig, ...config}
    this.consentManager = new ConsentManager(this.config)
    this.dataRequestHandler = new DataRequestHandler(this.config)
    this.auditLogger = new AuditLogger(this.config)
    this.residencyManager = new DataResidencyManager(this.config)
  }
  
  /**
   * Check if a user can perform an action
   */
  canPerformAction(params: {
    userId: string
    tenantId?: string
    action: string
    userConsents: ConsentRecord[]
    requiredConsent?: ComplianceConsentType
  }): { allowed: boolean; reason?: string } {
    // Check required consent
    if (params.requiredConsent && !this.consentManager.hasValidConsent(params.userConsents, params.requiredConsent)) {
      return {
        allowed: false,
        reason: `Consent required: ${params.requiredConsent}`,
      }
    }
    
    return {allowed: true}
  }
  
  /**
   * Get compliance status for a user/tenant
   */
  getComplianceStatus(params: {
    userId: string
    tenantId?: string
    userConsents: ConsentRecord[]
    pendingRequests: DataRequest[]
  }): {
    consents: Record<ComplianceConsentType, boolean>
    pendingRequests: number
    isCompliant: boolean
    issues: string[]
  } {
    const issues: string[] = []
    const consents: Record<string, boolean> = {}
    
    // Check required consents
    for (const consentType of this.config.requiredConsents) {
      const hasConsent = this.consentManager.hasValidConsent(params.userConsents, consentType as ComplianceConsentType)
      consents[consentType] = hasConsent
      if (!hasConsent) {
        issues.push(`Missing consent: ${consentType}`)
      }
    }
    
    // Check pending requests
    const pendingRequests = params.pendingRequests.filter(
      r => r.status === 'pending' || r.status === 'processing'
    ).length
    if (pendingRequests > 0) {
      issues.push(`${pendingRequests} pending data request(s)`)
    }
    
    return {
      consents: consents as Record<ComplianceConsentType, boolean>,
      pendingRequests,
      isCompliant: issues.length === 0,
      issues,
    }
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let complianceInstance: ComplianceChecker | null = null

export function getComplianceManager(config?: Partial<ComplianceConfig>): ComplianceChecker {
  if (!complianceInstance) {
    complianceInstance = new ComplianceChecker(config)
  }
  return complianceInstance
}
