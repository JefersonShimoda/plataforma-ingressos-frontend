import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Checkbox,
  Avatar,
  Typography,
  Box,
  CircularProgress,
  IconButton,
  Stack,
  Chip,
} from '@mui/material';
import { X, QrCode, UserCheck, Shield } from 'lucide-react';
import { authApi } from '../../api/auth';
import { eventsApi } from '../../api/events';
import { PorterUser, Event } from '../../types';
import { useSnackbar } from 'notistack';
import { getErrorMessage } from '../../api/client';

interface AssignPortersDialogProps {
  open: boolean;
  onClose: () => void;
  event: Event | null;
  onSuccess?: () => void;
}

export const AssignPortersDialog: React.FC<AssignPortersDialogProps> = ({
  open,
  onClose,
  event,
  onSuccess,
}) => {
  const [porters, setPorters] = useState<PorterUser[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (open && event) {
      loadPortersData();
    }
  }, [open, event]);

  const loadPortersData = async () => {
    if (!event) return;
    setLoading(true);
    try {
      const [allPorters, currentAssigned] = await Promise.all([
        authApi.getPorters().catch(() => []),
        eventsApi.getPortersForEvent(event.id).catch(() => []),
      ]);

      setPorters(allPorters);
      setSelectedIds(currentAssigned.map((p) => p.id));
    } catch (err) {
      enqueueSnackbar(getErrorMessage(err, 'Erro ao carregar lista de porteiros.'), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (porterId: number) => {
    setSelectedIds((prev) =>
      prev.includes(porterId) ? prev.filter((id) => id !== porterId) : [...prev, porterId]
    );
  };

  const handleSave = async () => {
    if (!event) return;
    setSaving(true);
    try {
      await eventsApi.assignPortersToEvent(event.id, selectedIds);
      enqueueSnackbar('Equipe de portaria escalada com sucesso!', { variant: 'success' });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      enqueueSnackbar(getErrorMessage(err, 'Falha ao salvar escala de portaria.'), { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#121927',
          border: '1px solid #1E293B',
          borderRadius: 4,
          p: 1,
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Shield size={20} color="#10B981" />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2 }}>
              Escalar Equipe de Portaria
            </Typography>
            <Typography variant="caption" sx={{ color: '#94A3B8' }}>
              Evento: {event?.title}
            </Typography>
          </Box>
        </Stack>

        <IconButton onClick={onClose} size="small" sx={{ color: '#64748B' }}>
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ py: 2 }}>
        <Typography variant="body2" sx={{ color: '#94A3B8', mb: 2 }}>
          Selecione os porteiros e validadores credenciados que terão acesso para escanear ingressos deste evento:
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : porters.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center', backgroundColor: '#0F172A', borderRadius: 3 }}>
            <Typography variant="body2" sx={{ color: '#94A3B8' }}>
              Nenhum porteiro cadastrado no sistema no momento.
            </Typography>
          </Box>
        ) : (
          <List sx={{ backgroundColor: '#0F172A', borderRadius: 3, border: '1px solid #1E293B', p: 1 }}>
            {porters.map((porter) => {
              const isChecked = selectedIds.includes(porter.id);
              return (
                <ListItem
                  key={porter.id}
                  onClick={() => handleToggle(porter.id)}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: '#1A2333' },
                  }}
                  secondaryAction={
                    <Checkbox
                      edge="end"
                      checked={isChecked}
                      sx={{ color: '#64748B', '&.Mui-checked': { color: '#10B981' } }}
                    />
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: isChecked ? '#10B981' : '#334155', color: '#FFFFFF', fontWeight: 700 }}>
                      {porter.name.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#FFFFFF' }}>
                        {porter.name}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                        {porter.email} • ID #{porter.id}
                      </Typography>
                    }
                  />
                </ListItem>
              );
            })}
          </List>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 1 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderColor: '#1E293B', color: '#94A3B8' }}>
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={saving || loading}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <UserCheck size={18} />}
          sx={{ background: 'linear-gradient(135deg, #00D2FF 0%, #8B5CF6 100%)' }}
        >
          {saving ? 'Salvando...' : `Salvar Escala (${selectedIds.length} porteiros)`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
