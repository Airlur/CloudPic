import axios from 'axios';
import type { 
  BaseResponse, 
  LoginResponseData,
  LogoutResponseData,
  VerifyResponseData 
} from '@/types/api';
import { ResponseCode } from '@/constants/httpCode';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:3000/api';

// 登录
export const login = async (password: string): Promise<BaseResponse<LoginResponseData>> => {
  try {
    const { data } = await axios.post<BaseResponse<LoginResponseData>>(
      `${API_BASE_URL}/auth`, 
      { password }, 
      { withCredentials: true }
    );
    return data;
  } catch (error) {
    console.error('登录出错:', error);
    return {
      code: ResponseCode.BAD_REQUEST,
      message: 'response.error.login'
    };
  }
};

// 验证登录状态
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const { data } = await axios.get<BaseResponse<VerifyResponseData>>(
      `${API_BASE_URL}/auth/verify`,
      { withCredentials: true }
    );
    return data.code === ResponseCode.SUCCESS;
  } catch (error) {
    return false;
  }
};

// 登出
export const logout = async (): Promise<BaseResponse<LogoutResponseData>> => {
  try {
    const { data } = await axios.post<BaseResponse<LogoutResponseData>>(
      `${API_BASE_URL}/auth/logout`, 
      {}, 
      { withCredentials: true }
    );
    return data;
  } catch (error) {
    return {
      code: ResponseCode.BAD_REQUEST,
      message: 'response.error.logout'
    };
  }
}; 