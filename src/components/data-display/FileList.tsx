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
} from '@mui/material';
import {
  Delete as DeleteIcon,
  DriveFileMove as MoveIcon,
  Download as DownloadIcon,
  Folder as FolderIcon,
  InsertDriveFile as FileIcon,
} from '@mui/icons-material';
import { CustomTooltip } from '@/components/feedback';
import { FileItem, FileActionProps } from '@/types/file';

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
              key={file.id}
              hover
              onClick={() => onPreview(file)}
              sx={{ cursor: 'pointer' }}
            >
              <TableCell padding="checkbox" sx={styles.checkbox}>
                <Checkbox
                  checked={selectedFiles.has(file.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    onToggleSelect(file.id);
                  }}
                  sx={{ padding: '2px' }}
                />
              </TableCell>
              <TableCell sx={styles.fileNameColumn}>
                <Box sx={styles.fileNameCell}>
                  {file.type === 'folder' ? (
                    <FolderIcon sx={styles.fileIcon} color="primary" />
                  ) : (
                    <FileIcon sx={styles.fileIcon} color="action" />
                  )}
                  <CustomTooltip 
                    title={file.name} 
                    placement="bottom" 
                    enterDelay={500}
                  >
                    <span style={styles.fileName}>{file.name}</span>
                  </CustomTooltip>
                </Box>
              </TableCell>
              <TableCell sx={styles.dataCell}>{file.size}</TableCell>
              <TableCell sx={styles.dataCell}>{file.modified}</TableCell>
              <TableCell sx={styles.dataCell}>
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default FileList; 