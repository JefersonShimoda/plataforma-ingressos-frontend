import React, { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  Grid,
  Stack,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  User as UserIcon,
  Armchair,
  Share2,
  CheckCircle2,
  Copy,
  Check,
  Download,
  Lock,
  ExternalLink,
  QrCode,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Ticket } from '../../types';
import { formatDateTime } from '../../utils/formatters';
import { DEFAULT_EVENT_IMAGE, isSafeImageUrl } from '../../utils/security';
import { useAuth } from '../../context/AuthContext';
import { useSnackbar } from 'notistack';

interface DigitalTicketCardProps {
  ticket: Ticket;
  onShare?: (shareToken: string) => void;
}

export const DigitalTicketCard: React.FC<DigitalTicketCardProps> = ({ ticket, onShare }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [simulating, setSimulating] = useState(false);

  const { quickLogin } = useAuth();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const safeImage = isSafeImageUrl(ticket.imageUrl) ? ticket.imageUrl : DEFAULT_EVENT_IMAGE;
  const shareUrl = `${window.location.origin}/tickets/share/${ticket.shareToken}`;

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    enqueueSnackbar('Link público copiado! Qualquer pessoa com o link pode visualizar este ingresso.', {
      variant: 'success',
    });
    setTimeout(() => setCopiedLink(false), 3000);
    if (onShare) onShare(ticket.shareToken);
  };

  const handleConfirmSimulate = async () => {
    setSimulating(true);
    try {
      // Alterna perfil para Portaria (Lucas Porteiro)
      await quickLogin('PORTER');
      setDemoModalOpen(false);
      navigate(
        `/portaria?eventId=${ticket.eventId}&token=${encodeURIComponent(ticket.qrCodeToken)}&auto=true`
      );
    } catch (err) {
      console.error(err);
      enqueueSnackbar('Erro ao alternar para o perfil de portaria.', { variant: 'error' });
    } finally {
      setSimulating(false);
    }
  };

  return (
    <Paper
      sx={{
        backgroundColor: '#121927',
        border: '1px solid #1E293B',
        borderRadius: 4,
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.4)',
        mb: 3,
      }}
    >
      <Grid container>
        {/* Left Event Banner Column */}
        <Grid
          item
          xs={12}
          md={4}
          sx={{
            position: 'relative',
            minHeight: { xs: 200, md: 340 },
            backgroundImage: `url(${safeImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            p: 3,
          }}
        >
          {/* Dark gradient overlay */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(11, 15, 25, 0.4) 0%, rgba(11, 15, 25, 0.95) 100%)',
            }}
          />

          <Box sx={{ position: 'relative', zIndex: 1 }}>
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

          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2, mb: 1 }}>
              {ticket.eventTitle}
            </Typography>
            <Typography variant="caption" sx={{ color: '#00D2FF', fontWeight: 600 }}>
              PASSE DIGITAL VERIFICADO
            </Typography>
          </Box>
        </Grid>

        {/* Right Details & QR Code Column */}
        <Grid
          item
          xs={12}
          md={8}
          sx={{
            p: { xs: 2.5, sm: 3.5 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: '#121927',
          }}
        >
          {/* Header Row: Location & Status */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: 1.5,
              mb: 3,
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, letterSpacing: '0.05em' }}>
                LOCAL & DATA
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
                {ticket.location}
              </Typography>
              <Typography variant="body2" sx={{ color: '#00D2FF', fontWeight: 600 }}>
                {formatDateTime(ticket.eventDate, { longMonth: true, showYear: true })}
              </Typography>
            </Box>

            <Chip
              icon={<CheckCircle2 size={14} color={ticket.validated ? '#F59E0B' : '#10B981'} />}
              label={ticket.validated ? 'CHECK-IN REALIZADO' : 'STATUS: VÁLIDO'}
              sx={{
                backgroundColor: ticket.validated ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                border: `1px solid ${ticket.validated ? 'rgba(245, 158, 11, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
                color: ticket.validated ? '#FBBF24' : '#34D399',
                fontWeight: 700,
                fontSize: '0.75rem',
              }}
            />
          </Box>

          {/* User & Seat Information */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
                TITULAR DO INGRESSO
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
                {ticket.clientName || 'Cliente EventPass'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                ID: TF-{ticket.id.toString().padStart(4, '0')}
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
                LUGAR / ASSENTO
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 700, color: '#8B5CF6' }}>
                {ticket.seatNumber ? `Poltrona ${ticket.seatNumber}` : 'Setor Pista Geral'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                {ticket.seatNumber ? 'Assento Marcado' : 'Acesso VIP'}
              </Typography>
            </Grid>
          </Grid>

          <Divider sx={{ borderColor: '#1E293B', mb: 3 }} />

          {/* QR Code & Actions Row */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={3}
            alignItems="center"
            justifyContent="space-between"
          >
            {/* Encrypted QR Code Box */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  p: 1.5,
                  backgroundColor: '#FFFFFF',
                  borderRadius: 2.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(0, 210, 255, 0.2)',
                }}
              >
                <QRCodeSVG value={ticket.qrCodeToken} size={110} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', maxWidth: 200, fontSize: '0.75rem' }}>
                  {ticket.validated
                    ? 'Ingresso já validado na portaria. QR Code inativo para novas entradas.'
                    : 'Apresente este código na entrada do evento. O QR Code é dinâmico e seguro.'}
                </Typography>
                <Chip
                  icon={ticket.validated ? <CheckCircle2 size={12} color="#F59E0B" /> : <Lock size={12} color="#00D2FF" />}
                  label={ticket.validated ? 'ACESSO JÁ REGISTRADO' : 'QR CODE CRIPTOGRAFADO'}
                  size="small"
                  sx={{
                    mt: 1,
                    height: 20,
                    fontSize: '0.65rem',
                    backgroundColor: ticket.validated ? 'rgba(245, 158, 11, 0.1)' : 'rgba(0, 210, 255, 0.1)',
                    color: ticket.validated ? '#FBBF24' : '#00D2FF',
                  }}
                />
              </Box>
            </Box>

            {/* Actions Stack */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              sx={{ width: { xs: '100%', sm: 'auto' }, flexWrap: 'wrap', gap: 1 }}
            >
              {/* Demo Mode Button: Simulate as Porter */}
              <Button
                variant="outlined"
                onClick={() => setDemoModalOpen(true)}
                startIcon={<QrCode size={16} />}
                sx={{
                  borderColor: ticket.validated ? 'rgba(245, 158, 11, 0.4)' : 'rgba(16, 185, 129, 0.4)',
                  color: ticket.validated ? '#FBBF24' : '#34D399',
                  backgroundColor: ticket.validated ? 'rgba(245, 158, 11, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  py: 1,
                  px: 2,
                  whiteSpace: 'nowrap',
                  '&:hover': {
                    borderColor: ticket.validated ? '#F59E0B' : '#10B981',
                    backgroundColor: ticket.validated ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                  },
                }}
              >
                {ticket.validated ? '🧪 Testar Bloqueio (Portaria)' : '🧪 Validar como Portaria'}
              </Button>

              {/* Share Link Button */}
              <Button
                variant="contained"
                onClick={handleCopyShareLink}
                startIcon={copiedLink ? <Check size={18} /> : <Share2 size={18} />}
                sx={{
                  background: 'linear-gradient(135deg, #00D2FF 0%, #8B5CF6 100%)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  px: 2.5,
                  py: 1,
                  whiteSpace: 'nowrap',
                }}
              >
                {copiedLink ? 'Link Copiado!' : 'Compartilhar Ingresso'}
              </Button>
            </Stack>
          </Stack>
        </Grid>
      </Grid>

      {/* Demo Simulation Explanation Modal */}
      <Dialog
        open={demoModalOpen}
        onClose={() => !simulating && setDemoModalOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: '#121927',
            border: '1px solid #1E293B',
            borderRadius: 4,
            maxWidth: 520,
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ color: '#FFFFFF', fontWeight: 800, pb: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              backgroundColor: ticket.validated ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              color: ticket.validated ? '#FBBF24' : '#34D399',
              display: 'flex',
            }}
          >
            <QrCode size={22} />
          </Box>
          Modo Demonstração: Simular Check-in
        </DialogTitle>

        <DialogContent sx={{ pt: 1.5 }}>
          <Typography variant="body2" sx={{ color: '#94A3B8', mb: 2 }}>
            Em um ambiente real de evento, o cliente exibe o QR Code no smartphone e o operador de portaria escaneia o código usando uma câmera.
          </Typography>

          <Paper sx={{ p: 2, backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: 3, mb: 2 }}>
            <Typography variant="caption" sx={{ color: '#00D2FF', fontWeight: 700, display: 'block', mb: 1 }}>
              O que acontecerá ao confirmar:
            </Typography>
            <Stack spacing={1}>
              <Typography variant="caption" sx={{ color: '#E2E8F0', display: 'flex', alignItems: 'center', gap: 1 }}>
                <span style={{ color: '#00D2FF', fontWeight: 800 }}>1.</span> Sua sessão será alternada para a conta de <strong>Portaria (Lucas Porteiro)</strong>.
              </Typography>
              <Typography variant="caption" sx={{ color: '#E2E8F0', display: 'flex', alignItems: 'center', gap: 1 }}>
                <span style={{ color: '#00D2FF', fontWeight: 800 }}>2.</span> Você será redirecionado para a tela de <strong>Portaria & Check-in</strong> com este evento selecionado.
              </Typography>
              <Typography variant="caption" sx={{ color: '#E2E8F0', display: 'flex', alignItems: 'center', gap: 1 }}>
                <span style={{ color: '#00D2FF', fontWeight: 800 }}>3.</span> O token criptográfico deste ingresso será enviado para validação imediata no backend.
              </Typography>
            </Stack>
          </Paper>

          {ticket.validated ? (
            <Alert severity="warning" sx={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#FBBF24', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              <strong>Teste de Bloqueio Seguro:</strong> Este ingresso já foi validado anteriormente. Ao simular, o backend acusará com sucesso a tentativa de reuso indevido (<code>ALREADY_USED</code>).
            </Alert>
          ) : (
            <Alert severity="success" sx={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#34D399', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <strong>Teste de Validação Real:</strong> Este ingresso está ativo. Ao simular, o backend dará baixa no acesso e atualizará a ocupação em tempo real.
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setDemoModalOpen(false)} disabled={simulating} sx={{ color: '#94A3B8' }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmSimulate}
            disabled={simulating}
            startIcon={simulating ? <CircularProgress size={16} color="inherit" /> : <ArrowRight size={18} />}
            sx={{
              background: ticket.validated
                ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: '#FFFFFF',
              fontWeight: 800,
              px: 2.5,
            }}
          >
            {simulating ? 'Alternando Perfil...' : ticket.validated ? 'Testar Bloqueio na Portaria' : 'Confirmar & Validar na Portaria'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};
