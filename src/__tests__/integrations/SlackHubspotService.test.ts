import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { SlackHubspotService } from '../../integrations/SlackHubspotService';
import { ConfigManager } from '../../config/ConfigManager';
import axios from 'axios';

// Mock dependencies
jest.mock('@slack/web-api');
jest.mock('axios');
jest.mock('../../utils/Logger');

const mockSlackClient = {
  conversations: {
    info: jest.fn() as jest.MockedFunction<any>,
  },
  users: {
    info: jest.fn() as jest.MockedFunction<any>,
  },
  chat: {
    postMessage: jest.fn() as jest.MockedFunction<any>,
  },
};

const mockConfig = new ConfigManager();

// Set up environment variables
process.env.SLACK_BOT_TOKEN = 'test-slack-token';
process.env.HUBSPOT_API_KEY = 'test-hubspot-key';

describe('SlackHubspotService', () => {
  let service: SlackHubspotService;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock WebClient constructor
    jest
      .mocked(require('@slack/web-api').WebClient)
      .mockImplementation(() => mockSlackClient);

    service = new SlackHubspotService(mockConfig);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Constructor', () => {
    it('should initialize successfully with valid configuration', () => {
      expect(service).toBeInstanceOf(SlackHubspotService);
    });

    it('should throw error when SLACK_BOT_TOKEN is missing', () => {
      delete process.env.SLACK_BOT_TOKEN;
      
      expect(() => {
        new SlackHubspotService(mockConfig);
      }).toThrow('SLACK_BOT_TOKEN no encontrado en variables de entorno');
      
      // Restore for other tests
      process.env.SLACK_BOT_TOKEN = 'test-slack-token';
    });

    it('should throw error when HUBSPOT_API_KEY is missing', () => {
      delete process.env.HUBSPOT_API_KEY;
      
      expect(() => {
        new SlackHubspotService(mockConfig);
      }).toThrow('HUBSPOT_API_KEY no encontrada en variables de entorno');
      
      // Restore for other tests
      process.env.HUBSPOT_API_KEY = 'test-hubspot-key';
    });
  });

  describe('syncChannelMessagesToHubspot', () => {
    it('should process messages from monitored channels', async () => {
      // Arrange
      const channelId = 'C1234567890';
      const message = {
        ts: '1634567890.123456',
        text: 'Test message from channel',
        user: 'U0987654321',
      };

      mockSlackClient.conversations.info.mockResolvedValue({
        channel: {
          id: channelId,
          name: 'growth-marketing',
        },
      });

      mockSlackClient.users.info.mockResolvedValue({
        user: {
          id: 'U0987654321',
          real_name: 'John Doe',
          profile: {
            email: 'john.doe@example.com',
          },
        },
      });

      // Mock HubSpot search request
      jest.mocked(axios.get).mockResolvedValue({
        data: {
          results: [
            {
              id: '12345',
              properties: {
                email: 'john.doe@example.com',
              },
            },
          ],
        },
      });

      // Mock HubSpot note creation
      jest.mocked(axios.post).mockResolvedValue({
        data: { id: 'note_123' },
      });

      // Act
      await service.syncChannelMessagesToHubspot(channelId, message);

      // Assert
      expect(mockSlackClient.conversations.info).toHaveBeenCalledWith({
        channel: channelId,
      });
      expect(mockSlackClient.users.info).toHaveBeenCalledWith({
        user: message.user,
      });
      expect(axios.get).toHaveBeenCalled();
      expect(axios.post).toHaveBeenCalled();
    });

    it('should ignore messages from non-monitored channels', async () => {
      // Arrange
      const channelId = 'C1234567890';
      const message = {
        ts: '1634567890.123456',
        text: 'Test message',
        user: 'U0987654321',
      };

      mockSlackClient.conversations.info.mockResolvedValue({
        channel: {
          id: channelId,
          name: 'random-channel', // Not monitored
        },
      });

      // Act
      await service.syncChannelMessagesToHubspot(channelId, message);

      // Assert
      expect(mockSlackClient.conversations.info).toHaveBeenCalledWith({
        channel: channelId,
      });
      expect(mockSlackClient.users.info).not.toHaveBeenCalled();
      expect(axios.get).not.toHaveBeenCalled();
      expect(axios.post).not.toHaveBeenCalled();
    });

    it('should create new contact if not found in HubSpot', async () => {
      // Arrange
      const channelId = 'C1234567890';
      const message = {
        ts: '1634567890.123456',
        text: 'Test message from new user',
        user: 'U0987654321',
      };

      mockSlackClient.conversations.info.mockResolvedValue({
        channel: {
          id: channelId,
          name: 'soporte-y-clientes',
        },
      });

      mockSlackClient.users.info.mockResolvedValue({
        user: {
          id: 'U0987654321',
          real_name: 'Jane Smith',
          profile: {
            email: 'jane.smith@example.com',
          },
        },
      });

      // Mock HubSpot search - no results
      jest.mocked(axios.get).mockResolvedValue({
        data: {
          results: [],
        },
      });

      // Mock HubSpot contact creation
      jest.mocked(axios.post).mockResolvedValue({
        data: { id: 'contact_456' },
      });

      // Act
      await service.syncChannelMessagesToHubspot(channelId, message);

      // Assert
      expect(axios.get).toHaveBeenCalled();
      expect(axios.post).toHaveBeenCalled();
    });

    it('should handle user without email', async () => {
      // Arrange
      const channelId = 'C1234567890';
      const message = {
        ts: '1634567890.123456',
        text: 'Test message',
        user: 'U0987654321',
      };

      mockSlackClient.conversations.info.mockResolvedValue({
        channel: {
          id: channelId,
          name: 'growth-marketing',
        },
      });

      mockSlackClient.users.info.mockResolvedValue({
        user: {
          id: 'U0987654321',
          real_name: 'User Without Email',
          profile: {
            // No email field
          },
        },
      });

      // Act
      await service.syncChannelMessagesToHubspot(channelId, message);

      // Assert
      expect(mockSlackClient.users.info).toHaveBeenCalled();
      expect(axios.get).not.toHaveBeenCalled();
      expect(axios.post).not.toHaveBeenCalled();
    });

    it('should handle Slack API errors gracefully', async () => {
      // Arrange
      const channelId = 'C1234567890';
      const message = {
        ts: '1634567890.123456',
        text: 'Test message',
        user: 'U0987654321',
      };

      mockSlackClient.conversations.info.mockRejectedValue(
        new Error('Slack API Error')
      );

      // Act & Assert
      await expect(
        service.syncChannelMessagesToHubspot(channelId, message)
      ).resolves.not.toThrow();
    });

    it('should handle HubSpot API errors gracefully', async () => {
      // Arrange
      const channelId = 'C1234567890';
      const message = {
        ts: '1634567890.123456',
        text: 'Test message',
        user: 'U0987654321',
      };

      mockSlackClient.conversations.info.mockResolvedValue({
        channel: {
          id: channelId,
          name: 'growth-marketing',
        },
      });

      mockSlackClient.users.info.mockResolvedValue({
        user: {
          id: 'U0987654321',
          real_name: 'John Doe',
          profile: {
            email: 'john.doe@example.com',
          },
        },
      });

      jest.mocked(axios.get).mockRejectedValue(
        new Error('HubSpot API Error')
      );

      // Act & Assert
      await expect(
        service.syncChannelMessagesToHubspot(channelId, message)
      ).resolves.not.toThrow();
    });
  });

  describe('sendStageChangeNotification', () => {
    it('should send notification when contact advances to new stage', async () => {
      // Arrange
      const contactData = {
        id: '12345',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        dealStage: 'negotiation',
        previousStage: 'qualification',
      };

      mockSlackClient.chat.postMessage.mockResolvedValue({
        ok: true,
        ts: '1634567890.123456',
      });

      // Act
      await service.sendStageChangeNotification(contactData);

      // Assert
      expect(mockSlackClient.chat.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          channel: expect.any(String),
          blocks: expect.any(Array),
        })
      );
    });

    it('should handle Slack notification errors gracefully', async () => {
      // Arrange
      const contactData = {
        id: '12345',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        dealStage: 'closed-won',
        previousStage: 'negotiation',
      };

      mockSlackClient.chat.postMessage.mockRejectedValue(
        new Error('Slack API Error')
      );

      // Act & Assert
      await expect(
        service.sendStageChangeNotification(contactData)
      ).resolves.not.toThrow();
    });
  });

  describe('testSlackConnection', () => {
    it('should test Slack connection successfully', async () => {
      // Arrange
      mockSlackClient.conversations.info.mockResolvedValue({
        ok: true,
        channel: { id: 'C1234567890', name: 'general' },
      });

      // Act
      const result = await service.testSlackConnection();

      // Assert
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('connected', true);
    });

    it('should handle Slack connection failure', async () => {
      // Arrange
      mockSlackClient.conversations.info.mockRejectedValue(
        new Error('Connection failed')
      );

      // Act
      const result = await service.testSlackConnection();

      // Assert
      expect(result).toHaveProperty('success', false);
      expect(result).toHaveProperty('connected', false);
      expect(result).toHaveProperty('error');
    });
  });

  describe('testHubspotConnection', () => {
    it('should test HubSpot connection successfully', async () => {
      // Arrange
      jest.mocked(axios.get).mockResolvedValue({
        data: { portalId: 12345 },
      });

      // Act
      const result = await service.testHubspotConnection();

      // Assert
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('connected', true);
    });

    it('should handle HubSpot connection failure', async () => {
      // Arrange
      jest.mocked(axios.get).mockRejectedValue(
        new Error('Unauthorized')
      );

      // Act
      const result = await service.testHubspotConnection();

      // Assert
      expect(result).toHaveProperty('success', false);
      expect(result).toHaveProperty('connected', false);
      expect(result).toHaveProperty('error');
    });
  });
});
