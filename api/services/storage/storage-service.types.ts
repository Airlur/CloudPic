// 存储连接接口
export interface StorageConnection {
  id: string;
  name: string;
  type: 'b2' | 'r2' | 's3';
  credentials: {
    accessKey: string;
    secretKey: string;
    bucket?: string;
    endpoint?: string;
    region?: string;
  };
  settings?: {
    customDomain?: string;
    isEnabled?: boolean;
    cdnProvider?: string;
  };
}

// 通用存储文件接口
export interface StorageFile {
  name: string;           // 文件名 (所有服务都有)
  size: number;          // 文件大小 (所有服务都有)
  lastModified?: Date;   // 最后修改时间 (通用)
  mimeType?: string;     // 文件类型 (通用)
  etag?: string;         // 文件标识 (通用)
  isDirectory?: boolean; // 是否是目录 (通用)
  url?: string;          // 文件URL (通用)
}

// B2完整认证信息类型
export interface B2AuthInfo {
  downloadUrl: string;
  apiUrl: string;
  authorizationToken: string;
  accountId: string;
  allowed: {
    bucketId?: string;
    bucketName?: string;
    capabilities: string[];
  };
  absoluteMinimumPartSize: number;
  recommendedPartSize: number;
}

// 存储服务接口
export interface IStorageService {
  connect(): Promise<{ downloadUrl: string; apiUrl: string; authorizationToken: string; }>;
  getAuthInfo(): B2AuthInfo;
  uploadFile(file: File, path: string): Promise<string>;
  deleteFile(path: string): Promise<void>;
  listFiles(prefix?: string): Promise<StorageFile[]>;
  getFileUrl(path: string, expiresIn?: number): string;
  createFolder(path: string): Promise<void>;
  deleteFolder(path: string): Promise<void>;
  move(from: string, to: string): Promise<void>;
  copy(from: string, to: string): Promise<void>;
  exists(path: string): Promise<boolean>;
  generateUploadUrl?(path: string): Promise<string>;
} 