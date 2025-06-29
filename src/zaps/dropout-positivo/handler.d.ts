/**
 * 💫 Dropout Positivo Handler - Type Declarations
 */

export interface DropoutPositivoConfig {
  contactId: string;
  email: string;
  lastEngagementDate?: string;
  hubspotApiKey: string;
  slackBotToken: string;
  slackChannel: string;
  scoreBoost?: number;
  thresholdDays?: number;
}

export interface DropoutPositivoResult {
  id: string;
  contactId: string;
  email: string;
  lastEngagementDate?: string;
  daysSinceEngagement: number;
  previousScore: number;
  newScore: number;
  slackMessageId: string;
  processedAt: string;
  success: boolean;
}

export declare function dropoutPositivoHandler(
  config: DropoutPositivoConfig
): Promise<DropoutPositivoResult>;
