import React from 'react';
import { Container, Box, Typography, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ py: 12, textAlign: 'center' }}>
      <Paper
        sx={{
          p: 6,
          backgroundColor: '#121927',
          border: '1px solid #1E293B',
          borderRadius: 5,
        }}
      >
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: 3,
            backgroundColor: 'rgba(0, 210, 255, 0.15)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
          }}
        >
          <Compass size={36} color="#00D2FF" />
        </Box>

        <Typography variant="h2" sx={{ fontWeight: 900, color: '#FFFFFF', mb: 1 }}>
          404
        </Typography>

        <Typography variant="h5" sx={{ fontWeight: 700, color: '#F8FAFC', mb: 2 }}>
          Página não encontrada
        </Typography>

        <Typography variant="body2" sx={{ color: '#94A3B8', mb: 4, maxWidth: 380, mx: 'auto' }}>
          O endereço que você tentou acessar não existe ou o evento não está mais disponível.
        </Typography>

        <Button
          variant="contained"
          onClick={() => navigate('/')}
          startIcon={<Home size={18} />}
          sx={{
            background: 'linear-gradient(135deg, #00D2FF 0%, #8B5CF6 100%)',
            fontWeight: 700,
            px: 3.5,
            py: 1.25,
          }}
        >
          Voltar para a Página Inicial
        </Button>
      </Paper>
    </Container>
  );
};
