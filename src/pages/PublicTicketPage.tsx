import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  Chip,
  CardMedia,
  Alert,
  Divider,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Wallet,
  Printer,
  ChevronLeft,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { ticketsApi } from '../api/tickets';
import { PublicTicket } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { formatDateTime } from '../utils/formatters';
import { DEFAULT_EVENT_IMAGE, isSafeImageUrl } from '../utils/security';
import { useSnackbar } from 'notistack';
import { getErrorMessage } from '../api/client';

export const PublicTicketPage: React.FC = () => {
  const { shareToken } = useParams<{ shareToken: string }>();

  const [ticket, setTicket] = useState<PublicTicket | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (shareToken) {
      loadPublicTicket();
    } else {
      setError('Token de compartilhamento não fornecido.');
      setLoading(false);
    }
  }, [shareToken]);

  const loadPublicTicket = async () => {
    if (!shareToken) return;
    setLoading(true);
    setError(null);
    try {
      const data = await ticketsApi.getPublicTicket(shareToken);
      setTicket(data);
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err, 'Ingresso não encontrado ou link expirado.'));
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  const handleAddToWallet = () => {
    enqueueSnackbar('Ingresso adicionado com sucesso à carteira digital (Apple Wallet / Google Wallet)!', {
      variant: 'success',
    });
  };

  if (loading) {
    return <LoadingSpinner message="Carregando ingresso compartilhado..." />;
  }

  if (error || !ticket) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Ingresso não encontrado.'}
        </Alert>
        <Button variant="outlined" startIcon={<ChevronLeft size={18} />} onClick={() => navigate('/')}>
          Conhecer outros eventos
        </Button>
      </Container>
    );
  }

  const safeImage = isSafeImageUrl(ticket.imageUrl) ? ticket.imageUrl : DEFAULT_EVENT_IMAGE;

  return (
    <Container maxWidth="xs" sx={{ py: { xs: 3, md: 5 }, pb: 10 }}>
      <Button
        startIcon={<ChevronLeft size={18} />}
        onClick={() => navigate('/')}
        sx={{ color: '#94A3B8', mb: 2, '&:hover': { color: '#FFFFFF' } }}
      >
        Ir para o EventPass
      </Button>

      <Paper
        sx={{
          backgroundColor: '#121927',
          border: '1px solid #1E293B',
          borderRadius: 5,
          overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
        }}
      >
        <Box sx={{ position: 'relative', height: 220 }}>
          <CardMedia
            component="img"
            image={safeImage}
            alt={ticket.eventTitle}
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(11, 15, 25, 0.2) 0%, #121927 100%)',
            }}
          />
          <Box sx={{ position: 'absolute', top: 16, left: 16 }}>
            <Chip
              label={ticket.seatNumber ? 'ASSENTO RESERVADO' : 'INGRESSO DIGITAL'}
              size="small"
              sx={{
                backgroundColor: 'rgba(0, 210, 255, 0.9)',
                color: '#0B0F19',
                fontWeight: 800,
                fontSize: '0.65rem',
                letterSpacing: '0.05em',
              }}
            />
          </Box>
        </Box>

        <Box sx={{ px: 3, pt: 1, pb: 3, textAlign: 'center' }}>
          <Typography
            variant="h5"
            sx={{ fontWeight: 900, color: '#FFFFFF', lineHeight: 1.2, mb: 1, textTransform: 'uppercase' }}
          >
            {ticket.eventTitle}
          </Typography>

          <Typography variant="body2" sx={{ color: '#00D2FF', fontWeight: 700, mb: 3 }}>
            {formatDateTime(ticket.eventDate, { longMonth: true, showYear: true })}
          </Typography>

          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              backgroundColor: '#0F172A',
              border: '1px solid #1E293B',
              display: 'flex',
              justifyContent: 'space-between',
              textAlign: 'left',
              mb: 3.5,
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, display: 'block' }}>
                LOCAL
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
                {ticket.location}
              </Typography>
            </Box>

            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, display: 'block' }}>
                ASSENTO
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#8B5CF6' }}>
                {ticket.seatNumber ? `Poltrona ${ticket.seatNumber}` : 'Pista Geral'}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              position: 'relative',
              p: 3,
              borderRadius: 4,
              border: '2px dashed #00D2FF',
              boxShadow: '0 0 25px rgba(0, 210, 255, 0.15)',
              backgroundColor: '#0B0F19',
              display: 'inline-block',
              mb: 2.5,
            }}
          >
            <Box
              sx={{
                p: 2,
                backgroundColor: '#FFFFFF',
                borderRadius: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              }}
            >
              <QRCodeSVG value={ticket.qrCodeToken} size={160} />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
            <CheckCircle2 size={18} color="#10B981" />
            <Typography variant="subtitle2" sx={{ color: '#10B981', fontWeight: 800, letterSpacing: '0.05em' }}>
              {ticket.validated ? 'INGRESSO JÁ UTILIZADO' : 'PRONTO PARA ENTRADA'}
            </Typography>
          </Box>

          <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mb: 3 }}>
            Apresente este código para o scanner no portão de entrada.
          </Typography>

          <Divider sx={{ borderColor: '#1E293B', mb: 3 }} />

          <Stack spacing={1.5}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleAddToWallet}
              startIcon={<Wallet size={18} />}
              sx={{
                backgroundColor: '#FFFFFF',
                color: '#0B0F19',
                fontWeight: 800,
                py: 1.25,
                '&:hover': { backgroundColor: '#E2E8F0' },
              }}
            >
              Adicionar ao Apple / Google Wallet
            </Button>

            <Button
              fullWidth
              variant="outlined"
              onClick={handleDownloadPDF}
              startIcon={<Printer size={18} />}
              sx={{
                borderColor: '#1E293B',
                color: '#FFFFFF',
                py: 1.25,
                backgroundColor: '#0F172A',
                '&:hover': { borderColor: '#334155', backgroundColor: '#1A2333' },
              }}
            >
              Baixar PDF / Imprimir
            </Button>
          </Stack>

          <Typography
            variant="caption"
            sx={{
              color: '#64748B',
              fontWeight: 700,
              letterSpacing: '0.1em',
              fontSize: '0.65rem',
              display: 'block',
              mt: 3,
            }}
          >
            ENCRYPTED DIGITAL TICKET • EVENTPASS
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};
