import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  Grid,
  Skeleton,
  Alert,
  Stack
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  LocalParking,
  Dashboard as ZoneIcon,
  BookOnline,
  Close
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { parkingService } from '../../services/parking.service';

const Parking = () => {
  const [tabValue, setTabValue] = useState(0);
  const [zones, setZones] = useState([]);
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Dialog visibility states
  const [openZoneDialog, setOpenZoneDialog] = useState(false);
  const [openSlotDialog, setOpenSlotDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); 

  // Independent Form Mode Tracking States
  const [zoneEditMode, setZoneEditMode] = useState(false);
  const [slotEditMode, setSlotEditMode] = useState(false);
  const [currentZoneId, setCurrentZoneId] = useState(null);
  const [currentSlotId, setCurrentSlotId] = useState(null);
  
  const [zoneForm, setZoneForm] = useState({
    zone_name: '',
    location: '',
    latitude: '',
    longitude: '',
    total_slots: 0,
    hourly_rate: '',
    is_active: 1
  });

  const [slotForm, setSlotForm] = useState({
    zone_id: '',
    slot_code: '',
    slot_type: 'car',
    is_available: 1
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [zonesRes, slotsRes, bookingsRes] = await Promise.all([
        parkingService.getZones(),
        parkingService.getSlots(),
        parkingService.getBookings()
      ]);

      if (zonesRes.success) setZones(zonesRes.zones || zonesRes.data || []);
      if (slotsRes.success) setSlots(slotsRes.slots || slotsRes.data || []);
      if (bookingsRes.success) setBookings(bookingsRes.bookings || bookingsRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading parking modules.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Centralized Teardown Methods to keep state safe and clean
  const closeZoneDialog = () => {
    setOpenZoneDialog(false);
    setZoneEditMode(false);
    setCurrentZoneId(null);
    setZoneForm({
      zone_name: '',
      location: '',
      latitude: '',
      longitude: '',
      total_slots: 0,
      hourly_rate: '',
      is_active: 1
    });
    setFormErrors({});
  };

  const closeSlotDialog = () => {
    setOpenSlotDialog(false);
    setSlotEditMode(false);
    setCurrentSlotId(null);
    setSlotForm({
      zone_id: '',
      slot_code: '',
      slot_type: 'car',
      is_available: 1
    });
    setFormErrors({});
  };

  // Zone CRUD Operations
  const handleOpenAddZone = () => {
    setZoneEditMode(false);
    setCurrentZoneId(null);
    setZoneForm({
      zone_name: '',
      location: '',
      latitude: '',
      longitude: '',
      total_slots: 0,
      hourly_rate: '',
      is_active: 1
    });
    setFormErrors({});
    setOpenZoneDialog(true);
  };

  const handleOpenEditZone = (zone) => {
    setZoneEditMode(true);
    setCurrentZoneId(zone.id || zone.zone_id);
    setZoneForm({
      zone_name: zone.zone_name || '',
      location: zone.location || '',
      latitude: zone.latitude !== undefined && zone.latitude !== null ? zone.latitude.toString() : '',
      longitude: zone.longitude !== undefined && zone.longitude !== null ? zone.longitude.toString() : '',
      total_slots: zone.total_slots || 0,
      hourly_rate: zone.hourly_rate !== undefined && zone.hourly_rate !== null ? zone.hourly_rate.toString() : '',
      is_active: zone.is_active !== undefined ? zone.is_active : 1
    });
    setFormErrors({});
    setOpenZoneDialog(true);
  };

  const validateZoneForm = () => {
    const errors = {};
    if (!zoneForm.zone_name.trim()) errors.zone_name = 'Zone name is required.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveZone = async () => {
    if (!validateZoneForm()) return;
    try {
      const payload = {
        zone_name: zoneForm.zone_name,
        location: zoneForm.location,
        latitude: zoneForm.latitude ? Number(zoneForm.latitude) : null,
        longitude: zoneForm.longitude ? Number(zoneForm.longitude) : null,
        total_slots: Number(zoneForm.total_slots) || 0,
        hourly_rate: Number(zoneForm.hourly_rate) || 0.00,
        is_active: Number(zoneForm.is_active)
      };

      let response;
      if (zoneEditMode) {
        response = await parkingService.updateZone(currentZoneId, payload);
      } else {
        response = await parkingService.createZone(payload);
      }

      if (response.success) {
        toast.success(response.message || 'Zone saved successfully!');
        closeZoneDialog();
        fetchData();
      } else {
        toast.error(response.message || 'Failed to save zone.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving zone.');
    }
  };

  // Slot CRUD Operations
  const handleOpenAddSlot = () => {
    if (zones.length === 0) {
      toast.warn('Please create a parking zone first.');
      return;
    }
    setSlotEditMode(false);
    setCurrentSlotId(null);
    const defaultZoneId = zones[0]?.id || zones[0]?.zone_id || '';
    setSlotForm({
      zone_id: defaultZoneId,
      slot_code: '',
      slot_type: 'car',
      is_available: 1
    });
    setFormErrors({});
    setOpenSlotDialog(true);
  };

  const handleOpenEditSlot = (slot) => {
    setSlotEditMode(true);
    setCurrentSlotId(slot.id || slot.slot_id);
    setSlotForm({
      zone_id: slot.zone_id,
      slot_code: slot.slot_code,
      slot_type: slot.slot_type || 'car',
      is_available: slot.is_available !== undefined ? slot.is_available : 1
    });
    setFormErrors({});
    setOpenSlotDialog(true);
  };

  const validateSlotForm = () => {
    const errors = {};
    if (!slotForm.zone_id) errors.zone_id = 'Zone selection is required.';
    if (!slotForm.slot_code.trim()) errors.slot_code = 'Slot code is required.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveSlot = async () => {
    if (!validateSlotForm()) return;
    try {
      const payload = {
        zone_id: Number(slotForm.zone_id),
        slot_code: slotForm.slot_code,
        slot_type: slotForm.slot_type,
        is_available: Number(slotForm.is_available)
      };

      let response;
      if (slotEditMode) {
        response = await parkingService.updateSlot(currentSlotId, payload);
      } else {
        response = await parkingService.createSlot(payload);
      }

      if (response.success) {
        toast.success(response.message || `Slot ${slotEditMode ? 'updated' : 'created'} successfully!`);
        closeSlotDialog();
        fetchData();
      } else {
        toast.error(response.message || 'Failed to save slot.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving slot.');
    }
  };

  // Delete Actions
  const handleConfirmDelete = (type, id, name) => {
    setDeleteTarget({ type, id, name });
    setOpenDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      let response;
      if (deleteTarget.type === 'zone') {
        response = await parkingService.deleteZone(deleteTarget.id);
      } else {
        response = await parkingService.deleteSlot(deleteTarget.id);
      }

      if (response.success) {
        toast.success(response.message || `${deleteTarget.type === 'zone' ? 'Zone' : 'Slot'} deleted.`);
        setOpenDeleteDialog(false);
        fetchData();
      } else {
        toast.error(response.message || 'Deletion failed.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error occurred during deletion.');
    }
  };

  if (loading && zones.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="text" width={250} height={40} sx={{ mb: 4 }} />
        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: '12px' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#1E293B', mb: 1 }}>
            Parking Management
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Poppins', color: '#64748B' }}>
            Configure parking zones, monitor individual slots, and view user booking reservations.
          </Typography>
        </Box>
        {tabValue === 0 && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenAddZone}
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
            Add Zone
          </Button>
        )}
        {tabValue === 1 && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenAddSlot}
            disabled={zones.length === 0}
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
            Add Slot
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ borderRadius: '12px', mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: '#E5E7EB', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              fontFamily: 'Poppins',
              textTransform: 'none',
              fontWeight: 500,
              color: '#64748B',
              '&.Mui-selected': { color: '#2563EB' }
            },
            '& .MuiTabs-indicator': { backgroundColor: '#2563EB' }
          }}
        >
          <Tab icon={<ZoneIcon fontSize="small" />} iconPosition="start" label="Zones" />
          <Tab icon={<LocalParking fontSize="small" />} iconPosition="start" label="Slots" />
          <Tab icon={<BookOnline fontSize="small" />} iconPosition="start" label="Bookings" />
        </Tabs>
      </Box>

      {/* TAB PANELS */}

      {/* Zones Panel */}
      {tabValue === 0 && (
        <TableContainer component={Card} sx={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(15,23,42,.06)' }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#64748B', width: 90 }}>Zone ID</TableCell>
                <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#64748B' }}>Zone Name</TableCell>
                <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#64748B' }}>Location / Address</TableCell>
                <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#64748B' }}>Capacity</TableCell>
                <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#64748B' }}>Hourly Rate</TableCell>
                <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#64748B' }}>Status</TableCell>
                <TableCell align="right" sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#64748B', pr: 3 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {zones.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ fontFamily: 'Poppins', py: 4, color: '#64748B' }}>
                    No zones created yet. Click "Add Zone" to start.
                  </TableCell>
                </TableRow>
              ) : (
                zones.map((zone) => {
                  const targetZoneId = zone.id || zone.zone_id;
                  return (
                    <TableRow key={targetZoneId} hover>
                      <TableCell sx={{ fontFamily: 'Poppins', color: '#64748B', fontWeight: 500 }}>#{targetZoneId}</TableCell>
                      <TableCell sx={{ fontFamily: 'Poppins', color: '#1E293B', fontWeight: 600 }}>{zone.zone_name}</TableCell>
                      <TableCell sx={{ fontFamily: 'Poppins', color: '#64748B', fontSize: '13px' }}>
                        {zone.location || 'N/A'}
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'Poppins', color: '#1E293B', fontWeight: 500 }}>
                        {zone.total_slots || 0} slots
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'Poppins', color: '#2563EB', fontWeight: 600 }}>
                        ₹ {Number(zone.hourly_rate || 0).toFixed(2)}/hr
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={zone.is_active ? 'Active' : 'Inactive'}
                          size="small"
                          sx={{
                            fontFamily: 'Poppins',
                            fontSize: '11px',
                            backgroundColor: zone.is_active ? '#22C55E15' : '#EF444415',
                            color: zone.is_active ? '#22C55E' : '#EF4444',
                            fontWeight: 600,
                            borderRadius: '6px'
                          }}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ pr: 2 }}>
                        <IconButton onClick={() => handleOpenEditZone(zone)} size="small" sx={{ color: '#2563EB', mr: 1 }}>
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton onClick={() => handleConfirmDelete('zone', targetZoneId, zone.zone_name)} size="small" sx={{ color: '#EF4444' }}>
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
      )}

      {/* Slots Panel */}
      {tabValue === 1 && (
        <TableContainer component={Card} sx={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(15,23,42,.06)' }}>
          <Table sx={{ minWidth: 950 }}>
            <TableHead sx={{ backgroundColor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#64748B', width: 80 }}>Slot ID</TableCell>
                <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#64748B' }}>Zone (Zone ID)</TableCell>
                <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#64748B' }}>Slot Code</TableCell>
                <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#64748B' }}>Type</TableCell>
                <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#64748B' }}>Availability</TableCell>
                <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#64748B' }}>Created At</TableCell>
                <TableCell align="right" sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#64748B', pr: 3 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {slots.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ fontFamily: 'Poppins', py: 4, color: '#64748B' }}>
                    No slots created yet. Click "Add Slot" to start.
                  </TableCell>
                </TableRow>
              ) : (
                slots.map((slot) => {
                  const targetSlotId = slot.id || slot.slot_id;
                  const parentZone = zones.find((z) => (z.id || z.zone_id) === slot.zone_id);
                  const isAvailableFlag = slot.is_available !== undefined ? slot.is_available : 1;

                  return (
                    <TableRow key={targetSlotId} hover>
                      <TableCell sx={{ fontFamily: 'Poppins', color: '#64748B', fontWeight: 500 }}>#{targetSlotId}</TableCell>

                      <TableCell sx={{ fontFamily: 'Poppins', color: '#1E293B', fontWeight: 500 }}>
                        {parentZone?.zone_name || slot.zone_name || `Zone #${slot.zone_id}`}
                        <Typography variant="caption" sx={{ display: 'block', color: '#94A3B8' }}>
                          (ID: #{slot.zone_id})
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ fontFamily: 'Poppins', color: '#2563EB', fontWeight: 600 }}>{slot.slot_code}</TableCell>

                      <TableCell sx={{ fontFamily: 'Poppins', color: '#64748B', textTransform: 'uppercase', fontSize: '12px', fontWeight: 600 }}>
                        <Chip
                          label={slot.slot_type || 'car'}
                          size="small"
                          sx={{
                            fontFamily: 'Poppins',
                            fontSize: '11px',
                            textTransform: 'uppercase',
                            backgroundColor: '#F1F5F9',
                            color: '#334155',
                            fontWeight: 600,
                            borderRadius: '6px'
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={isAvailableFlag ? 'Enabled (1)' : 'Disabled (0)'}
                          size="small"
                          sx={{
                            fontFamily: 'Poppins',
                            fontSize: '11px',
                            backgroundColor: isAvailableFlag ? '#22C55E15' : '#EF444415',
                            color: isAvailableFlag ? '#22C55E' : '#EF4444',
                            fontWeight: 600,
                            borderRadius: '6px'
                          }}
                        />
                      </TableCell>

                      <TableCell sx={{ fontFamily: 'Poppins', color: '#64748B', fontSize: '13px' }}>
                        {slot.created_at ? new Date(slot.created_at).toLocaleDateString() : 'N/A'}
                      </TableCell>

                      <TableCell align="right" sx={{ pr: 2 }}>
                        <IconButton onClick={() => handleOpenEditSlot(slot)} size="small" sx={{ color: '#2563EB', mr: 1 }}>
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton onClick={() => handleConfirmDelete('slot', targetSlotId, slot.slot_code)} size="small" sx={{ color: '#EF4444' }}>
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
      )}

      {/* Bookings Panel */}
      {tabValue === 2 && (
        <TableContainer component={Card} sx={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(15,23,42,.06)' }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#64748B' }}>Booking ID</TableCell>
                <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#64748B' }}>Booking No</TableCell>
                <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#64748B' }}>User</TableCell>
                <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#64748B' }}>Slot</TableCell>
                <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#64748B' }}>Start Time</TableCell>
                <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#64748B' }}>Total Amount</TableCell>
                <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#64748B' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ fontFamily: 'Poppins', py: 4, color: '#64748B' }}>
                    No parking bookings recorded.
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((booking) => {
                  const targetBookingId = booking.booking_id;
                  const bStatus = booking.status || 'active';
                  return (
                    <TableRow key={targetBookingId} hover>
                      <TableCell sx={{ fontFamily: 'Poppins', color: '#64748B', fontWeight: 500 }}>#{targetBookingId}</TableCell>
                      <TableCell sx={{ fontFamily: 'Poppins', color: '#2563EB', fontWeight: 600 }}>{booking.booking_no || 'N/A'}</TableCell>
                      <TableCell sx={{ fontFamily: 'Poppins', color: '#1E293B', fontWeight: 500 }}>{booking.user_name || `User #${booking.user_id}`}</TableCell>
                      <TableCell sx={{ fontFamily: 'Poppins', color: '#1E293B' }}>{booking.slot_code || `Slot #${booking.slot_id}`}</TableCell>
                      <TableCell sx={{ fontFamily: 'Poppins', color: '#64748B' }}>
                        {booking.start_time ? new Date(booking.start_time).toLocaleString() : 'N/A'}
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'Poppins', color: '#1E293B', fontWeight: 600 }}>
                        ${booking.total_amount ? Number(booking.total_amount).toFixed(2) : '0.00'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={bStatus}
                          size="small"
                          sx={{
                            fontFamily: 'Poppins',
                            fontSize: '11px',
                            textTransform: 'capitalize',
                            backgroundColor:
                              bStatus === 'active' || bStatus === 'booked'
                                ? '#2563EB15'
                                : bStatus === 'completed'
                                ? '#22C55E15'
                                : '#EF444415',
                            color:
                              bStatus === 'active' || bStatus === 'booked'
                                ? '#2563EB'
                                : bStatus === 'completed'
                                ? '#22C55E'
                                : '#EF4444',
                            borderRadius: '6px'
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* ZONE DIALOG (ADD & EDIT) */}
      <Dialog open={openZoneDialog} onClose={closeZoneDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'Poppins', fontWeight: 600 }}>
          {zoneEditMode ? 'Edit Parking Zone' : 'Add Parking Zone'}
          <IconButton onClick={closeZoneDialog} size="small"><Close /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Zone Name"
              placeholder="e.g. Sector 18 Smart Parking Zone"
              value={zoneForm.zone_name}
              onChange={(e) => setZoneForm({ ...zoneForm, zone_name: e.target.value })}
              error={!!formErrors.zone_name}
              helperText={formErrors.zone_name}
              fullWidth
              slotProps={{ inputLabel: { style: { fontFamily: 'Poppins' } }, htmlInput: { style: { fontFamily: 'Poppins' } } }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />

            <TextField
              label="Location / Address"
              placeholder="e.g. Near Metro Gate No. 2, Main Market"
              value={zoneForm.location}
              onChange={(e) => setZoneForm({ ...zoneForm, location: e.target.value })}
              fullWidth
              slotProps={{ inputLabel: { style: { fontFamily: 'Poppins' } }, htmlInput: { style: { fontFamily: 'Poppins' } } }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Total Slots Capacity"
                  type="number"
                  placeholder="e.g. 50"
                  value={zoneForm.total_slots}
                  onChange={(e) => setZoneForm({ ...zoneForm, total_slots: e.target.value })}
                  fullWidth
                  slotProps={{ inputLabel: { style: { fontFamily: 'Poppins' } }, htmlInput: { style: { fontFamily: 'Poppins' } } }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Hourly Rate ($)"
                  type="number"
                  placeholder="e.g. 15.00"
                  value={zoneForm.hourly_rate}
                  onChange={(e) => setZoneForm({ ...zoneForm, hourly_rate: e.target.value })}
                  fullWidth
                  slotProps={{ inputLabel: { style: { fontFamily: 'Poppins' } }, htmlInput: { style: { fontFamily: 'Poppins' } } }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Latitude"
                  placeholder="e.g. 28.5355"
                  value={zoneForm.latitude}
                  onChange={(e) => setZoneForm({ ...zoneForm, latitude: e.target.value })}
                  fullWidth
                  slotProps={{ inputLabel: { style: { fontFamily: 'Poppins' } }, htmlInput: { style: { fontFamily: 'Poppins' } } }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Longitude"
                  placeholder="e.g. 77.3910"
                  value={zoneForm.longitude}
                  onChange={(e) => setZoneForm({ ...zoneForm, longitude: e.target.value })}
                  fullWidth
                  slotProps={{ inputLabel: { style: { fontFamily: 'Poppins' } }, htmlInput: { style: { fontFamily: 'Poppins' } } }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                />
              </Grid>
            </Grid>

            <FormControl fullWidth size="small">
              <InputLabel sx={{ fontFamily: 'Poppins' }}>Zone Active Status</InputLabel>
              <Select
                value={zoneForm.is_active}
                label="Zone Active Status"
                onChange={(e) => setZoneForm({ ...zoneForm, is_active: e.target.value })}
                sx={{ borderRadius: '8px', fontFamily: 'Poppins' }}
              >
                <MenuItem value={1} sx={{ fontFamily: 'Poppins' }}>Active (Operational)</MenuItem>
                <MenuItem value={0} sx={{ fontFamily: 'Poppins' }}>Inactive (Closed / Under Maintenance)</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={closeZoneDialog} sx={{ fontFamily: 'Poppins', textTransform: 'none', color: '#64748B' }}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveZone} sx={{ fontFamily: 'Poppins', textTransform: 'none', backgroundColor: '#2563EB', '&:hover': { backgroundColor: '#1D4ED8' } }}>
            {zoneEditMode ? 'Save Changes' : 'Create Zone'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* SLOT DIALOG (ADD & EDIT) */}
      <Dialog open={openSlotDialog} onClose={closeSlotDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'Poppins', fontWeight: 600 }}>
          {slotEditMode ? 'Edit Parking Slot' : 'Add Parking Slot'}
          <IconButton onClick={closeSlotDialog} size="small"><Close /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <FormControl fullWidth error={!!formErrors.zone_id}>
              <InputLabel sx={{ fontFamily: 'Poppins' }}>Select Zone</InputLabel>
              <Select
                value={slotForm.zone_id}
                label="Select Zone"
                onChange={(e) => setSlotForm({ ...slotForm, zone_id: e.target.value })}
                sx={{ borderRadius: '8px', fontFamily: 'Poppins' }}
              >
                {zones.map((z) => (
                  <MenuItem key={z.id || z.zone_id} value={z.id || z.zone_id} sx={{ fontFamily: 'Poppins' }}>{z.zone_name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Slot Code / Identifier"
              placeholder="e.g. A-12"
              value={slotForm.slot_code}
              onChange={(e) => setSlotForm({ ...slotForm, slot_code: e.target.value })}
              error={!!formErrors.slot_code}
              helperText={formErrors.slot_code}
              fullWidth
              slotProps={{ inputLabel: { style: { fontFamily: 'Poppins' } }, htmlInput: { style: { fontFamily: 'Poppins' } } }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ fontFamily: 'Poppins' }}>Slot Type</InputLabel>
                  <Select
                    value={slotForm.slot_type}
                    label="Slot Type"
                    onChange={(e) => setSlotForm({ ...slotForm, slot_type: e.target.value })}
                    sx={{ borderRadius: '8px', fontFamily: 'Poppins' }}
                  >
                    <MenuItem value="car" sx={{ fontFamily: 'Poppins' }}>Car</MenuItem>
                    <MenuItem value="bike" sx={{ fontFamily: 'Poppins' }}>Bike</MenuItem>
                    <MenuItem value="ev" sx={{ fontFamily: 'Poppins' }}>Electric Vehicle (EV)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ fontFamily: 'Poppins' }}>Availability Flag</InputLabel>
                  <Select
                    value={slotForm.is_available}
                    label="Availability Flag"
                    onChange={(e) => setSlotForm({ ...slotForm, is_available: e.target.value })}
                    sx={{ borderRadius: '8px', fontFamily: 'Poppins' }}
                  >
                    <MenuItem value={1} sx={{ fontFamily: 'Poppins' }}>Enabled (1)</MenuItem>
                    <MenuItem value={0} sx={{ fontFamily: 'Poppins' }}>Disabled (0)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={closeSlotDialog} sx={{ fontFamily: 'Poppins', textTransform: 'none', color: '#64748B' }}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveSlot} sx={{ fontFamily: 'Poppins', textTransform: 'none', backgroundColor: '#2563EB', '&:hover': { backgroundColor: '#1D4ED8' } }}>
            {slotEditMode ? 'Save Changes' : 'Create Slot'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* DELETE CONFIRM DIALOG */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>Delete Confirmation</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontFamily: 'Poppins', color: '#64748B' }}>
            Are you sure you want to delete the {deleteTarget?.type} <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenDeleteDialog(false)} sx={{ fontFamily: 'Poppins', textTransform: 'none', color: '#64748B' }}>Cancel</Button>
          <Button variant="contained" onClick={handleDelete} sx={{ fontFamily: 'Poppins', textTransform: 'none', backgroundColor: '#EF4444', '&:hover': { backgroundColor: '#DC2626' } }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Parking;