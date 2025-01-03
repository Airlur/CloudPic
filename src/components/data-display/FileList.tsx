import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Checkbox,
  Box,
  Typography,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  DriveFileMove as MoveIcon,
  Download as DownloadIcon,
  Folder as FolderIcon,
  InsertDriveFile as FileIcon,
  PlayArrow as PlayArrowIcon,
} from '@mui/icons-material';
import { FileItem, FileActionProps } from '@/types/file';
import { formatFileSize } from '@/utils/format';

interface FileListProps extends FileActionProps {
  files: FileItem[];
  selectedFiles: Set<number | string>;
  onToggleSelect: (fileId: number | string) => void;
}

const styles = {
  tableContainer: {
    maxHeight: 'calc(100vh - 200px)',
    overflowY: 'auto',
  },
  checkbox: {
    width: '48px',
    padding: '0 4px',
  },
  fileNameColumn: {
    minWidth: '200px',
    width: '40%',
    padding: '8px',
    textAlign: 'center',
  },
  fileNameCell: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 1,
    minWidth: '150px',
  },
  fileIcon: {
    marginRight: '8px',
  },
  fileName: {
    verticalAlign: 'middle',
  },
  headerCell: {
    textAlign: 'center',
    padding: '12px',
  },
  dataCell: {
    textAlign: 'center',
  },
  nameCell: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 1,
    minWidth: '150px',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 1,
  },
} as const;

const FileList: React.FC<FileListProps> = ({
  files,
  selectedFiles,
  onToggleSelect,
  onDelete,
  onMove,
  onDownload,
  onPreview,
}) => {
  const { t } = useTranslation();

  const handleRowClick = (file: FileItem, event: React.MouseEvent) => {
    // 如果点击的是复选框或操作按钮区域，不处理
    if (
      (event.target as HTMLElement).closest('.MuiCheckbox-root') ||
      (event.target as HTMLElement).closest('.file-actions')
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

  const renderFileIcon = (file: FileItem) => {
    if (file.isDirectory) {
      return <FolderIcon color="primary" />;
    }

    // 对于图片文件，显示缩略图
    if (file.mimeType.startsWith('image/') && file.url) {
      return (
        <Box
          component="img"
          src={file.url}
          sx={{
            width: 32,
            height: 32,
            objectFit: 'cover',
            borderRadius: 1,
            mr: 1
          }}
        />
      );
    }

    // 对于视频文件，显示视频缩略图
    if (file.mimeType.startsWith('video/') && file.url) {
      return (
        <Box sx={{ position: 'relative', mr: 1 }}>
          <video
            src={file.url}
            style={{
              width: 32,
              height: 32,
              objectFit: 'cover',
              borderRadius: 4
            }}
          />
          <PlayArrowIcon
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: 16,
              color: 'white',
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              borderRadius: '50%',
              p: 0.25
            }}
          />
        </Box>
      );
    }

    // 其他文件类型显示默认图标
    return <FileIcon />;
  };

  return (
    <TableContainer component={Paper} sx={styles.tableContainer}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox" sx={styles.checkbox} />
            <TableCell sx={{ ...styles.headerCell, ...styles.fileNameColumn }}>{t('home.fileName')}</TableCell>
            <TableCell sx={styles.headerCell}>{t('home.fileSize')}</TableCell>
            <TableCell sx={styles.headerCell}>{t('home.lastModified')}</TableCell>
            <TableCell sx={styles.headerCell}>{t('home.actions')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {files.map((file) => (
            <TableRow
              key={file.name}
              hover
              selected={selectedFiles.has(file.name)}
              onClick={(e) => handleRowClick(file, e)}
              style={{ cursor: 'pointer' }}
            >
              <TableCell padding="checkbox">
                <Checkbox
                  className="MuiCheckbox-root"
                  checked={selectedFiles.has(file.name)}
                  onChange={(e) => {
                    e.stopPropagation();
                    onToggleSelect(file.name);
                  }}
                />
              </TableCell>
              <TableCell>
                <Box sx={styles.nameCell}>
                  {renderFileIcon(file)}
                  <Typography sx={styles.fileName}>
                    {file.name}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell sx={styles.dataCell}>
                {file.isDirectory ? '-' : formatFileSize(file.size)}
              </TableCell>
              <TableCell sx={styles.dataCell}>
                {new Date(file.lastModified).toLocaleString()}
              </TableCell>
              <TableCell>
                <Box className="file-actions" sx={styles.actions}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(file);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMove(file);
                    }}
                  >
                    <MoveIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDownload(file);
                    }}
                  >
                    <DownloadIcon />
                  </IconButton>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default FileList; 