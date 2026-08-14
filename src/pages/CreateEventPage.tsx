import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  TextField,
  Stack,
  InputAdornment,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  MenuItem,
  Select,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Search,
  Sparkles,
  Send,
  Armchair,
  Users,
  MapPin,
  X,
} from 'lucide-react';
import { catalogApi } from '../api/catalog';
import { eventsApi } from '../api/events';
import { CreateEventDTO, EventType, CatalogItem } from '../types';
import { LivePreviewCard } from '../components/organizer/LivePreviewCard';
import { formatForDateTimeInput } from '../utils/formatters';
import { useSnackbar } from 'notistack';
import { getErrorMessage } from '../api/client';

export const CreateEventPage: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // Smart Search State
  const [catalogQuery, setCatalogQuery] = useState('');
  const [searchingCatalog, setSearchingCatalog] = useState(false);
  const [catalogResults, setCatalogResults] = useState<CatalogItem[]>([]);
  const [catalogModalOpen, setCatalogModalOpen] = useState(false);
  const [isAutoFilled, setIsAutoFilled] = useState(false);

  // Form State
  const [formData, setFormData] = useState<CreateEventDTO>({
    title: '',
    description: '',
    imageUrl: '',
    category: 'Filmes',
    type: 'MOVIE',
    eventDate: formatForDateTimeInput(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
    location: '',
    price: 45.0,
    seatingType: 'SEATED',
    totalCapacity: 200,
    seatRows: 10,
    seatColumns: 20,
  });

  const [saving, setSaving] = useState(false);

  const handleSearchCatalog = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!catalogQuery.trim()) {
      enqueueSnackbar('Digite o nome de um filme, artista ou show para buscar.', { variant: 'warning' });
      return;
    }

    setSearchingCatalog(true);
    try {
      const results = await catalogApi.getCatalog(catalogQuery.trim());
      if (results && results.length > 0) {
        setCatalogResults(results);
        setCatalogModalOpen(true);
      } else {
        enqueueSnackbar('Nenhum resultado encontrado no catálogo externo TMDb/Ticketmaster.', {
          variant: 'info',
        });
      }
    } catch (err) {
      enqueueSnackbar(getErrorMessage(err, 'Erro ao consultar catálogo inteligente.'), { variant: 'error' });
    } finally {
      setSearchingCatalog(false);
    }
  };

  const handleSelectCatalogItem = (item: CatalogItem) => {
    setFormData((prev) => {
      let mappedType: EventType = 'MOVIE';
      if (
        item.type?.toUpperCase().includes('SHOW') ||
        item.type?.toUpperCase().includes('MUSIC') ||
        item.type?.toUpperCase().includes('CONCERT')
      ) {
        mappedType = 'SHOW';
      } else if (item.type?.toUpperCase().includes('THEATER')) {
        mappedType = 'THEATER';
      }

      return {
        ...prev,
        title: item.title,
        description: item.description || prev.description,
        imageUrl: item.imageUrl || prev.imageUrl,
        category: item.category || (mappedType === 'MOVIE' ? 'Filmes' : 'Shows'),
        type: mappedType,
        location: item.venueSuggestion || prev.location || 'Cinemark IMAX - São Paulo',
      };
    });

    setIsAutoFilled(true);
    setCatalogModalOpen(false);
    enqueueSnackbar(`Dados importados de "${item.title}" com sucesso!`, { variant: 'success' });
  };

  const rows = formData.seatRows || 10;
  const cols = formData.seatColumns || 20;
  const calculatedSeatsCapacity = rows * cols;

  const handleRowChange = (val: number) => {
    const safeVal = Math.max(1, Math.min(26, val));
    setFormData((prev) => ({
      ...prev,
      seatRows: safeVal,
      totalCapacity: safeVal * (prev.seatColumns || 20),
    }));
  };

  const handleColChange = (val: number) => {
    const safeVal = Math.max(1, Math.min(100, val));
    setFormData((prev) => ({
      ...prev,
      seatColumns: safeVal,
      totalCapacity: (prev.seatRows || 10) * safeVal,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      enqueueSnackbar('Por favor, informe o título do evento.', { variant: 'warning' });
      return;
    }
    if (!formData.location.trim()) {
      enqueueSnackbar('Por favor, informe o local do evento.', { variant: 'warning' });
      return;
    }
    if (!formData.price || formData.price <= 0) {
      enqueueSnackbar('O preço base deve ser maior que zero.', { variant: 'warning' });
      return;
    }

    setSaving(true);
    try {
      const payload: CreateEventDTO = {
        ...formData,
        totalCapacity: formData.seatingType === 'SEATED' ? calculatedSeatsCapacity : formData.totalCapacity,
      };

      await eventsApi.createEvent(payload);
      enqueueSnackbar('🚀 Evento publicado com sucesso na plataforma!', { variant: 'success' });
      navigate('/organizer');
    } catch (err) {
      enqueueSnackbar(getErrorMessage(err, 'Erro ao criar evento. Verifique os campos informados.'), {
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 }, pb: 10 }}>
      {/* Breadcrumb */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
            Eventos &gt; Criar Novo
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em', mt: 0.5 }}>
            Configurar Novo Evento
          </Typography>
        </Box>

        <Button
          startIcon={<ChevronLeft size={18} />}
          onClick={() => navigate('/organizer')}
          sx={{ color: '#94A3B8', '&:hover': { color: '#FFFFFF' } }}
        >
          Voltar
        </Button>
      </Box>

      {/* Smart Search Box */}
      <Paper
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 4,
          backgroundColor: '#121927',
          border: '1px solid #1E293B',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#FFFFFF', mb: 0.5 }}>
          Preenchimento Automático Inteligente
        </Typography>
        <Typography variant="body2" sx={{ color: '#94A3B8', mb: 2, fontSize: '0.85rem' }}>
          Sincronizamos automaticamente o pôster oficial, sinopse, classificação e categoria via catálogo externo.
        </Typography>

        <Box component="form" onSubmit={handleSearchCatalog} sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <TextField
            fullWidth
            placeholder="Buscar filmes no TMDb ou turnês no Ticketmaster (Ex: Batman, Avatar, Spider-Man)..."
            value={catalogQuery}
            onChange={(e) => setCatalogQuery(e.target.value)}
            sx={{ flex: 1, minWidth: 260 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={18} color="#64748B" />
                </InputAdornment>
              ),
            }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={searchingCatalog}
            startIcon={searchingCatalog ? <CircularProgress size={16} color="inherit" /> : <Sparkles size={18} />}
            sx={{
              px: 3,
              background: 'linear-gradient(135deg, #00D2FF 0%, #8B5CF6 100%)',
              fontWeight: 700,
              whiteSpace: 'nowrap',
            }}
          >
            {searchingCatalog ? 'Buscando...' : 'Buscar & Importar'}
          </Button>
        </Box>
      </Paper>

      {/* Main Grid */}
      <Grid container spacing={4}>
        <Grid item xs={12} lg={7}>
          <Box component="form" onSubmit={handleSubmit}>
            <Paper
              sx={{
                p: { xs: 2.5, sm: 3.5 },
                borderRadius: 4,
                backgroundColor: '#121927',
                border: '1px solid #1E293B',
                mb: 4,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF', mb: 3 }}>
                1. Informações Básicas do Evento
              </Typography>

              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, mb: 0.5, display: 'block' }}>
                    Título do Evento
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Ex: Homem-Aranha: Um Novo Dia"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, mb: 0.5, display: 'block' }}>
                    Sinopse / Descrição Completa
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Descreva a experiência, atrações ou enredo..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, mb: 0.5, display: 'block' }}>
                      Categoria
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Ex: Filmes, Shows, Teatro"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, mb: 0.5, display: 'block' }}>
                      Tipo do Evento
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as EventType })}
                      >
                        <MenuItem value="MOVIE">Cinema (MOVIE)</MenuItem>
                        <MenuItem value="SHOW">Show / Festival (SHOW)</MenuItem>
                        <MenuItem value="THEATER">Teatro / Cultura (THEATER)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <Box>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, mb: 0.5, display: 'block' }}>
                    URL da Imagem do Pôster
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="https://exemplo.com/poster.jpg"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  />
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, mb: 0.5, display: 'block' }}>
                      Data e Hora do Evento
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      type="datetime-local"
                      value={formData.eventDate}
                      onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, mb: 0.5, display: 'block' }}>
                      Preço Base do Ingresso (R$)
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                      }}
                    />
                  </Grid>
                </Grid>

                <Box>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, mb: 0.5, display: 'block' }}>
                    Local do Evento
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Ex: Allianz Parque, São Paulo - SP"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <MapPin size={16} color="#8B5CF6" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              </Stack>
            </Paper>

            <Paper
              sx={{
                p: { xs: 2.5, sm: 3.5 },
                borderRadius: 4,
                backgroundColor: '#121927',
                border: '1px solid #1E293B',
                mb: 4,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF', mb: 1 }}>
                2. Configuração de Lotação
              </Typography>
              <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3, fontSize: '0.85rem' }}>
                Defina como os ingressos serão distribuídos e reservados pelos compradores.
              </Typography>

              <ToggleButtonGroup
                value={formData.seatingType}
                exclusive
                onChange={(_, val) => val && setFormData({ ...formData, seatingType: val })}
                fullWidth
                sx={{
                  mb: 3,
                  backgroundColor: '#0F172A',
                  border: '1px solid #1E293B',
                  p: 0.5,
                  borderRadius: 3,
                  '& .MuiToggleButton-root': {
                    border: 'none',
                    borderRadius: 2.5,
                    color: '#94A3B8',
                    fontWeight: 700,
                    py: 1.25,
                    '&.Mui-selected': {
                      backgroundColor: '#1E293B',
                      color: '#00D2FF',
                    },
                  },
                }}
              >
                <ToggleButton value="SEATED">
                  <Armchair size={18} style={{ marginRight: 8 }} />
                  Assentos Marcados
                </ToggleButton>
                <ToggleButton value="GENERAL_ADMISSION">
                  <Users size={18} style={{ marginRight: 8 }} />
                  Pista / Geral
                </ToggleButton>
              </ToggleButtonGroup>

              {formData.seatingType === 'SEATED' ? (
                <Stack spacing={2.5}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, mb: 0.5, display: 'block' }}>
                        Quantidade de Linhas (Fileiras A a {String.fromCharCode(64 + rows)})
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        inputProps={{ min: 1, max: 26 }}
                        value={formData.seatRows}
                        onChange={(e) => handleRowChange(parseInt(e.target.value, 10) || 1)}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, mb: 0.5, display: 'block' }}>
                        Quantidade de Colunas (Assentos 1 a {cols})
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        inputProps={{ min: 1, max: 100 }}
                        value={formData.seatColumns}
                        onChange={(e) => handleColChange(parseInt(e.target.value, 10) || 1)}
                      />
                    </Grid>
                  </Grid>

                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2.5,
                      backgroundColor: '#0F172A',
                      border: '1px solid #1E293B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                      Capacidade Total Calculada:
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#00D2FF' }}>
                      {calculatedSeatsCapacity} assentos marcados
                    </Typography>
                  </Box>
                </Stack>
              ) : (
                <Box>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, mb: 0.5, display: 'block' }}>
                    Capacidade Total da Pista (Lotação Máxima)
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    value={formData.totalCapacity}
                    onChange={(e) =>
                      setFormData({ ...formData, totalCapacity: parseInt(e.target.value, 10) || 100 })
                    }
                  />
                </Box>
              )}
            </Paper>

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={saving}
              startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Send size={20} />}
              sx={{
                py: 2,
                fontSize: '1.05rem',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #00D2FF 0%, #8B5CF6 100%)',
                boxShadow: '0 8px 25px rgba(0, 210, 255, 0.4)',
              }}
            >
              {saving ? 'Publicando Evento...' : 'Publicar Evento Agora'}
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Box sx={{ position: { lg: 'sticky' }, top: { lg: 100 } }}>
            <LivePreviewCard formData={formData} isAutoFilled={isAutoFilled} />
          </Box>
        </Grid>
      </Grid>

      {/* Catalog Search Results Modal */}
      <Dialog
        open={catalogModalOpen}
        onClose={() => setCatalogModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { backgroundColor: '#121927', border: '1px solid #1E293B', borderRadius: 4, p: 1 },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Sparkles size={20} color="#00D2FF" />
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF' }}>
              Resultados do Catálogo TMDb / Ticketmaster
            </Typography>
          </Stack>
          <IconButton onClick={() => setCatalogModalOpen(false)} sx={{ color: '#64748B' }}>
            <X size={18} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ py: 2 }}>
          <Typography variant="body2" sx={{ color: '#94A3B8', mb: 2 }}>
            Selecione uma das opções abaixo para autopreencher pôster, sinopse e dados do evento:
          </Typography>

          <List sx={{ backgroundColor: '#0F172A', borderRadius: 3, border: '1px solid #1E293B', p: 1 }}>
            {catalogResults.map((item, idx) => (
              <ListItem
                key={idx}
                onClick={() => handleSelectCatalogItem(item)}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: '#1A2333' },
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    src={item.imageUrl}
                    variant="rounded"
                    sx={{ width: 50, height: 65, mr: 1, borderRadius: 1.5 }}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
                      {item.title}
                    </Typography>
                  }
                  secondary={
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#94A3B8',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {item.description || item.category || 'Disponível no catálogo'}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </Container>
  );
};
