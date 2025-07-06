#!/usr/bin/env node
/**
 * Slack Integration Test Script
 * Tests Slack connectivity and basic functionality for Kopp Stadium CRM
 */

const { WebClient } = require('@slack/web-api');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Slack client
const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

// Default test channel
const TEST_CHANNEL = process.env.SLACK_TEST_CHANNEL || '#kop-stadium-test';

/**
 * Colors for console output
 */
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

/**
 * Logging utilities
 */
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  header: (msg) =>
    console.log(`${colors.magenta}${colors.bright}🚀 ${msg}${colors.reset}`),
};

/**
 * Test Slack authentication
 */
async function testAuth() {
  log.info('Testing Slack authentication...');

  try {
    const result = await slack.auth.test();
    log.success(`Authenticated as: ${result.user} in team: ${result.team}`);
    return result;
  } catch (error) {
    log.error(`Authentication failed: ${error.message}`);
    throw error;
  }
}

/**
 * Test basic message sending
 */
async function testBasicMessage() {
  log.info(`Sending test message to ${TEST_CHANNEL}...`);

  try {
    const result = await slack.chat.postMessage({
      channel: TEST_CHANNEL,
      text: '🧪 **Test básico de KoppStadium Bot**',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '¡Hola desde *KoppStadium CRM Bot*! 🚀\n\nEste es un mensaje de prueba para verificar la conectividad.',
          },
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `⏰ Timestamp: ${new Date().toISOString()}`,
            },
          ],
        },
      ],
    });

    log.success(`Message sent successfully! Timestamp: ${result.ts}`);
    return result;
  } catch (error) {
    log.error(`Failed to send message: ${error.message}`);
    throw error;
  }
}

/**
 * Test rich message with attachments
 */
async function testRichMessage() {
  log.info('Sending rich message with attachments...');

  try {
    const result = await slack.chat.postMessage({
      channel: TEST_CHANNEL,
      text: '📊 **Test de mensaje enriquecido**',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🏟️ Kopp Stadium CRM - Test Report',
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: '*Estado:* ✅ Operational',
            },
            {
              type: 'mrkdwn',
              text: '*Integraciones:* 🔗 Active',
            },
            {
              type: 'mrkdwn',
              text: '*Lead Scoring:* 📈 Running',
            },
            {
              type: 'mrkdwn',
              text: '*Automation:* ⚡ Enabled',
            },
          ],
        },
        {
          type: 'divider',
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '🎯 *APIs Status Check:*\n• HubSpot: ✅ Connected\n• Google Sheets: ✅ Connected\n• Zapier: ✅ Connected',
          },
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: '📊 View Dashboard',
              },
              style: 'primary',
              url: 'https://your-dashboard-url.com',
            },
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: '📚 Documentation',
              },
              url: 'https://github.com/your-repo/docs',
            },
          ],
        },
      ],
    });

    log.success(`Rich message sent successfully! Timestamp: ${result.ts}`);
    return result;
  } catch (error) {
    log.error(`Failed to send rich message: ${error.message}`);
    throw error;
  }
}

/**
 * Test thread reply
 */
async function testThreadReply(parentTs) {
  log.info('Testing thread reply...');

  try {
    const result = await slack.chat.postMessage({
      channel: TEST_CHANNEL,
      thread_ts: parentTs,
      text: '🧵 Este es un mensaje de respuesta en hilo.\n\n*Funcionalidades probadas:*\n• ✅ Autenticación\n• ✅ Mensaje básico\n• ✅ Mensaje enriquecido\n• ✅ Respuesta en hilo',
    });

    log.success(`Thread reply sent successfully! Timestamp: ${result.ts}`);
    return result;
  } catch (error) {
    log.error(`Failed to send thread reply: ${error.message}`);
    throw error;
  }
}

/**
 * Test channel listing
 */
async function testChannelListing() {
  log.info('Testing channel listing...');

  try {
    const result = await slack.conversations.list({
      types: 'public_channel,private_channel',
      limit: 10,
    });

    const channels = result.channels.map((ch) => `#${ch.name}`).join(', ');
    log.success(`Found channels: ${channels}`);
    return result;
  } catch (error) {
    log.error(`Failed to list channels: ${error.message}`);
    throw error;
  }
}

/**
 * Test user info
 */
async function testUserInfo() {
  log.info('Testing user info retrieval...');

  try {
    const authResult = await slack.auth.test();
    const userResult = await slack.users.info({
      user: authResult.user_id,
    });

    const user = userResult.user;
    log.success(`Bot user info: ${user.real_name} (@${user.name})`);
    return userResult;
  } catch (error) {
    log.error(`Failed to get user info: ${error.message}`);
    throw error;
  }
}

