import React from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useForm, SubmitHandler } from 'react-hook-form';

export interface B2Credentials {
  accessKey: string;
  secretKey: string;
  bucket: string;
}

interface Props {
  onClose?: () => void;
  onSubmit: (credentials: B2Credentials) => Promise<void>;
  isLoading?: boolean;
}

export const B2ConnectionForm: React.FC<Props> = ({ onSubmit, isLoading = false }) => {
  const { t } = useTranslation();
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
  } = useForm<B2Credentials>();

  const onFormSubmit: SubmitHandler<B2Credentials> = (credentials) => {
    onSubmit(credentials);
  };

  return (
    <Box 
      component="form" 
      onSubmit={handleSubmit(onFormSubmit)} 
      sx={{ 
        width: '100%',
        minWidth: { xs: '300px', sm: '400px' },
        maxWidth: '600px',
        mx: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        p: 2
      }}
    >
      <Typography variant="h6">
        {t('storage.connectToB2')}
      </Typography>
      
      <TextField
        {...register('accessKey', { 
          required: t('common.required') as string 
        })}
        InputLabelProps={{ shrink: true }}
        label={t('storage.accessKey')}
        placeholder="keyID"
        fullWidth
        error={!!errors.accessKey}
        helperText={errors.accessKey?.message}
        disabled={isLoading}
      />
      
      <TextField
        {...register('secretKey', { 
          required: t('common.required') as string 
        })}
        InputLabelProps={{ shrink: true }}
        label={t('storage.secretKey')}
        placeholder="applicationKey"
        fullWidth
        type="password"
        error={!!errors.secretKey}
        helperText={errors.secretKey?.message}
        disabled={isLoading}
      />
      
      <TextField
        {...register('bucket', { 
          required: t('common.required') as string 
        })}
        InputLabelProps={{ shrink: true }}
        label={t('storage.bucket')}
        placeholder="bucketName"
        fullWidth
        error={!!errors.bucket}
        helperText={errors.bucket?.message}
        disabled={isLoading}
      />

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button 
          type="submit" 
          variant="contained" 
          color="primary"
          disabled={isLoading}
          size="large"
        >
          {t('common.connect')}
        </Button>
      </Box>
    </Box>
  );
}; 