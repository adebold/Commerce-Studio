import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { Typography, Button, Input, Card } from '../../../design-system';
import { FormSection, SettingsCard } from '../../../components/settings';
import { settingsService, AccountSettings } from '../../../services/settings';

const TeamMembersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.spacing[16]};
`;

const TeamMemberCard = styled(Card)`
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.spacing[16]};
`;

const TeamMemberInfo = styled.div`
  flex: 1;
`;

const TeamMemberActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.spacing[8]};
`;

const StatusBadge = styled.span<{ status: 'active' | 'invited' | 'disabled' }>`
  display: inline-block;
  padding: ${({ theme }) => `${theme.spacing.spacing[4]} ${theme.spacing.spacing[8]}`};
  border-radius: 4px;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  
  ${({ theme, status }) => {
    if (status === 'active') {
      return `
        background-color: ${theme.colors.semantic.success.light};
        color: ${theme.colors.semantic.success.dark};
      `;
    } else if (status === 'invited') {
      return `
        background-color: ${theme.colors.semantic.warning.light};
        color: ${theme.colors.semantic.warning.dark};
      `;
    } else {
      return `
        background-color: ${theme.colors.neutral[200]};
        color: ${theme.colors.neutral[700]};
      `;
    }
  }}
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.spacing[16]};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

/**
 * AccountSettingsPage Component
 * 
 * Page for managing account settings, team members, and billing information.
 */
const AccountSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<AccountSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', email: '', role: 'Viewer' });
  
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const accountSettings = await settingsService.getSettingsSection('account');
        setSettings(accountSettings);
        setLoading(false);
      } catch (error) {
        console.error('Error loading account settings:', error);
        setLoading(false);
      }
    };
    
    loadSettings();
  }, []);
  
  const handleProfileChange = (field: string, value: string) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      profile: {
        ...settings.profile,
        [field]: value,
      },
    });
  };
  
  const handleAddressChange = (field: string, value: string) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      profile: {
        ...settings.profile,
        address: {
          ...settings.profile.address,
          [field]: value,
        },
      },
    });
  };
  
  const handleSaveProfile = async () => {
    if (!settings) return;
    
    setSaving(true);
    try {
      await settingsService.updateSettings('account', {
        profile: settings.profile,
      });
      alert('Profile settings saved successfully!');
    } catch (error) {
      console.error('Error saving profile settings:', error);
      alert('Failed to save profile settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  const handleAddTeamMember = async () => {
    if (!newMember.name || !newMember.email) return;
    
    setSaving(true);
    try {
      await settingsService.addTeamMember(
        newMember.name,
        newMember.email,
        newMember.role
      );
      
      // Refresh team members
      const accountSettings = await settingsService.getSettingsSection('account');
      setSettings(accountSettings);
      
      // Reset form
      setNewMember({ name: '', email: '', role: 'Viewer' });
      setShowAddMember(false);
      
      alert('Team member added successfully!');
    } catch (error) {
      console.error('Error adding team member:', error);
      alert('Failed to add team member. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  const handleRemoveTeamMember = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this team member?')) return;
    
    try {
      await settingsService.removeTeamMember(id);
      
      // Refresh team members
      const accountSettings = await settingsService.getSettingsSection('account');
      setSettings(accountSettings);
      
      alert('Team member removed successfully!');
    } catch (error) {
      console.error('Error removing team member:', error);
      alert('Failed to remove team member. Please try again.');
    }
  };
  
  if (loading) {
    return (
      <Card variant="outlined">
        <Card.Content>
          <Typography variant="body1" align="center">
            Loading account settings...
          </Typography>
        </Card.Content>
      </Card>
    );
  }
  
  if (!settings) {
    return (
      <Card variant="outlined">
        <Card.Content>
          <Typography variant="body1" align="center" color="semantic.error.main">
            Failed to load account settings. Please refresh the page and try again.
          </Typography>
        </Card.Content>
      </Card>
    );
  }
  
  return (
    <div>
      <Typography variant="h3" gutterBottom>
        Account Settings
      </Typography>
      
      <SettingsCard
        title="Company Profile"
        description="Update your company information and contact details."
        onSave={handleSaveProfile}
        onReset={() => {
          // Reset to original values
          loadSettings();
        }}
        saving={saving}
      >
        <FormSection title="Company Information">
          <FormRow>
            <Input
              label="Company Name"
              value={settings.profile.companyName}
              onChange={(e) => handleProfileChange('companyName', e.target.value)}
              fullWidth
            />
            <Input
              label="Website"
              value={settings.profile.website}
              onChange={(e) => handleProfileChange('website', e.target.value)}
              fullWidth
            />
          </FormRow>
          <FormRow>
            <Input
              label="Contact Email"
              type="email"
              value={settings.profile.contactEmail}
              onChange={(e) => handleProfileChange('contactEmail', e.target.value)}
              fullWidth
            />
            <Input
              label="Contact Phone"
              value={settings.profile.contactPhone}
              onChange={(e) => handleProfileChange('contactPhone', e.target.value)}
              fullWidth
            />
          </FormRow>
        </FormSection>
        
        <FormSection title="Address">
          <Input
            label="Street Address"
            value={settings.profile.address.street}
            onChange={(e) => handleAddressChange('street', e.target.value)}
            fullWidth
          />
          <FormRow>
            <Input
              label="City"
              value={settings.profile.address.city}
              onChange={(e) => handleAddressChange('city', e.target.value)}
              fullWidth
            />
            <Input
              label="State/Province"
              value={settings.profile.address.state}
              onChange={(e) => handleAddressChange('state', e.target.value)}
              fullWidth
            />
          </FormRow>
          <FormRow>
            <Input
              label="Postal/ZIP Code"
              value={settings.profile.address.zipCode}
              onChange={(e) => handleAddressChange('zipCode', e.target.value)}
              fullWidth
            />
            <Input
              label="Country"
              value={settings.profile.address.country}
              onChange={(e) => handleAddressChange('country', e.target.value)}
              fullWidth
            />
          </FormRow>
        </FormSection>
        
        <FormSection title="Preferences">
          <FormRow>
            <Input
              label="Timezone"
              value={settings.profile.timezone}
              onChange={(e) => handleProfileChange('timezone', e.target.value)}
              fullWidth
            />
            <Input
              label="Language"
              value={settings.profile.language}
              onChange={(e) => handleProfileChange('language', e.target.value)}
              fullWidth
            />
          </FormRow>
        </FormSection>
      </SettingsCard>
      
      <SettingsCard
        title="Team Members"
        description="Manage team members and their access to your VARAi Commerce Studio account."
      >
        <div style={{ marginBottom: '16px' }}>
          <Button
            variant="secondary"
            onClick={() => setShowAddMember(!showAddMember)}
          >
            {showAddMember ? 'Cancel' : 'Add Team Member'}
          </Button>
        </div>
        
        {showAddMember && (
          <Card variant="outlined" style={{ marginBottom: '24px' }}>
            <Card.Content>
              <Typography variant="h5" gutterBottom>
                Add New Team Member
              </Typography>
              <FormRow>
                <Input
                  label="Name"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  fullWidth
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  fullWidth
                  required
                />
              </FormRow>
              <div style={{ marginTop: '16px' }}>
                <label htmlFor="role-select">Role</label>
                <select
                  id="role-select"
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '8px',
                    marginTop: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                  }}
                >
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </div>
              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="primary"
                  onClick={handleAddTeamMember}
                  loading={saving}
                  disabled={!newMember.name || !newMember.email}
                >
                  Add Member
                </Button>
              </div>
            </Card.Content>
          </Card>
        )}
        
        <TeamMembersList>
          {settings.teamMembers.map((member) => (
            <TeamMemberCard key={member.id} variant="outlined">
              <TeamMemberInfo>
                <Typography variant="h5">{member.name}</Typography>
                <Typography variant="body2">{member.email}</Typography>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <Typography variant="caption">{member.role}</Typography>
                  <StatusBadge status={member.status}>{member.status}</StatusBadge>
                </div>
                {member.lastLogin && (
                  <Typography variant="caption" color="neutral.600">
                    Last login: {new Date(member.lastLogin).toLocaleString()}
                  </Typography>
                )}
              </TeamMemberInfo>
              <TeamMemberActions>
                <Button
                  variant="tertiary"
                  size="small"
                  onClick={() => handleRemoveTeamMember(member.id)}
                >
                  Remove
                </Button>
              </TeamMemberActions>
            </TeamMemberCard>
          ))}
        </TeamMembersList>
      </SettingsCard>
      
      <SettingsCard
        title="Billing Information"
        description="View and manage your billing information and subscription plan."
      >
        <FormSection title="Current Plan">
          <Card variant="filled">
            <Card.Content>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Typography variant="h4">{settings.billing.plan}</Typography>
                  <Typography variant="body2">
                    Billing cycle: {settings.billing.billingCycle === 'annual' ? 'Annual' : 'Monthly'}
                  </Typography>
                  <Typography variant="body2">
                    Next billing date: {new Date(settings.billing.nextBillingDate).toLocaleDateString()}
                  </Typography>
                </div>
                <Button variant="secondary">Change Plan</Button>
              </div>
            </Card.Content>
          </Card>
        </FormSection>
        
        <FormSection title="Payment Method">
          <Card variant="outlined">
            <Card.Content>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Typography variant="h5">
                    {settings.billing.paymentMethod.type === 'credit_card' ? 'Credit Card' : 
                     settings.billing.paymentMethod.type === 'paypal' ? 'PayPal' : 'Bank Transfer'}
                  </Typography>
                  {settings.billing.paymentMethod.lastFour && (
                    <Typography variant="body2">
                      •••• •••• •••• {settings.billing.paymentMethod.lastFour}
                    </Typography>
                  )}
                  {settings.billing.paymentMethod.expiryDate && (
                    <Typography variant="body2">
                      Expires: {settings.billing.paymentMethod.expiryDate}
                    </Typography>
                  )}
                </div>
                <Button variant="tertiary">Update</Button>
              </div>
            </Card.Content>
          </Card>
        </FormSection>
        
        <FormSection title="Billing History">
          <Typography variant="body2" color="neutral.600">
            No billing history available yet.
          </Typography>
        </FormSection>
      </SettingsCard>
    </div>
  );
  
  // Helper function to reload settings
  async function loadSettings() {
    try {
      const accountSettings = await settingsService.getSettingsSection('account');
      setSettings(accountSettings);
    } catch (error) {
      console.error('Error reloading account settings:', error);
    }
  }
};

export default AccountSettingsPage;