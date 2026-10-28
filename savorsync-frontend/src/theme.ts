import { createTheme } from '@mui/material/styles';

// Mirrors src/styles/tokens.css (design.md section 3)
export const theme = createTheme({
  palette: {
    primary: { main: '#C2410C', dark: '#9A3412', light: '#FF6B35', contrastText: '#FFFFFF' },
    secondary: { main: '#2F7D4F', contrastText: '#FFFFFF' },
    error: { main: '#B91C1C' },
    warning: { main: '#8F5206' },
    success: { main: '#15803D' },
    info: { main: '#1D4ED8' },
    background: { default: '#FFF8F2', paper: '#FFFFFF' },
    text: { primary: '#3B2A20', secondary: '#6B5547' },
    divider: '#EADBCB',
  },
  typography: {
    fontFamily: "'Poppins', system-ui, -apple-system, 'Segoe UI', sans-serif",
    h1: { fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700 },
    h2: { fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700 },
    h3: { fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 16 },
  breakpoints: { values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 } },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 999, minHeight: 44, paddingInline: 20, boxShadow: 'none' },
        outlined: { borderWidth: 1.5, borderColor: '#A08670', '&:hover': { borderWidth: 1.5 } },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 2px rgba(59, 42, 32, 0.06), 0 1px 3px rgba(59, 42, 32, 0.10)',
          border: '1px solid #EADBCB',
        },
      },
    },
    MuiDialog: {
      styleOverrides: { paper: { borderRadius: 16, boxShadow: '0 12px 32px rgba(59, 42, 32, 0.18)' } },
    },
    MuiChip: { styleOverrides: { root: { borderRadius: 999, fontWeight: 500 } } },
    MuiTextField: { defaultProps: { size: 'medium' } },
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: { borderColor: '#A08670' },
        root: { '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#C2410C' } },
      },
    },
  },
});
