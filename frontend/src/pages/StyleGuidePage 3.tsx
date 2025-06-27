import React from 'react';
import styled from '@emotion/styled';
import { 
  Typography, 
  Button, 
  Input, 
  Card,
  ThemeProvider
} from '../design-system';

// Styled components for the style guide
const StyleGuideContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const Section = styled.section`
  margin-bottom: 60px;
`;

const ComponentRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 20px;
  margin-bottom: 40px;
`;

const ColorBox = styled.div<{ bgColor: string }>`
  width: 100px;
  height: 100px;
  background-color: ${({ bgColor }) => bgColor};
  border-radius: 8px;
  display: flex;
  align-items: flex-end;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ColorLabel = styled.div`
  width: 100%;
  padding: 8px;
  background-color: rgba(255, 255, 255, 0.9);
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  font-size: 12px;
  font-weight: 500;
`;

/**
 * Style Guide Page Component
 * 
 * A page that showcases all the components in the VARAi design system.
 */
const StyleGuidePage: React.FC = () => {
  return (
    <ThemeProvider>
      <StyleGuideContainer>
        <Section>
          <Typography variant="h1" gutterBottom>VARAi Design System</Typography>
          <Typography variant="body1">
            This style guide showcases all the components in the VARAi design system.
            Use these components to build consistent user interfaces across the platform.
          </Typography>
        </Section>

        {/* Typography Section */}
        <Section>
          <Typography variant="h2" gutterBottom>Typography</Typography>
          
          <Typography variant="h1" gutterBottom>Heading 1</Typography>
          <Typography variant="h2" gutterBottom>Heading 2</Typography>
          <Typography variant="h3" gutterBottom>Heading 3</Typography>
          <Typography variant="h4" gutterBottom>Heading 4</Typography>
          <Typography variant="h5" gutterBottom>Heading 5</Typography>
          <Typography variant="h6" gutterBottom>Heading 6</Typography>
          
          <Typography variant="body1" gutterBottom>
            Body 1. Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
            Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </Typography>
          
          <Typography variant="body2" gutterBottom>
            Body 2. Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
            Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </Typography>
          
          <Typography variant="caption" gutterBottom>
            Caption text. Lorem ipsum dolor sit amet.
          </Typography>
          
          <Typography variant="overline" gutterBottom>
            Overline text
          </Typography>
          
          <Typography variant="button" gutterBottom>
            Button text
          </Typography>
        </Section>

        {/* Colors Section */}
        <Section>
          <Typography variant="h2" gutterBottom>Colors</Typography>
          
          <Typography variant="h4" gutterBottom>Primary Colors</Typography>
          <ComponentRow>
            <div>
              <ColorBox bgColor="#E6F7FF">
                <ColorLabel>Primary 50</ColorLabel>
              </ColorBox>
            </div>
            <div>
              <ColorBox bgColor="#BAE7FF">
                <ColorLabel>Primary 100</ColorLabel>
              </ColorBox>
            </div>
            <div>
              <ColorBox bgColor="#91D5FF">
                <ColorLabel>Primary 200</ColorLabel>
              </ColorBox>
            </div>
            <div>
              <ColorBox bgColor="#69C0FF">
                <ColorLabel>Primary 300</ColorLabel>
              </ColorBox>
            </div>
            <div>
              <ColorBox bgColor="#40A9FF">
                <ColorLabel>Primary 400</ColorLabel>
              </ColorBox>
            </div>
            <div>
              <ColorBox bgColor="#1890FF">
                <ColorLabel>Primary 500</ColorLabel>
              </ColorBox>
            </div>
            <div>
              <ColorBox bgColor="#096DD9">
                <ColorLabel>Primary 600</ColorLabel>
              </ColorBox>
            </div>
            <div>
              <ColorBox bgColor="#0050B3">
                <ColorLabel>Primary 700</ColorLabel>
              </ColorBox>
            </div>
          </ComponentRow>
          
          <Typography variant="h4" gutterBottom>Neutral Colors</Typography>
          <ComponentRow>
            <div>
              <ColorBox bgColor="#FFFFFF">
                <ColorLabel>White</ColorLabel>
              </ColorBox>
            </div>
            <div>
              <ColorBox bgColor="#FAFAFA">
                <ColorLabel>Neutral 50</ColorLabel>
              </ColorBox>
            </div>
            <div>
              <ColorBox bgColor="#F5F5F5">
                <ColorLabel>Neutral 100</ColorLabel>
              </ColorBox>
            </div>
            <div>
              <ColorBox bgColor="#E0E0E0">
                <ColorLabel>Neutral 300</ColorLabel>
              </ColorBox>
            </div>
            <div>
              <ColorBox bgColor="#9E9E9E">
                <ColorLabel>Neutral 500</ColorLabel>
              </ColorBox>
            </div>
            <div>
              <ColorBox bgColor="#616161">
                <ColorLabel>Neutral 700</ColorLabel>
              </ColorBox>
            </div>
            <div>
              <ColorBox bgColor="#212121">
                <ColorLabel>Neutral 900</ColorLabel>
              </ColorBox>
            </div>
          </ComponentRow>
          
          <Typography variant="h4" gutterBottom>Semantic Colors</Typography>
          <ComponentRow>
            <div>
              <ColorBox bgColor="#52C41A">
                <ColorLabel>Success</ColorLabel>
              </ColorBox>
            </div>
            <div>
              <ColorBox bgColor="#FAAD14">
                <ColorLabel>Warning</ColorLabel>
              </ColorBox>
            </div>
            <div>
              <ColorBox bgColor="#FF4D4F">
                <ColorLabel>Error</ColorLabel>
              </ColorBox>
            </div>
            <div>
              <ColorBox bgColor="#1890FF">
                <ColorLabel>Info</ColorLabel>
              </ColorBox>
            </div>
          </ComponentRow>
        </Section>

        {/* Buttons Section */}
        <Section>
          <Typography variant="h2" gutterBottom>Buttons</Typography>
          
          <Typography variant="h4" gutterBottom>Button Variants</Typography>
          <ComponentRow>
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="tertiary">Tertiary Button</Button>
          </ComponentRow>
          
          <Typography variant="h4" gutterBottom>Button Sizes</Typography>
          <ComponentRow>
            <Button variant="primary" size="small">Small Button</Button>
            <Button variant="primary" size="medium">Medium Button</Button>
            <Button variant="primary" size="large">Large Button</Button>
          </ComponentRow>
          
          <Typography variant="h4" gutterBottom>Button States</Typography>
          <ComponentRow>
            <Button variant="primary">Normal</Button>
            <Button variant="primary" disabled>Disabled</Button>
            <Button variant="primary" loading>Loading</Button>
          </ComponentRow>
        </Section>

        {/* Inputs Section */}
        <Section>
          <Typography variant="h2" gutterBottom>Inputs</Typography>
          
          <Typography variant="h4" gutterBottom>Input Variants</Typography>
          <ComponentRow>
            <Input 
              variant="outlined" 
              label="Outlined Input" 
              placeholder="Enter text here" 
            />
            <Input 
              variant="filled" 
              label="Filled Input" 
              placeholder="Enter text here" 
            />
            <Input 
              variant="standard" 
              label="Standard Input" 
              placeholder="Enter text here" 
            />
          </ComponentRow>
          
          <Typography variant="h4" gutterBottom>Input States</Typography>
          <ComponentRow>
            <Input 
              label="Normal Input" 
              placeholder="Enter text here" 
            />
            <Input 
              label="Disabled Input" 
              placeholder="Enter text here" 
              disabled 
            />
            <Input 
              label="Error Input" 
              placeholder="Enter text here" 
              error 
              helperText="This field has an error" 
            />
          </ComponentRow>
          
          <Typography variant="h4" gutterBottom>Input Sizes</Typography>
          <ComponentRow>
            <Input 
              size="small" 
              label="Small Input" 
              placeholder="Enter text here" 
            />
            <Input 
              size="medium" 
              label="Medium Input" 
              placeholder="Enter text here" 
            />
            <Input 
              size="large" 
              label="Large Input" 
              placeholder="Enter text here" 
            />
          </ComponentRow>
        </Section>

        {/* Cards Section */}
        <Section>
          <Typography variant="h2" gutterBottom>Cards</Typography>
          
          <Typography variant="h4" gutterBottom>Card Variants</Typography>
          <ComponentRow>
            <Card variant="outlined" style={{ width: 300, height: 200 }}>
              <Card.Content>
                <Typography variant="h5" gutterBottom>Outlined Card</Typography>
                <Typography variant="body2">
                  This is an outlined card with a border.
                </Typography>
              </Card.Content>
            </Card>
            
            <Card variant="elevated" style={{ width: 300, height: 200 }}>
              <Card.Content>
                <Typography variant="h5" gutterBottom>Elevated Card</Typography>
                <Typography variant="body2">
                  This is an elevated card with a shadow.
                </Typography>
              </Card.Content>
            </Card>
            
            <Card variant="filled" style={{ width: 300, height: 200 }}>
              <Card.Content>
                <Typography variant="h5" gutterBottom>Filled Card</Typography>
                <Typography variant="body2">
                  This is a filled card with a background color.
                </Typography>
              </Card.Content>
            </Card>
          </ComponentRow>
          
          <Typography variant="h4" gutterBottom>Card with Header and Footer</Typography>
          <ComponentRow>
            <Card variant="elevated" style={{ width: 300 }}>
              <Card.Header 
                title="Card Title" 
                subtitle="Card Subtitle" 
              />
              <Card.Content>
                <Typography variant="body2">
                  This card has a header and footer. The header includes a title and subtitle,
                  while the footer contains actions.
                </Typography>
              </Card.Content>
              <Card.Footer>
                <Button variant="tertiary" size="small">Cancel</Button>
                <Button variant="primary" size="small">Submit</Button>
              </Card.Footer>
            </Card>
          </ComponentRow>
        </Section>
      </StyleGuideContainer>
    </ThemeProvider>
  );
};

export default StyleGuidePage;