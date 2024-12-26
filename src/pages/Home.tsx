import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container, Box, Typography, Button, AppBar, Toolbar, Snackbar, Alert, Fade } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LogoutIcon from '@mui/icons-material/Logout';
import LanguageSwitch from '../components/LanguageSwitch';

// 样式定义
const styles = {
  root: {
    flexGrow: 1
  },
  title: {
    flexGrow: 1
  },
  content: {
    marginTop: '32px'
  },
  contentBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 3
  },
  uploadButton: {
    marginTop: '24px'
  },
  noImagesText: {
    color: 'text.secondary'
  }
} as const;

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [alert, setAlert] = useState<{
    show: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ show: false, message: '', severity: 'success' });

  const handleLogout = () => {
    try {
      localStorage.removeItem('isAuthenticated');
      setAlert({
        show: true,
        message: t('logout.success'),
        severity: 'success'
      });
      // 短暂延迟后导航
      setTimeout(() => {
        navigate('/login');
      }, 500);
    } catch (error) {
      setAlert({
        show: true,
        message: t('logout.failed'),
        severity: 'error'
      });
    }
  };

  const handleCloseAlert = () => {
    setAlert(prev => ({ ...prev, show: false }));
  };

  return (
    <Box sx={styles.root}>
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

      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={styles.title}>
            {t('home.title')}
          </Typography>
          <LanguageSwitch />
          <Button
            color="inherit"
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
          >
            {t('common.logout')}
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={styles.content}>
        <Box sx={styles.contentBox}>
          <Typography variant="h4" component="h1" gutterBottom>
            {t('home.welcome')}
          </Typography>
          <Button
            variant="contained"
            startIcon={<CloudUploadIcon />}
            size="large"
            sx={styles.uploadButton}
          >
            {t('home.uploadImage')}
          </Button>
          <Typography variant="body1" sx={styles.noImagesText}>
            {t('home.noImages')}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Home; 