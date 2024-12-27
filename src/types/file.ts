export interface FileItem {
  id: number | string;
  name: string;
  size: string;
  modified: string;
  type: 'file' | 'folder';
  mimeType?: string;
  thumbnailUrl?: string;
}

export type ViewMode = 'grid' | 'list';

export interface FileActionProps {
  onDelete: (file: FileItem) => void;
  onMove: (file: FileItem) => void;
  onDownload: (file: FileItem) => void;
  onSelect: (file: FileItem) => void;
  onPreview: (file: FileItem) => void;
} 