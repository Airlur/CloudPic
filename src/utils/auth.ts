// 验证密码复杂度
export const validatePassword = (password: string): boolean => {
  // 至少8位，必须包含数字和字母
  return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password);
};

// 生成带过期时间的token
export const generateToken = (): string => {
  return btoa(JSON.stringify({
    timestamp: Date.now(),
    expires: Date.now() + 24 * 60 * 60 * 1000 // 24小时过期
  }));
};

// 验证token
export const validateToken = (token: string): boolean => {
  try {
    const data = JSON.parse(atob(token));
    return Date.now() < data.expires;
  } catch {
    return false;
  }
};

// 检查是否已认证
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('authToken');
  if (!token) return false;
  
  const isValid = validateToken(token);
  if (!isValid) {
    localStorage.removeItem('authToken');
    return false;
  }
  
  return true;
};

// 登录
export const login = (password: string): boolean => {
  if (password === import.meta.env.ACCESS_PASSWORD) {
    const token = generateToken();
    localStorage.setItem('authToken', token);
    return true;
  }
  return false;
};

// 登出
export const logout = (): void => {
  localStorage.removeItem('authToken');
}; 