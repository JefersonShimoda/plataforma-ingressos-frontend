import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Chip,
  Button,
  Stack,
  CardMedia,
  Alert,
  Paper,
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Film,
  Music,
  Drama,
  ArrowRight,
  Sparkles,
  Ticket,
  Armchair,
} from 'lucide-react';
import { eventsApi } from '../api/events';
import { Event } from '../types';
import { EventCard } from '../components/events/EventCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { DEFAULT_EVENT_IMAGE, isSafeImageUrl } from '../utils/security';

const CATEGORIES = [
  { key: 'ALL', label: 'Todos', icon: Sparkles },
  { key: 'MOVIE', label: 'Filmes/Cinema', icon: Film },
  { key: 'SHOW', label: 'Shows & Festivais', icon: Music },
  { key: 'THEATER', label: 'Teatro', icon: Drama },
];

export const HomePage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const selectedType = searchParams.get('type') || searchParams.get('category') || 'ALL';
  const queryParam = searchParams.get('query') || '';

  useEffect(() => {
    loadEvents();
  }, [selectedType, queryParam]);

  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: { query?: string; type?: string } = {};
      if (queryParam) params.query = queryParam;
      if (selectedType !== 'ALL') params.type = selectedType;

      const data = await eventsApi.getEvents(params);
      setEvents(data);
    } catch (err) {
      console.error('Erro ao carregar eventos:', err);
      setError('Não foi possível carregar os eventos. Verifique se o servidor backend está ativo.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (typeKey: string) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('category');
    if (typeKey === 'ALL') {
      nextParams.delete('type');
    } else {
      nextParams.set('type', typeKey);
    }
    setSearchParams(nextParams);
  };

  const handleClearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const getBadgeInfo = (event: Event) => {
    switch (event.type) {
      case 'MOVIE':
        return { label: 'FILME EM CARTAZ', bg: 'rgba(0, 210, 255, 0.9)', color: '#0B0F19' };
      case 'SHOW':
        return { label: 'SHOW IMPERDÍVEL', bg: 'rgba(139, 92, 246, 0.9)', color: '#FFFFFF' };
      case 'THEATER':
        return { label: 'ESPETÁCULO TEATRAL', bg: 'rgba(245, 158, 11, 0.9)', color: '#0B0F19' };
      default:
        return { label: 'EM DESTAQUE', bg: 'rgba(0, 210, 255, 0.9)', color: '#0B0F19' };
    }
  };

  return (
    <Box sx={{ pb: 10 }}>
      <Container maxWidth="xl" sx={{ pt: { xs: 3, md: 5 } }}>
        {/* Category Pills Header */}
        <Stack
          direction="row"
          spacing={1.5}
          sx={{
            overflowX: 'auto',
            pb: 2,
            mb: 4,
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {CATEGORIES.map((cat) => {
            const IconComp = cat.icon;
            const isSelected = selectedType === cat.key;
            return (
              <Chip
                key={cat.key}
                icon={<IconComp size={16} color={isSelected ? '#0B0F19' : '#94A3B8'} />}
                label={cat.label}
                onClick={() => handleCategoryClick(cat.key)}
                sx={{
                  py: 2.2,
                  px: 1.5,
                  borderRadius: 3,
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: isSelected ? '#00D2FF' : '#121927',
                  color: isSelected ? '#0B0F19' : '#94A3B8',
                  border: isSelected ? '1px solid #00D2FF' : '1px solid #1E293B',
                  boxShadow: isSelected ? '0 0 16px rgba(0, 210, 255, 0.4)' : 'none',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: isSelected ? '#00C0EB' : '#1A2333',
                    borderColor: '#00D2FF',
                    color: isSelected ? '#0B0F19' : '#FFFFFF',
                  },
                  '& .MuiChip-icon': {
                    color: isSelected ? '#0B0F19' : '#94A3B8',
                  },
                }}
              />
            );
          })}
        </Stack>

        {/* Hero Banners Section */}
        {!queryParam && selectedType === 'ALL' && events.length > 0 && (
          <Grid container spacing={3} sx={{ mb: 6 }}>
            {events.slice(0, 2).map((heroEv, idx) => {
              const badge = getBadgeInfo(heroEv);
              const isSeated = heroEv.seatingType === 'SEATED';
              const safeImg = isSafeImageUrl(heroEv.imageUrl) ? heroEv.imageUrl : DEFAULT_EVENT_IMAGE;
              const isFirst = idx === 0;

              return (
                <Grid item xs={12} lg={events.length === 1 ? 12 : 6} key={heroEv.id}>
                  <Paper
                    onClick={() => navigate(`/events/${heroEv.id}`)}
                    sx={{
                      position: 'relative',
                      height: { xs: 340, sm: 400 },
                      borderRadius: 5,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: '1px solid #1E293B',
                      boxShadow: '0 16px 36px rgba(0, 0, 0, 0.5)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        borderColor: isFirst ? '#00D2FF' : '#8B5CF6',
                        boxShadow: isFirst
                          ? '0 20px 45px rgba(0, 210, 255, 0.2)'
                          : '0 20px 45px rgba(139, 92, 246, 0.2)',
                      },
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={safeImg}
                      alt={heroEv.title}
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(180deg, rgba(11, 15, 25, 0.1) 0%, rgba(11, 15, 25, 0.95) 100%)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        p: { xs: 3, sm: 4 },
                      }}
                    >
                      <Chip
                        label={badge.label}
                        size="small"
                        sx={{
                          backgroundColor: badge.bg,
                          color: badge.color,
                          fontWeight: 800,
                          fontSize: '0.7rem',
                          letterSpacing: '0.06em',
                          width: 'fit-content',
                          mb: 1.5,
                        }}
                      />
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: 900,
                          color: '#FFFFFF',
                          fontSize: { xs: '1.6rem', sm: '2.2rem' },
                          lineHeight: 1.15,
                          mb: 1.5,
                        }}
                      >
                        {heroEv.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#CBD5E1',
                          mb: 3,
                          maxWidth: 480,
                          fontSize: { xs: '0.85rem', sm: '0.95rem' },
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {heroEv.description || 'Uma experiência única com tecnologia de ponta e ingressos digitais imediatos.'}
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={isSeated ? <Armchair size={18} /> : <Ticket size={18} />}
                        sx={{
                          width: 'fit-content',
                          px: 3.5,
                          py: 1.25,
                          background: 'linear-gradient(135deg, #00D2FF 0%, #8B5CF6 100%)',
                          color: '#FFFFFF',
                          fontWeight: 800,
                          borderRadius: 3,
                          boxShadow: '0 4px 15px rgba(0, 210, 255, 0.35)',
                          transition: 'all 0.25s ease',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #00C0EB 0%, #7C3AED 100%)',
                            boxShadow: '0 6px 20px rgba(0, 210, 255, 0.5)',
                            transform: 'translateY(-2px)',
                          },
                        }}
                      >
                        {isSeated ? 'Reservar Lugar' : 'Comprar Ingressos'}
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* Section Title & Events Grid */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
              {queryParam ? `Resultados para "${queryParam}"` : 'Eventos Próximos'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#94A3B8', mt: 0.5 }}>
              Experiências selecionadas com alta demanda e ingressos digitais imediatos
            </Typography>
          </Box>

          <Button
            onClick={handleClearAllFilters}
            endIcon={<ArrowRight size={16} />}
            sx={{ color: '#00D2FF', fontWeight: 700 }}
          >
            Ver todos os eventos
          </Button>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert
            severity="warning"
            action={
              <Button color="inherit" size="small" onClick={loadEvents} sx={{ fontWeight: 700 }}>
                Tentar Novamente
              </Button>
            }
            sx={{ mb: 4, backgroundColor: '#1A1829', color: '#FBBF24' }}
          >
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading ? (
          <LoadingSpinner message="Buscando eventos em cartaz..." />
        ) : events.length === 0 ? (
          <Paper
            sx={{
              py: 8,
              textAlign: 'center',
              backgroundColor: '#121927',
              border: '1px dashed #1E293B',
              borderRadius: 4,
            }}
          >
            <Ticket size={48} color="#64748B" style={{ marginBottom: 16 }} />
            <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 700, mb: 1 }}>
              Nenhum evento encontrado
            </Typography>
            <Typography variant="body2" sx={{ color: '#94A3B8', maxWidth: 400, mx: 'auto', mb: 3 }}>
              Não encontramos eventos para o filtro selecionado. Tente pesquisar por outro termo ou explore todas as categorias.
            </Typography>
            <Button variant="outlined" onClick={handleClearAllFilters} sx={{ color: '#00D2FF' }}>
              Limpar Filtros
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {events.map((event) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={event.id}>
                <EventCard event={event} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};
