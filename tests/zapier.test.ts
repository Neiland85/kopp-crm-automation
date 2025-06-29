import App from '../src/zapier/index';
import {
  withRetry,
  logZapAction,
  mapFormFieldsToHubSpot,
  isValidEmail,
} from '../src/zapier/utils/common';

// Mock del logger
jest.mock('fs/promises');

describe('Form Submission Trigger', () => {
  test('should have correct trigger configuration', () => {
    const trigger = App.triggers.new_form_submission;

    expect(trigger).toBeDefined();
    expect(trigger.key).toBe('new_form_submission');
    expect(trigger.noun).toBe('Form Submission');
    expect(trigger.display.label).toBe('New Form Submission');
    expect(trigger.operation.type).toBe('polling');
    expect(typeof trigger.operation.perform).toBe('function');
  });

  test('should have correct output fields', () => {
    const trigger = App.triggers.new_form_submission;
    const outputFields = trigger.operation.outputFields;

    expect(outputFields).toBeDefined();
    expect(Array.isArray(outputFields)).toBe(true);

    const fieldKeys = outputFields?.map((field) => field.key) || [];
    expect(fieldKeys).toContain('id');
    expect(fieldKeys).toContain('contact_email');
    expect(fieldKeys).toContain('submitted_at');
    expect(fieldKeys).toContain('form_id');
  });

  test('should have sample data', () => {
    const trigger = App.triggers.new_form_submission;

    expect(trigger.operation.sample).toBeDefined();
    expect(trigger.operation.sample).toHaveProperty('id');
    expect(trigger.operation.sample).toHaveProperty('contact_email');
    expect(trigger.operation.sample).toHaveProperty('submitted_at');
  });
});

describe('Page View Trigger', () => {
  test('should have correct trigger configuration', () => {
    const trigger = App.triggers.new_page_view;

    expect(trigger).toBeDefined();
    expect(trigger.key).toBe('new_page_view');
    expect(trigger.noun).toBe('Page View');
    expect(trigger.display.label).toBe('New Page View');
    expect(trigger.operation.type).toBe('polling');
    expect(typeof trigger.operation.perform).toBe('function');
  });

  test('should have correct output fields', () => {
    const trigger = App.triggers.new_page_view;
    const outputFields = trigger.operation.outputFields;

    expect(outputFields).toBeDefined();
    expect(Array.isArray(outputFields)).toBe(true);

    const fieldKeys = outputFields?.map((field) => field.key) || [];
    expect(fieldKeys).toContain('id');
    expect(fieldKeys).toContain('page_url');
    expect(fieldKeys).toContain('timestamp');
  });
});

describe('HubSpot Contact Create Action', () => {
  test('should have correct create configuration', () => {
    const create = App.creates.hubspot_contact;

    expect(create).toBeDefined();
    expect(create.key).toBe('hubspot_contact');
    expect(create.noun).toBe('Contact');
    expect(create.display.label).toBe('Create or Update HubSpot Contact');
    expect(typeof create.operation.perform).toBe('function');
  });

  test('should have required input fields', () => {
    const create = App.creates.hubspot_contact;
    const inputFields = create.operation.inputFields;

    expect(inputFields).toBeDefined();
    expect(Array.isArray(inputFields)).toBe(true);

    const emailField = inputFields.find((field) => field.key === 'email');
    expect(emailField).toBeDefined();
    expect(emailField?.required).toBe(true);

    const fieldKeys = inputFields.map((field) => field.key);
    expect(fieldKeys).toContain('email');
    expect(fieldKeys).toContain('firstname');
    expect(fieldKeys).toContain('lastname');
    expect(fieldKeys).toContain('form_name');
    expect(fieldKeys).toContain('submitted_at');
  });

  test('should have sample output', () => {
    const create = App.creates.hubspot_contact;

    expect(create.operation.sample).toBeDefined();
    expect(create.operation.sample).toHaveProperty('email');
    expect(create.operation.sample).toHaveProperty('firstname');
    expect(create.operation.sample).toHaveProperty('lastname');
  });
});

describe('Slack Notification Create Action', () => {
  test('should have correct create configuration', () => {
    const create = App.creates.slack_notification;

    expect(create).toBeDefined();
    expect(create.key).toBe('slack_notification');
    expect(create.noun).toBe('Slack Message');
    expect(create.display.label).toBe('Send Slack Notification');
    expect(typeof create.operation.perform).toBe('function');
  });

  test('should have required input fields', () => {
    const create = App.creates.slack_notification;
    const inputFields = create.operation.inputFields;

    expect(inputFields).toBeDefined();
    expect(Array.isArray(inputFields)).toBe(true);

    const emailField = inputFields.find((field) => field.key === 'email');
    expect(emailField).toBeDefined();
    expect(emailField?.required).toBe(true);

    const fieldKeys = inputFields.map((field) => field.key);
    expect(fieldKeys).toContain('email');
    expect(fieldKeys).toContain('form_name');
    expect(fieldKeys).toContain('submitted_at');
  });

  test('should have sample output with Block Kit format', () => {
    const create = App.creates.slack_notification;

    expect(create.operation.sample).toBeDefined();
    expect(create.operation.sample).toHaveProperty('blocks');
    expect(Array.isArray(create.operation.sample.blocks)).toBe(true);

    const firstBlock = create.operation.sample.blocks[0];
    expect(firstBlock).toHaveProperty('type', 'section');
    expect(firstBlock).toHaveProperty('text');
    expect(firstBlock.text).toHaveProperty('type', 'mrkdwn');
    expect(firstBlock.text.text).toContain('📩 *Nuevo Form Submission*');
  });
});

