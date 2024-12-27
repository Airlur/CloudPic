import React from 'react';
import { Box, ToggleButton, ToggleButtonGroup, Checkbox } from '@mui/material';
import { GridView as GridViewIcon, List as ListViewIcon } from '@mui/icons-material';
import { FileItem, ViewMode, FileActionProps } from '@/types/file';
import FileGrid from './FileGrid';
import FileList from './FileList';

interface FileViewProps extends FileActionProps {
  files: FileItem[];
  viewMode: ViewMode;
  selectedFiles: Set<number | string>;
  onViewModeChange: (mode: ViewMode) => void;
  onToggleSelect: (fileId: number | string) => void;
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0.5,
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
  ...actionProps
}) => {
  const handleViewModeChange = (
    _: React.MouseEvent<HTMLElement>,
    newMode: ViewMode | null,
  ) => {
    if (newMode !== null) {
      onViewModeChange(newMode);
    }
  };

  const handleSelectAll = () => {
    const allSelected = files.every(file => selectedFiles.has(file.id));
    files.forEach(file => onToggleSelect(file.id));
  };

  return (
    <Box sx={styles.container}>
      <Box sx={styles.header}>
        <Checkbox
          checked={files.length > 0 && files.every(file => selectedFiles.has(file.id))}
          indeterminate={files.some(file => selectedFiles.has(file.id)) && !files.every(file => selectedFiles.has(file.id))}
          onChange={handleSelectAll}
          sx={styles.checkbox}
        />
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

      {viewMode === 'grid' ? (
        <FileGrid
          files={files}
          selectedFiles={selectedFiles}
          onToggleSelect={onToggleSelect}
          {...actionProps}
        />
      ) : (
        <FileList
          files={files}
          selectedFiles={selectedFiles}
          onToggleSelect={onToggleSelect}
          {...actionProps}
        />
      )}
    </Box>
  );
};

export default FileView; 