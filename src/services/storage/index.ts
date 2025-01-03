import { B2ConnectionData } from '@/components/data-display/storage-forms/B2ConnectionForm';

// 临时实现，后续再对接后端
export const createStorageConnection = async (data: B2ConnectionData): Promise<{ success: boolean }> => {
  console.log('Creating storage connection:', data);
  // 模拟 API 调用
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 1000);
  });
}; 