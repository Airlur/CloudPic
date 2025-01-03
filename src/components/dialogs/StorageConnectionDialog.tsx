import { Dialog } from '@mui/material';
import { B2ConnectionForm, B2Credentials } from '../forms/B2ConnectionForm';
import { useState, useEffect } from 'react';
import { connectStorage } from '@/services/storage/storage';
import { CustomAlert } from '../feedback';
import { useTranslation } from 'react-i18next';

interface Props {
  open: boolean;
  providerId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const StorageConnectionDialog: React.FC<Props> = ({
  open,
  providerId,
  onClose,
  onSuccess
}) => {
  const { t } = useTranslation();
  const [isConnecting, setIsConnecting] = useState(false);
  const [alert, setAlert] = useState<{
    open: boolean;
    type: 'success' | 'error';
    message: string;
  }>({
    open: false,
    type: 'success',
    message: ''
  });

  useEffect(() => {
    if (open) {
      setAlert({
        open: false,
        type: 'success',
        message: ''
      });
    }
  }, [open]);

  const handleConnect = async (credentials: B2Credentials) => {
    setIsConnecting(true);
    try {
      const response = await connectStorage({
        type: providerId,
        credentials
      });
      
      if (response.code === 200) {
        setAlert({
          open: true,
          type: 'success',
          message: t(response.message)
        });
        onSuccess?.();
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setAlert({
          open: true,
          type: 'error',
          message: t(response.message)
        });
        console.log(response.message);
      }
    } catch (error) {
      setAlert({
        open: true,
        type: 'error',
        message: t('response.error.connectionCreationFailed')
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCloseAlert = () => {
    setAlert(prev => ({ ...prev, open: false }));
  };

  const renderConnectionForm = () => {
    switch (providerId) {
      case 'b2':
        return (
          <B2ConnectionForm
            onSubmit={handleConnect}
            onClose={onClose}
            isLoading={isConnecting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      {renderConnectionForm()}
      <CustomAlert
        open={alert.open}
        severity={alert.type}
        message={alert.message}
        onClose={handleCloseAlert}
      />
    </Dialog>
  );
}; 