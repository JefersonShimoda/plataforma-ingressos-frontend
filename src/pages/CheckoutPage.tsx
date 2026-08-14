import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Stack,
  Divider,
  CardMedia,
  Alert,
  Chip,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ShieldCheck,
  Lock,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { reservationsApi } from '../api/reservations';
import { paymentsApi } from '../api/payments';
import { Reservation, PaymentMethod, PaymentStatus } from '../types';
import { CountdownTimer } from '../components/checkout/CountdownTimer';
import { PaymentSimulation } from '../components/checkout/PaymentSimulation';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { formatCurrency } from '../utils/formatters';
import { parseSafeId, DEFAULT_EVENT_IMAGE } from '../utils/security';
import { useSnackbar } from 'notistack';
import { getErrorMessage } from '../api/client';

export const CheckoutPage: React.FC = () => {
  const { reservationId } = useParams<{ reservationId: string }>();
  const resId = parseSafeId(reservationId);

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [processing, setProcessing] = useState<boolean>(false);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (resId) {
      loadReservation();
    } else {
      setError('ID de reserva inválido.');
      setLoading(false);
    }
  }, [resId]);

  const loadReservation = async () => {
    if (!resId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await reservationsApi.getReservationById(resId);
      setReservation(data);

      if (new Date(data.expiresAt).getTime() < Date.now() || data.status === 'EXPIRED') {
        setIsExpired(true);
      }
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err, 'Erro ao carregar detalhes da reserva.'));
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePayment = async (method: PaymentMethod, status: PaymentStatus) => {
    if (!resId || !reservation) return;

    if (isExpired) {
      enqueueSnackbar('Esta reserva expirou. Inicie uma nova reserva na página do evento.', {
        variant: 'error',
      });
      return;
    }

    setProcessing(true);
    try {
      const response = await paymentsApi.processPayment({
        reservationId: resId,
        paymentMethod: method,
        simulateStatus: status,
        simulationStatus: status,
        effectiveStatus: status,
      });

      if (response.status === 'APPROVED') {
        try {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#00D2FF', '#8B5CF6', '#10B981', '#FFFFFF'],
          });
        } catch {
          // ignore
        }

        enqueueSnackbar('🎉 Pagamento Aprovado com Sucesso! Seus ingressos já estão na carteira.', {
          variant: 'success',
          autoHideDuration: 5000,
        });

        setTimeout(() => {
          navigate('/my-tickets');
        }, 1200);
      } else {
        enqueueSnackbar('❌ Pagamento Recusado pela Operadora (Simulação). Tente outro método ou simule aprovação.', {
          variant: 'error',
          autoHideDuration: 6000,
        });
      }
    } catch (err) {
      enqueueSnackbar(getErrorMessage(err, 'Falha ao processar pagamento simulado.'), {
        variant: 'error',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleBackToMap = async () => {
    const seatsToRestore = reservation?.seatNumbers || [];
    const qtyToRestore = reservation?.quantity || 1;

    if (resId && reservation && reservation.status === 'PENDING_PAYMENT') {
      try {
        await reservationsApi.cancelReservation(resId);
      } catch (err) {
        console.warn('Erro ao liberar reserva ao voltar:', err);
      }
    }

    if (reservation?.eventId) {
      navigate(`/events/${reservation.eventId}`, {
        state: { selectedSeats: seatsToRestore, quantity: qtyToRestore },
      });
    } else {
      navigate(-1);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Carregando dados da sua reserva segura..." />;
  }

  if (error || !reservation) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Reserva não encontrada.'}
        </Alert>
        <Button startIcon={<ChevronLeft size={18} />} onClick={() => navigate('/')}>
          Voltar para os eventos
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 }, pb: 10 }}>
      <Button
        startIcon={<ChevronLeft size={18} />}
        onClick={handleBackToMap}
        sx={{ color: '#94A3B8', mb: 3, '&:hover': { color: '#FFFFFF' } }}
      >
        Voltar para o mapa
      </Button>

      <Grid container spacing={4}>
        <Grid item xs={12} lg={8}>
          <CountdownTimer
            expiresAt={reservation.expiresAt}
            onExpire={() => setIsExpired(true)}
          />

          <PaymentSimulation
            reservationId={reservation.id}
            totalAmount={reservation.totalAmount}
            onSimulatePayment={handleSimulatePayment}
            loading={processing}
          />
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper
            sx={{
              backgroundColor: '#121927',
              border: '1px solid #1E293B',
              borderRadius: 4,
              p: 3.5,
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.5)',
              position: { lg: 'sticky' },
              top: { lg: 100 },
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF', mb: 3 }}>
              Resumo do Pedido
            </Typography>

            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: 2.5,
                  overflow: 'hidden',
                  flexShrink: 0,
                  backgroundColor: '#0F172A',
                }}
              >
                <CardMedia
                  component="img"
                  image={reservation.event?.imageUrl || DEFAULT_EVENT_IMAGE}
                  alt={reservation.eventTitle}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>

              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2 }}>
                  {reservation.eventTitle}
                </Typography>
                <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mt: 0.5 }}>
                  Reserva #{reservation.id}
                </Typography>
                {reservation.seatNumbers && reservation.seatNumbers.length > 0 && (
                  <Typography variant="caption" sx={{ color: '#00D2FF', fontWeight: 700, display: 'block' }}>
                    Assentos: {reservation.seatNumbers.join(', ')}
                  </Typography>
                )}
              </Box>
            </Stack>

            <Divider sx={{ borderColor: '#1E293B', my: 2 }} />

            <Stack spacing={1.5} sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                  {reservation.quantity || reservation.seatNumbers?.length || 1}x Ingressos
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#FFFFFF' }}>
                  {formatCurrency(reservation.totalAmount)}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                  Taxa de Emissão
                </Typography>
                <Typography variant="body2" sx={{ color: '#10B981', fontWeight: 600 }}>
                  Inclusa
                </Typography>
              </Box>
            </Stack>

            <Divider sx={{ borderColor: '#1E293B', my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 3 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, letterSpacing: '0.05em' }}>
                  TOTAL A PAGAR
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#FFFFFF', lineHeight: 1.1 }}>
                  {formatCurrency(reservation.totalAmount)}
                </Typography>
              </Box>
            </Box>

            <Stack spacing={1.25} sx={{ pt: 2, borderTop: '1px solid #1E293B' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#94A3B8' }}>
                <ShieldCheck size={16} color="#00D2FF" />
                <Typography variant="caption" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                  PAGAMENTO CRIPTOGRAFADO SSL 256-BIT
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#94A3B8' }}>
                <Lock size={16} color="#8B5CF6" />
                <Typography variant="caption" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                  AMBIENTE SEGURO PCI-DSS COMPLIANT
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};
