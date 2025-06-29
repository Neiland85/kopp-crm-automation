/**
 * Setup file for Jest tests
 * Configures global test environment
 */

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.SLACK_BOT_TOKEN = 'test-slack-token';
process.env.SLACK_SIGNING_SECRET = 'test-slack-secret';
process.env.HUBSPOT_API_KEY = 'test-hubspot-key';
process.env.ZAPIER_WEBHOOK_URL = 'https://test-zapier-webhook.com';
