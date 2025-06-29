export interface RecompensasEscasezConfig {
  hubspotApiKey: string;
  slackBotToken: string;
  slackSigningSecret: string;
  googleSheetsApiKey: string;
  googleSheetsId: string;
  slackChannel: string;
  stockThreshold: number;
  isEnabled: boolean;
}

export interface EscasezTriggerData {
  productId: string;
  productName: string;
  stockRemaining: number;
  previousStock?: number;
  email?: string;
  contactId?: string;
  sheetRowId: string;
  timestamp: string;
  urgencyLevel: 'medium' | 'high' | 'critical';
}

export interface RecompensasEscasezResult {
  id: string;
  timestamp: string;
  productId: string;
  productName: string;
  stockRemaining: number;
  previousStock: number;
  urgencyLevel: 'medium' | 'high' | 'critical';
  hubspotUpdated: boolean;
  slackMessageSent: boolean;
  executionTimeMs: number;
  error?: string;
  skipped?: boolean;
  reason?: string;
  contactsUpdated?: number;
  couponCode?: string;
}

export declare function recompensasEscasezHandler(
  config: RecompensasEscasezConfig,
  triggerData: EscasezTriggerData
): Promise<RecompensasEscasezResult>;
