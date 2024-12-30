export interface BaseResponse<T = any> {
  code: number;
  message: string;
  data?: T;
}

// 登录响应数据
export interface LoginResponseData {
  authorized: boolean;
}

// 验证响应数据
export interface VerifyResponseData {
  authorized: boolean;
}

// 登出响应数据
export interface LogoutResponseData {
  loggedOut: boolean;
} 