/**
 * Comprehensive test suite
 */
async function runComprehensiveTest() {
  log.header('🧪 KOPP STADIUM SLACK INTEGRATION TEST SUITE');
  log.info('Starting comprehensive Slack integration tests...\n');

  const results = {
    auth: null,
    basicMessage: null,
    richMessage: null,
    threadReply: null,
    channels: null,
    userInfo: null,
    success: true,
    errors: [],
  };

  try {
    // Test 1: Authentication
    log.header('Test 1: Authentication');
    results.auth = await testAuth();
    console.log();

    // Test 2: Basic message
    log.header('Test 2: Basic Message');
    results.basicMessage = await testBasicMessage();
    console.log();

    // Test 3: Rich message
    log.header('Test 3: Rich Message');
    results.richMessage = await testRichMessage();
    console.log();

    // Test 4: Thread reply
    log.header('Test 4: Thread Reply');
    if (results.basicMessage?.ts) {
      results.threadReply = await testThreadReply(results.basicMessage.ts);
    } else {
      log.warning('Skipping thread reply test - no parent message timestamp');
    }
    console.log();

    // Test 5: Channel listing
    log.header('Test 5: Channel Listing');
    results.channels = await testChannelListing();
    console.log();

    // Test 6: User info
    log.header('Test 6: User Information');
    results.userInfo = await testUserInfo();
    console.log();
  } catch (error) {
    results.success = false;
    results.errors.push(error.message);
    log.error(`Test suite failed: ${error.message}`);
  }

  // Summary
  log.header('📋 TEST SUMMARY');

  if (results.success && results.errors.length === 0) {
    log.success('🎉 All tests passed! Slack integration is working correctly.');

    // Send final success message
    try {
      await slack.chat.postMessage({
        channel: TEST_CHANNEL,
        text: '🎉 **Slack Integration Test Suite Completed Successfully!**',
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: '🎉 Test Suite Completed!',
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '✅ *All Slack integration tests passed successfully*\n\nKopp Stadium CRM Bot is ready for production use!',
            },
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `🔧 Tested by: slack-test.js | 📅 ${new Date().toLocaleString()}`,
              },
            ],
          },
        ],
      });
    } catch (finalError) {
      log.warning(
        `Could not send final success message: ${finalError.message}`
      );
    }
  } else {
    log.error(`❌ Some tests failed. Errors: ${results.errors.join(', ')}`);
    process.exit(1);
  }

  return results;
}

/**
 * Simple test function for quick checks
 */
async function runSimpleTest() {
  log.header('🧪 SIMPLE SLACK TEST');

  try {
    await testAuth();
    await testBasicMessage();
    log.success('✅ Simple test completed successfully!');
  } catch (error) {
    log.error(`❌ Simple test failed: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Main function
 */
async function main() {
  // Check for required environment variables
  if (!process.env.SLACK_BOT_TOKEN) {
    log.error('SLACK_BOT_TOKEN environment variable is required');
    log.info('Please set SLACK_BOT_TOKEN in your .env file');
    process.exit(1);
  }

  // Parse command line arguments
  const args = process.argv.slice(2);
  const testType = args[0] || 'simple';

  try {
    switch (testType) {
      case 'simple':
      case 's':
        await runSimpleTest();
        break;

      case 'comprehensive':
      case 'full':
      case 'c':
        await runComprehensiveTest();
        break;

      case 'auth':
        await testAuth();
        break;

      case 'message':
      case 'm':
        await testBasicMessage();
        break;

      case 'rich':
      case 'r':
        await testRichMessage();
        break;

      case 'channels':
        await testChannelListing();
        break;

      case 'user':
        await testUserInfo();
        break;

      default:
        log.info('Usage: node slack-test.js [test-type]');
        log.info('Test types:');
        log.info('  simple (s)         - Basic auth and message test');
        log.info('  comprehensive (c)  - Full test suite');
        log.info('  auth              - Authentication test only');
        log.info('  message (m)       - Basic message test only');
        log.info('  rich (r)          - Rich message test only');
        log.info('  channels          - List channels test only');
        log.info('  user              - User info test only');
        break;
    }
  } catch (error) {
    log.error(`Test execution failed: ${error.message}`);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  log.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testAuth,
  testBasicMessage,
  testRichMessage,
  testThreadReply,
  testChannelListing,
  testUserInfo,
  runSimpleTest,
  runComprehensiveTest,
};
