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
    // 先进行认证
    try {
      const authResponse = await this.b2.authorize();
    
      this._authInfo = authResponse.data;
    } catch (error: any) {  // 明确指定 error 类型
      console.error('Authorization failed:', {
        message: error?.message || 'Unknown error',
        name: error?.name
      });
      throw new Error(`Failed to authorize: ${error?.message || 'Unknown error'}`);
    }

    if (!this._authInfo) {
      throw new Error('Not authenticated with B2. Call connect() first.');
    }

    // 使用 authInfo 中的 bucketId
    const bucketId = this._authInfo.allowed.bucketId;
    if (!bucketId) {
      throw new Error('Bucket ID not found in auth info');
    }

    let files: StorageFile[] = [];
    let startFileName: string | undefined;

    try {
      while (files.length < maxFiles) {
        const response = await this.b2.listFileNames({
          bucketId,  // 使用 authInfo 中的 bucketId
          prefix: prefix || '',
          startFileName,
          maxFileCount: Math.min(1000, maxFiles - files.length),
          delimiter: '/'
        });

        const downloadAuth = await this.b2.getDownloadAuthorization({
          bucketId: this._authInfo!.allowed.bucketId,
          fileNamePrefix: prefix || '',
          validDurationInSeconds: 3600  // 1小时有效期
        });

        const newFiles = response.data.files.map((file: {
          fileName: string;
          contentLength: number;
          uploadTimestamp: number;
          contentType: string;
          fileId: string;
          action: string;
        }) => ({
          name: file.fileName,
          size: file.contentLength,
          lastModified: new Date(file.uploadTimestamp),
          mimeType: file.contentType || 'application/octet-stream',
          etag: file.fileId,
          isDirectory: file.fileName.endsWith('/') || file.action === 'folder',
          url: !file.fileName.endsWith('/') ? 
            `${this._authInfo!.downloadUrl}/file/${this._authInfo!.allowed.bucketName}/${file.fileName}?Authorization=${downloadAuth.data.authorizationToken}` : 
            null
        }));

        // 添加文件夹（如果有）
        if (response.data.folders) {
          const folders = response.data.folders.map((folderName: string) => ({
            name: folderName,
            size: 0,
            lastModified: new Date(),
            mimeType: 'application/directory',
            etag: '',
            isDirectory: true
          }));
          files = [...files, ...folders];
        }

        files = [...files, ...newFiles];

        if (!response.data.nextFileName || files.length >= maxFiles) break;
        startFileName = response.data.nextFileName;
      }

      return files.slice(0, maxFiles);
    } catch (error: any) {
      throw new Error(`Failed to list files: ${error.message}`);
    }
  }

  // 获取文件 URL
  getFileUrl(path: string, expiresIn: number = 3600): string {
    if (!this.authInfo?.downloadUrl) {
      throw new Error('Not connected to B2');
    }

    // 生成授权下载 URL
    const downloadAuth = this.b2.getDownloadAuthorization({
      bucketId: this.authInfo.allowed.bucketId,
      fileNamePrefix: path,
      validDurationInSeconds: expiresIn
    });

    return `${this.authInfo.downloadUrl}/file/${this.authInfo.allowed.bucketId}/${path}?Authorization=${downloadAuth}`;
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