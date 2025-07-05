import React from 'react';
import styled from '@emotion/styled';
import { Typography } from '../../design-system';

interface ToggleSwitchProps {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

const ToggleContainer = styled.div`
  display: flex;
  align-items: flex-start;
  padding: ${({ theme }) => theme.spacing.spacing[12]};
  border-radius: ${({ theme }) => theme.components.card.borderRadius};
  background-color: ${({ theme }) => theme.colors.neutral[50]};
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.neutral[100]};
  }
`;

const ToggleInput = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

const ToggleTrack = styled.div<{ checked: boolean; disabled: boolean }>`
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  flex-shrink: 0;
  border-radius: 12px;
  background-color: ${({ theme, checked, disabled }) => {
    if (disabled) return theme.colors.neutral[300];
    return checked ? theme.colors.primary[500] : theme.colors.neutral[300];
  }};
  transition: background-color 0.2s;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
`;

const ToggleThumb = styled.div<{ checked: boolean }>`
  position: absolute;
  top: 2px;
  left: ${({ checked }) => (checked ? '22px' : '2px')};
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: left 0.2s;
`;

const LabelContainer = styled.div`
  margin-left: ${({ theme }) => theme.spacing.spacing[16]};
  flex: 1;
`;

/**
 * ToggleSwitch Component
 * 
 * A toggle switch component for boolean settings with label and description.
 */
const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  id,
  label,
  description,
  checked,
  onChange,
  disabled = false,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled) {
      onChange(e.target.checked);
    }
  };

  const handleTrackClick = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <ToggleContainer>
      <ToggleInput
        id={id}
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
      />
      <ToggleTrack 
        checked={checked} 
        disabled={disabled} 
        onClick={handleTrackClick}
      >
        <ToggleThumb checked={checked} />
      </ToggleTrack>
      <LabelContainer>
        <Typography variant="body1" component="label">
          {label}
        </Typography>
        {description && (
          <Typography variant="body2" color="neutral.600">
            {description}
          </Typography>
        )}
      </LabelContainer>
    </ToggleContainer>
  );
};

export default ToggleSwitch;