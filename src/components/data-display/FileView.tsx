import React, { useState } from 'react';
import { Box, ToggleButton, ToggleButtonGroup, Checkbox } from '@mui/material';
import { GridView as GridViewIcon, List as ListViewIcon } from '@mui/icons-material';
import { FileItem, ViewMode, FileActionProps } from '@/types/file';
import FileGrid from './FileGrid';
import FileList from './FileList';
import { FilePreview } from './FilePreview';

interface FileViewProps extends FileActionProps {
  files: FileItem[];
  viewMode: ViewMode;
  selectedFiles: Set<number | string>;
  onViewModeChange: (mode: ViewMode) => void;
  onToggleSelect: (fileId: number | string) => void;
  breadcrumbs?: React.ReactNode;
  onPreview: (file: FileItem) => void;
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    marginBottom: 0.5,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  },
  headerRight: {
    marginLeft: 'auto',
  },
  viewToggle: {
    '& .MuiToggleButton-root': {
      padding: '4px',
    },
  },
  checkbox: {
    padding: '2px',
  },
} as const;

const FileView: React.FC<FileViewProps> = ({
  files,
  viewMode,
  selectedFiles,
  onViewModeChange,
  onToggleSelect,
  breadcrumbs,
  onPreview,
  ...actionProps
}) => {
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);

  const handleViewModeChange = (
    _: React.MouseEvent<HTMLElement>,
    newMode: ViewMode | null,
  ) => {
    if (newMode !== null) {
      onViewModeChange(newMode);
    }
  };

  const handleSelectAll = () => {
    const allSelected = files.every(file => selectedFiles.has(file.name));
    files.forEach(file => {
      if (allSelected) {
        onToggleSelect(file.name);
      } else if (!selectedFiles.has(file.name)) {
        onToggleSelect(file.name);
      }
    });
  };

  const handlePreview = (file: FileItem) => {
    if (file.isDirectory) {
      onPreview(file);
    } else if (!file.isDirectory && file.url) {
      const previewableFiles = files
        .filter(f => 
          (f.mimeType.startsWith('image/') || f.mimeType.startsWith('video/')) && f.url
        )
        .map(f => ({
          url: f.url!,
          mimeType: f.mimeType
        }));
      
      if (previewableFiles.length > 0) {
        const currentIndex = previewableFiles.findIndex(
          f => f.url === file.url
        );
        
        if (currentIndex !== -1) {
          setPreviewFile({
            ...file,
            previewFiles: previewableFiles,
            previewIndex: currentIndex
          });
        }
      }
    }
  };

  const handleClosePreview = () => {
    setPreviewFile(null);
  };

  return (
    <Box sx={styles.container}>
      <Box sx={styles.header}>
        <Box sx={styles.headerLeft}>
          <Checkbox
            checked={files.length > 0 && files.every(file => selectedFiles.has(file.name))}
            indeterminate={files.some(file => selectedFiles.has(file.name)) && !files.every(file => selectedFiles.has(file.name))}
            onChange={handleSelectAll}
            sx={styles.checkbox}
          />
          {breadcrumbs}
        </Box>
        <Box sx={styles.headerRight}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            size="small"
            sx={styles.viewToggle}
          >
            <ToggleButton value="grid" aria-label="grid view">
              <GridViewIcon />
            </ToggleButton>
            <ToggleButton value="list" aria-label="list view">
              <ListViewIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {viewMode === 'grid' ? (
        <FileGrid
          files={files}
          selectedFiles={selectedFiles}
          onToggleSelect={onToggleSelect}
          onPreview={handlePreview}
          {...actionProps}
        />
      ) : (
        <FileList
          files={files}
          selectedFiles={selectedFiles}
          onToggleSelect={onToggleSelect}
          onPreview={handlePreview}
          {...actionProps}
        />
      )}

      {previewFile && (
        <FilePreview
          open={!!previewFile}
          files={previewFile.previewFiles || []}
          currentIndex={previewFile.previewIndex || 0}
          onClose={handleClosePreview}
        />
      )}
    </Box>
  );
};

export default FileView; 