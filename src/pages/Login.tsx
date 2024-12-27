import React, { useState, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, TextField, Button, Typography, Paper, IconButton, InputAdornment, useTheme } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CloudIcon from '@mui/icons-material/Cloud';
import { DarkMode as DarkModeIcon, LightMode as LightModeIcon } from '@mui/icons-material';
import { LanguageSwitch, CustomTooltip, CustomAlert } from '@/components';
import { useTheme as useCustomTheme } from '@/themes/ThemeContext';
import { login } from '@/utils/auth';

// 样式定义
const styles = {
  pageContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  settingsContainer: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    maxWidth: '400px'
  },
  paper: (theme: any) => ({
    padding: '32px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    background: theme.palette.mode === 'dark' 
      ? 'linear-gradient(to bottom right, #424242, #303030)'
      : 'linear-gradient(to bottom right, #ffffff, #f5f5f5)',
    color: theme.palette.text.primary
  }),
  cloudIcon: {
    fontSize: '48px',
    marginBottom: '16px'
  },
  form: {
    marginTop: '8px',
    width: '100%'
  },
  submitButton: {
    margin: '24px 0 16px'
  }
} as const;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const theme = useTheme();
  const { mode, toggleTheme } = useCustomTheme();
  
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert] = useState<{
    show: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ show: false, message: '', severity: 'success' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(password);
    
    if (success) {
      setAlert({
        show: true,
        message: t('login.loginSuccess'),
        severity: 'success'
      });
      setTimeout(() => {
        navigate('/');
      }, 500);
    } else {
      setAlert({
        show: true,
        message: t('login.loginFailed'),
        severity: 'error'
      });
    }
  };

  const handleCloseAlert = () => {
    setAlert(prev => ({ ...prev, show: false }));
  };

  return (
    <Box sx={styles.pageContainer}>
      <CustomAlert 
        open={alert.show}
        message={alert.message}
        severity={alert.severity}
        onClose={handleCloseAlert}
      />
      
      <Box sx={styles.settingsContainer}>
        <CustomTooltip 
          title={mode === 'light' ? t('common.darkMode') : t('common.lightMode')}
          arrow
          placement="bottom"
          enterDelay={200}
          leaveDelay={0}
        >
          <IconButton 
            onClick={toggleTheme} 
            color="inherit"
          >
            {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>
        </CustomTooltip>
        <LanguageSwitch />
      </Box>
      <Box sx={styles.container}>
        <Paper sx={styles.paper(theme)} elevation={3}>
          <CloudIcon sx={styles.cloudIcon} color="primary" />
          <Typography component="h1" variant="h5" gutterBottom>
            CloudPic
          </Typography>
          <Box component="form" sx={styles.form} onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label={t('login.password')}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              InputLabelProps={{
                required: false
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={styles.submitButton}
            >
              {t('common.login')}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Login; 