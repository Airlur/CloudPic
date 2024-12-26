import { createTheme, ThemeOptions } from '@mui/material/styles';

const lightTheme: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#2196f3',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#212121',
      secondary: '#666666',
    },
  },
};

const darkTheme: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    background: {
      default: '#303030',
      paper: '#424242',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },
  },
};

export const getTheme = (mode: 'light' | 'dark') => {
  return createTheme(mode === 'light' ? lightTheme : darkTheme);
}; 