import { useEffect } from 'react';
import { RouterProvider, useNavigate } from 'react-router-dom';
import { verify } from '@/services/auth/auth';
import router from './routes/Router';

function AuthCheck() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const isAuthed = await verify();
      if (!isAuthed) {
        navigate('/login');
      }
    };
    checkAuth();
  }, []);

  return null;
}

export default function App() {
  return (
    <>
      <AuthCheck />
      <RouterProvider router={router} />
    </>
  );
}
