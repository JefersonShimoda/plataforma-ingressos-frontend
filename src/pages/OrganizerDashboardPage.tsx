import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Stack,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  TextField,
  InputAdornment,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tooltip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Ticket as TicketIcon,
  DollarSign,
  Search,
  Ban,
  BarChart3,
  Calendar,
  Lightbulb,
  Shield,
  MapPin,
} from 'lucide-react';
import { eventsApi } from '../api/events';
import { Event, DailySales } from '../types';
import { AssignPortersDialog } from '../components/organizer/AssignPortersDialog';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { DEFAULT_EVENT_IMAGE, isSafeImageUrl } from '../utils/security';
import { useSnackbar } from 'notistack';
import { getErrorMessage } from '../api/client';

export const OrganizerDashboardPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [salesTrend, setSalesTrend] = useState<DailySales[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [selectedEventForPorters, setSelectedEventForPorters] = useState<Event | null>(null);
  const [portersDialogOpen, setPortersDialogOpen] = useState(false);

  const [eventToCancel, setEventToCancel] = useState<Event | null>(null);
  const [canceling, setCanceling] = useState(false);

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    loadMyEvents();
  }, []);

  const loadMyEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const [eventsData, trendData] = await Promise.all([
        eventsApi.getMyEvents(),
        eventsApi.getMySalesTrend().catch(() => []),
      ]);
      setEvents(eventsData);
      setSalesTrend(trendData || []);
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar lista de eventos do produtor.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPorters = (event: Event) => {
    setSelectedEventForPorters(event);
    setPortersDialogOpen(true);
  };

  const handleConfirmCancelEvent = async () => {
    if (!eventToCancel) return;
    setCanceling(true);
    try {
      await eventsApi.deleteEvent(eventToCancel.id);
      enqueueSnackbar('Evento cancelado com sucesso.', { variant: 'success' });
      setEventToCancel(null);
      loadMyEvents();
    } catch (err) {
      enqueueSnackbar(getErrorMessage(err, 'Não foi possível cancelar o evento.'), { variant: 'error' });
    } finally {
      setCanceling(false);
    }
  };

  const filteredEvents = events.filter((e) =>
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalEventsCount = events.length;
  const totalCapacitySum = events.reduce((acc, e) => acc + (e.totalCapacity || 100), 0);
  const availableSum = events.reduce((acc, e) => acc + (e.availableCapacity ?? e.totalCapacity ?? 100), 0);
  const soldSum = Math.max(0, totalCapacitySum - availableSum);
  const estimatedRevenue = events.reduce((acc, e) => {
    const sold = (e.totalCapacity || 100) - (e.availableCapacity ?? e.totalCapacity ?? 100);
    return acc + Math.max(0, sold) * (e.price || 0);
  }, 0);

  // 7-day sales trend processing
  const effectiveTrend: DailySales[] = useMemo(() => {
    if (salesTrend && salesTrend.length === 7) return salesTrend;
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const result: DailySales[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dayName = days[d.getDay()];
      const dateStr = d.toISOString().split('T')[0];
      const found = salesTrend?.find((st) => st.date === dateStr);
      result.push(
        found || {
          date: dateStr,
          dayOfWeek: dayName,
          ticketsSold: 0,
          revenue: 0,
        }
      );
    }
    return result;
  }, [salesTrend]);

  const totalWeeklySold = useMemo(
    () => effectiveTrend.reduce((acc, d) => acc + (Number(d.ticketsSold) || 0), 0),
    [effectiveTrend]
  );
  const totalWeeklyRevenue = useMemo(
    () => effectiveTrend.reduce((acc, d) => acc + (Number(d.revenue) || 0), 0),
    [effectiveTrend]
  );
  const maxWeeklySold = useMemo(
    () => Math.max(...effectiveTrend.map((d) => Number(d.ticketsSold) || 0), 0),
    [effectiveTrend]
  );

  const chartPoints = useMemo(() => {
    return effectiveTrend.map((d, i) => {
      const x = 30 + (i / 6) * 540;
      const y = maxWeeklySold > 0 ? 130 - (Number(d.ticketsSold) / maxWeeklySold) * 85 : 130;
      return { x, y, data: d };
    });
  }, [effectiveTrend, maxWeeklySold]);

  const { linePath, areaPath } = useMemo(() => {
    if (chartPoints.length === 0) return { linePath: '', areaPath: '' };
    let d = `M ${chartPoints[0].x},${chartPoints[0].y}`;
    for (let i = 0; i < chartPoints.length - 1; i++) {
      const p0 = chartPoints[i === 0 ? 0 : i - 1];
      const p1 = chartPoints[i];
      const p2 = chartPoints[i + 1];
      const p3 = chartPoints[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.x.toFixed(1)}`;
    }
    const area = `${d} L ${chartPoints[chartPoints.length - 1].x},150 L ${chartPoints[0].x},150 Z`;
    return { linePath: d, areaPath: area };
  }, [chartPoints]);

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 }, pb: 10 }}>
      {/* Header */}
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
            Dashboard do Organizador
          </Typography>
          <Typography variant="body1" sx={{ color: '#94A3B8', mt: 0.5 }}>
            Bem-vindo de volta! Gerencie suas vendas, eventos e equipe de portaria em tempo real.
          </Typography>
        </Box>

        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/organizer/events/new')}
          startIcon={<Plus size={20} />}
          sx={{
            px: 3,
            py: 1.25,
            background: 'linear-gradient(135deg, #00D2FF 0%, #8B5CF6 100%)',
            boxShadow: '0 6px 20px rgba(0, 210, 255, 0.35)',
            fontWeight: 800,
          }}
        >
          Criar Novo Evento
        </Button>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 4, backgroundColor: '#1A1829', color: '#FBBF24' }}>
          {error}
        </Alert>
      )}

      {/* Metrics Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 4,
              backgroundColor: '#121927',
              border: '1px solid #1E293B',
              boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box
                sx={{
                  p: 1.25,
                  borderRadius: 2.5,
                  backgroundColor: 'rgba(0, 210, 255, 0.15)',
                  color: '#00D2FF',
                }}
              >
                <Calendar size={22} />
              </Box>
              <Chip
                label={`${events.filter((e) => e.status !== 'CANCELLED').length} Ativos`}
                size="small"
                sx={{
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: '#34D399',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>
              Total de Eventos Criados
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#FFFFFF', mt: 0.5 }}>
              {totalEventsCount}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 4,
              backgroundColor: '#121927',
              border: '1px solid #1E293B',
              boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box
                sx={{
                  p: 1.25,
                  borderRadius: 2.5,
                  backgroundColor: 'rgba(139, 92, 246, 0.15)',
                  color: '#8B5CF6',
                }}
              >
                <TicketIcon size={22} />
              </Box>
              <Chip
                label={totalWeeklySold > 0 ? `+${totalWeeklySold} 7d` : 'Geral'}
                size="small"
                sx={{
                  backgroundColor: totalWeeklySold > 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(148, 163, 184, 0.1)',
                  color: totalWeeklySold > 0 ? '#34D399' : '#94A3B8',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>
              Ingressos Vendidos
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#FFFFFF', mt: 0.5 }}>
              {soldSum.toLocaleString('pt-BR')}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 4,
              backgroundColor: '#121927',
              border: '1px solid #1E293B',
              boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box
                sx={{
                  p: 1.25,
                  borderRadius: 2.5,
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: '#10B981',
                }}
              >
                <DollarSign size={22} />
              </Box>
              <Chip
                label={totalWeeklyRevenue > 0 ? `+${formatCurrency(totalWeeklyRevenue)} 7d` : 'Geral'}
                size="small"
                sx={{
                  backgroundColor: totalWeeklyRevenue > 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(148, 163, 184, 0.1)',
                  color: totalWeeklyRevenue > 0 ? '#34D399' : '#94A3B8',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>
              Receita Total Estimada
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#00D2FF', mt: 0.5 }}>
              {formatCurrency(estimatedRevenue)}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Middle Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <Paper
            sx={{
              p: 3.5,
              borderRadius: 4,
              backgroundColor: '#121927',
              border: '1px solid #1E293B',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
                Tendência de Vendas (Últimos 7 dias)
              </Typography>
              <Chip
                label={
                  totalWeeklySold > 0
                    ? `${totalWeeklySold} ${totalWeeklySold === 1 ? 'ingresso vendido' : 'ingressos vendidos'} (7d)`
                    : '0 vendas nos últimos 7 dias'
                }
                size="small"
                sx={{
                  backgroundColor: totalWeeklySold > 0 ? 'rgba(0, 210, 255, 0.15)' : '#0F172A',
                  color: totalWeeklySold > 0 ? '#00D2FF' : '#94A3B8',
                  border: `1px solid ${totalWeeklySold > 0 ? 'rgba(0, 210, 255, 0.3)' : '#1E293B'}`,
                  fontWeight: 700,
                }}
              />
            </Box>

            <Box sx={{ position: 'relative', width: '100%', height: 180, my: 2 }}>
              <svg viewBox="0 0 600 160" width="100%" height="100%" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(0, 210, 255, 0.35)" />
                    <stop offset="100%" stopColor="rgba(0, 210, 255, 0.0)" />
                  </linearGradient>
                </defs>

                {/* Reference guideline */}
                <line x1="30" y1="130" x2="570" y2="130" stroke="#1E293B" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="30" y1="45" x2="570" y2="45" stroke="#1E293B" strokeWidth="1" strokeDasharray="4 4" />

                {/* Shaded Area and Line */}
                <path d={areaPath} fill="url(#chartGrad)" />
                <path
                  d={linePath}
                  fill="none"
                  stroke="#00D2FF"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Data Points */}
                {chartPoints.map((pt, idx) => {
                  const hasSales = pt.data.ticketsSold > 0;
                  return (
                    <g key={idx}>
                      {hasSales && (
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="10"
                          fill="rgba(0, 210, 255, 0.25)"
                        />
                      )}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={hasSales ? 5 : 3.5}
                        fill={hasSales ? '#00D2FF' : '#475569'}
                        stroke={hasSales ? '#FFFFFF' : '#1E293B'}
                        strokeWidth={hasSales ? 2 : 1}
                      />
                    </g>
                  );
                })}
              </svg>
            </Box>

            <Stack direction="row" justifyContent="space-between" sx={{ color: '#64748B', px: 1 }}>
              {chartPoints.map((pt, idx) => (
                <Tooltip
                  key={idx}
                  title={
                    <Box sx={{ p: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#FFFFFF', display: 'block' }}>
                        {pt.data.dayOfWeek} ({pt.data.date})
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#00D2FF', fontWeight: 700, display: 'block' }}>
                        {pt.data.ticketsSold} {pt.data.ticketsSold === 1 ? 'ingresso' : 'ingressos'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#34D399', fontWeight: 600, display: 'block' }}>
                        Receita: {formatCurrency(pt.data.revenue)}
                      </Typography>
                    </Box>
                  }
                  arrow
                  placement="top"
                >
                  <Box sx={{ textAlign: 'center', cursor: 'pointer', flex: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: pt.data.ticketsSold > 0 ? 800 : 600,
                        color: pt.data.ticketsSold > 0 ? '#00D2FF' : '#94A3B8',
                        display: 'block',
                      }}
                    >
                      {pt.data.dayOfWeek}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: pt.data.ticketsSold > 0 ? '#34D399' : '#475569',
                      }}
                    >
                      {pt.data.ticketsSold}
                    </Typography>
                  </Box>
                </Tooltip>
              ))}
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper
            sx={{
              p: 3.5,
              borderRadius: 4,
              backgroundColor: '#121927',
              border: '1px solid #1E293B',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#FFFFFF', mb: 3 }}>
                Ocupação Média dos Eventos
              </Typography>

              <Stack spacing={2.5} sx={{ mb: 3 }}>
                {events.slice(0, 3).map((ev) => {
                  const total = ev.totalCapacity || 100;
                  const avail = ev.availableCapacity ?? total;
                  const sold = Math.max(0, total - avail);
                  const pct = Math.min(100, Math.round((sold / total) * 100));

                  return (
                    <Box key={ev.id}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 700,
                            color: '#FFFFFF',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: 180,
                          }}
                        >
                          {ev.title}
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#00D2FF' }}>
                          {pct}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: '#1E293B',
                          '& .MuiLinearProgress-bar': {
                            background: 'linear-gradient(90deg, #00D2FF 0%, #8B5CF6 100%)',
                          },
                        }}
                      />
                    </Box>
                  );
                })}
              </Stack>
            </Box>

            <Paper
              sx={{
                p: 2,
                borderRadius: 3,
                backgroundColor: '#0F172A',
                border: '1px solid #1E293B',
                display: 'flex',
                gap: 1.5,
                alignItems: 'flex-start',
              }}
            >
              <Lightbulb size={20} color="#00D2FF" style={{ flexShrink: 0, marginTop: 2 }} />
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#FFFFFF', display: 'block' }}>
                  Dica de Gestão:
                </Typography>
                <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.75rem', lineHeight: 1.4 }}>
                  Acompanhe suas métricas de vendas e escale sua equipe na ferramenta de portaria para validação ágil na entrada.
                </Typography>
              </Box>
            </Paper>
          </Paper>
        </Grid>
      </Grid>

      {/* Events Table Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#FFFFFF' }}>
          Meus Eventos Publicados
        </Typography>

        <TextField
          size="small"
          placeholder="Filtrar eventos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={16} color="#64748B" />
              </InputAdornment>
            ),
          }}
          sx={{ width: { xs: '100%', sm: 260 } }}
        />
      </Box>

      {/* Table */}
      {loading ? (
        <LoadingSpinner message="Carregando seus eventos..." />
      ) : filteredEvents.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', backgroundColor: '#121927', border: '1px dashed #1E293B', borderRadius: 4 }}>
          <Typography variant="subtitle1" sx={{ color: '#94A3B8', mb: 2 }}>
            Nenhum evento encontrado no seu catálogo.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/organizer/events/new')}>
            Criar Primeiro Evento
          </Button>
        </Paper>
      ) : (
        <>
          {/* Mobile View: Responsive Cards (< md) */}
          <Stack spacing={2} sx={{ display: { xs: 'flex', md: 'none' } }}>
            {filteredEvents.map((ev) => {
              const total = ev.totalCapacity || 100;
              const avail = ev.availableCapacity ?? total;
              const sold = Math.max(0, total - avail);
              const pct = Math.min(100, Math.round((sold / total) * 100));
              const isCancelled = ev.status === 'CANCELLED';
              const safeImg = isSafeImageUrl(ev.imageUrl) ? ev.imageUrl : DEFAULT_EVENT_IMAGE;

              return (
                <Paper
                  key={ev.id}
                  sx={{
                    p: 2.5,
                    borderRadius: 3.5,
                    backgroundColor: '#121927',
                    border: '1px solid #1E293B',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                  }}
                >
                  {/* Top Row: Avatar + Title + Status */}
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', mb: 2 }}>
                    <Avatar
                      src={safeImg}
                      variant="rounded"
                      sx={{ width: 50, height: 50, borderRadius: 2.5, flexShrink: 0 }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, mb: 0.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2 }}>
                          {ev.title}
                        </Typography>
                        <Chip
                          label={isCancelled ? 'CANCELADO' : 'PUBLICADO'}
                          size="small"
                          sx={{
                            height: 22,
                            backgroundColor: isCancelled ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                            color: isCancelled ? '#F87171' : '#34D399',
                            fontWeight: 700,
                            fontSize: '0.65rem',
                            border: `1px solid ${isCancelled ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                            flexShrink: 0,
                          }}
                        />
                      </Box>
                      <Typography variant="caption" sx={{ color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <MapPin size={13} color="#64748B" /> {ev.location}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#E2E8F0', display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25, fontWeight: 600 }}>
                        <Calendar size={13} color="#00D2FF" /> {formatDateTime(ev.eventDate)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Sales Progress Bar */}
                  <Box sx={{ p: 1.5, borderRadius: 2.5, backgroundColor: '#0F172A', border: '1px solid #1E293B', mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>
                        Ingressos Vendidos
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#FFFFFF' }}>
                        {sold.toLocaleString('pt-BR')} / {total.toLocaleString('pt-BR')} ({pct}%)
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={pct}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: '#1E293B',
                        '& .MuiLinearProgress-bar': {
                          background: 'linear-gradient(90deg, #00D2FF 0%, #8B5CF6 100%)',
                        },
                      }}
                    />
                  </Box>

                  {/* Action Buttons */}
                  <Stack direction="row" spacing={1} sx={{ pt: 0.5 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      fullWidth
                      onClick={() => handleOpenPorters(ev)}
                      startIcon={<Shield size={14} />}
                      sx={{
                        borderColor: 'rgba(16, 185, 129, 0.3)',
                        color: '#34D399',
                        backgroundColor: 'rgba(16, 185, 129, 0.08)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        py: 0.75,
                        '&:hover': {
                          borderColor: '#10B981',
                          backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        },
                      }}
                    >
                      Portaria
                    </Button>

                    <Button
                      size="small"
                      variant="outlined"
                      fullWidth
                      onClick={() => navigate(`/portaria?eventId=${ev.id}`)}
                      startIcon={<BarChart3 size={14} />}
                      sx={{
                        borderColor: 'rgba(0, 210, 255, 0.3)',
                        color: '#00D2FF',
                        backgroundColor: 'rgba(0, 210, 255, 0.08)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        py: 0.75,
                        '&:hover': {
                          borderColor: '#00D2FF',
                          backgroundColor: 'rgba(0, 210, 255, 0.15)',
                        },
                      }}
                    >
                      Check-in
                    </Button>

                    {!isCancelled && (
                      <IconButton
                        size="small"
                        onClick={() => setEventToCancel(ev)}
                        title="Cancelar Evento"
                        sx={{
                          backgroundColor: '#0F172A',
                          border: '1px solid #1E293B',
                          color: '#EF4444',
                          flexShrink: 0,
                          '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.15)' },
                        }}
                      >
                        <Ban size={16} />
                      </IconButton>
                    )}
                  </Stack>
                </Paper>
              );
            })}
          </Stack>

          {/* Desktop View: Full Table (>= md) */}
          <TableContainer
            component={Paper}
            sx={{
              display: { xs: 'none', md: 'block' },
              backgroundColor: '#121927',
              border: '1px solid #1E293B',
              borderRadius: 4,
              overflowX: 'auto',
            }}
          >
            <Table>
              <TableHead sx={{ backgroundColor: '#0F172A' }}>
                <TableRow>
                  <TableCell sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.75rem' }}>EVENTO</TableCell>
                  <TableCell sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.75rem' }}>STATUS</TableCell>
                  <TableCell sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.75rem' }}>DATA & HORA</TableCell>
                  <TableCell sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.75rem' }}>INGRESSOS</TableCell>
                  <TableCell align="right" sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.75rem' }}>AÇÕES</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredEvents.map((ev) => {
                  const total = ev.totalCapacity || 100;
                  const avail = ev.availableCapacity ?? total;
                  const sold = Math.max(0, total - avail);
                  const pct = Math.min(100, Math.round((sold / total) * 100));
                  const isCancelled = ev.status === 'CANCELLED';
                  const safeImg = isSafeImageUrl(ev.imageUrl) ? ev.imageUrl : DEFAULT_EVENT_IMAGE;

                  return (
                    <TableRow
                      key={ev.id}
                      sx={{
                        '&:hover': { backgroundColor: '#162032' },
                        borderBottom: '1px solid #1E293B',
                      }}
                    >
                      <TableCell>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar
                            src={safeImg}
                            variant="rounded"
                            sx={{ width: 44, height: 44, borderRadius: 2 }}
                          />
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
                              {ev.title}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                              {ev.location}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={isCancelled ? 'CANCELADO' : 'PUBLICADO'}
                          size="small"
                          sx={{
                            backgroundColor: isCancelled ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                            color: isCancelled ? '#F87171' : '#34D399',
                            fontWeight: 700,
                            fontSize: '0.65rem',
                            border: `1px solid ${isCancelled ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#E2E8F0', fontWeight: 600 }}>
                          {formatDateTime(ev.eventDate)}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
                          {sold.toLocaleString('pt-BR')} / {total.toLocaleString('pt-BR')}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#00D2FF', fontWeight: 600 }}>
                          {pct}% vendido
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenPorters(ev)}
                            title="Escalar Equipe de Portaria"
                            sx={{
                              backgroundColor: '#0F172A',
                              border: '1px solid #1E293B',
                              color: '#10B981',
                              '&:hover': { backgroundColor: 'rgba(16, 185, 129, 0.15)' },
                            }}
                          >
                            <Shield size={16} />
                          </IconButton>

                          <IconButton
                            size="small"
                            onClick={() => navigate(`/portaria?eventId=${ev.id}`)}
                            title="Abrir Portaria & Check-in"
                            sx={{
                              backgroundColor: '#0F172A',
                              border: '1px solid #1E293B',
                              color: '#00D2FF',
                              '&:hover': { backgroundColor: 'rgba(0, 210, 255, 0.15)' },
                            }}
                          >
                            <BarChart3 size={16} />
                          </IconButton>

                          {!isCancelled && (
                            <IconButton
                              size="small"
                              onClick={() => setEventToCancel(ev)}
                              title="Cancelar Evento"
                              sx={{
                                backgroundColor: '#0F172A',
                                border: '1px solid #1E293B',
                                color: '#EF4444',
                                '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.15)' },
                              }}
                            >
                              <Ban size={16} />
                            </IconButton>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      <AssignPortersDialog
        open={portersDialogOpen}
        onClose={() => setPortersDialogOpen(false)}
        event={selectedEventForPorters}
        onSuccess={loadMyEvents}
      />

      <Dialog
        open={Boolean(eventToCancel)}
        onClose={() => setEventToCancel(null)}
        PaperProps={{ sx: { backgroundColor: '#121927', border: '1px solid #1E293B', borderRadius: 3 } }}
      >
        <DialogTitle sx={{ color: '#EF4444', fontWeight: 800 }}>
          Confirmar Cancelamento do Evento
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#94A3B8' }}>
            Tem certeza que deseja cancelar o evento <strong style={{ color: '#FFFFFF' }}>{eventToCancel?.title}</strong>? Essa ação é irreversível e bloqueará a venda de novos ingressos.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEventToCancel(null)} sx={{ color: '#94A3B8' }}>
            Voltar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmCancelEvent}
            disabled={canceling}
          >
            {canceling ? 'Cancelando...' : 'Sim, Cancelar Evento'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
