import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { Container, Paper, Box, CircularProgress, Typography, Button, Stack } from '@mui/material';
import { Lock, LogIn, ChevronLeft, ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading, openAuthModal } = useAuth();
  const navigate = useNavigate();

  // Auto-abre o modal de autenticação ao tentar acessar rota protegida deslogado
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user)) {
      openAuthModal(0);
    }
  }, [isLoading, isAuthenticated, user, openAuthModal]);

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <CircularProgress color="primary" />
        <Typography variant="body2" color="text.secondary">
          Verificando credenciais...
        </Typography>
      </Box>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Container maxWidth="sm" sx={{ py: { xs: 6, md: 10 } }}>
        <Paper
          sx={{
            p: { xs: 3, sm: 5 },
            textAlign: 'center',
            backgroundColor: '#121927',
            border: '1px solid #1E293B',
            borderRadius: 4,
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.5)',
          }}
        >
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: 3,
              backgroundColor: 'rgba(0, 210, 255, 0.15)',
              color: '#00D2FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2.5,
            }}
          >
            <Lock size={30} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#FFFFFF', mb: 1 }}>
            Autenticação Necessária
          </Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3.5, lineHeight: 1.6 }}>
            Esta área é restrita. Faça login na sua conta para acessar seus ingressos, gerenciar eventos ou concluir sua reserva.
          </Typography>
          <Stack spacing={1.5}>
            <Button
              variant="contained"
              size="large"
              onClick={() => openAuthModal(0)}
              startIcon={<LogIn size={18} />}
              sx={{
                background: 'linear-gradient(135deg, #00D2FF 0%, #8B5CF6 100%)',
                fontWeight: 700,
                py: 1.4,
              }}
            >
              Entrar ou Criar Conta
            </Button>
            <Button
              variant="text"
              onClick={() => navigate('/')}
              startIcon={<ChevronLeft size={18} />}
              sx={{ color: '#94A3B8' }}
            >
              Voltar para o Início
            </Button>
          </Stack>
        </Paper>
      </Container>
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <Container maxWidth="sm" sx={{ py: { xs: 6, md: 10 } }}>
        <Paper
          sx={{
            p: { xs: 3, sm: 5 },
            textAlign: 'center',
            backgroundColor: '#121927',
            border: '1px solid #1E293B',
            borderRadius: 4,
          }}
        >
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: 3,
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#EF4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2.5,
            }}
          >
            <ShieldAlert size={30} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#FFFFFF', mb: 1 }}>
            Acesso Restrito
          </Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3.5 }}>
            Seu perfil atual não possui permissão para acessar esta funcionalidade.
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/')} sx={{ color: '#00D2FF' }}>
            Voltar para o Início
          </Button>
        </Paper>
      </Container>
    );
  }

  return children;
};
