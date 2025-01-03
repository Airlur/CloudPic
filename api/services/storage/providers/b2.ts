import B2 from 'backblaze-b2';
import { IStorageService, StorageFile, B2AuthInfo } from '../storage-service.types';

// B2 存储服务
export class B2StorageService implements IStorageService {
  private b2: any;
  private _authInfo: B2AuthInfo | null = null;

  constructor(credentials: {
    accessKey: string;
    secretKey: string;
  }) {
    this.b2 = new B2({
      applicationKeyId: credentials.accessKey,
      applicationKey: credentials.secretKey
    });
  }

  set authInfo(info: B2AuthInfo | null) {
    this._authInfo = info;
    if (info) {
      // 重新初始化 B2 客户端
      this.b2 = new B2({
        applicationKeyId: this.b2.applicationKeyId,
        applicationKey: this.b2.applicationKey
      });
      this.b2.authorize({
        apiUrl: info.apiUrl,
        authorizationToken: info.authorizationToken
      });
    }
  }

  get authInfo(): B2AuthInfo | null {
    return this._authInfo;
  }

  // 实现接口要求的 getAuthInfo 方法
  getAuthInfo(): B2AuthInfo {
    if (!this._authInfo) {
      throw new Error('Not authenticated with B2');
    }
    return this._authInfo;
  }

  // 连接到存储服务
  async connect(): Promise<{
    downloadUrl: string;
    apiUrl: string;
    authorizationToken: string;
  }> {
    const auth = await this.b2.authorize();
    
    if (!auth.data.downloadUrl || !auth.data.apiUrl || !auth.data.authorizationToken) {
      throw new Error('Missing required auth information from B2');
    }

    // 存储完整的认证信息
    this.authInfo = {
      downloadUrl: auth.data.downloadUrl,
      apiUrl: auth.data.apiUrl,
      authorizationToken: auth.data.authorizationToken,
      accountId: auth.data.accountId,
      allowed: auth.data.allowed,
      absoluteMinimumPartSize: auth.data.absoluteMinimumPartSize,
      recommendedPartSize: auth.data.recommendedPartSize
    };

    // 只返回必要的公开信息
    return {
      downloadUrl: auth.data.downloadUrl,
      apiUrl: auth.data.apiUrl,
      authorizationToken: auth.data.authorizationToken
    };
  }

  // 上传文件
  async uploadFile(file: File, path: string): Promise<string> {
    if (!this.authInfo) {
      throw new Error('Not authenticated with B2. Call connect() first.');
    }

    // TODO: 实现文件上传逻辑
    throw new Error('Upload functionality not implemented yet');
    
    // 返回类型是 Promise<string>，所以需要返回一个字符串
    // return 'file_url';
  }

  private async uploadLargeFile(file: File, path: string): Promise<string> {
    // 实现分片上传逻辑
    // 1. 开始大文件上传
    // 2. 上传分片
    // 3. 完成上传
    throw new Error('Large file upload not implemented');
  }

  // 删除文件
  async deleteFile(path: string): Promise<void> {
    const file = await this.b2.getFileInfo({
      fileName: path,
      bucketId: this.authInfo?.allowed.bucketId
    });
    
    await this.b2.deleteFileVersion({
      fileId: file.data.fileId,
      fileName: path
    });
  }

  // 列出文件
  async listFiles(prefix?: string, maxFiles: number = 1000): Promise<StorageFile[]> {
    if (!this._authInfo) {
      throw new Error('Not authenticated with B2. Call connect() first.');
    }

    const bucketId = this._authInfo.allowed.bucketId;
    if (!bucketId) {
      throw new Error('Bucket ID not found in auth info');
    }

    let files: StorageFile[] = [];
    let startFileName: string | undefined;

    try {
      // 获取下载授权
      const downloadAuthResponse = await this.b2.getDownloadAuthorization({
        bucketId: bucketId,
        fileNamePrefix: prefix || '',
        validDurationInSeconds: 3600  // 1小时有效期
      });

      const authToken = downloadAuthResponse.data.authorizationToken;
      const bucketName = this._authInfo.allowed.bucketName;
      const downloadUrl = this._authInfo.downloadUrl;

      while (files.length < maxFiles) {
        const response = await this.b2.listFileNames({
          bucketId,
          prefix: prefix || '',
          startFileName,
          maxFileCount: Math.min(1000, maxFiles - files.length),
          delimiter: '/'
        });

        const newFiles = response.data.files.map((file: {
          fileName: string;
          contentLength: number;
          uploadTimestamp: number;
          contentType: string;
          fileId: string;
          action: string;
        }) => {
          // 始终根据文件扩展名判断 MIME 类型
          const mimeType = this.getMimeType(file.fileName);
          return {
            name: file.fileName,
            size: file.contentLength,
            lastModified: new Date(file.uploadTimestamp),
            mimeType,
            etag: file.fileId,
            isDirectory: file.fileName.endsWith('/') || file.action === 'folder',
            url: !file.fileName.endsWith('/') ? 
              `${downloadUrl}/file/${bucketName}/${encodeURIComponent(file.fileName)}?Authorization=${authToken}` : 
              null
          };
        });

        // 添加文件夹
        if (response.data.folders) {
          const folders = response.data.folders.map((folderName: string) => ({
            name: folderName,
            size: 0,
            lastModified: new Date(),
            mimeType: 'application/directory',
            etag: '',
            isDirectory: true,
            url: null
          }));
          files = [...files, ...folders];
        }

        files = [...files, ...newFiles];

        if (!response.data.nextFileName || files.length >= maxFiles) break;
        startFileName = response.data.nextFileName;
      }

      return files.slice(0, maxFiles);
    } catch (error: any) {
      // 如果是认证错误，尝试重新认证
      if (error.message.includes('Invalid authorizationToken')) {
        const auth = await this.b2.authorize();
        this._authInfo = {
          ...this._authInfo!,
          authorizationToken: auth.data.authorizationToken,
          apiUrl: auth.data.apiUrl,
          downloadUrl: auth.data.downloadUrl
        };
        
        // 递归调用自身重试
        return this.listFiles(prefix, maxFiles);
      }
      
      console.error('List files error:', error);
      throw new Error(`Failed to list files: ${error.message}`);
    }
  }

