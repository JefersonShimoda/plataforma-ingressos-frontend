import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Stack,
  alpha,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Plus, Armchair, Users } from 'lucide-react';
import { Event } from '../../types';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { DEFAULT_EVENT_IMAGE, isSafeImageUrl } from '../../utils/security';

interface EventCardProps {
  event: Event;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/events/${event.id}`);
  };

  const safeImage = isSafeImageUrl(event.imageUrl) ? event.imageUrl : DEFAULT_EVENT_IMAGE;

  return (
    <Card
      onClick={handleCardClick}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#121927',
        border: '1px solid #1E293B',
        borderRadius: 4,
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative',
        transition: 'all 0.25s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          borderColor: '#00D2FF',
          boxShadow: '0 12px 28px rgba(0, 210, 255, 0.15)',
          '& .card-image': {
            transform: 'scale(1.05)',
          },
        },
      }}
    >
      {/* Image Container with Badges */}
      <Box sx={{ position: 'relative', height: 210, overflow: 'hidden' }}>
        <CardMedia
          component="img"
          image={safeImage}
          alt={event.title}
          className="card-image"
          sx={{
            height: '100%',
            width: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease',
          }}
        />
        {/* Gradient Overlay */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(11, 15, 25, 0.2) 0%, rgba(11, 15, 25, 0.85) 100%)',
          }}
        />

        {/* Top Left Category Badge */}
        <Box sx={{ position: 'absolute', top: 12, left: 12 }}>
          <Chip
            label={event.category || event.type}
            size="small"
            sx={{
              backgroundColor: alpha('#0B0F19', 0.8),
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.7rem',
              textTransform: 'uppercase',
            }}
          />
        </Box>

        {/* Bottom Right Seating Type Badge */}
        <Box sx={{ position: 'absolute', bottom: 12, right: 12 }}>
          <Chip
            icon={
              event.seatingType === 'SEATED' ? (
                <Armchair size={13} color="#FFFFFF" />
              ) : (
                <Users size={13} color="#0B0F19" />
              )
            }
            label={event.seatingType === 'SEATED' ? 'ASSENTOS MARCADOS' : 'PISTA'}
            size="small"
            sx={{
              backgroundColor:
                event.seatingType === 'SEATED'
                  ? 'rgba(139, 92, 246, 0.9)'
                  : 'rgba(0, 210, 255, 0.95)',
              color: event.seatingType === 'SEATED' ? '#FFFFFF' : '#0B0F19',
              fontWeight: 800,
              fontSize: '0.65rem',
              letterSpacing: '0.04em',
              backdropFilter: 'blur(6px)',
              '& .MuiChip-icon': {
                color: event.seatingType === 'SEATED' ? '#FFFFFF' : '#0B0F19',
              },
            }}
          />
        </Box>
      </Box>

      {/* Content */}
      <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: '#FFFFFF',
            lineHeight: 1.3,
            mb: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '2.6em',
          }}
        >
          {event.title}
        </Typography>

        {/* Metadata */}
        <Stack spacing={0.75} sx={{ mb: 2.5, color: '#94A3B8' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Calendar size={15} color="#00D2FF" />
            <Typography variant="caption" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
              {formatDateTime(event.eventDate)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MapPin size={15} color="#8B5CF6" />
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.8rem',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {event.location}
            </Typography>
          </Box>
        </Stack>

        {/* Price & Action */}
        <Box
          sx={{
            mt: 'auto',
            pt: 1.5,
            borderTop: '1px solid #1E293B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontSize: '0.7rem', fontWeight: 600 }}>
              A PARTIR DE
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#00D2FF', lineHeight: 1.1 }}>
              {formatCurrency(event.price)}
            </Typography>
          </Box>

          <IconButton
            size="small"
            sx={{
              backgroundColor: '#1E293B',
              color: '#FFFFFF',
              '&:hover': {
                background: 'linear-gradient(135deg, #00D2FF 0%, #8B5CF6 100%)',
                transform: 'scale(1.08)',
              },
              transition: 'all 0.2s',
            }}
          >
            <Plus size={18} />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
};
