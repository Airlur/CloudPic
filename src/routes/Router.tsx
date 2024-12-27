import { createBrowserRouter, redirect } from 'react-router-dom';
import Login from '../pages/Login';
import Home from '../pages/Home';
import { isAuthenticated } from '../utils/auth';

const router = createBrowserRouter([
  {
    path: '/',
    loader: () => {
      if (!isAuthenticated()) {
        return redirect('/login');
      }
      return null;
    },
    element: <Home />,
  },
  {
    path: '/login',
    loader: () => {
      if (isAuthenticated()) {
        return redirect('/');
      }
      return null;
    },
    element: <Login />,
  },
]);

export default router; 