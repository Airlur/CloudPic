import React from 'react';
import { Grid, Card, CardContent, CardMedia, Typography, IconButton, Box, Checkbox } from '@mui/material';
import { Delete as DeleteIcon, DriveFileMove as MoveIcon, Download as DownloadIcon, PlayArrow as PlayArrowIcon, InsertDriveFile as InsertDriveFileIcon } from '@mui/icons-material';
import { FileItem, FileActionProps } from '@/types/file';
import { formatFileSize } from '@/utils/format';
import FolderIcon from '@mui/icons-material/Folder';

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
  const handleClick = (file: FileItem, event: React.MouseEvent) => {
    // 如果点击的是复选框或操作按钮区域，不处理
    if (
      (event.target as HTMLElement).closest('.file-actions') ||
      (event.target as HTMLElement).closest('.MuiCheckbox-root')
    ) {
      return;
    }
    
    // 如果是文件夹，触发预览（实际是导航）
    if (file.isDirectory) {
      onPreview(file);
      return;
    }
    
    // 如果是文件且有 URL，触发预览
    if (!file.isDirectory && file.url) {
      onPreview(file);
    }
  };

  const renderThumbnail = (file: FileItem) => {
    if (file.isDirectory) {
      return (
        <Box 
          sx={{ 
            height: 140, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            bgcolor: 'action.hover' 
          }}
        >
          <FolderIcon sx={{ fontSize: 64, color: 'primary.main' }} />
        </Box>
      );
    }

    // 对于图片文件，使用 url 作为缩略图
    if (file.mimeType.startsWith('image/') && file.url) {
      return (
        <CardMedia
          sx={styles.media}
          image={file.url}
          title={file.name}
        />
      );
    }

    // 对于视频文件，使用视频元素作为缩略图
    if (file.mimeType.startsWith('video/') && file.url) {
      return (
        <Box sx={{ ...styles.media, position: 'relative' }}>
          <video
            src={file.url}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              borderRadius: '50%',
              width: 48,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <PlayArrowIcon sx={{ color: 'white', fontSize: 32 }} />
          </Box>
        </Box>
      );
    }

    // 其他文件类型显示默认图标或占位图
    return (
      <Box 
        sx={{ 
          ...styles.media, 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'action.hover'
        }}
      >
        <InsertDriveFileIcon sx={{ fontSize: 64, color: 'text.secondary' }} />
      </Box>
    );
  };

  return (
    <Box sx={styles.container}>
      <Grid container spacing={2} sx={styles.grid}>
        {files.map((file) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={file.name}>
            <Card 
              sx={styles.card}
              onClick={(e) => handleClick(file, e)}
            >
              <Checkbox
                className="MuiCheckbox-root"
                checked={selectedFiles.has(file.name)}
                onChange={(e) => {
                  e.stopPropagation();
                  onToggleSelect(file.name);
                }}
                sx={styles.checkbox}
              />
              {renderThumbnail(file)}
              <CardContent sx={styles.content}>
                <Typography variant="subtitle1" sx={styles.fileName}>
                  {file.name}
                </Typography>
                <Typography variant="body2" sx={styles.fileInfo}>
                  {file.isDirectory ? '-' : formatFileSize(Number(file.size))} • {typeof file.lastModified === 'string' ? file.lastModified : file.lastModified.toLocaleString()}
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