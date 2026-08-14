import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Tabs,
  Tab,
  IconButton,
  CircularProgress,
  Divider,
  Paper,
  InputAdornment,
} from '@mui/material';
import {
  X,
  Ticket,
  User as UserIcon,
  Calendar,
  QrCode,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useAuth, PRESET_USERS } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { useSnackbar } from 'notistack';
import { getErrorMessage } from '../../api/client';
import { isValidEmail, isValidPassword } from '../../utils/security';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  initialTab?: 0 | 1; // 0 = Login, 1 = Register
}

export const AuthModal: React.FC<AuthModalProps> = ({
  open,
  onClose,
  initialTab = 0,
}) => {
  const [tab, setTab] = useState<number>(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('CLIENT');

  // Field validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setTab(initialTab);
      setErrors({});
    }
  }, [open, initialTab]);

  const { login, register, quickLogin } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
    setErrors({});
  };

  const validateLoginForm = () => {
    const errs: Record<string, string> = {};
    if (!email.trim()) {
      errs.email = 'Informe seu e-mail';
    } else if (!isValidEmail(email)) {
      errs.email = 'Formato de e-mail inválido';
    }
    if (!password) {
      errs.password = 'Informe sua senha';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateRegisterForm = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) {
      errs.name = 'Informe seu nome completo';
    }
    if (!email.trim()) {
      errs.email = 'Informe seu e-mail';
    } else if (!isValidEmail(email)) {
      errs.email = 'Formato de e-mail inválido';
    }
    const passCheck = isValidPassword(password);
    if (!passCheck.valid) {
      errs.password = passCheck.message || 'Senha inválida';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLoginForm()) return;

    setLoading(true);
    try {
      await login({ email: email.trim(), password });
      enqueueSnackbar('Bem-vindo de volta ao EventPass!', { variant: 'success' });
      onClose();
    } catch (err) {
      enqueueSnackbar(getErrorMessage(err, 'Falha no login. Verifique seu e-mail e senha.'), {
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRegisterForm()) return;

    setLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });
      enqueueSnackbar('Conta criada com sucesso! Você já está autenticado.', { variant: 'success' });
      onClose();
    } catch (err) {
      enqueueSnackbar(getErrorMessage(err, 'Não foi possível cadastrar a conta.'), {
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPresetLogin = async (presetKey: keyof typeof PRESET_USERS) => {
    setLoading(true);
    try {
      await quickLogin(presetKey);
      enqueueSnackbar(`Autenticado como ${PRESET_USERS[presetKey].label}!`, { variant: 'success' });
      onClose();
    } catch (err) {
      enqueueSnackbar(getErrorMessage(err, 'Falha ao autenticar usuário pré-cadastrado.'), {
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#121927',
          border: '1px solid #1E293B',
          borderRadius: 4,
          p: 1,
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
        },
      }}
    >
      <DialogContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
        {/* Header & Logo */}
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
                boxShadow: '0 4px 10px rgba(0, 210, 255, 0.3)',
              }}
            >
              <Ticket size={20} color="#FFFFFF" />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF' }}>
              EventPass
            </Typography>
          </Stack>
          <IconButton onClick={onClose} size="small" sx={{ color: '#94A3B8' }}>
            <X size={20} />
          </IconButton>
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2.5, color: '#F8FAFC' }}>
          {tab === 0 ? 'Acesse sua conta' : 'Criar nova conta'}
        </Typography>

        {/* Tab Switcher */}
        <Paper
          sx={{
            backgroundColor: '#0A0F1D',
            p: 0.5,
            borderRadius: 3,
            mb: 3,
            border: '1px solid #1E293B',
          }}
        >
          <Tabs
            value={tab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              minHeight: 40,
              '& .MuiTabs-indicator': { display: 'none' },
              '& .MuiTab-root': {
                minHeight: 40,
                borderRadius: 2.5,
                fontWeight: 600,
                fontSize: '0.9rem',
                color: '#94A3B8',
                '&.Mui-selected': {
                  backgroundColor: '#1E293B',
                  color: '#FFFFFF',
                },
              },
            }}
          >
            <Tab label="Entrar" />
            <Tab label="Criar Conta" />
          </Tabs>
        </Paper>

        {/* Login Form */}
        {tab === 0 && (
          <Box component="form" onSubmit={handleLoginSubmit} noValidate>
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, mb: 0.75, display: 'block' }}>
                  E-mail
                </Typography>
                <TextField
                  fullWidth
                  placeholder="seu.email@exemplo.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={!!errors.email}
                  helperText={errors.email}
                  disabled={loading}
                />
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, mb: 0.75, display: 'block' }}>
                  Senha
                </Typography>
                <TextField
                  fullWidth
                  placeholder="••••••••"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={!!errors.password}
                  helperText={errors.password}
                  disabled={loading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                          sx={{ color: '#64748B' }}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                endIcon={loading ? <CircularProgress size={18} color="inherit" /> : <ArrowRight size={18} />}
                sx={{
                  py: 1.5,
                  mt: 1,
                  fontSize: '1rem',
                }}
              >
                {loading ? 'Entrando...' : 'Entrar na Plataforma'}
              </Button>
            </Stack>
          </Box>
        )}

        {/* Register Form */}
        {tab === 1 && (
          <Box component="form" onSubmit={handleRegisterSubmit} noValidate>
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, mb: 0.5, display: 'block' }}>
                  Nome completo
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Ex: Ana Souza"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  error={!!errors.name}
                  helperText={errors.name}
                  disabled={loading}
                />
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, mb: 0.5, display: 'block' }}>
                  E-mail
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="ana.souza@mail.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={!!errors.email}
                  helperText={errors.email}
                  disabled={loading}
                />
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, mb: 0.5, display: 'block' }}>
                  Senha (mínimo 6 caracteres)
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="••••••••"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={!!errors.password}
                  helperText={errors.password}
                  disabled={loading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                          sx={{ color: '#64748B' }}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {/* Role Selection Cards */}
              <Box>
                <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, mb: 1, display: 'block' }}>
                  Selecione seu perfil
                </Typography>
                <Stack direction="row" spacing={1}>
                  {[
                    { key: 'CLIENT', label: 'Cliente', icon: UserIcon },
                    { key: 'ORGANIZER', label: 'Organizador', icon: Calendar },
                    { key: 'PORTER', label: 'Validador', icon: QrCode },
                  ].map((item) => {
                    const IconComp = item.icon;
                    const isSelected = role === item.key;
                    return (
                      <Box
                        key={item.key}
                        onClick={() => setRole(item.key as UserRole)}
                        sx={{
                          flex: 1,
                          py: 1.5,
                          px: 1,
                          borderRadius: 2.5,
                          backgroundColor: isSelected ? '#1A2234' : '#0F172A',
                          border: isSelected ? '1.5px solid #8B5CF6' : '1px solid #1E293B',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 0.75,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            borderColor: '#8B5CF6',
                          },
                        }}
                      >
                        <IconComp size={20} color={isSelected ? '#00D2FF' : '#94A3B8'} />
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: isSelected ? 700 : 500,
                            color: isSelected ? '#FFFFFF' : '#94A3B8',
                          }}
                        >
                          {item.label}
                        </Typography>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                endIcon={loading ? <CircularProgress size={18} color="inherit" /> : <ArrowRight size={18} />}
                sx={{
                  py: 1.5,
                  mt: 1,
                  fontSize: '1rem',
                }}
              >
                {loading ? 'Cadastrando...' : 'Criar Conta'}
              </Button>
            </Stack>
          </Box>
        )}

        {/* Quick Test Accounts Helper */}
        <Divider sx={{ my: 3, borderColor: '#1E293B' }}>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Sparkles size={14} color="#00D2FF" />
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
              ACESSO RÁPIDO PARA TESTES
            </Typography>
          </Stack>
        </Divider>

        <Stack spacing={1}>
          <Typography variant="caption" sx={{ color: '#94A3B8', textAlign: 'center', display: 'block' }}>
            Clique em um perfil pré-configurado para logar instantaneamente:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap justifyContent="center">
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleQuickPresetLogin('CLIENT_1')}
              disabled={loading}
              sx={{ borderColor: '#1E293B', color: '#00D2FF', fontSize: '0.75rem', py: 0.5 }}
            >
              João Silva (Cliente)
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleQuickPresetLogin('CLIENT_2')}
              disabled={loading}
              sx={{ borderColor: '#1E293B', color: '#00D2FF', fontSize: '0.75rem', py: 0.5 }}
            >
              Ana Oliveira (Cliente)
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleQuickPresetLogin('ORGANIZER')}
              disabled={loading}
              sx={{ borderColor: '#1E293B', color: '#8B5CF6', fontSize: '0.75rem', py: 0.5 }}
            >
              Maria Souza (Organizadora)
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleQuickPresetLogin('PORTER')}
              disabled={loading}
              sx={{ borderColor: '#1E293B', color: '#10B981', fontSize: '0.75rem', py: 0.5 }}
            >
              Lucas Porteiro
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};
