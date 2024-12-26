import React from 'react';
import { Snackbar, Alert, Fade } from '@mui/material';

interface CustomAlertProps {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
  onClose: () => void;
}

const CustomAlert: React.FC<CustomAlertProps> = ({ open, message, severity, onClose }) => {
  return (
    <Snackbar 
      open={open} 
      autoHideDuration={2000} 
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      TransitionComponent={Fade}
    >
      <Alert 
        onClose={onClose} 
        severity={severity} 
        sx={{ 
          width: '100%',
          '&.MuiAlert-standardSuccess': {
            backgroundColor: '#15E923', // 比默认的浅绿色深一点点
            color: '#fff'
          },
          '&.MuiAlert-standardError': {
            backgroundColor: '#f20c00', // 保持原来的亮红色
            color: '#fff'
          },
          '.MuiAlert-icon': {
            color: '#fff'
          }
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default CustomAlert; 