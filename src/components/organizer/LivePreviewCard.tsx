import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Chip,
  CardMedia,
  Stack,
  alpha,
} from '@mui/material';
import { Calendar, MapPin, Sparkles, Lightbulb, Star } from 'lucide-react';
import { CreateEventDTO } from '../../types';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { DEFAULT_EVENT_IMAGE, isSafeImageUrl } from '../../utils/security';

interface LivePreviewCardProps {
  formData: CreateEventDTO;
  isAutoFilled?: boolean;
}

export const LivePreviewCard: React.FC<LivePreviewCardProps> = ({ formData, isAutoFilled }) => {
  const safeImage = isSafeImageUrl(formData.imageUrl) ? formData.imageUrl : DEFAULT_EVENT_IMAGE;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, letterSpacing: '0.08em' }}>
          PRÉ-VISUALIZAÇÃO DO CARD
        </Typography>
        {isAutoFilled && (
          <Chip
            icon={<Sparkles size={12} color="#10B981" />}
            label="AUTOPREENCHIDO"
            size="small"
            sx={{
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: '#34D399',
              fontWeight: 700,
              fontSize: '0.65rem',
            }}
          />
        )}
      </Box>

      {/* Card Visual */}
      <Paper
        sx={{
          backgroundColor: '#121927',
          border: '1px solid #1E293B',
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.5)',
          mb: 3,
        }}
      >
        {/* Banner with poster */}
        <Box sx={{ position: 'relative', height: 260 }}>
          <CardMedia
            component="img"
            image={safeImage}
            alt={formData.title || 'Novo Evento'}
            sx={{ height: '100%', width: '100%', objectFit: 'cover' }}
          />
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(11, 15, 25, 0.1) 0%, rgba(11, 15, 25, 0.9) 100%)',
            }}
          />

          {/* TMDb badge */}
          <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
            <Chip
              icon={<Star size={12} color="#FBBF24" />}
              label="8.4 TMDb"
              size="small"
              sx={{
                backgroundColor: 'rgba(11, 15, 25, 0.85)',
                color: '#FBBF24',
                fontWeight: 800,
                fontSize: '0.7rem',
                border: '1px solid rgba(251, 191, 36, 0.3)',
              }}
            />
          </Box>

          {/* Category Chip */}
          <Box sx={{ position: 'absolute', bottom: 12, left: 12 }}>
            <Stack direction="row" spacing={1}>
              <Chip
                label={formData.category || 'EVENTO'}
                size="small"
                sx={{
                  backgroundColor: 'rgba(0, 210, 255, 0.2)',
                  color: '#00D2FF',
                  fontWeight: 700,
                  fontSize: '0.65rem',
                }}
              />
              <Chip
                label={formData.seatingType === 'SEATED' ? 'ASSENTOS MARCADOS' : 'PISTA GERAL'}
                size="small"
                sx={{
                  backgroundColor: 'rgba(139, 92, 246, 0.2)',
                  color: '#A78BFA',
                  fontWeight: 700,
                  fontSize: '0.65rem',
                }}
              />
            </Stack>
          </Box>
        </Box>

        {/* Info */}
        <Box sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2 }}>
              {formData.title || 'Título do Evento'}
            </Typography>
            <Box sx={{ textAlign: 'right', ml: 2 }}>
              <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontSize: '0.65rem', fontWeight: 600 }}>
                A PARTIR DE
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#00D2FF', lineHeight: 1 }}>
                {formatCurrency(formData.price || 0)}
              </Typography>
            </Box>
          </Box>

          <Typography
            variant="body2"
            sx={{
              color: '#94A3B8',
              fontSize: '0.8rem',
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {formData.description || 'Sinopse ou descrição do evento aparecerá aqui...'}
          </Typography>

          <Stack spacing={0.75} sx={{ color: '#64748B' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Calendar size={14} color="#00D2FF" />
              <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 500 }}>
                {formData.eventDate ? formatDateTime(formData.eventDate) : 'Data a ser definida'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MapPin size={14} color="#8B5CF6" />
              <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 500 }}>
                {formData.location || 'Local / Endereço do evento'}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Paper>

      {/* Tip Box */}
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
        <Box
          sx={{
            p: 1,
            borderRadius: 2,
            backgroundColor: 'rgba(139, 92, 246, 0.15)',
            color: '#8B5CF6',
          }}
        >
          <Lightbulb size={18} />
        </Box>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.85rem' }}>
            Dica de Conversão
          </Typography>
          <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.75rem', lineHeight: 1.4, display: 'block' }}>
            Pôsteres com cores contrastantes como Cyan e Magenta tendem a atrair até 30% mais cliques na vitrine principal.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};
