import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  TextField,
  Button,
  Stack,
  IconButton,
  Divider,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import {
  Instagram,
  Twitter,
  Youtube,
  Ticket,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { useSnackbar } from 'notistack';

export const Footer: React.FC = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      enqueueSnackbar('Por favor, informe um e-mail válido.', { variant: 'warning' });
      return;
    }
    enqueueSnackbar('Inscrição realizada com sucesso na Newsletter VIP!', { variant: 'success' });
    setNewsletterEmail('');
  };

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#070B14',
        borderTop: '1px solid #1E293B',
        pt: 8,
        pb: 4,
        mt: 'auto',
        color: '#94A3B8',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {/* Brand & Mission */}
          <Grid item xs={12} md={4}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: 2.5,
                  background: 'linear-gradient(135deg, #00D2FF 0%, #8B5CF6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0, 210, 255, 0.3)',
                }}
              >
                <Ticket size={22} color="#FFFFFF" />
              </Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  color: '#FFFFFF',
                  letterSpacing: '-0.02em',
                }}
              >
                EventPass
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.6, maxWidth: 320, color: '#94A3B8' }}>
              Conectando você às melhores experiências culturais e de entretenimento do Brasil com tecnologia, alta disponibilidade e segurança antifraude.
            </Typography>
            <Stack direction="row" spacing={1.5}>
              <IconButton
                sx={{
                  backgroundColor: '#0F172A',
                  border: '1px solid #1E293B',
                  color: '#F8FAFC',
                  '&:hover': { color: '#00D2FF', borderColor: '#00D2FF' },
                }}
                size="small"
              >
                <Instagram size={18} />
              </IconButton>
              <IconButton
                sx={{
                  backgroundColor: '#0F172A',
                  border: '1px solid #1E293B',
                  color: '#F8FAFC',
                  '&:hover': { color: '#00D2FF', borderColor: '#00D2FF' },
                }}
                size="small"
              >
                <Twitter size={18} />
              </IconButton>
              <IconButton
                sx={{
                  backgroundColor: '#0F172A',
                  border: '1px solid #1E293B',
                  color: '#F8FAFC',
                  '&:hover': { color: '#00D2FF', borderColor: '#00D2FF' },
                }}
                size="small"
              >
                <Youtube size={18} />
              </IconButton>
            </Stack>
          </Grid>

          {/* Navigation Links */}
          <Grid item xs={6} sm={3} md={2}>
            <Typography variant="subtitle2" sx={{ color: '#FFFFFF', fontWeight: 700, mb: 2.5 }}>
              Explorar
            </Typography>
            <Stack spacing={1.5}>
              <Typography
                component={RouterLink}
                to="/"
                variant="body2"
                sx={{ color: '#94A3B8', textDecoration: 'none', '&:hover': { color: '#00D2FF' } }}
              >
                Todos os Eventos
              </Typography>
              <Typography
                component={RouterLink}
                to="/?category=Filmes"
                variant="body2"
                sx={{ color: '#94A3B8', textDecoration: 'none', '&:hover': { color: '#00D2FF' } }}
              >
                Cinema & Filmes
              </Typography>
              <Typography
                component={RouterLink}
                to="/?category=Shows"
                variant="body2"
                sx={{ color: '#94A3B8', textDecoration: 'none', '&:hover': { color: '#00D2FF' } }}
              >
                Shows & Festivais
              </Typography>
              <Typography
                component={RouterLink}
                to="/?category=Teatro"
                variant="body2"
                sx={{ color: '#94A3B8', textDecoration: 'none', '&:hover': { color: '#00D2FF' } }}
              >
                Teatro & Cultura
              </Typography>
            </Stack>
          </Grid>

          {/* Organizer Links */}
          <Grid item xs={6} sm={3} md={3}>
            <Typography variant="subtitle2" sx={{ color: '#FFFFFF', fontWeight: 700, mb: 2.5 }}>
              Para Organizadores
            </Typography>
            <Stack spacing={1.5}>
              <Typography
                component={RouterLink}
                to="/organizer/events/new"
                variant="body2"
                sx={{ color: '#94A3B8', textDecoration: 'none', '&:hover': { color: '#00D2FF' } }}
              >
                Publicar Novo Evento
              </Typography>
              <Typography
                component={RouterLink}
                to="/organizer"
                variant="body2"
                sx={{ color: '#94A3B8', textDecoration: 'none', '&:hover': { color: '#00D2FF' } }}
              >
                Painel do Produtor
              </Typography>
              <Typography
                component={RouterLink}
                to="/portaria"
                variant="body2"
                sx={{ color: '#94A3B8', textDecoration: 'none', '&:hover': { color: '#00D2FF' } }}
              >
                Portaria & Scanner
              </Typography>
              <Typography
                component="a"
                href="http://localhost:8080/swagger-ui.html"
                target="_blank"
                rel="noreferrer"
                variant="body2"
                sx={{ color: '#94A3B8', textDecoration: 'none', '&:hover': { color: '#00D2FF' } }}
              >
                Documentação API (Swagger)
              </Typography>
            </Stack>
          </Grid>

          {/* Newsletter */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2" sx={{ color: '#FFFFFF', fontWeight: 700, mb: 1.5 }}>
              Newsletter
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: '#94A3B8', fontSize: '0.875rem' }}>
              Fique por dentro dos lançamentos e pré-vendas exclusivas no seu e-mail.
            </Typography>
            <Box component="form" onSubmit={handleNewsletterSubmit} sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                placeholder="Seu e-mail"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                sx={{
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#0F172A',
                    fontSize: '0.875rem',
                  },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                sx={{
                  minWidth: 48,
                  px: 2,
                  background: 'linear-gradient(135deg, #00D2FF 0%, #8B5CF6 100%)',
                }}
              >
                <Send size={16} />
              </Button>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ borderColor: '#1E293B', mb: 3 }} />

        {/* Bottom Bar */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'center', sm: 'center' },
            gap: 2,
            fontSize: '0.8rem',
          }}
        >
          <Typography variant="caption" sx={{ color: '#64748B' }}>
            © {new Date().getFullYear()} EVENTPASS. TODOS OS DIREITOS RESERVADOS.
          </Typography>
          <Stack direction="row" spacing={3}>
            <Typography variant="caption" sx={{ color: '#64748B', cursor: 'pointer', '&:hover': { color: '#94A3B8' } }}>
              PRIVACIDADE
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', cursor: 'pointer', '&:hover': { color: '#94A3B8' } }}>
              TERMOS DE USO
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', cursor: 'pointer', '&:hover': { color: '#94A3B8' } }}>
              SAC / SUPORTE
            </Typography>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};
