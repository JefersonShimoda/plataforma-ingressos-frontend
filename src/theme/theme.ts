import { createTheme, responsiveFontSizes, alpha } from '@mui/material/styles';

let theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0B0F19',
      paper: '#121927',
    },
    primary: {
      main: '#00D2FF',
      light: '#67E8F9',
      dark: '#0891B2',
      contrastText: '#0B0F19',
    },
    secondary: {
      main: '#8B5CF6',
      light: '#A78BFA',
      dark: '#6D28D9',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#10B981',
      light: '#34D399',
      dark: '#059669',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#F59E0B',
      light: '#FBBF24',
      dark: '#D97706',
      contrastText: '#0B0F19',
    },
    error: {
      main: '#EF4444',
      light: '#F87171',
      dark: '#DC2626',
      contrastText: '#FFFFFF',
    },
    text: {
      primary: '#F8FAFC',
      secondary: '#94A3B8',
      disabled: '#64748B',
    },
    divider: '#1E293B',
  },
  typography: {
    fontFamily: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'].join(','),
    h1: {
      fontWeight: 800,
      letterSpacing: '-0.025em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h3: {
      fontWeight: 700,
      letterSpacing: '-0.015em',
    },
    h4: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.01em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#0B0F19',
          color: '#F8FAFC',
          scrollbarWidth: 'thin',
          scrollbarColor: '#1E293B #0B0F19',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#0B0F19',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#1E293B',
            borderRadius: '4px',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#121927',
          border: '1px solid #1E293B',
          borderRadius: 16,
          backgroundImage: 'none',
          transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '10px 20px',
          fontSize: '0.95rem',
          transition: 'all 0.2s ease-in-out',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #00D2FF 0%, #8B5CF6 100%)',
          color: '#FFFFFF',
          fontWeight: 700,
          boxShadow: '0 4px 14px 0 rgba(0, 210, 255, 0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #00C0EB 0%, #7C3AED 100%)',
            boxShadow: '0 6px 20px 0 rgba(0, 210, 255, 0.45)',
            transform: 'translateY(-1px)',
          },
        },
        outlinedPrimary: {
          borderColor: alpha('#00D2FF', 0.4),
          color: '#00D2FF',
          '&:hover': {
            borderColor: '#00D2FF',
            backgroundColor: alpha('#00D2FF', 0.08),
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#0F172A',
            borderRadius: 10,
            '& fieldset': {
              borderColor: '#1E293B',
            },
            '&:hover fieldset': {
              borderColor: '#334155',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#00D2FF',
              borderWidth: '1.5px',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#121927',
          border: '1px solid #1E293B',
          borderRadius: 20,
          backgroundImage: 'none',
        },
      },
    },
  },
});

theme = responsiveFontSizes(theme);

export default theme;
