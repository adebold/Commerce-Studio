import React, { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { Typography, Input } from '../../design-system';

interface ColorPickerProps {
  id: string;
  label: string;
  description?: string;
  value: string;
  onChange: (color: string) => void;
  disabled?: boolean;
}

const ColorPickerContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.spacing[8]};
`;

const ColorPickerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ColorInputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.spacing[12]};
`;

const ColorPreview = styled.div<{ color: string; disabled: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 4px;
  background-color: ${({ color }) => color};
  border: 1px solid ${({ theme }) => theme.colors.neutral[300]};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`;

const HiddenColorInput = styled.input`
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

/**
 * ColorPicker Component
 * 
 * A color picker component with a color preview and hex input.
 */
const ColorPicker: React.FC<ColorPickerProps> = ({
  id,
  label,
  description,
  value,
  onChange,
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState(value);
  const colorInputRef = useRef<HTMLInputElement>(null);

  // Update input value when value prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setInputValue(newColor);
    onChange(newColor);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Only update the actual color if it's a valid hex color
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(newValue)) {
      onChange(newValue);
    }
  };

  const handlePreviewClick = () => {
    if (!disabled && colorInputRef.current) {
      colorInputRef.current.click();
    }
  };

  return (
    <ColorPickerContainer>
      <ColorPickerHeader>
        <Typography variant="body1" component="label">
          {label}
        </Typography>
      </ColorPickerHeader>
      
      {description && (
        <Typography variant="body2" color="neutral.600">
          {description}
        </Typography>
      )}
      
      <ColorInputContainer>
        <ColorPreview 
          color={value} 
          disabled={disabled} 
          onClick={handlePreviewClick}
        />
        
        <HiddenColorInput
          ref={colorInputRef}
          type="color"
          value={value}
          onChange={handleColorChange}
          disabled={disabled}
        />
        
        <Input
          id={id}
          value={inputValue}
          onChange={handleInputChange}
          disabled={disabled}
          size="small"
          placeholder="#RRGGBB"
          maxLength={7}
        />
      </ColorInputContainer>
    </ColorPickerContainer>
  );
};

export default ColorPicker;