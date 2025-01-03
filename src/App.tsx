import router from './routes/Router';
import { RouterProvider } from 'react-router-dom';

export default function App() {
  return <RouterProvider router={router} />;
}
