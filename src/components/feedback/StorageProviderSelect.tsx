import React from 'react';
import { Dialog, DialogTitle, Grid, Card, CardContent, Typography, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface StorageProvider {
  id: string;
  name: string;
  logoUrl: string;  // 使用图片 URL 代替图标组件
}

const STORAGE_PROVIDERS: StorageProvider[] = [
  { 
    id: 'b2', 
    name: 'Backblaze B2', 
    logoUrl: '/src/assets/backblaze.svg'
  },
  { 
    id: 'r2', 
    name: 'Cloudflare R2', 
    logoUrl: '/src/assets/cloudflare.svg'
  },
  { 
    id: 's3', 
    name: 'Amazon S3', 
    logoUrl: '/src/assets/amazon.svg'
  }
];

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (providerId: string) => void;
}

export const StorageProviderSelect: React.FC<Props> = ({ open, onClose, onSelect }) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{t('storage.selectProvider')}</DialogTitle>
      <Grid container spacing={2} sx={{ p: 2 }}>
        {STORAGE_PROVIDERS.map((provider) => (
          <Grid item xs={4} sm={3} md={2} key={provider.id}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
                height: '100%'
              }}
              onClick={() => onSelect(provider.id)}
            >
              <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
                <Box 
                  component="img"
                  src={provider.logoUrl}
                  alt={provider.name}
                  sx={{ 
                    height: 32,
                    width: 'auto',
                    objectFit: 'contain',
                    mb: 1
                  }}
                />
                <Typography variant="caption" display="block">
                  {provider.name}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Dialog>
  );
};