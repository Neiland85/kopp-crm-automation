export interface HotLeadsConfig {
  hubspotApiKey: string;
  slackBotToken: string;
  slackSigningSecret: string;
  slackChannel: string;
  hotLeadThreshold: number;
  isEnabled: boolean;
}

export interface HotLeadTriggerData {
  contactId: string;
  email: string;
  leadInfluenceScore: number;
  previousScore?: number;
  timestamp: string;
  hubspotPortalId: string;
}

export interface HotLeadsResult {
  id: string;
  timestamp: string;
  contactId: string;
  email: string;
  previousScore: number;
  newScore: number;
  statusUpdated: boolean;
  slackMessageSent: boolean;
  executionTimeMs: number;
  error?: string;
  skipped?: boolean;
  reason?: string;
}

export declare function hotLeadsHandler(
  config: HotLeadsConfig,
  triggerData: HotLeadTriggerData
): Promise<HotLeadsResult>;
