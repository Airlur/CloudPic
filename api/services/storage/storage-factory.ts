import { IStorageService, StorageConnection } from './storage-service.types';
import { B2StorageService } from './providers/b2';

// 存储工厂类
export class StorageFactory {
  static create(config: Pick<StorageConnection, 'type' | 'credentials'>): IStorageService {
    switch(config.type) {
      case 'b2':
        return new B2StorageService({
          accessKey: config.credentials.accessKey,
          secretKey: config.credentials.secretKey
        });
      case 'r2':
        throw new Error('R2 storage not implemented yet');
      case 's3':
        throw new Error('S3 storage not implemented yet');
      default:
        throw new Error(`Unknown storage type: ${config.type}`);
    }
  }
} 