import { createBrowserRouter, redirect } from 'react-router-dom';
import Login from '../pages/Login';
import Home from '../pages/Home';

const isAuthenticated = () => localStorage.getItem('isAuthenticated') === 'true';

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