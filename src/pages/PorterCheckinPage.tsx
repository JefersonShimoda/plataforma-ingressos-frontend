import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  TextField,
  MenuItem,
  Select,
  FormControl,
  LinearProgress,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import {
  Camera,
  Keyboard,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  QrCode,
  RefreshCw,
  CameraOff,
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { checkinApi } from '../api/checkin';
import { eventsApi } from '../api/events';
import { Event, CheckinResponse, CheckinStats } from '../types';
import { formatDateTime } from '../utils/formatters';
import { useSnackbar } from 'notistack';
import { getErrorMessage } from '../api/client';

export const PorterCheckinPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialEventId = searchParams.get('eventId');
  const initialToken = searchParams.get('token') || '';
  const autoValidate = searchParams.get('auto') === 'true';

  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | ''>(
    initialEventId ? parseInt(initialEventId, 10) : ''
  );
  const [stats, setStats] = useState<CheckinStats | null>(null);
  const [manualCode, setManualCode] = useState(initialToken);
  const [validating, setValidating] = useState(false);
  const [lastResult, setLastResult] = useState<CheckinResponse | null>(null);
  const [scannerActive, setScannerActive] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isProcessingQr = useRef<boolean>(false);
  const autoValidatedRef = useRef<boolean>(false);

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    loadEvents();
    return () => {
      stopCameraScanner();
    };
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      loadStats(selectedEventId);
      setSearchParams({ eventId: selectedEventId.toString() });
    }
  }, [selectedEventId]);

  const loadEvents = async () => {
    try {
      const data = await eventsApi.getEvents();
      setEvents(data);
      if (!selectedEventId && data.length > 0) {
        setSelectedEventId(data[0].id);
      }
    } catch (err) {
      console.error(err);
      enqueueSnackbar('Erro ao carregar lista de eventos.', { variant: 'error' });
    }
  };

  const loadStats = async (eventId: number) => {
    try {
      const statsData = await checkinApi.getCheckinStats(eventId);
      setStats(statsData);
    } catch (err: any) {
      const ev = events.find((e) => e.id === eventId);
      setStats({
        eventId: eventId,
        eventTitle: ev?.title || '',
        totalTicketsSold: 0,
        checkedInCount: 0,
        pendingCount: 0,
      });

      const statusCode = err?.response?.status;
      if (statusCode === 403) {
        enqueueSnackbar('Acesso restrito: Você não tem permissão para visualizar as estatísticas deste evento (não escalado como porteiro nem organizador responsável).', {
          variant: 'warning',
        });
      } else {
        console.error('Erro ao carregar estatísticas de check-in:', err);
      }
    }
  };

  const startCameraScanner = async () => {
    setScannerError(null);
    try {
      const element = document.getElementById('qr-reader');
      if (!element) return;

      if (scannerRef.current) {
        await scannerRef.current.stop().catch(() => {});
      }

      const html5QrCode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          if (!isProcessingQr.current) {
            isProcessingQr.current = true;
            handleValidateCode(decodedText);
            setTimeout(() => {
              isProcessingQr.current = false;
            }, 2500);
          }
        },
        () => {}
      );

      setScannerActive(true);
    } catch (err) {
      console.error('Falha ao iniciar leitor de câmera:', err);
      setScannerError('Não foi possível acessar a câmera. Use a digitação manual de código.');
      setScannerActive(false);
    }
  };

  const stopCameraScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {
        // ignore
      }
      scannerRef.current = null;
    }
    setScannerActive(false);
  };

  const handleValidateCode = async (tokenToValidate: string) => {
    if (!selectedEventId) {
      enqueueSnackbar('Selecione um evento ativo antes de validar ingressos.', { variant: 'warning' });
      return;
    }

    const cleanToken = tokenToValidate.trim();
    if (!cleanToken) return;

    setValidating(true);
    try {
      const response = await checkinApi.validateCheckin({
        eventId: Number(selectedEventId),
        qrCodeToken: cleanToken,
      });

      setLastResult(response);

      if (response.status === 'VALID') {
        enqueueSnackbar('🟢 Entrada Liberada com Sucesso!', { variant: 'success' });
      } else if (response.status === 'ALREADY_USED') {
        enqueueSnackbar('🔴 Ingresso Já Utilizado Anteriormente!', { variant: 'error' });
      } else if (response.status === 'WRONG_EVENT') {
        enqueueSnackbar('🟡 Ingresso Pertence a Outro Evento!', { variant: 'warning' });
      } else {
        enqueueSnackbar('❌ QR Code Inválido ou Adulterado!', { variant: 'error' });
      }

      loadStats(Number(selectedEventId));
    } catch (err) {
      const fallbackErrorMsg = getErrorMessage(err, 'Erro ao validar ingresso.');
      setLastResult({
        status: 'INVALID',
        message: fallbackErrorMsg,
        eventTitle: '',
      });
      enqueueSnackbar(fallbackErrorMsg, { variant: 'error' });
    } finally {
      setValidating(false);
      setManualCode('');
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleValidateCode(manualCode.trim());
    }
  };

  useEffect(() => {
    if (selectedEventId && initialToken && autoValidate && !autoValidatedRef.current) {
      autoValidatedRef.current = true;
      setManualCode(initialToken);
      handleValidateCode(initialToken);
    }
  }, [selectedEventId, initialToken, autoValidate]);

  const totalSold = stats?.totalTicketsSold ?? 0;
  const checkedIn = stats?.checkedInCount ?? 0;
  const pending = stats?.pendingCount ?? Math.max(0, totalSold - checkedIn);
  const presencePct = totalSold > 0 ? Math.round((checkedIn / totalSold) * 100) : 0;

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 2.5, sm: 4 }, pb: 10 }}>
      {/* Top Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #00D2FF 0%, #8B5CF6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <QrCode size={20} color="#FFFFFF" />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#FFFFFF' }}>
            Portaria & Check-in
          </Typography>
        </Stack>

        <IconButton onClick={() => selectedEventId && loadStats(Number(selectedEventId))} sx={{ color: '#00D2FF' }}>
          <RefreshCw size={18} />
        </IconButton>
      </Box>

      {/* Event Selector Dropdown */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3.5,
          backgroundColor: '#121927',
          border: '1px solid #1E293B',
        }}
      >
        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, display: 'block', mb: 0.5 }}>
          EVENTO ATIVO PARA VALIDAÇÃO
        </Typography>
        <FormControl fullWidth size="small">
          <Select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value as number)}
            displayEmpty
            sx={{
              backgroundColor: '#0F172A',
              fontWeight: 700,
              color: '#FFFFFF',
              borderRadius: 2.5,
            }}
          >
            {events.map((ev) => (
              <MenuItem key={ev.id} value={ev.id}>
                {ev.title} ({formatDateTime(ev.eventDate)})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {/* Camera Viewfinder */}
      <Paper
        sx={{
          p: 2,
          borderRadius: 4,
          backgroundColor: '#0F172A',
          border: '1px solid #1E293B',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          mb: 3,
        }}
      >
        <Box
          id="qr-reader"
          sx={{
            width: '100%',
            minHeight: scannerActive ? 280 : 0,
            borderRadius: 3,
            overflow: 'hidden',
            display: scannerActive ? 'block' : 'none',
          }}
        />

        {!scannerActive && (
          <Box
            sx={{
              height: 240,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              backgroundColor: '#070B14',
              borderRadius: 3,
              p: 3,
            }}
          >
            <Box
              sx={{
                width: 180,
                height: 180,
                border: '2px solid rgba(0, 210, 255, 0.4)',
                borderRadius: 3,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(0, 210, 255, 0.1)',
              }}
            >
              <Camera size={36} color="#00D2FF" />
            </Box>

            <Typography variant="caption" sx={{ color: '#94A3B8', mt: 2, fontWeight: 600 }}>
              Alinhe o QR Code na mira da câmera
            </Typography>
          </Box>
        )}

        <Box sx={{ mt: 2 }}>
          {scannerActive ? (
            <Button
              variant="outlined"
              color="error"
              onClick={stopCameraScanner}
              startIcon={<CameraOff size={18} />}
              sx={{ borderRadius: 3 }}
            >
              Desativar Câmera
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={startCameraScanner}
              startIcon={<Camera size={18} />}
              sx={{
                background: 'linear-gradient(135deg, #00D2FF 0%, #8B5CF6 100%)',
                borderRadius: 3,
                fontWeight: 700,
                px: 3,
              }}
            >
              Ativar Leitor de Câmera
            </Button>
          )}
        </Box>

        {scannerError && (
          <Alert severity="warning" sx={{ mt: 2, textAlign: 'left' }}>
            {scannerError}
          </Alert>
        )}
      </Paper>

      {/* Manual Code Input */}
      <Paper
        component="form"
        onSubmit={handleManualSubmit}
        sx={{
          p: 1,
          pl: 2,
          borderRadius: 3,
          backgroundColor: '#121927',
          border: '1px solid #1E293B',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 3,
        }}
      >
        <Keyboard size={20} color="#64748B" />
        <TextField
          variant="standard"
          placeholder="Código manual (Token do ingresso)..."
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value)}
          InputProps={{ disableUnderline: true }}
          sx={{ flex: 1 }}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={validating || !manualCode.trim()}
          sx={{
            backgroundColor: '#00D2FF',
            color: '#0B0F19',
            fontWeight: 800,
            px: 3,
            '&:hover': { backgroundColor: '#38BDF8' },
          }}
        >
          {validating ? <CircularProgress size={16} color="inherit" /> : 'CHECK'}
        </Button>
      </Paper>

      {/* 4 State Feedback Cards */}
      {lastResult && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, display: 'block', mb: 1 }}>
            RESULTADO DA VALIDAÇÃO
          </Typography>

          {lastResult.status === 'VALID' && (
            <Paper
              sx={{
                p: 2.5,
                borderRadius: 3.5,
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                border: '1.5px solid #10B981',
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.25)',
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2.5,
                    backgroundColor: '#10B981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                  }}
                >
                  <CheckCircle2 size={24} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#10B981', lineHeight: 1.1 }}>
                    ENTRADA LIBERADA!
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#FFFFFF', mt: 0.25 }}>
                    {lastResult.clientName || 'Cliente Autenticado'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#A7F3D0', display: 'block' }}>
                    {lastResult.seatNumber ? `Assento: Poltrona ${lastResult.seatNumber}` : 'Setor Pista Geral'} • ID #{lastResult.ticketId || 'OK'}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          )}

          {lastResult.status === 'ALREADY_USED' && (
            <Paper
              sx={{
                p: 2.5,
                borderRadius: 3.5,
                backgroundColor: 'rgba(245, 158, 11, 0.12)',
                border: '1.5px solid #F59E0B',
                boxShadow: '0 0 20px rgba(245, 158, 11, 0.25)',
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2.5,
                    backgroundColor: '#F59E0B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0B0F19',
                  }}
                >
                  <Clock size={24} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#F59E0B', lineHeight: 1.1 }}>
                    INGRESSO JÁ UTILIZADO
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#FFFFFF', mt: 0.25 }}>
                    Entrada registrada anteriormente às {lastResult.validatedAt ? formatDateTime(lastResult.validatedAt) : 'Horário não registrado'}.
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#FCD34D', display: 'block', mt: 0.25 }}>
                    Alerta de duplicidade de acesso ou QR code reutilizado.
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          )}

          {lastResult.status === 'WRONG_EVENT' && (
            <Paper
              sx={{
                p: 2.5,
                borderRadius: 3.5,
                backgroundColor: 'rgba(139, 92, 246, 0.15)',
                border: '1.5px solid #8B5CF6',
                boxShadow: '0 0 20px rgba(139, 92, 246, 0.25)',
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2.5,
                    backgroundColor: '#8B5CF6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                  }}
                >
                  <AlertTriangle size={24} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#A78BFA', lineHeight: 1.1 }}>
                    EVENTO INCORRETO
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#FFFFFF', mt: 0.25 }}>
                    Este ingresso pertence a outro evento: <strong>{lastResult.eventTitle || 'Outro Show/Filme'}</strong>.
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          )}

          {lastResult.status === 'INVALID' && (
            <Paper
              sx={{
                p: 2.5,
                borderRadius: 3.5,
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                border: '1.5px solid #EF4444',
                boxShadow: '0 0 20px rgba(239, 68, 68, 0.25)',
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2.5,
                    backgroundColor: '#EF4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                  }}
                >
                  <XCircle size={24} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#EF4444', lineHeight: 1.1 }}>
                    ACESSO NEGADO / QR CODE INVÁLIDO
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#CBD5E1', mt: 0.25 }}>
                    {lastResult.message || 'Código forjado, adulterado ou inexistente no banco de dados.'}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          )}
        </Box>
      )}

      {/* Presence Stats */}
      <Paper
        sx={{
          p: 3,
          borderRadius: 4,
          backgroundColor: '#121927',
          border: '1px solid #1E293B',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Box>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, letterSpacing: '0.05em' }}>
              PRESENÇA ATUAL EM TEMPO REAL
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#FFFFFF' }}>
              {checkedIn.toLocaleString('pt-BR')}{' '}
              <span style={{ fontSize: '1rem', color: '#64748B', fontWeight: 600 }}>
                / {totalSold.toLocaleString('pt-BR')}
              </span>
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#10B981' }}>
              {presencePct}%
            </Typography>
            <Typography variant="caption" sx={{ color: '#94A3B8' }}>
              {pending} faltantes
            </Typography>
          </Box>
        </Box>

        <LinearProgress
          variant="determinate"
          value={presencePct}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: '#1E293B',
            mb: 2,
            '& .MuiLinearProgress-bar': {
              background: 'linear-gradient(90deg, #00D2FF 0%, #8B5CF6 100%)',
              borderRadius: 4,
            },
          }}
        />

        <Stack direction="row" justifyContent="space-between" sx={{ color: '#94A3B8' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#00D2FF' }} />
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              Presentes ({checkedIn})
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#64748B' }} />
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              Faltantes ({pending})
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
};
