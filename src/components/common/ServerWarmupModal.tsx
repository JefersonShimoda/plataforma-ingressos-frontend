import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  LinearProgress,
  Stack,
  Button,
  Fade,
} from '@mui/material';
import { Server, Database, CheckCircle2, AlertCircle, RefreshCw, Sparkles, ArrowRight } from 'lucide-react';
import { api } from '../../api/client';

export const ServerWarmupModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isWarmingUp, setIsWarmingUp] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [attempts, setAttempts] = useState<number>(0);
  const [stepIndex, setStepIndex] = useState<number>(0);

  const steps = [
    { label: 'Despertando container Docker (Render Free)', icon: Server },
    { label: 'Conectando ao banco PostgreSQL (Supabase Free)', icon: Database },
    { label: 'Sincronizando catálogo e segurança', icon: Sparkles },
  ];

  useEffect(() => {
    // Check if backend is already warm or waking up
    const hasCheckedSession = sessionStorage.getItem('server_warmup_checked');
    if (hasCheckedSession === 'true') {
      return;
    }

    checkServerHealth();
  }, []);

  const checkServerHealth = async () => {
    setHasError(false);

    // Show modal if health check takes more than 1.2s (indicating cold start)
    const showTimeout = setTimeout(() => {
      setIsOpen(true);
      setIsWarmingUp(true);
    }, 1200);

    let ready = false;
    let count = 0;
    const maxAttempts = 15; // up to ~45 seconds

    while (!ready && count < maxAttempts) {
      count += 1;
      setAttempts(count);
      setStepIndex((prev) => (count > 6 ? 2 : count > 3 ? 1 : 0));

      try {
        const response = await api.get('/health', { timeout: 8000 });
        if (response.status === 200) {
          ready = true;
          break;
        }
      } catch (err) {
        // Wait 2.5s before next ping
        await new Promise((resolve) => setTimeout(resolve, 2500));
      }
    }

    clearTimeout(showTimeout);

    if (ready) {
      setIsReady(true);
      setIsWarmingUp(false);
      sessionStorage.setItem('server_warmup_checked', 'true');
    } else {
      setIsWarmingUp(false);
      setHasError(true);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <Dialog
      open={isOpen}
      PaperProps={{
        sx: {
          backgroundColor: '#0F172A',
          backgroundImage: 'radial-gradient(ellipse at top, rgba(0, 210, 255, 0.12), transparent 70%)',
          border: '1px solid #1E293B',
          borderRadius: 4,
          maxWidth: 460,
          width: '100%',
          p: { xs: 2, sm: 3 },
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)',
        },
      }}
    >
      <DialogContent sx={{ textAlign: 'center', p: { xs: 1, sm: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          {isReady ? (
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid #10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 25px rgba(16, 185, 129, 0.3)',
              }}
            >
              <CheckCircle2 size={38} color="#10B981" />
            </Box>
          ) : hasError ? (
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid #EF4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertCircle size={38} color="#EF4444" />
            </Box>
          ) : (
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                backgroundColor: 'rgba(0, 210, 255, 0.12)',
                border: '1px solid #00D2FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 30px rgba(0, 210, 255, 0.25)',
                animation: 'pulse 2s infinite',
              }}
            >
              <Server size={36} color="#00D2FF" />
            </Box>
          )}
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 800, color: '#FFFFFF', mb: 1, letterSpacing: '-0.02em' }}>
          {isReady ? 'Servidor e Banco Prontos!' : hasError ? 'Servidor Temporariamente Indisponível' : 'Inicializando Servidor na Nuvem'}
        </Typography>

        <Typography variant="body2" sx={{ color: '#94A3B8', mb: 2, lineHeight: 1.6 }}>
          {isReady
            ? 'Conexão restabelecida com sucesso. Entrando na plataforma...'
            : hasError
            ? 'O servidor demorou mais que o esperado para responder. Tente verificar sua conexão ou clique no botão abaixo para tentar novamente.'
            : 'Aguarde enquanto os serviços da nuvem são inicializados com segurança.'}
        </Typography>

        {!isReady && !hasError && (
          <Box
            sx={{
              backgroundColor: 'rgba(234, 179, 8, 0.08)',
              border: '1px solid rgba(234, 179, 8, 0.25)',
              borderRadius: 3,
              p: 1.75,
              mb: 3,
              textAlign: 'left',
            }}
          >
            <Typography variant="caption" sx={{ color: '#FACC15', fontWeight: 700, display: 'block', mb: 0.5 }}>
              ⚡ Limitação do Plano Gratuito (Render + Supabase):
            </Typography>
            <Typography variant="caption" sx={{ color: '#CBD5E1', lineHeight: 1.5, display: 'block' }}>
              Por estarmos hospedados no plano gratuito, o container e o banco de dados entram em <strong>hibernação</strong> após períodos sem acessos. O primeiro carregamento leva cerca de <strong>30 a 50 segundos</strong> para inicializar. Após isso, toda a navegação fica instantânea!
            </Typography>
          </Box>
        )}

        {!isReady && !hasError && (
          <Box sx={{ mb: 3 }}>
            <LinearProgress
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: '#1E293B',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #00D2FF, #8B5CF6)',
                  borderRadius: 4,
                },
              }}
            />
            <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 1 }}>
              Verificando saúde do serviço (Tentativa {attempts}/15)...
            </Typography>
          </Box>
        )}

        {/* Steps */}
        <Stack spacing={1.5} sx={{ textAlign: 'left', mb: 3 }}>
          {steps.map((step, idx) => {
            const IconComp = step.icon;
            const isCompleted = isReady || idx < stepIndex;
            const isCurrent = !isReady && !hasError && idx === stepIndex;

            return (
              <Box
                key={step.label}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1.25,
                  borderRadius: 2,
                  backgroundColor: isCurrent ? 'rgba(0, 210, 255, 0.08)' : 'rgba(30, 41, 59, 0.4)',
                  border: isCurrent ? '1px solid rgba(0, 210, 255, 0.3)' : '1px solid transparent',
                  transition: 'all 0.3s ease',
                }}
              >
                <IconComp
                  size={18}
                  color={isCompleted ? '#10B981' : isCurrent ? '#00D2FF' : '#64748B'}
                />
                <Typography
                  variant="body2"
                  sx={{
                    color: isCompleted ? '#10B981' : isCurrent ? '#FFFFFF' : '#64748B',
                    fontWeight: isCurrent ? 700 : 500,
                    flex: 1,
                  }}
                >
                  {step.label}
                </Typography>
                {isCompleted && <CheckCircle2 size={16} color="#10B981" />}
              </Box>
            );
          })}
        </Stack>

        {isReady && (
          <Button
            variant="contained"
            fullWidth
            onClick={handleClose}
            endIcon={<ArrowRight size={18} />}
            sx={{
              py: 1.4,
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '0.95rem',
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)',
              transition: 'all 0.25s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                boxShadow: '0 6px 25px rgba(16, 185, 129, 0.6)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            Acessar Plataforma Agora
          </Button>
        )}

        {hasError && (
          <Button
            variant="contained"
            fullWidth
            onClick={checkServerHealth}
            startIcon={<RefreshCw size={18} />}
            sx={{
              py: 1.2,
              background: 'linear-gradient(135deg, #00D2FF 0%, #8B5CF6 100%)',
              color: '#FFFFFF',
              fontWeight: 700,
              borderRadius: 3,
            }}
          >
            Tentar Reconectar
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
};
