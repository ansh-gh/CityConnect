import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Skeleton,
  Alert,
  Stack
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Close,
  NotificationsActive
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { notificationService } from '../../services/notification.service';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Dialog States
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  // Form states
  const [currentNotification, setCurrentNotification] = useState(null);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [targetAudience, setTargetAudience] = useState('all');
  const [formErrors, setFormErrors] = useState({});

  const mockNotificationsData = [
    {
      id: 1,
      notification_id: 1,
      title: "Monsoon Drainage & Waterlogging Advisory",
      message: "Heavy rainfall predicted over the next 48 hours. Citizens are advised to avoid low-lying underpasses and report drainage blockages.",
      type: "warning",
      targetAudience: "all",
      createdAt: new Date(Date.now() - 2 * 3600000).toISOString()
    },
    {
      id: 2,
      notification_id: 2,
      title: "Scheduled Power Maintenance in Sector 5",
      message: "Substation upgrade work scheduled from 10:00 AM to 02:00 PM on Friday. Electricity supply will be temporarily paused.",
      type: "alert",
      targetAudience: "citizens",
      createdAt: new Date(Date.now() - 12 * 3600000).toISOString()
    },
    {
      id: 3,
      notification_id: 3,
      title: "Smart Parking & EV Charging Launch",
      message: "New automated EV fast-charging stations and sensor-enabled parking slots are now active at Central Mall Parking Zone.",
      type: "info",
      targetAudience: "all",
      createdAt: new Date(Date.now() - 24 * 3600000).toISOString()
    },
    {
      id: 4,
      notification_id: 4,
      title: "Public Cleanliness & Sanitation Drive",
      message: "Join the weekly municipal waste segregation and cleanliness drive this Sunday morning at City Central Park.",
      type: "info",
      targetAudience: "citizens",
      createdAt: new Date(Date.now() - 48 * 3600000).toISOString()
    }
  ];

  useEffect(() => {
    // Load mock notifications for preview mode
    setNotifications(mockNotificationsData);
    setLoading(false);
  }, []);

  const fetchNotifications = async () => {
    setNotifications((prev) => (prev.length > 0 ? prev : mockNotificationsData));
    setLoading(false);
  };

  const handleOpenCreate = () => {
    setTitle('');
    setMessage('');
    setType('info');
    setTargetAudience('all');
    setFormErrors({});
    setOpenCreate(true);
  };

  const handleOpenEdit = (n) => {
    setCurrentNotification(n);
    setTitle(n.title);
    setMessage(n.message);
    setType(n.type);
    setTargetAudience(n.targetAudience || 'all');
    setFormErrors({});
    setOpenEdit(true);
  };

  const handleOpenDelete = (n) => {
    setCurrentNotification(n);
    setOpenDelete(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!title.trim()) errors.title = 'Title is required.';
    if (!message.trim()) errors.message = 'Message content is required.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;
    const newNotice = {
      id: Date.now(),
      notification_id: Date.now(),
      title,
      message,
      type,
      targetAudience,
      createdAt: new Date().toISOString()
    };
    setNotifications((prev) => [newNotice, ...prev]);
    toast.success('Announcement broadcasted successfully (Mock Preview)!');
    setOpenCreate(false);
  };

  const handleEdit = async () => {
    if (!validateForm()) return;
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === currentNotification.id || n.notification_id === currentNotification.notification_id
          ? { ...n, title, message, type, targetAudience }
          : n
      )
    );
    toast.success('Announcement updated successfully (Mock Preview)!');
    setOpenEdit(false);
  };

  const handleDelete = async () => {
    setNotifications((prev) =>
      prev.filter((n) => n.id !== currentNotification.id && n.notification_id !== currentNotification.notification_id)
    );
    toast.success('Announcement deleted successfully (Mock Preview)!');
    setOpenDelete(false);
  };

  const getTypeStyle = (t) => {
    switch (t) {
      case 'alert':
        return { bg: '#EF444415', color: '#EF4444' };
      case 'warning':
        return { bg: '#F59E0B15', color: '#F59E0B' };
      default:
        return { bg: '#2563EB15', color: '#2563EB' };
    }
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#1E293B', mb: 1 }}>
            Municipal Announcements
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Poppins', color: '#64748B' }}>
            Broadcast notifications, alerts, and promotional announcements to city residents.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenCreate}
          sx={{
            py: 1,
            px: 2.5,
            borderRadius: '8px',
            backgroundColor: '#2563EB',
            textTransform: 'none',
            fontFamily: 'Poppins',
            fontWeight: 600,
            boxShadow: 'none',
            '&:hover': { backgroundColor: '#1D4ED8', boxShadow: 'none' }
          }}
        >
          New Announcement
        </Button>
      </Box>

      {/* Service Coming Soon Notice */}
      <Alert
        severity="info"
        icon={<NotificationsActive sx={{ color: '#2563EB' }} />}
        sx={{
          mb: 3,
          borderRadius: '12px',
          fontFamily: 'Poppins',
          backgroundColor: '#EFF6FF',
          color: '#1E40AF',
          border: '1px solid #BFDBFE',
          '& .MuiAlert-message': { width: '100%' }
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700, fontFamily: 'Poppins', color: '#1E3A8A' }}>
          🚀 Municipal Broadcast Services — Coming Soon!
        </Typography>
        <Typography variant="body2" sx={{ fontFamily: 'Poppins', fontSize: '13.5px', color: '#1E40AF', mt: 0.5 }}>
          Push notifications, SMS gateway broadcasts, and citizen channels are currently under development. Demonstrating mock announcement data below.
        </Typography>
      </Alert>

      {error && (
        <Alert severity="error" sx={{ borderRadius: '12px', mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Announcements Table */}
      <Card sx={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(15,23,42,.06)' }}>
        <TableContainer>
          <Table sx={{ minWidth: 800 }}>
            <TableHead sx={{ backgroundColor: '#F8FAFC' }}>
              <TableRow>
                <TableRow sx={{ display: 'none' }} />
                <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#64748B', width: 220 }}>Title</TableCell>
                <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#64748B' }}>Message Content</TableCell>
                <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#64748B', width: 100 }}>Type</TableCell>
                <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#64748B', width: 120 }}>Audience</TableCell>
                <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#64748B', width: 130 }}>Date Sent</TableCell>
                <TableCell align="right" sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#64748B', pr: 3, width: 110 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                [1, 2, 3].map((idx) => (
                  <TableRow key={idx}>
                    <TableCell><Skeleton variant="text" width={140} /></TableCell>
                    <TableCell><Skeleton variant="text" width={300} /></TableCell>
                    <TableCell><Skeleton variant="text" width={60} /></TableCell>
                    <TableCell><Skeleton variant="text" width={80} /></TableCell>
                    <TableCell><Skeleton variant="text" width={95} /></TableCell>
                    <TableCell align="right"><Skeleton variant="text" width={80} /></TableCell>
                  </TableRow>
                ))
              ) : notifications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ fontFamily: 'Poppins', py: 4, color: '#64748B' }}>
                    No announcements broadcasted yet. Click "New Announcement" to start.
                  </TableCell>
                </TableRow>
              ) : (
                notifications.map((n) => {
                  const tStyle = getTypeStyle(n.type);
                  return (
                    <TableRow key={n.id} hover>
                      <TableCell sx={{ fontFamily: 'Poppins', color: '#1E293B', fontWeight: 600, verticalAlign: 'top' }}>
                        {n.title}
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'Poppins', color: '#64748B', fontSize: '13px', lineHeight: 1.5 }}>
                        {n.message}
                      </TableCell>
                      <TableCell sx={{ verticalAlign: 'top' }}>
                        <Chip
                          label={n.type}
                          size="small"
                          sx={{
                            fontFamily: 'Poppins',
                            fontSize: '11px',
                            textTransform: 'capitalize',
                            backgroundColor: tStyle.bg,
                            color: tStyle.color,
                            borderRadius: '6px',
                            fontWeight: 500
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'Poppins', color: '#1E293B', textTransform: 'capitalize', verticalAlign: 'top' }}>
                        {n.targetAudience}
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'Poppins', color: '#64748B', verticalAlign: 'top' }}>
                        {n.createdAt ? n.createdAt.split('T')[0] : 'N/A'}
                      </TableCell>
                      <TableCell align="right" sx={{ pr: 2, verticalAlign: 'top' }}>
                        <IconButton onClick={() => handleOpenEdit(n)} size="small" sx={{ color: '#2563EB', mr: 0.5 }}>
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton onClick={() => handleOpenDelete(n)} size="small" sx={{ color: '#EF4444' }}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* CREATE ANNOUNCEMENT DIALOG */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'Poppins', fontWeight: 600 }}>
          Broadcast New Announcement
          <IconButton onClick={() => setOpenCreate(false)} size="small"><Close /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              label="Notification Title"
              placeholder="e.g. Scheduled Road Closure"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={!!formErrors.title}
              helperText={formErrors.title}
              fullWidth
              slotProps={{ inputLabel: { style: { fontFamily: 'Poppins' } }, htmlInput: { style: { fontFamily: 'Poppins' } } }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />
            <TextField
              label="Message Body"
              placeholder="Detailed description of the broadcast message..."
              multiline
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              error={!!formErrors.message}
              helperText={formErrors.message}
              fullWidth
              slotProps={{ inputLabel: { style: { fontFamily: 'Poppins' } }, htmlInput: { style: { fontFamily: 'Poppins' } } }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />

            <Stack direction="row" spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ fontFamily: 'Poppins' }}>Notification Type</InputLabel>
                <Select
                  value={type}
                  label="Notification Type"
                  onChange={(e) => setType(e.target.value)}
                  sx={{ borderRadius: '8px', fontFamily: 'Poppins' }}
                >
                  <MenuItem value="info" sx={{ fontFamily: 'Poppins' }}>Information</MenuItem>
                  <MenuItem value="warning" sx={{ fontFamily: 'Poppins' }}>Warning</MenuItem>
                  <MenuItem value="alert" sx={{ fontFamily: 'Poppins' }}>Critical Alert</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel sx={{ fontFamily: 'Poppins' }}>Target Audience</InputLabel>
                <Select
                  value={targetAudience}
                  label="Target Audience"
                  onChange={(e) => setTargetAudience(e.target.value)}
                  sx={{ borderRadius: '8px', fontFamily: 'Poppins' }}
                >
                  <MenuItem value="all" sx={{ fontFamily: 'Poppins' }}>All Citizens</MenuItem>
                  <MenuItem value="citizens" sx={{ fontFamily: 'Poppins' }}>Citizens Only</MenuItem>
                  <MenuItem value="operators" sx={{ fontFamily: 'Poppins' }}>Operators Only</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenCreate(false)} sx={{ fontFamily: 'Poppins', textTransform: 'none', color: '#64748B' }}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} sx={{ fontFamily: 'Poppins', textTransform: 'none', backgroundColor: '#2563EB', '&:hover': { backgroundColor: '#1D4ED8' } }}>Send Broadcast</Button>
        </DialogActions>
      </Dialog>

      {/* EDIT ANNOUNCEMENT DIALOG */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'Poppins', fontWeight: 600 }}>
          Edit Announcement
          <IconButton onClick={() => setOpenEdit(false)} size="small"><Close /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              label="Notification Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={!!formErrors.title}
              helperText={formErrors.title}
              fullWidth
              slotProps={{ inputLabel: { style: { fontFamily: 'Poppins' } }, htmlInput: { style: { fontFamily: 'Poppins' } } }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />
            <TextField
              label="Message Body"
              multiline
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              error={!!formErrors.message}
              helperText={formErrors.message}
              fullWidth
              slotProps={{ inputLabel: { style: { fontFamily: 'Poppins' } }, htmlInput: { style: { fontFamily: 'Poppins' } } }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />

            <Stack direction="row" spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ fontFamily: 'Poppins' }}>Notification Type</InputLabel>
                <Select
                  value={type}
                  label="Notification Type"
                  onChange={(e) => setType(e.target.value)}
                  sx={{ borderRadius: '8px', fontFamily: 'Poppins' }}
                >
                  <MenuItem value="info" sx={{ fontFamily: 'Poppins' }}>Information</MenuItem>
                  <MenuItem value="warning" sx={{ fontFamily: 'Poppins' }}>Warning</MenuItem>
                  <MenuItem value="alert" sx={{ fontFamily: 'Poppins' }}>Critical Alert</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel sx={{ fontFamily: 'Poppins' }}>Target Audience</InputLabel>
                <Select
                  value={targetAudience}
                  label="Target Audience"
                  onChange={(e) => setTargetAudience(e.target.value)}
                  sx={{ borderRadius: '8px', fontFamily: 'Poppins' }}
                >
                  <MenuItem value="all" sx={{ fontFamily: 'Poppins' }}>All Citizens</MenuItem>
                  <MenuItem value="citizens" sx={{ fontFamily: 'Poppins' }}>Citizens Only</MenuItem>
                  <MenuItem value="operators" sx={{ fontFamily: 'Poppins' }}>Operators Only</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenEdit(false)} sx={{ fontFamily: 'Poppins', textTransform: 'none', color: '#64748B' }}>Cancel</Button>
          <Button variant="contained" onClick={handleEdit} sx={{ fontFamily: 'Poppins', textTransform: 'none', backgroundColor: '#2563EB', '&:hover': { backgroundColor: '#1D4ED8' } }}>Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* DELETE CONFIRM */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>Delete Announcement</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontFamily: 'Poppins', color: '#64748B' }}>
            Are you sure you want to delete the announcement <strong>{currentNotification?.title}</strong>? This action cannot be undone and will retract it from users' feeds.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenDelete(false)} sx={{ fontFamily: 'Poppins', textTransform: 'none', color: '#64748B' }}>Cancel</Button>
          <Button variant="contained" onClick={handleDelete} sx={{ fontFamily: 'Poppins', textTransform: 'none', backgroundColor: '#EF4444', '&:hover': { backgroundColor: '#DC2626' } }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Notifications;
