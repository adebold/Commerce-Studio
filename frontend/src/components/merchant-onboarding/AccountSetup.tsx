import React from 'react';
import { 
  Typography, 
  Box, 
  TextField, 
  Grid,
  Paper,
  Alert,
  InputAdornment,
  IconButton
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

interface AccountSetupProps {
  email: string;
  password: string;
  confirmPassword: string;
  onInputChange: (field: string, value: string) => void;
}

const AccountSetup: React.FC<AccountSetupProps> = ({ 
  email, 
  password, 
  confirmPassword, 
  onInputChange 
}) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const passwordsMatch = password === confirmPassword;
  const passwordStrength = getPasswordStrength(password);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Set Up Your VARAi Account
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Create your VARAi account to manage your integration, access analytics, and customize your settings.
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              label="Email Address"
              variant="outlined"
              fullWidth
              required
              type="email"
              value={email}
              onChange={(e) => onInputChange('email', e.target.value)}
              placeholder="your@email.com"
              helperText="We'll use this email for account notifications and support"
              data-testid="email-input"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              label="Password"
              variant="outlined"
              fullWidth
              required
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => onInputChange('password', e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              helperText={
                password ? `Password strength: ${passwordStrength.label}` : "Create a strong password"
              }
              FormHelperTextProps={{
                sx: { color: passwordStrength.color }
              }}
              data-testid="password-input"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              label="Confirm Password"
              variant="outlined"
              fullWidth
              required
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => onInputChange('confirmPassword', e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={handleToggleConfirmPasswordVisibility}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              error={confirmPassword !== '' && !passwordsMatch}
              helperText={
                confirmPassword !== '' && !passwordsMatch 
                  ? "Passwords don't match" 
                  : "Confirm your password"
              }
              data-testid="confirm-password-input"
            />
          </Grid>
        </Grid>
      </Paper>
      
      {password && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Password Requirements:
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <PasswordRequirement 
                met={password.length >= 8} 
                text="At least 8 characters" 
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <PasswordRequirement 
                met={/[A-Z]/.test(password)} 
                text="At least one uppercase letter" 
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <PasswordRequirement 
                met={/[a-z]/.test(password)} 
                text="At least one lowercase letter" 
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <PasswordRequirement 
                met={/[0-9]/.test(password)} 
                text="At least one number" 
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <PasswordRequirement 
                met={/[^A-Za-z0-9]/.test(password)} 
                text="At least one special character" 
              />
            </Grid>
          </Grid>
        </Box>
      )}
      
      <Alert severity="info" sx={{ mt: 2 }}>
        Your account will give you access to the VARAi Commerce Studio, where you can manage your integration, view analytics, and customize your settings.
      </Alert>
    </Box>
  );
};

interface PasswordRequirementProps {
  met: boolean;
  text: string;
}

const PasswordRequirement: React.FC<PasswordRequirementProps> = ({ met, text }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
    <Box
      component="span"
      sx={{
        width: 10,
        height: 10,
        borderRadius: '50%',
        backgroundColor: met ? '#4caf50' : '#ccc',
        display: 'inline-block',
        mr: 1
      }}
    />
    <Typography 
      variant="body2" 
      color={met ? 'text.primary' : 'text.secondary'}
      sx={{ fontWeight: met ? 500 : 400 }}
    >
      {text}
    </Typography>
  </Box>
);

interface PasswordStrength {
  label: string;
  color: string;
}

const getPasswordStrength = (password: string): PasswordStrength => {
  if (!password) {
    return { label: 'None', color: 'text.secondary' };
  }
  
  let strength = 0;
  
  // Length check
  if (password.length >= 8) strength += 1;
  if (password.length >= 12) strength += 1;
  
  // Character type checks
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[a-z]/.test(password)) strength += 1;
  if (/[0-9]/.test(password)) strength += 1;
  if (/[^A-Za-z0-9]/.test(password)) strength += 1;
  
  // Return strength level
  if (strength <= 2) return { label: 'Weak', color: '#f44336' };
  if (strength <= 4) return { label: 'Medium', color: '#ff9800' };
  return { label: 'Strong', color: '#4caf50' };
};

export default AccountSetup;