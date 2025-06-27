import React from 'react';
import styled from '@emotion/styled';
import { Card, Button, Typography } from '../../design-system';

interface SettingsCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  onSave?: () => void;
  onReset?: () => void;
  saving?: boolean;
  children: React.ReactNode;
}

const CardContainer = styled(Card)`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[24]};
`;

const CardActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.spacing[12]};
`;

/**
 * SettingsCard Component
 * 
 * A card component for settings sections with title, description, and actions.
 */
const SettingsCard: React.FC<SettingsCardProps> = ({
  title,
  description,
  icon,
  onSave,
  onReset,
  saving = false,
  children,
}) => {
  return (
    <CardContainer variant="outlined" fullWidth>
      <Card.Header
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {icon && <span>{icon}</span>}
            <Typography variant="h3">{title}</Typography>
          </div>
        }
        subtitle={description && <Typography variant="body2" color="neutral.600">{description}</Typography>}
      />
      <Card.Content>
        {children}
      </Card.Content>
      {(onSave || onReset) && (
        <Card.Footer>
          <CardActions>
            {onReset && (
              <Button
                variant="tertiary"
                onClick={onReset}
                disabled={saving}
              >
                Reset
              </Button>
            )}
            {onSave && (
              <Button
                variant="primary"
                onClick={onSave}
                loading={saving}
              >
                Save Changes
              </Button>
            )}
          </CardActions>
        </Card.Footer>
      )}
    </CardContainer>
  );
};

export default SettingsCard;