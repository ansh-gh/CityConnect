import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2563EB',
      contrastText: '#FFFFFF'
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF'
    },
    text: {
      primary: '#1E293B',
      secondary: '#64748B'
    },
    success: {
      main: '#22C55E'
    },
    warning: {
      main: '#F59E0B'
    },
    error: {
      main: '#EF4444'
    },
    divider: '#E5E7EB'
  },
  typography: {
    fontFamily: ['Poppins', 'sans-serif'].join(','),
    h1: { fontFamily: 'Poppins' },
    h2: { fontFamily: 'Poppins' },
    h3: { fontFamily: 'Poppins' },
    h4: { fontFamily: 'Poppins' },
    h5: { fontFamily: 'Poppins' },
    h6: { fontFamily: 'Poppins' },
    subtitle1: { fontFamily: 'Poppins' },
    subtitle2: { fontFamily: 'Poppins' },
    body1: { fontFamily: 'Poppins' },
    body2: { fontFamily: 'Poppins' },
    button: { fontFamily: 'Poppins', textTransform: 'none' },
    caption: { fontFamily: 'Poppins' }
  },
  shape: {
    borderRadius: 12
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 2px 8px rgba(15,23,42,.06)',
          backgroundColor: '#FFFFFF'
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none'
          }
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#64748B'
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#2563EB'
          }
        }
      }
    }
  }
});

export default theme;
