import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Chip,
  Button,
  Stack,
  Paper,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  Zap,
  ArrowRight,
  Armchair,
  Users,
  ChevronLeft,
  Lock,
} from 'lucide-react';
import { eventsApi } from '../api/events';
import { reservationsApi } from '../api/reservations';
import { Event } from '../types';
import { SeatMap } from '../components/events/SeatMap';
import { GeneralAdmissionSelector } from '../components/events/GeneralAdmissionSelector';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { parseSafeId, DEFAULT_EVENT_IMAGE, isSafeImageUrl } from '../utils/security';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from 'notistack';
import { getErrorMessage } from '../api/client';

export const EventDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const eventId = parseSafeId(id);

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selection states
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [generalAdmissionQty, setGeneralAdmissionQty] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);

  const { user, isAuthenticated, openAuthModal } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();

  const isOrganizer = user?.role === 'ORGANIZER';
  const isPorter = user?.role === 'PORTER';
  const canPurchase = !isAuthenticated || user?.role === 'CLIENT';

  useEffect(() => {
    if (eventId) {
      loadEventDetails();
    } else {
      setError('ID de evento inválido.');
      setLoading(false);
    }
  }, [eventId]);

  const loadEventDetails = async () => {
    if (!eventId) return;
    setLoading(true);
    setError(null);
    try {
      let previousSeats: string[] = [];
      let previousQty: number | null = null;

      // Verifica se veio seleção prévia via navigation state
      const stateSeats = (location.state as any)?.selectedSeats;
      const stateQty = (location.state as any)?.quantity;
      if (stateSeats && Array.isArray(stateSeats) && stateSeats.length > 0) {
        previousSeats = stateSeats;
      }
      if (typeof stateQty === 'number') {
        previousQty = stateQty;
      }

      // Se o cliente logado possui reservas pendentes abandonadas para este evento, cancela para liberar os assentos
      if (isAuthenticated && user?.role === 'CLIENT') {
        try {
          const myReservations = await reservationsApi.getMyReservations();
          const pendingForEvent = myReservations.filter(
            (r) => r.eventId === eventId && r.status === 'PENDING_PAYMENT'
          );
          for (const pendingRes of pendingForEvent) {
            if (previousSeats.length === 0 && pendingRes.seatNumbers && pendingRes.seatNumbers.length > 0) {
              previousSeats = pendingRes.seatNumbers;
            }
            if (previousQty === null && pendingRes.quantity) {
              previousQty = pendingRes.quantity;
            }
            await reservationsApi.cancelReservation(pendingRes.id);
          }
        } catch (cleanupErr) {
          console.warn('Falha silenciosa ao liberar reserva pendente anterior:', cleanupErr);
        }
      }

      const data = await eventsApi.getEventById(eventId);
      setEvent(data);

      // Restaura seleção anterior para que o usuário possa editar livremente
      if (previousSeats.length > 0) {
        setSelectedSeats(previousSeats);
      }
      if (previousQty !== null && previousQty > 0) {
        setGeneralAdmissionQty(previousQty);
      }
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err, 'Erro ao carregar detalhes do evento.'));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSeat = (seatNumber: string) => {
    setSelectedSeats((prev) =>
      prev.includes(seatNumber) ? prev.filter((s) => s !== seatNumber) : [...prev, seatNumber]
    );
  };

  const isSeated = event?.seatingType === 'SEATED';
  const ticketCount = isSeated ? selectedSeats.length : generalAdmissionQty;
  const basePrice = event?.price || 0;
  const subtotal = ticketCount * basePrice;
  const serviceFee = ticketCount > 0 ? Math.round(subtotal * 0.1 * 100) / 100 : 0;
  const totalAmount = subtotal + serviceFee;

  const handleCreateReservation = async () => {
    if (!eventId || !event) return;

    if (!isAuthenticated) {
      enqueueSnackbar('Por favor, faça login ou crie sua conta para prosseguir com a reserva.', { variant: 'info' });
      openAuthModal(0);
      return;
    }

    if (!canPurchase) {
      enqueueSnackbar(
        isOrganizer
          ? 'Contas de Organizador não podem realizar compras de ingressos.'
          : 'Contas de Portaria não podem realizar compras de ingressos.',
        { variant: 'warning' }
      );
      return;
    }

    if (ticketCount === 0) {
      enqueueSnackbar(
        isSeated
          ? 'Selecione pelo menos um assento no mapa para continuar.'
          : 'Selecione a quantidade de ingressos.',
        { variant: 'warning' }
      );
      return;
    }

    setSubmitting(true);
    try {
      const payload = isSeated
        ? { eventId, seatNumbers: selectedSeats }
        : { eventId, quantity: generalAdmissionQty };

      const reservation = await reservationsApi.createReservation(payload);
      enqueueSnackbar('Reserva iniciada com sucesso! Você tem 10 minutos para concluir.', {
        variant: 'success',
      });
      navigate(`/checkout/${reservation.id}`);
    } catch (err) {
      enqueueSnackbar(getErrorMessage(err, 'Não foi possível reservar os lugares. Tente outros assentos.'), {
        variant: 'error',
      });
      loadEventDetails();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Carregando mapa e informações do evento..." />;
  }

  if (error || !event) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Evento não encontrado.'}
        </Alert>
        <Button startIcon={<ChevronLeft size={18} />} onClick={() => navigate('/')}>
          Voltar para o catálogo
        </Button>
      </Container>
    );
  }

  const safeImage = isSafeImageUrl(event.imageUrl) ? event.imageUrl : DEFAULT_EVENT_IMAGE;

  return (
    <Box sx={{ pb: 10 }}>
      {/* Hero Banner */}
      <Box
        sx={{
          position: 'relative',
          minHeight: { xs: 380, md: 460 },
          backgroundImage: `url(${safeImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 30%',
          display: 'flex',
          alignItems: 'flex-end',
          pt: 4,
          pb: 6,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(11, 15, 25, 0.4) 0%, rgba(11, 15, 25, 0.8) 70%, #0B0F19 100%)',
          }}
        />

        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
          <Button
            startIcon={<ChevronLeft size={18} />}
            onClick={() => navigate('/')}
            sx={{
              color: '#94A3B8',
              mb: 3,
              backgroundColor: 'rgba(11, 15, 25, 0.6)',
              backdropFilter: 'blur(8px)',
              '&:hover': { color: '#FFFFFF', backgroundColor: 'rgba(11, 15, 25, 0.9)' },
            }}
          >
            Voltar para o catálogo
          </Button>

          <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
            <Chip
              label={`${event.category || event.type} • IMAX`}
              size="small"
              sx={{
                backgroundColor: 'rgba(0, 210, 255, 0.2)',
                color: '#00D2FF',
                border: '1px solid rgba(0, 210, 255, 0.4)',
                fontWeight: 800,
                fontSize: '0.7rem',
                letterSpacing: '0.05em',
              }}
            />
            <Chip
              label="CLASSIFICAÇÃO: 14+"
              size="small"
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#CBD5E1',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                fontWeight: 700,
                fontSize: '0.7rem',
              }}
            />
          </Stack>

          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              color: '#FFFFFF',
              fontSize: { xs: '2rem', sm: '3rem', md: '3.6rem' },
              lineHeight: 1.1,
              maxWidth: 900,
              mb: 2.5,
            }}
          >
            {event.title}
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 1.5, sm: 4 }}
            sx={{ color: '#E2E8F0', fontSize: '0.9rem' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Calendar size={18} color="#00D2FF" />
              <Box>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontWeight: 700 }}>
                  DATA
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatDateTime(event.eventDate, { longMonth: true, showYear: true })}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Clock size={18} color="#8B5CF6" />
              <Box>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontWeight: 700 }}>
                  HORÁRIO
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  20:30 (Duração: 145 min)
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MapPin size={18} color="#10B981" />
              <Box>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontWeight: 700 }}>
                  LOCAL
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {event.location}
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} lg={8}>
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  color: '#FFFFFF',
                  mb: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Box sx={{ width: 4, height: 20, backgroundColor: '#00D2FF', borderRadius: 1 }} />
                Sinopse & Detalhes
              </Typography>
              <Typography variant="body1" sx={{ color: '#94A3B8', lineHeight: 1.7, fontSize: '0.95rem' }}>
                {event.description ||
                  'Uma experiência cinematográfica e sonora inesquecível em ambiente imersivo, com tecnologia de ponta e assentos de alto conforto.'}
              </Typography>
            </Box>

            {isSeated ? (
              <Box>
                <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      backgroundColor: 'rgba(0, 210, 255, 0.15)',
                      color: '#00D2FF',
                      display: 'flex',
                    }}
                  >
                    <Armchair size={20} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2 }}>
                      Escolha seus Assentos
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                      Selecione as poltronas desejadas no mapa interativo abaixo
                    </Typography>
                  </Box>
                </Box>

                <SeatMap
                  seats={event.seats}
                  selectedSeats={selectedSeats}
                  onToggleSeat={handleToggleSeat}
                  rows={event.seatRows || 4}
                  columns={event.seatColumns || 12}
                  disabled={submitting}
                />
              </Box>
            ) : (
              <Box>
                <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      backgroundColor: 'rgba(139, 92, 246, 0.15)',
                      color: '#8B5CF6',
                      display: 'flex',
                    }}
                  >
                    <Users size={20} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2 }}>
                      Seleção de Ingressos (Pista)
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                      Evento de pista livre — Escolha a quantidade de ingressos desejada
                    </Typography>
                  </Box>
                </Box>

                <GeneralAdmissionSelector
                  quantity={generalAdmissionQty}
                  onQuantityChange={setGeneralAdmissionQty}
                  pricePerTicket={event.price}
                  availableCapacity={event.availableCapacity || event.totalCapacity}
                  totalCapacity={event.totalCapacity}
                  disabled={submitting}
                />
              </Box>
            )}
          </Grid>

          <Grid item xs={12} lg={4}>
            <Box sx={{ position: { lg: 'sticky' }, top: { lg: 100 } }}>
              <Paper
                sx={{
                  backgroundColor: '#121927',
                  border: '1px solid #1E293B',
                  borderRadius: 4,
                  p: 3.5,
                  boxShadow: '0 16px 40px rgba(0, 0, 0, 0.5)',
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF', mb: 3 }}>
                  Resumo da Reserva
                </Typography>

                <Stack spacing={2} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#F8FAFC' }}>
                        {ticketCount}x {isSeated ? 'Assentos' : 'Ingressos Pista'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                        {isSeated && selectedSeats.length > 0
                          ? `Poltronas: (${selectedSeats.join(', ')})`
                          : 'Entrada individual'}
                      </Typography>
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
                      {formatCurrency(subtotal)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                        Taxa de Serviço (10%)
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>
                        Processamento e emissão
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#94A3B8' }}>
                      {formatCurrency(serviceFee)}
                    </Typography>
                  </Box>
                </Stack>

                <Divider sx={{ borderColor: '#1E293B', my: 2.5 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 3 }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, letterSpacing: '0.05em' }}>
                      TOTAL A PAGAR
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#FFFFFF', lineHeight: 1.1 }}>
                      {formatCurrency(totalAmount)}
                    </Typography>
                  </Box>
                </Box>

                {!canPurchase && (
                  <Alert
                    severity="warning"
                    sx={{
                      mb: 2.5,
                      backgroundColor: 'rgba(245, 158, 11, 0.1)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      color: '#FBBF24',
                      fontSize: '0.8rem',
                      lineHeight: 1.4,
                      '& .MuiAlert-icon': {
                        color: '#FBBF24',
                      },
                    }}
                  >
                    {isOrganizer
                      ? 'Você está conectado como Organizador. Apenas contas do tipo Cliente podem comprar ingressos.'
                      : 'Você está conectado como Portaria. Apenas contas do tipo Cliente podem comprar ingressos.'}
                  </Alert>
                )}

                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={!canPurchase || ticketCount === 0 || submitting}
                  onClick={handleCreateReservation}
                  endIcon={
                    submitting ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : !canPurchase ? (
                      <Lock size={18} />
                    ) : (
                      <ArrowRight size={20} />
                    )
                  }
                  sx={{
                    py: 1.75,
                    fontSize: '1rem',
                    background: canPurchase
                      ? 'linear-gradient(135deg, #00D2FF 0%, #8B5CF6 100%)'
                      : '#1E293B',
                    color: canPurchase ? '#FFFFFF' : '#64748B',
                    boxShadow: canPurchase ? '0 6px 20px rgba(0, 210, 255, 0.35)' : 'none',
                    '&:hover': {
                      background: canPurchase
                        ? 'linear-gradient(135deg, #00C0EB 0%, #7C3AED 100%)'
                        : '#1E293B',
                    },
                    '&.Mui-disabled': {
                      backgroundColor: '#1E293B',
                      color: '#64748B',
                    },
                  }}
                >
                  {submitting
                    ? 'Iniciando Reserva...'
                    : !canPurchase
                    ? isOrganizer
                      ? 'Indisponível para Organizador'
                      : 'Indisponível para Portaria'
                    : 'Continuar para Reserva'}
                </Button>

                <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" sx={{ mt: 2 }}>
                  <ShieldCheck size={16} color="#10B981" />
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500 }}>
                    Pagamento 100% Seguro & Encriptado
                  </Typography>
                </Stack>
              </Paper>

              <Paper
                sx={{
                  mt: 2.5,
                  p: 2.5,
                  borderRadius: 3.5,
                  backgroundColor: '#0F172A',
                  border: '1px solid #1E293B',
                  display: 'flex',
                  gap: 2,
                  alignItems: 'flex-start',
                }}
              >
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2.5,
                    backgroundColor: 'rgba(0, 210, 255, 0.15)',
                    color: '#00D2FF',
                  }}
                >
                  <Zap size={20} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#FFFFFF', mb: 0.25 }}>
                    Ingresso Digital Imediato
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94A3B8', lineHeight: 1.4, display: 'block' }}>
                    Após a confirmação do pagamento, seu ingresso com QR Code criptografado fica disponível instantaneamente na sua carteira.
                  </Typography>
                </Box>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};
