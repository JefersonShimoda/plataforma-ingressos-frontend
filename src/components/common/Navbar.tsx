import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Container,
  Box,
  Typography,
  InputBase,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  Stack,
  alpha,
} from '@mui/material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Ticket,
  Menu as MenuIcon,
  X,
  User as UserIcon,
  LogOut,
  Sparkles,
  Compass,
  CalendarPlus,
  BarChart3,
  QrCode,
} from 'lucide-react';
import { useAuth, PRESET_USERS } from '../../context/AuthContext';
export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, quickLogin, openAuthModal } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [presetAnchorEl, setPresetAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('query') || '';
    setSearchQuery(query);
  }, [location.search]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?query=${encodeURIComponent(searchQuery.trim())}`);
      setMobileDrawerOpen(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    const params = new URLSearchParams(location.search);
    params.delete('query');
    if (location.pathname === '/') {
      navigate(params.toString() ? `/?${params.toString()}` : '/');
    }
  };

  const handleOpenAuth = (tab: 0 | 1 = 0) => {
    openAuthModal(tab);
    setMobileDrawerOpen(false);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
    navigate('/');
  };

  const handleSwitchPreset = async (presetKey: keyof typeof PRESET_USERS) => {
    setPresetAnchorEl(null);
    setAnchorEl(null);
    setMobileDrawerOpen(false);
    await quickLogin(presetKey);
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'ORGANIZER':
        return 'Organizador';
      case 'PORTER':
        return 'Portaria';
      default:
        return 'Cliente';
    }
  };

  return (
    <>
      <AppBar
        position="sticky"
        sx={{
          backgroundColor: alpha('#0B0F19', 0.85),
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid #1E293B',
          boxShadow: 'none',
          zIndex: 1100,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 74 }, gap: { xs: 1.5, md: 3 } }}>
            {/* Brand Logo */}
            <Box
              component={RouterLink}
              to="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                textDecoration: 'none',
                flexShrink: 0,
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2.5,
                  background: 'linear-gradient(135deg, #00D2FF 0%, #8B5CF6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(0, 210, 255, 0.35)',
                }}
              >
                <Ticket size={22} color="#FFFFFF" />
              </Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  background: 'linear-gradient(180deg, #FFFFFF 0%, #E2E8F0 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: { xs: 'none', sm: 'block' },
                  letterSpacing: '-0.02em',
                }}
              >
                EventPass
              </Typography>
            </Box>

            {/* Global Search Bar */}
            <Box
              component="form"
              onSubmit={handleSearchSubmit}
              sx={{
                flex: { xs: 1, md: '0 1 420px' },
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#0F172A',
                border: '1px solid #1E293B',
                borderRadius: 3,
                px: 2,
                py: 0.5,
                transition: 'border-color 0.2s',
                '&:focus-within': {
                  borderColor: '#00D2FF',
                },
              }}
            >
              <Search size={18} color="#64748B" />
              <InputBase
                placeholder="Pesquisar shows, filmes, teatros..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                  ml: 1.5,
                  flex: 1,
                  fontSize: '0.875rem',
                  color: '#F8FAFC',
                  '& input::placeholder': {
                    color: '#64748B',
                    opacity: 1,
                  },
                }}
              />
              {searchQuery && (
                <IconButton
                  size="small"
                  onClick={handleClearSearch}
                  sx={{
                    color: '#64748B',
                    p: 0.5,
                    '&:hover': { color: '#FFFFFF' },
                  }}
                  title="Limpar busca"
                >
                  <X size={15} />
                </IconButton>
              )}
            </Box>

            {/* Desktop Navigation Links */}
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ display: { xs: 'none', md: 'flex' }, ml: 'auto' }}
            >
              <Button
                component={RouterLink}
                to="/"
                sx={{
                  color: location.pathname === '/' ? '#00D2FF' : '#94A3B8',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  '&:hover': { color: '#FFFFFF' },
                }}
              >
                Explorar
              </Button>

              {isAuthenticated && (!user || user.role === 'CLIENT') && (
                <Button
                  component={RouterLink}
                  to="/my-tickets"
                  sx={{
                    color: location.pathname === '/my-tickets' ? '#00D2FF' : '#94A3B8',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    '&:hover': { color: '#FFFFFF' },
                  }}
                >
                  Meus Ingressos
                </Button>
              )}

              {user?.role === 'ORGANIZER' && (
                <Button
                  component={RouterLink}
                  to="/organizer"
                  sx={{
                    color: location.pathname.startsWith('/organizer') ? '#8B5CF6' : '#94A3B8',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    '&:hover': { color: '#FFFFFF' },
                  }}
                >
                  Painel Produtor
                </Button>
              )}

              {(user?.role === 'PORTER' || user?.role === 'ORGANIZER') && (
                <Button
                  component={RouterLink}
                  to="/portaria"
                  sx={{
                    color: location.pathname.startsWith('/portaria') ? '#10B981' : '#94A3B8',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    '&:hover': { color: '#FFFFFF' },
                  }}
                >
                  Portaria
                </Button>
              )}
            </Stack>

            {/* Profile or Login Actions */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1.5 }}>
              {isAuthenticated && user ? (
                <>
                  <Box
                    onClick={handleProfileMenuOpen}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      p: 0.75,
                      pr: 2,
                      borderRadius: 3,
                      backgroundColor: '#121927',
                      border: '1px solid #1E293B',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: '#334155',
                        backgroundColor: '#162032',
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 34,
                        height: 34,
                        bgcolor: user.role === 'ORGANIZER' ? '#8B5CF6' : user.role === 'PORTER' ? '#10B981' : '#00D2FF',
                        color: '#0B0F19',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                      }}
                    >
                      {user.name.charAt(0)}
                    </Avatar>
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2, color: '#F8FAFC' }}>
                        {user.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#00D2FF', fontWeight: 600, fontSize: '0.7rem' }}>
                        {getRoleLabel(user.role)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Dropdown Menu */}
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleProfileMenuClose}
                    PaperProps={{
                      sx: {
                        backgroundColor: '#121927',
                        border: '1px solid #1E293B',
                        borderRadius: 3,
                        minWidth: 220,
                        mt: 1.5,
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                      },
                    }}
                  >
                    <Box sx={{ px: 2, py: 1.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
                        {user.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                        {user.email}
                      </Typography>
                      <Chip
                        label={user.role}
                        size="small"
                        sx={{
                          mt: 1,
                          height: 20,
                          fontSize: '0.65rem',
                          backgroundColor: alpha('#00D2FF', 0.1),
                          color: '#00D2FF',
                          border: '1px solid rgba(0, 210, 255, 0.2)',
                        }}
                      />
                    </Box>
                    <Divider sx={{ borderColor: '#1E293B' }} />

                    <MenuItem
                      component={RouterLink}
                      to="/my-tickets"
                      onClick={handleProfileMenuClose}
                      sx={{ py: 1, '&:hover': { backgroundColor: '#1A2333' } }}
                    >
                      <ListItemIcon sx={{ color: '#00D2FF' }}>
                        <Ticket size={18} />
                      </ListItemIcon>
                      <ListItemText primary="Meus Ingressos" />
                    </MenuItem>

                    {user.role === 'ORGANIZER' && (
                      <MenuItem
                        component={RouterLink}
                        to="/organizer"
                        onClick={handleProfileMenuClose}
                        sx={{ py: 1, '&:hover': { backgroundColor: '#1A2333' } }}
                      >
                        <ListItemIcon sx={{ color: '#8B5CF6' }}>
                          <BarChart3 size={18} />
                        </ListItemIcon>
                        <ListItemText primary="Painel do Produtor" />
                      </MenuItem>
                    )}

                    {(user.role === 'PORTER' || user.role === 'ORGANIZER') && (
                      <MenuItem
                        component={RouterLink}
                        to="/portaria"
                        onClick={handleProfileMenuClose}
                        sx={{ py: 1, '&:hover': { backgroundColor: '#1A2333' } }}
                      >
                        <ListItemIcon sx={{ color: '#10B981' }}>
                          <QrCode size={18} />
                        </ListItemIcon>
                        <ListItemText primary="Portaria & Scanner" />
                      </MenuItem>
                    )}

                    <Divider sx={{ borderColor: '#1E293B' }} />

                    {/* Quick switch accounts */}
                    <MenuItem
                      onClick={(e) => setPresetAnchorEl(e.currentTarget)}
                      sx={{ py: 1, color: '#FBBF24', '&:hover': { backgroundColor: '#1A2333' } }}
                    >
                      <ListItemIcon sx={{ color: '#FBBF24' }}>
                        <Sparkles size={18} />
                      </ListItemIcon>
                      <ListItemText primary="Trocar Perfil (Teste)" />
                    </MenuItem>

                    <MenuItem
                      onClick={handleLogout}
                      sx={{ py: 1, color: '#EF4444', '&:hover': { backgroundColor: alpha('#EF4444', 0.1) } }}
                    >
                      <ListItemIcon sx={{ color: '#EF4444' }}>
                        <LogOut size={18} />
                      </ListItemIcon>
                      <ListItemText primary="Sair da Conta" />
                    </MenuItem>
                  </Menu>

                  {/* Preset User Switch Submenu */}
                  <Menu
                    anchorEl={presetAnchorEl}
                    open={Boolean(presetAnchorEl)}
                    onClose={() => setPresetAnchorEl(null)}
                    PaperProps={{
                      sx: {
                        backgroundColor: '#121927',
                        border: '1px solid #1E293B',
                        borderRadius: 3,
                        minWidth: 200,
                      },
                    }}
                  >
                    <MenuItem onClick={() => handleSwitchPreset('CLIENT_1')}>
                      <ListItemText primary="João Silva (Cliente)" />
                    </MenuItem>
                    <MenuItem onClick={() => handleSwitchPreset('CLIENT_2')}>
                      <ListItemText primary="Ana Oliveira (Cliente)" />
                    </MenuItem>
                    <MenuItem onClick={() => handleSwitchPreset('ORGANIZER')}>
                      <ListItemText primary="Maria Souza (Organizadora)" />
                    </MenuItem>
                    <MenuItem onClick={() => handleSwitchPreset('PORTER')}>
                      <ListItemText primary="Lucas Porteiro" />
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Stack direction="row" spacing={1.5}>
                  <Button
                    variant="text"
                    onClick={() => handleOpenAuth(0)}
                    sx={{ color: '#F8FAFC', fontWeight: 600 }}
                  >
                    Entrar
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => handleOpenAuth(1)}
                    sx={{ px: 2.5 }}
                  >
                    Criar Conta
                  </Button>
                </Stack>
              )}
            </Box>

            {/* Mobile Hamburger Button */}
            <IconButton
              onClick={() => setMobileDrawerOpen(true)}
              sx={{ display: { xs: 'flex', md: 'none' }, color: '#F8FAFC', ml: 'auto' }}
            >
              <MenuIcon size={24} />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 290,
            backgroundColor: '#0B0F19',
            borderLeft: '1px solid #1E293B',
            p: 2.5,
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #00D2FF 0%, #8B5CF6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ticket size={18} color="#FFFFFF" />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF' }}>
              EventPass
            </Typography>
          </Stack>
          <IconButton onClick={() => setMobileDrawerOpen(false)} sx={{ color: '#94A3B8' }}>
            <X size={20} />
          </IconButton>
        </Box>

        {isAuthenticated && user && (
          <Box
            sx={{
              p: 2,
              mb: 3,
              borderRadius: 3,
              backgroundColor: '#121927',
              border: '1px solid #1E293B',
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
              <Avatar sx={{ width: 36, height: 36, bgcolor: '#00D2FF', color: '#0B0F19', fontWeight: 700 }}>
                {user.name.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
                  {user.name}
                </Typography>
                <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                  {user.email}
                </Typography>
              </Box>
            </Stack>
            <Chip
              label={user.role}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.65rem',
                backgroundColor: alpha('#00D2FF', 0.15),
                color: '#00D2FF',
              }}
            />
          </Box>
        )}

        <List sx={{ p: 0 }}>
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              component={RouterLink}
              to="/"
              onClick={() => setMobileDrawerOpen(false)}
              sx={{ borderRadius: 2, color: '#F8FAFC' }}
            >
              <ListItemIcon sx={{ color: '#00D2FF', minWidth: 38 }}>
                <Compass size={20} />
              </ListItemIcon>
              <ListItemText primary="Explorar Eventos" />
            </ListItemButton>
          </ListItem>

          {isAuthenticated && (!user || user.role === 'CLIENT') && (
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                component={RouterLink}
                to="/my-tickets"
                onClick={() => setMobileDrawerOpen(false)}
                sx={{ borderRadius: 2, color: '#F8FAFC' }}
              >
                <ListItemIcon sx={{ color: '#00D2FF', minWidth: 38 }}>
                  <Ticket size={20} />
                </ListItemIcon>
                <ListItemText primary="Meus Ingressos" />
              </ListItemButton>
            </ListItem>
          )}

          {user?.role === 'ORGANIZER' && (
            <>
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  component={RouterLink}
                  to="/organizer"
                  onClick={() => setMobileDrawerOpen(false)}
                  sx={{ borderRadius: 2, color: '#F8FAFC' }}
                >
                  <ListItemIcon sx={{ color: '#8B5CF6', minWidth: 38 }}>
                    <BarChart3 size={20} />
                  </ListItemIcon>
                  <ListItemText primary="Painel do Produtor" />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  component={RouterLink}
                  to="/organizer/events/new"
                  onClick={() => setMobileDrawerOpen(false)}
                  sx={{ borderRadius: 2, color: '#F8FAFC' }}
                >
                  <ListItemIcon sx={{ color: '#8B5CF6', minWidth: 38 }}>
                    <CalendarPlus size={20} />
                  </ListItemIcon>
                  <ListItemText primary="Criar Novo Evento" />
                </ListItemButton>
              </ListItem>
            </>
          )}

          {(user?.role === 'PORTER' || user?.role === 'ORGANIZER') && (
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                component={RouterLink}
                to="/portaria"
                onClick={() => setMobileDrawerOpen(false)}
                sx={{ borderRadius: 2, color: '#F8FAFC' }}
              >
                <ListItemIcon sx={{ color: '#10B981', minWidth: 38 }}>
                  <QrCode size={20} />
                </ListItemIcon>
                <ListItemText primary="Portaria & Scanner" />
              </ListItemButton>
            </ListItem>
          )}
        </List>

        <Divider sx={{ my: 3, borderColor: '#1E293B' }} />

        {/* Quick login / Switcher in mobile */}
        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, mb: 1.5, display: 'block' }}>
          TROCAR USUÁRIO DE TESTE
        </Typography>
        <Stack spacing={1} sx={{ mb: 3 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleSwitchPreset('CLIENT_1')}
            sx={{ justifyContent: 'flex-start', borderColor: '#1E293B', color: '#00D2FF' }}
          >
            João Silva (Cliente)
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleSwitchPreset('CLIENT_2')}
            sx={{ justifyContent: 'flex-start', borderColor: '#1E293B', color: '#00D2FF' }}
          >
            Ana Oliveira (Cliente)
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleSwitchPreset('ORGANIZER')}
            sx={{ justifyContent: 'flex-start', borderColor: '#1E293B', color: '#8B5CF6' }}
          >
            Maria Souza (Organizadora)
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleSwitchPreset('PORTER')}
            sx={{ justifyContent: 'flex-start', borderColor: '#1E293B', color: '#10B981' }}
          >
            Lucas Porteiro
          </Button>
        </Stack>

        {isAuthenticated ? (
          <Button
            fullWidth
            variant="outlined"
            color="error"
            onClick={handleLogout}
            startIcon={<LogOut size={18} />}
            sx={{ mt: 'auto' }}
          >
            Sair da Conta
          </Button>
        ) : (
          <Stack spacing={1.5} sx={{ mt: 'auto' }}>
            <Button fullWidth variant="outlined" onClick={() => handleOpenAuth(0)}>
              Entrar
            </Button>
            <Button fullWidth variant="contained" onClick={() => handleOpenAuth(1)}>
              Criar Conta
            </Button>
          </Stack>
        )}
      </Drawer>
    </>
  );
};