  // 根据文件扩展名获取 MIME 类型
  private getMimeType(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'mp4': 'video/mp4',
      'mov': 'video/quicktime',
      'avi': 'video/x-msvideo',
      'mkv': 'video/x-matroska',
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'txt': 'text/plain',
      'zip': 'application/zip',
      'rar': 'application/x-rar-compressed'
    };
    return mimeTypes[ext || ''] || 'application/octet-stream';
  }

  // 获取文件 URL
  async getFileUrl(path: string, expiresIn: number = 3600): Promise<string> {
    if (!this.authInfo?.downloadUrl) {
      throw new Error('Not connected to B2');
    }

    try {
      // 获取下载授权
      const downloadAuthResponse = await this.b2.getDownloadAuthorization({
        bucketId: this.authInfo.allowed.bucketId,
        fileNamePrefix: path,
        validDurationInSeconds: expiresIn
      });

      return `${this.authInfo.downloadUrl}/file/${this.authInfo.allowed.bucketName}/${encodeURIComponent(path)}?Authorization=${downloadAuthResponse.data.authorizationToken}`;
    } catch (error: any) {
      // 如果是认证错误，尝试重新认证
      if (error.message.includes('Invalid authorizationToken')) {
        const auth = await this.b2.authorize();
        this._authInfo = {
          ...this._authInfo!,
          authorizationToken: auth.data.authorizationToken,
          apiUrl: auth.data.apiUrl,
          downloadUrl: auth.data.downloadUrl
        };
        
        // 重新尝试获取下载授权
        const downloadAuthResponse = await this.b2.getDownloadAuthorization({
          bucketId: this.authInfo.allowed.bucketId,
          fileNamePrefix: path,
          validDurationInSeconds: expiresIn
        });

        return `${this.authInfo.downloadUrl}/file/${this.authInfo.allowed.bucketName}/${encodeURIComponent(path)}?Authorization=${downloadAuthResponse.data.authorizationToken}`;
      }
      
      console.error('Get file URL error:', error);
      throw new Error(`Failed to generate file URL: ${error.message}`);
    }
  }

  // 创建文件夹
  async createFolder(path: string): Promise<void> {
    await this.uploadFile(new File([], ''), `${path.replace(/\/$/, '')}/`);
  }

  // 删除文件夹
  async deleteFolder(path: string): Promise<void> {
    const files = await this.listFiles(path);
    await Promise.all(files.map(file => this.deleteFile(file.name)));
  }

  // 移动文件
  async move(from: string, to: string): Promise<void> {
    await this.copy(from, to);
    await this.deleteFile(from);
  }

  // 复制文件
  async copy(from: string, to: string): Promise<void> {
    const sourceFile = await this.b2.getFileInfo({
      fileName: from,
      bucketId: this.authInfo?.allowed.bucketId
    });

    await this.b2.copyFile({
      sourceFileId: sourceFile.data.fileId,
      fileName: to
    });
  }

  // 检查文件是否存在
  async exists(path: string): Promise<boolean> {
    try {
      await this.b2.getFileInfo({
        fileName: path,
        bucketId: this.authInfo?.allowed.bucketId
      });
      return true;
    } catch {
      return false;
    }
  }

  // 生成上传 URL
  async generateUploadUrl(path: string): Promise<string> {
    const auth = await this.b2.getUploadUrl({
      bucketId: this.authInfo?.allowed.bucketId
    });
    return auth.data.uploadUrl;
  }

  private async calculateSHA1(file: File): Promise<string> {
    // 实现文件 SHA1 计算
    throw new Error('SHA1 calculation not implemented');
  }
} 