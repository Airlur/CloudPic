import React from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, Card, CardContent, CardMedia, Typography, IconButton, Box, Checkbox, FormControlLabel } from '@mui/material';
import { Delete as DeleteIcon, DriveFileMove as MoveIcon, Download as DownloadIcon } from '@mui/icons-material';
import { FileItem, FileActionProps } from '@/types/file';

interface FileGridProps extends FileActionProps {
  files: FileItem[];
  selectedFiles: Set<number | string>;
  onToggleSelect: (fileId: number | string) => void;
}

const styles = {
  container: {
    width: '100%',
  },
  grid: {
    width: '100%',
  },
  card: {
    position: 'relative',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    '&:hover .file-actions': {
      opacity: 1,
    },
  },
  media: {
    height: 140,
    backgroundSize: 'contain',
  },
  content: {
    flexGrow: 1,
    padding: '8px !important',
  },
  actions: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: '8px',
    background: 'rgba(0, 0, 0, 0.6)',
    opacity: 0,
    transition: 'opacity 0.2s',
    borderRadius: '0 4px 0 4px',
  },
  checkbox: {
    position: 'absolute',
    top: 0,
    left: 0,
    padding: '4px',
  },
  fileName: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  fileInfo: {
    fontSize: '0.75rem',
    color: 'text.secondary',
  },
} as const;

const FileGrid: React.FC<FileGridProps> = ({
  files,
  selectedFiles,
  onToggleSelect,
  onDelete,
  onMove,
  onDownload,
  onPreview,
}) => {
  const { t } = useTranslation();

  const handlePreview = (file: FileItem, event: React.MouseEvent) => {
    if ((event.target as HTMLElement).closest('.file-actions')) {
      return;
    }
    onPreview(file);
  };

  return (
    <Box sx={styles.container}>
      <Grid container spacing={2} sx={styles.grid}>
        {files.map((file) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={file.id}>
            <Card 
              sx={styles.card}
              onClick={(e) => handlePreview(file, e)}
            >
              <Checkbox
                checked={selectedFiles.has(file.id)}
                onChange={() => onToggleSelect(file.id)}
                sx={styles.checkbox}
              />
              <CardMedia
                sx={styles.media}
                image={file.thumbnailUrl || '/placeholder.png'}
                title={file.name}
              />
              <CardContent sx={styles.content}>
                <Typography variant="subtitle1" sx={styles.fileName}>
                  {file.name}
                </Typography>
                <Typography variant="body2" sx={styles.fileInfo}>
                  {file.size} • {file.modified}
                </Typography>
              </CardContent>
              <Box className="file-actions" sx={styles.actions}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(file);
                  }}
                  sx={{ color: 'white' }}
                >
                  <DeleteIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMove(file);
                  }}
                  sx={{ color: 'white' }}
                >
                  <MoveIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownload(file);
                  }}
                  sx={{ color: 'white' }}
                >
                  <DownloadIcon />
                </IconButton>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default FileGrid; 