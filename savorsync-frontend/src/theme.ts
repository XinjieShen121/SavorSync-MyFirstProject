import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#FF6B35',
      light: '#ff8a5c',
      dark: '#e55a2b',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f7931e',
      light: '#ffb74d',
      dark: '#e67e22',
      contrastText: '#ffffff',
    },
    background: {
      default: '#FBE7D2',
      paper: '#ffffff',
    },
    text: {
      primary: '#2c3e50',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 700,
    },
    h2: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 700,
    },
    h3: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 600,
    },
    h4: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 600,
    },
    h5: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 600,
    },
    h6: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 25,
        },
        contained: {
          boxShadow: '0 8px 25px rgba(255, 107, 53, 0.3)',
          '&:hover': {
            boxShadow: '0 12px 35px rgba(255, 107, 53, 0.4)',
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 107, 53, 0.1)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
}); 