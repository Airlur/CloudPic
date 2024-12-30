import { createBrowserRouter, redirect } from 'react-router-dom';
import Login from '../pages/Login';
import Home from '../pages/Home';
import { isAuthenticated } from '../services/auth/auth';

const router = createBrowserRouter([
  {
    path: '/',
    loader: async () => {
      const authenticated = await isAuthenticated();
      if (!authenticated) {
        return redirect('/login');
      }
      return null;
    },
    element: <Home />,
  },
  {
    path: '/login',
    loader: async () => {
      const authenticated = await isAuthenticated();
      if (authenticated) {
        return redirect('/');
      }
      return null;
    },
    element: <Login />,
  },
]);

export default router; 