describe('App Authentication', () => {
  test('should have custom authentication configuration', () => {
    expect(App.authentication).toBeDefined();
    expect(App.authentication.type).toBe('custom');
    expect(App.authentication.fields).toBeDefined();
    expect(Array.isArray(App.authentication.fields)).toBe(true);

    const fieldKeys = App.authentication.fields.map((field) => field.key);
    expect(fieldKeys).toContain('hubspot_api_key');
    expect(fieldKeys).toContain('slack_webhook_url');
  });

  test('should have authentication test endpoint', () => {
    expect(App.authentication.test).toBeDefined();
    expect(App.authentication.test.url).toContain('hubapi.com');
    expect(App.authentication.test.method).toBe('GET');
  });
});

describe('App Middleware', () => {
  test('should have beforeRequest middleware', () => {
    expect(App.beforeRequest).toBeDefined();
    expect(Array.isArray(App.beforeRequest)).toBe(true);
    expect(App.beforeRequest.length).toBeGreaterThan(0);
    expect(typeof App.beforeRequest[0]).toBe('function');
  });

  test('should have afterResponse middleware', () => {
    expect(App.afterResponse).toBeDefined();
    expect(Array.isArray(App.afterResponse)).toBe(true);
    expect(App.afterResponse.length).toBeGreaterThan(0);
    expect(typeof App.afterResponse[0]).toBe('function');
  });
});

describe('Utility Functions', () => {
  test('withRetry should handle failures and retries', async () => {
    let attempts = 0;
    const flakyOperation = jest.fn(async () => {
      attempts++;
      if (attempts < 3) {
        throw new Error('Temporary failure');
      }
      return 'success';
    });

    const result = await withRetry(flakyOperation, 3, 10);

    expect(result).toBe('success');
    expect(attempts).toBe(3);
    expect(flakyOperation).toHaveBeenCalledTimes(3);
  });

  test('withRetry should fail after max retries', async () => {
    const alwaysFailOperation = jest.fn(async () => {
      throw new Error('Always fails');
    });

    await expect(withRetry(alwaysFailOperation, 2, 10)).rejects.toThrow(
      'Always fails'
    );

    expect(alwaysFailOperation).toHaveBeenCalledTimes(3); // initial + 2 retries
  });

  test('mapFormFieldsToHubSpot should map form fields correctly', () => {
    const formValues = [
      { name: 'email', value: 'test@example.com' },
      { name: 'first_name', value: 'John' },
      { name: 'last_name', value: 'Doe' },
      { name: 'phone', value: '+1-234-567-8900' },
      { name: 'company', value: 'Test Corp' },
    ];

    const mapped = mapFormFieldsToHubSpot(formValues);

    expect(mapped).toHaveProperty('email', 'test@example.com');
    expect(mapped).toHaveProperty('firstname', 'John');
    expect(mapped).toHaveProperty('lastname', 'Doe');
    expect(mapped).toHaveProperty('phone', '+12345678900');
    expect(mapped).toHaveProperty('company', 'Test Corp');
  });

  test('mapFormFieldsToHubSpot should skip invalid emails', () => {
    const formValues = [
      { name: 'email', value: 'invalid-email' },
      { name: 'firstname', value: 'John' },
    ];

    const mapped = mapFormFieldsToHubSpot(formValues);

    expect(mapped).not.toHaveProperty('email');
    expect(mapped).toHaveProperty('firstname', 'John');
  });

  test('isValidEmail should validate email addresses correctly', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name+tag@example.co.uk')).toBe(true);
    expect(isValidEmail('invalid-email')).toBe(false);
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('test@')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
    expect(isValidEmail('test..test@example.com')).toBe(false);
  });

  test('logZapAction should handle logging gracefully', async () => {
    const mockZ = {
      console: {
        log: jest.fn(),
        error: jest.fn(),
      },
    };

    // Should not throw even if logging fails
    await expect(
      logZapAction(mockZ, {
        action: 'test_action',
        timestamp: new Date().toISOString(),
        success: true,
        data: { test: 'data' },
      })
    ).resolves.not.toThrow();

    expect(mockZ.console.log).toHaveBeenCalled();
  });
});
