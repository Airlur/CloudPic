import { request } from '@/utils/request';
import type { BaseResponse } from '@/types/api';
import { B2Credentials } from '@/components/forms/B2ConnectionForm';
import type { FileItem } from '@/types/file';

interface StorageConnectionRequest {
  type: string;
  credentials: B2Credentials;
}

interface StorageConnectionResponse {
  id: string;
  name: string;
  type: string;
  bucket: string;
}

// 导出接口定义
export interface StorageConnection {
  id: string;
  name: string;
  type: string;
  created_at: string;
}

// 创建存储连接
export const connectStorage = async (data: StorageConnectionRequest): Promise<BaseResponse<StorageConnectionResponse>> => {
  try {
    const response = await request.post<BaseResponse<StorageConnectionResponse>>('/storage', data);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    return {
      code: 400,
      message: 'response.error.connectionCreationFailed'
    };
  }
};

// 获取文件列表
export const getFileList = async (connectionId: string, prefix?: string) => {
  try {
    const response = await request.get<BaseResponse<{ files: FileItem[] }>>('/storage/files', {
      params: { 
        connectionId,
        ...(prefix && prefix !== '/' && { prefix })
      }
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    return {
      code: 400,
      message: 'response.error.listFilesFailed'
    };
  }
};

// 获取存储连接列表
export const getStorageConnections = async (): Promise<BaseResponse<StorageConnection[]>> => {
  try {
    const response = await request.get<BaseResponse<StorageConnection[]>>('/storage');
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    return {
      code: 400,
      message: 'response.error.failedToFetchConnections'
    };
  }
}; 