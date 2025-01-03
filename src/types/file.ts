export interface FileItem {
  name: string;
  size: number;
  lastModified: string | Date;
  mimeType: string;
  etag?: string;
  isDirectory?: boolean;
  url?: string;
  // 用于文件预览的属性
  previewFiles?: Array<{
    url: string;
    mimeType: string;
  }>;
  previewIndex?: number;
}

export type ViewMode = 'grid' | 'list';

export interface FileActionProps {
  onDelete: (file: FileItem) => void;
  onMove: (file: FileItem) => void;
  onDownload: (file: FileItem) => void;
  onSelect: (file: FileItem) => void;
  onPreview: (file: FileItem) => void;
}

// 通用的文件视图 Props（可以被 FileList 和 FileGrid 共用）
export interface FileViewProps extends FileActionProps {
  files: FileItem[];
  selectedFiles: Set<string>;  // 只使用 string 类型
  onToggleSelect: (fileName: string) => void;  // 只接受 string 类型
} 