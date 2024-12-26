import { RouterProvider } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import router from './routes/Router';
import './i18n/i18n';
import { CustomThemeProvider } from './themes/ThemeContext';

function App() {
  return (
    <CustomThemeProvider>
      <CssBaseline />
      <RouterProvider 
        router={router} 
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        } as any}
      />
    </CustomThemeProvider>
  );
}

export default App;
