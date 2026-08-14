import React, { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  Grid,
  Stack,
  Button,
  TextField,
  Radio,
  CircularProgress,
  InputAdornment,
  Divider,
  alpha,
} from '@mui/material';
import {
  QrCode,
  CreditCard,
  Barcode,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { PaymentMethod, PaymentStatus } from '../../types';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../context/AuthContext';

interface PaymentSimulationProps {
  reservationId: number;
  totalAmount: number;
  onSimulatePayment: (method: PaymentMethod, status: PaymentStatus) => Promise<void>;
  loading?: boolean;
}

export const PaymentSimulation: React.FC<PaymentSimulationProps> = ({
  reservationId,
  totalAmount,
  onSimulatePayment,
  loading = false,
}) => {
  const { user } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('PIX');
  const [copiedPix, setCopiedPix] = useState(false);
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8829');
  const [cardHolder, setCardHolder] = useState(() => (user?.name ? user.name.toUpperCase() : 'CLIENTE'));
  const [cardExpiry, setCardExpiry] = useState('12/29');
  const [cardCvv, setCardCvv] = useState('882');

  const { enqueueSnackbar } = useSnackbar();

  // Simulated Pix Payload
  const pixPayload = `00020126580014br.gov.bcb.pix0136eventpass-res-${reservationId}-checkout520400005303986540${totalAmount.toFixed(2)}5802BR5913EVENTPASS LTDA6009SAO PAULO62070503***6304ABCD`;

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixPayload);
    setCopiedPix(true);
    enqueueSnackbar('Código PIX Copia-e-Cola copiado para a área de transferência!', { variant: 'success' });
    setTimeout(() => setCopiedPix(false), 3000);
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#FFFFFF' }}>
        Método de Pagamento
      </Typography>

      {/* Payment Method Selector Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* PIX Option */}
        <Grid item xs={12} sm={4}>
          <Paper
            onClick={() => setSelectedMethod('PIX')}
            sx={{
              p: 2,
              borderRadius: 3,
              backgroundColor: selectedMethod === 'PIX' ? '#162032' : '#0F172A',
              border: `1.5px solid ${selectedMethod === 'PIX' ? '#00D2FF' : '#1E293B'}`,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%',
              transition: 'all 0.2s ease',
              '&:hover': { borderColor: '#00D2FF' },
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <QrCode size={24} color="#00D2FF" />
              <Radio
                checked={selectedMethod === 'PIX'}
                sx={{ p: 0, color: '#64748B', '&.Mui-checked': { color: '#00D2FF' } }}
              />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
                Pix
              </Typography>
              <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 700, display: 'block' }}>
                APROVAÇÃO IMEDIATA
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Credit Card Option */}
        <Grid item xs={12} sm={4}>
          <Paper
            onClick={() => setSelectedMethod('CREDIT_CARD')}
            sx={{
              p: 2,
              borderRadius: 3,
              backgroundColor: selectedMethod === 'CREDIT_CARD' ? '#162032' : '#0F172A',
              border: `1.5px solid ${selectedMethod === 'CREDIT_CARD' ? '#00D2FF' : '#1E293B'}`,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%',
              transition: 'all 0.2s ease',
              '&:hover': { borderColor: '#00D2FF' },
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <CreditCard size={24} color="#8B5CF6" />
              <Radio
                checked={selectedMethod === 'CREDIT_CARD'}
                sx={{ p: 0, color: '#64748B', '&.Mui-checked': { color: '#00D2FF' } }}
              />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
                Cartão de Crédito
              </Typography>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, display: 'block' }}>
                ATÉ 12X COM JUROS
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Boleto Option */}
        <Grid item xs={12} sm={4}>
          <Paper
            onClick={() => setSelectedMethod('BOLETO')}
            sx={{
              p: 2,
              borderRadius: 3,
              backgroundColor: selectedMethod === 'BOLETO' ? '#162032' : '#0F172A',
              border: `1.5px solid ${selectedMethod === 'BOLETO' ? '#00D2FF' : '#1E293B'}`,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%',
              transition: 'all 0.2s ease',
              '&:hover': { borderColor: '#00D2FF' },
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Barcode size={24} color="#94A3B8" />
              <Radio
                checked={selectedMethod === 'BOLETO'}
                sx={{ p: 0, color: '#64748B', '&.Mui-checked': { color: '#00D2FF' } }}
              />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
                Boleto Bancário
              </Typography>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, display: 'block' }}>
                ATÉ 3 DIAS ÚTEIS
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Dynamic Details Box for Selected Method */}
      <Paper
        sx={{
          p: { xs: 2.5, sm: 3.5 },
          borderRadius: 4,
          backgroundColor: '#0F172A',
          border: '1px dashed #1E293B',
          mb: 4,
        }}
      >
        {selectedMethod === 'PIX' && (
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={3}
            alignItems="center"
            justifyContent="center"
          >
            <Box
              sx={{
                p: 2,
                backgroundColor: '#FFFFFF',
                borderRadius: 3,
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <QRCodeSVG value={pixPayload} size={150} />
            </Box>

            <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#FFFFFF', mb: 0.5 }}>
                Escaneie o QR Code
              </Typography>
              <Typography variant="body2" sx={{ color: '#94A3B8', mb: 2, fontSize: '0.875rem' }}>
                Abra o aplicativo do seu banco, escolha a opção PIX e aponte a câmera. O pagamento será processado em instantes.
              </Typography>
              <Button
                variant="outlined"
                onClick={handleCopyPix}
                startIcon={copiedPix ? <Check size={16} /> : <Copy size={16} />}
                sx={{
                  borderColor: '#1E293B',
                  color: '#00D2FF',
                  '&:hover': { borderColor: '#00D2FF', backgroundColor: 'rgba(0, 210, 255, 0.08)' },
                }}
              >
                {copiedPix ? 'Código Pix Copiado!' : 'Copiar Código Pix'}
              </Button>
            </Box>
          </Stack>
        )}

        {selectedMethod === 'CREDIT_CARD' && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, mb: 0.5, display: 'block' }}>
                Número do Cartão
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="4532 0000 0000 8829"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, mb: 0.5, display: 'block' }}>
                Nome do Titular
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
                placeholder="Como no cartão"
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, mb: 0.5, display: 'block' }}>
                Validade
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={cardExpiry}
                onChange={(e) => setCardExpiry(e.target.value)}
                placeholder="MM/AA"
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, mb: 0.5, display: 'block' }}>
                CVV
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="password"
                value={cardCvv}
                onChange={(e) => setCardCvv(e.target.value)}
                placeholder="123"
              />
            </Grid>
          </Grid>
        )}

        {selectedMethod === 'BOLETO' && (
          <Box sx={{ textAlign: 'center', py: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#FFFFFF', mb: 1 }}>
              Boleto Bancário Registrado
            </Typography>
            <Typography variant="body2" sx={{ color: '#94A3B8', mb: 2, fontSize: '0.875rem' }}>
              Linha Digitável: 34191.79001 01043.510047 91020.150008 5 998200000{totalAmount.toFixed(0)}
            </Typography>
            <Button
              variant="outlined"
              onClick={() => {
                navigator.clipboard.writeText(`341917900101043510047910201500085998200000${totalAmount.toFixed(0)}`);
                enqueueSnackbar('Linha digitável copiada!', { variant: 'success' });
              }}
              startIcon={<Copy size={16} />}
              sx={{ borderColor: '#1E293B', color: '#00D2FF' }}
            >
              Copiar Código de Barras
            </Button>
          </Box>
        )}
      </Paper>

      {/* Test Environment Simulation Panel */}
      <Box sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
          <Sparkles size={16} color="#00D2FF" />
          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, letterSpacing: '0.08em' }}>
            PAINEL DE SIMULAÇÃO (AMBIENTE DE TESTES)
          </Typography>
        </Stack>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={() => onSimulatePayment(selectedMethod, 'APPROVED')}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <CheckCircle2 size={20} />}
              sx={{
                py: 1.5,
                borderColor: '#10B981',
                color: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                '&:hover': {
                  borderColor: '#34D399',
                  backgroundColor: 'rgba(16, 185, 129, 0.18)',
                  boxShadow: '0 0 16px rgba(16, 185, 129, 0.3)',
                },
              }}
            >
              Simular Pagamento APROVADO
            </Button>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={() => onSimulatePayment(selectedMethod, 'DECLINED')}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <XCircle size={20} />}
              sx={{
                py: 1.5,
                borderColor: '#EF4444',
                color: '#EF4444',
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                '&:hover': {
                  borderColor: '#F87171',
                  backgroundColor: 'rgba(239, 68, 68, 0.18)',
                  boxShadow: '0 0 16px rgba(239, 68, 68, 0.3)',
                },
              }}
            >
              Simular Pagamento RECUSADO
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};
