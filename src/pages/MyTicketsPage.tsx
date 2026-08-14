import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Stack,
  CardMedia,
  Alert,
  LinearProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Ticket as TicketIcon,
  CheckCircle2,
  Settings,
  CreditCard,
  Crown,
  ChevronRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { ticketsApi } from '../api/tickets';
import { Ticket } from '../types';
import { DigitalTicketCard } from '../components/tickets/DigitalTicketCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { formatDateTime } from '../utils/formatters';
import { DEFAULT_EVENT_IMAGE, isSafeImageUrl } from '../utils/security';
import { useAuth } from '../context/AuthContext';

export const MyTicketsPage: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');
  const [selectedTicketIndex, setSelectedTicketIndex] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const { user, quickLogin } = useAuth();
  const navigate = useNavigate();

  const isClient = !user || user.role === 'CLIENT';

  useEffect(() => {
    if (isClient) {
      loadTickets();
    } else {
      setLoading(false);
    }
  }, [user?.role]);

  const loadTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ticketsApi.getMyTickets();
      setTickets(data);
    } catch (err) {
      console.error(err);
      setError('Não foi possível carregar seus ingressos. Verifique se o backend está ativo.');
    } finally {
      setLoading(false);
    }
  };

  const activeTickets = tickets.filter((t) => !t.validated);
  const historyTickets = tickets.filter((t) => t.validated);
  const displayedTickets = activeFilter === 'ACTIVE' ? activeTickets : historyTickets;

  const currentSelectedTicket = displayedTickets[selectedTicketIndex] || displayedTickets[0];

  if (user && user.role !== 'CLIENT') {
    const isOrganizer = user.role === 'ORGANIZER';
    return (
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 }, pb: 10 }}>
        <Paper
          sx={{
            p: { xs: 3, sm: 5 },
            textAlign: 'center',
            backgroundColor: '#121927',
            border: '1px solid #1E293B',
            borderRadius: 4,
            boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: 3,
              backgroundColor: isOrganizer ? 'rgba(139, 92, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              color: isOrganizer ? '#8B5CF6' : '#10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2.5,
            }}
          >
            {isOrganizer ? <Crown size={32} /> : <ShieldCheck size={32} />}
          </Box>

          <Typography variant="h4" sx={{ fontWeight: 800, color: '#FFFFFF', mb: 1 }}>
            Conectado como {isOrganizer ? 'Organizador' : 'Portaria'}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: '#94A3B8',
              maxWidth: 540,
              mx: 'auto',
              mb: 4,
              fontSize: '0.95rem',
              lineHeight: 1.6,
            }}
          >
            A <strong>Carteira de Ingressos</strong> é destinada a contas de <strong>Clientes</strong> que realizam compras.
            {isOrganizer
              ? ' Como produtor de eventos, gerencie suas vendas, ingressos e equipe no Painel do Produtor.'
              : ' Como equipe de portaria, realize a conferência e validação de ingressos no Painel de Portaria.'}
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button
              variant="contained"
              onClick={() => navigate(isOrganizer ? '/organizer' : '/portaria')}
              sx={{
                background: isOrganizer
                  ? 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)'
                  : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: '#FFFFFF',
                fontWeight: 700,
                px: 3,
                py: 1.25,
              }}
            >
              {isOrganizer ? 'Acessar Painel do Produtor' : 'Acessar Portaria & Check-in'}
            </Button>

            <Button
              variant="outlined"
              onClick={async () => {
                await quickLogin('CLIENT_1');
                navigate('/my-tickets');
              }}
              startIcon={<Sparkles size={18} />}
              sx={{
                borderColor: '#00D2FF',
                color: '#00D2FF',
                fontWeight: 700,
                px: 3,
                py: 1.25,
                '&:hover': {
                  borderColor: '#00D2FF',
                  backgroundColor: 'rgba(0, 210, 255, 0.1)',
                },
              }}
            >
              🧪 Alternar para Perfil de Cliente
            </Button>
          </Stack>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 }, pb: 10 }}>
      {/* Header with Title & Filter Buttons */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            Sua Carteira Digital
          </Typography>
          <Typography variant="body1" sx={{ color: '#94A3B8', mt: 0.5 }}>
            {activeFilter === 'ACTIVE' ? (
              <>
                Você tem <strong style={{ color: '#00D2FF' }}>{activeTickets.length} ingressos ativos</strong> para os próximos eventos.
              </>
            ) : (
              <>
                Você tem <strong style={{ color: '#00D2FF' }}>{historyTickets.length} ingressos utilizados</strong> em eventos anteriores.
              </>
            )}
          </Typography>
        </Box>

        {/* Ativos vs Histórico Buttons */}
        <Stack direction="row" spacing={1} sx={{ backgroundColor: '#0F172A', p: 0.5, borderRadius: 3, border: '1px solid #1E293B' }}>
          <Button
            size="small"
            onClick={() => {
              setActiveFilter('ACTIVE');
              setSelectedTicketIndex(0);
            }}
            sx={{
              px: 2.5,
              borderRadius: 2.5,
              fontWeight: 700,
              backgroundColor: activeFilter === 'ACTIVE' ? '#1E293B' : 'transparent',
              color: activeFilter === 'ACTIVE' ? '#00D2FF' : '#94A3B8',
              '&:hover': { backgroundColor: '#1E293B' },
            }}
          >
            ATIVOS ({activeTickets.length})
          </Button>

          <Button
            size="small"
            onClick={() => {
              setActiveFilter('HISTORY');
              setSelectedTicketIndex(0);
            }}
            sx={{
              px: 2.5,
              borderRadius: 2.5,
              fontWeight: 700,
              backgroundColor: activeFilter === 'HISTORY' ? '#1E293B' : 'transparent',
              color: activeFilter === 'HISTORY' ? '#00D2FF' : '#94A3B8',
              '&:hover': { backgroundColor: '#1E293B' },
            }}
          >
            HISTÓRICO ({historyTickets.length})
          </Button>
        </Stack>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 4, backgroundColor: '#1A1829', color: '#FBBF24' }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <LoadingSpinner message="Carregando seus ingressos criptografados..." />
      ) : displayedTickets.length === 0 ? (
        <Paper
          sx={{
            py: 8,
            px: 3,
            textAlign: 'center',
            backgroundColor: '#121927',
            border: '1px dashed #1E293B',
            borderRadius: 4,
          }}
        >
          <TicketIcon size={52} color="#64748B" style={{ marginBottom: 16 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#FFFFFF', mb: 1 }}>
            {activeFilter === 'ACTIVE' ? 'Nenhum ingresso ativo no momento' : 'Nenhum histórico de ingressos'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8', maxWidth: 460, mx: 'auto', mb: 3 }}>
            {activeFilter === 'ACTIVE'
              ? 'Explore nossa vitrine de eventos e garanta seus lugares nos melhores shows, cinemas e festivais!'
              : 'Seus ingressos utilizados em eventos anteriores aparecerão arquivados aqui.'}
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/')}
            sx={{
              background: 'linear-gradient(135deg, #00D2FF 0%, #8B5CF6 100%)',
              fontWeight: 700,
              px: 4,
              py: 1.25,
            }}
          >
            Explorar Eventos Disponíveis
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={4}>
          <Grid item xs={12} lg={8}>
            {currentSelectedTicket && (
              <DigitalTicketCard
                ticket={currentSelectedTicket}
              />
            )}
          </Grid>

          <Grid item xs={12} lg={4}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, letterSpacing: '0.08em', mb: 2, display: 'block' }}>
                {activeFilter === 'ACTIVE' ? 'PRÓXIMOS EVENTOS' : 'EVENTOS ANTERIORES'} ({displayedTickets.length})
              </Typography>

              <Stack spacing={1.5}>
                {displayedTickets.map((t, idx) => {
                  const isSelected = idx === selectedTicketIndex;
                  const safeImg = isSafeImageUrl(t.imageUrl) ? t.imageUrl : DEFAULT_EVENT_IMAGE;

                  return (
                    <Paper
                      key={t.id}
                      onClick={() => setSelectedTicketIndex(idx)}
                      sx={{
                        p: 1.5,
                        borderRadius: 3,
                        backgroundColor: isSelected ? '#162032' : '#0F172A',
                        border: `1.5px solid ${isSelected ? '#00D2FF' : '#1E293B'}`,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        transition: 'all 0.2s ease',
                        '&:hover': { borderColor: '#00D2FF' },
                      }}
                    >
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          overflow: 'hidden',
                          flexShrink: 0,
                        }}
                      >
                        <CardMedia
                          component="img"
                          image={safeImg}
                          alt={t.eventTitle}
                          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </Box>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 700,
                            color: '#FFFFFF',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {t.eventTitle}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>
                          {formatDateTime(t.eventDate)} • {t.seatNumber ? `Poltrona ${t.seatNumber}` : 'Pista'}
                        </Typography>
                      </Box>

                      {isSelected ? (
                        <CheckCircle2 size={18} color="#00D2FF" />
                      ) : (
                        <ChevronRight size={18} color="#64748B" />
                      )}
                    </Paper>
                  );
                })}
              </Stack>
            </Box>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6}>
                <Paper
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    backgroundColor: '#0F172A',
                    border: '1px solid #1E293B',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1,
                    cursor: 'pointer',
                    '&:hover': { borderColor: '#334155' },
                  }}
                >
                  <Settings size={20} color="#94A3B8" />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
                    AJUSTES
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={6}>
                <Paper
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    backgroundColor: '#0F172A',
                    border: '1px solid #1E293B',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1,
                    cursor: 'pointer',
                    '&:hover': { borderColor: '#334155' },
                  }}
                >
                  <CreditCard size={20} color="#94A3B8" />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
                    CARTÕES
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            <Paper
              sx={{
                p: 3,
                borderRadius: 4,
                backgroundColor: '#121927',
                border: '1px solid #1E293B',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    backgroundColor:
                      activeFilter === 'ACTIVE'
                        ? 'rgba(0, 210, 255, 0.15)'
                        : 'rgba(16, 185, 129, 0.15)',
                    color: activeFilter === 'ACTIVE' ? '#00D2FF' : '#10B981',
                    display: 'flex',
                  }}
                >
                  {activeFilter === 'ACTIVE' ? <TicketIcon size={20} /> : <CheckCircle2 size={20} />}
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#FFFFFF' }}>
                  {activeFilter === 'ACTIVE' ? 'Acesso Direto na Portaria' : 'Ingresso Utilizado & Arquivado'}
                </Typography>
              </Stack>

              <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: '0.85rem', lineHeight: 1.5 }}>
                {activeFilter === 'ACTIVE'
                  ? 'Apresente o QR Code do seu ingresso na tela do celular na entrada do evento para validação imediata e segura.'
                  : 'Este ingresso já foi validado na portaria e consta arquivado no histórico da sua conta como utilizado.'}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};
