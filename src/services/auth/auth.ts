import { request } from '@/utils/request';
import type { 
  BaseResponse, 
  LoginResponseData,
  LogoutResponseData,
  VerifyResponseData 
} from '@/types/api';
import { ResponseCode } from '@/constants/httpCode';

export const login = async (password: string): Promise<BaseResponse<LoginResponseData>> => {
  try {
    const { data } = await request.post<BaseResponse<LoginResponseData>>('/auth', { password });
    return data;
  } catch (error) {
    console.error('登录出错:', error);
    return {
      code: ResponseCode.BAD_REQUEST,
      message: 'response.error.login'
    };
  }
};

export const verify = async (): Promise<boolean> => {
  try {
    const { data } = await request.get<BaseResponse<VerifyResponseData>>('/auth/verify');
    return data.code === ResponseCode.SUCCESS;
  } catch {
    return false;
  }
};

export const logout = async (): Promise<BaseResponse<LogoutResponseData>> => {
  try {
    const { data } = await request.post<BaseResponse<LogoutResponseData>>('/auth/logout');
    return data;
  } catch (error) {
    return {
      code: ResponseCode.BAD_REQUEST,
      message: 'response.error.logout'
    };
  }
}; 