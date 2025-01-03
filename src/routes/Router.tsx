import { createBrowserRouter, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Home from '../pages/Home';
import { verify } from '@/services/auth/auth';

// 创建路由守卫组件
const AuthGuard = async () => {
  const isAuthed = await verify();
  if (!isAuthed) {
    return <Navigate to="/login" replace />;
  }
  return null;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
    loader: AuthGuard,
  },
  {
    path: '/login',
    element: <Login />,
  },
]);

export default router; 