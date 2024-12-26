import React, { useState, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, TextField, Button, Typography, Paper, IconButton, InputAdornment, Snackbar, Alert, Fade } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CloudIcon from '@mui/icons-material/Cloud';
import { LanguageSwitch } from '@/components';

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
  languageSwitch: {
    position: 'absolute',
    top: '16px',
    right: '16px'
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    maxWidth: '400px'
  },
  paper: {
    padding: '32px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    background: 'linear-gradient(to bottom right, #ffffff, #f5f5f5)'
  },
  cloudIcon: {
    fontSize: '48px',
    color: 'primary.main',
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
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert] = useState<{
    show: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ show: false, message: '', severity: 'success' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === import.meta.env.ACCESS_PASSWORD) {
      localStorage.setItem('isAuthenticated', 'true');
      setAlert({
        show: true,
        message: t('login.loginSuccess'),
        severity: 'success'
      });
      // 短暂延迟后导航
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
      <Snackbar 
        open={alert.show} 
        autoHideDuration={2000} 
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        TransitionComponent={Fade}
      >
        <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>
      
      <Box sx={styles.languageSwitch}>
        <LanguageSwitch />
      </Box>
      <Box sx={styles.container}>
        <Paper sx={styles.paper} elevation={3}>
          <CloudIcon sx={styles.cloudIcon} />
          <Typography component="h1" variant="h5" gutterBottom>
            CloudPic
          </Typography>
          <Box component="form" sx={styles.form} onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
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