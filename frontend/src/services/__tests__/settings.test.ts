import { settingsService } from '../settings';

// Mock global fetch for testing
global.fetch = jest.fn();

describe('settingsService', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('getSettings', () => {
    test('returns all settings', async () => {
      const settingsPromise = settingsService.getSettings();
      
      // Fast-forward timers to resolve the promise
      jest.runAllTimers();
      
      const settings = await settingsPromise;
      
      // Verify the structure of the returned settings
      expect(settings).toHaveProperty('account');
      expect(settings).toHaveProperty('integration');
      expect(settings).toHaveProperty('appearance');
      expect(settings).toHaveProperty('recommendation');
      expect(settings).toHaveProperty('notification');
    });
  });

  describe('getSettingsSection', () => {
    test('returns account settings', async () => {
      const settingsPromise = settingsService.getSettingsSection('account');
      
      // Fast-forward timers to resolve the promise
      jest.runAllTimers();
      
      const accountSettings = await settingsPromise;
      
      // Verify the structure of the returned account settings
      expect(accountSettings).toHaveProperty('profile');
      expect(accountSettings).toHaveProperty('teamMembers');
      expect(accountSettings).toHaveProperty('billing');
    });

    test('returns integration settings', async () => {
      const settingsPromise = settingsService.getSettingsSection('integration');
      
      // Fast-forward timers to resolve the promise
      jest.runAllTimers();
      
      const integrationSettings = await settingsPromise;
      
      // Verify the structure of the returned integration settings
      expect(integrationSettings).toHaveProperty('apiKeys');
      expect(integrationSettings).toHaveProperty('webhooks');
      expect(integrationSettings).toHaveProperty('dataSync');
      expect(integrationSettings).toHaveProperty('connectedPlatforms');
    });

    test('returns appearance settings', async () => {
      const settingsPromise = settingsService.getSettingsSection('appearance');
      
      // Fast-forward timers to resolve the promise
      jest.runAllTimers();
      
      const appearanceSettings = await settingsPromise;
      
      // Verify the structure of the returned appearance settings
      expect(appearanceSettings).toHaveProperty('widget');
      expect(appearanceSettings).toHaveProperty('branding');
      expect(appearanceSettings).toHaveProperty('emailTemplates');
    });
  });

  describe('updateSettings', () => {
    test('updates account settings', async () => {
      const updatedProfile = {
        profile: {
          companyName: 'Updated Company Name',
          website: 'https://updated-website.com',
          contactEmail: 'updated@example.com',
          contactPhone: '+1 (555) 987-6543',
          address: {
            street: 'Updated Street',
            city: 'Updated City',
            state: 'Updated State',
            zipCode: 'Updated Zip',
            country: 'Updated Country',
          },
          timezone: 'America/New_York',
          language: 'en-US',
        },
      };
      
      const updatePromise = settingsService.updateSettings('account', updatedProfile);
      
      // Fast-forward timers to resolve the promise
      jest.runAllTimers();
      
      const result = await updatePromise;
      
      // Verify the updated settings
      expect(result.profile.companyName).toBe('Updated Company Name');
      expect(result.profile.website).toBe('https://updated-website.com');
      expect(result.profile.contactEmail).toBe('updated@example.com');
      expect(result.profile.contactPhone).toBe('+1 (555) 987-6543');
      expect(result.profile.address.street).toBe('Updated Street');
    });
  });

  describe('generateApiKey', () => {
    test('generates a new API key', async () => {
      const name = 'Test API Key';
      const permissions = ['read', 'write'];
      
      const generatePromise = settingsService.generateApiKey(name, permissions);
      
      // Fast-forward timers to resolve the promise
      jest.runAllTimers();
      
      const newKey = await generatePromise;
      
      // Verify the structure of the generated key
      expect(newKey).toHaveProperty('id');
      expect(newKey).toHaveProperty('name', name);
      expect(newKey).toHaveProperty('key');
      expect(newKey).toHaveProperty('createdAt');
      expect(newKey).toHaveProperty('permissions', permissions);
    });
  });

  describe('deleteApiKey', () => {
    test('deletes an API key', async () => {
      // First, get the current API keys
      const settingsPromise = settingsService.getSettingsSection('integration');
      jest.runAllTimers();
      const integrationSettings = await settingsPromise;
      
      // Get the first API key ID
      const keyId = integrationSettings.apiKeys[0].id;
      
      // Delete the API key
      const deletePromise = settingsService.deleteApiKey(keyId);
      jest.runAllTimers();
      await deletePromise;
      
      // Get the updated API keys
      const updatedSettingsPromise = settingsService.getSettingsSection('integration');
      jest.runAllTimers();
      const updatedSettings = await updatedSettingsPromise;
      
      // Verify the API key was deleted
      const deletedKey = updatedSettings.apiKeys.find(key => key.id === keyId);
      expect(deletedKey).toBeUndefined();
    });
  });

  describe('addTeamMember', () => {
    test('adds a new team member', async () => {
      const name = 'Test User';
      const email = 'test@example.com';
      const role = 'Viewer';
      
      const addPromise = settingsService.addTeamMember(name, email, role);
      
      // Fast-forward timers to resolve the promise
      jest.runAllTimers();
      
      const newMember = await addPromise;
      
      // Verify the structure of the added team member
      expect(newMember).toHaveProperty('id');
      expect(newMember).toHaveProperty('name', name);
      expect(newMember).toHaveProperty('email', email);
      expect(newMember).toHaveProperty('role', role);
      expect(newMember).toHaveProperty('status', 'invited');
    });
  });

  describe('updateTeamMember', () => {
    test('throws an error when team member is not found', async () => {
      const updatePromise = settingsService.updateTeamMember('non-existent-id', {
        name: 'Updated Name',
      });
      
      // Fast-forward timers to resolve the promise
      jest.runAllTimers();
      
      await expect(updatePromise).rejects.toThrow('Team member not found');
    });
  });

  describe('removeTeamMember', () => {
    test('removes a team member', async () => {
      // First, get the current team members
      const settingsPromise = settingsService.getSettingsSection('account');
      jest.runAllTimers();
      const accountSettings = await settingsPromise;
      
      // Get the first team member ID
      const memberId = accountSettings.teamMembers[0].id;
      
      // Remove the team member
      const removePromise = settingsService.removeTeamMember(memberId);
      jest.runAllTimers();
      await removePromise;
      
      // Get the updated team members
      const updatedSettingsPromise = settingsService.getSettingsSection('account');
      jest.runAllTimers();
      const updatedSettings = await updatedSettingsPromise;
      
      // Verify the team member was removed
      const removedMember = updatedSettings.teamMembers.find(member => member.id === memberId);
      expect(removedMember).toBeUndefined();
    });
  });
});