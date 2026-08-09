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
  Stack,
  LinearProgress,
  Grid
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Close,
  Poll as PollIcon,
  People
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { pollService } from '../../services/poll.service';

const Polls = () => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Dialog States
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  // Form states
  const [currentPoll, setCurrentPoll] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(1);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const response = await pollService.getPolls();
      if (response.success) {
        setPolls(response.data || []);
      } else {
        setError(response.message || 'Failed to fetch polls.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error connecting to the server.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setTitle('');
    setDescription('');
    setOptions(['', '']);
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate('');
    setIsActive(1);
    setFormErrors({});
    setOpenCreate(true);
  };

  const handleOpenEdit = (poll) => {
    const pollId = poll.id || poll.poll_id;
    setCurrentPoll({ ...poll, id: pollId });
    setTitle(poll.title || '');
    setDescription(poll.description || '');

    if (Array.isArray(poll.options) && poll.options.length > 0) {
      setOptions(poll.options.map((o) => typeof o === 'object' ? (o.option_text || o.text || '') : String(o)));
    } else if (poll.option_1 || poll.option_2) {
      setOptions([poll.option_1, poll.option_2, poll.option_3, poll.option_4].filter(Boolean));
    } else {
      setOptions(['', '']);
    }

    setStartDate(poll.start_date ? new Date(poll.start_date).toISOString().split('T')[0] : '');
    setEndDate(poll.end_date ? new Date(poll.end_date).toISOString().split('T')[0] : '');
    setIsActive(poll.is_active !== undefined ? poll.is_active : 1);
    setFormErrors({});
    setOpenEdit(true);
  };

  const handleOpenView = async (poll) => {
    const pollId = poll.id || poll.poll_id;
    try {
      const res = await pollService.getPollById(pollId);
      if (res.success && res.data) {
        setCurrentPoll(res.data);
      } else {
        setCurrentPoll({ ...poll, id: pollId });
      }
    } catch (err) {
      setCurrentPoll({ ...poll, id: pollId });
    }
    setOpenView(true);
  };

  const handleOpenDelete = (poll) => {
    const pollId = poll.id || poll.poll_id;
    setCurrentPoll({ ...poll, id: pollId });
    setOpenDelete(true);
  };

  const handleAddOptionField = () => {
    if (options.length >= 6) {
      toast.warning('A poll can have a maximum of 6 options.');
      return;
    }
    setOptions([...options, '']);
  };

  const handleRemoveOptionField = (index) => {
    if (options.length <= 2) {
      toast.warning('A poll must have at least 2 options.');
      return;
    }
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const validateForm = () => {
    const errors = {};
    if (!title.trim()) errors.title = 'Poll title is required.';

    const filledOptions = options.filter((o) => o.trim() !== '');
    if (filledOptions.length < 2) {
      errors.options = 'At least 2 non-empty options are required.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreatePoll = async () => {
    if (!validateForm()) return;
    try {
      const validOptions = options.filter((o) => o.trim() !== '');
      const payload = {
        title,
        description,
        option_1: validOptions[0] || '',
        option_2: validOptions[1] || '',
        option_3: validOptions[2] || '',
        option_4: validOptions[3] || '',
        options: validOptions,
        start_date: startDate || null,
        end_date: endDate || null,
        is_active: Number(isActive)
      };
      const response = await pollService.createPoll(payload);
      if (response.success) {
        toast.success(response.message || 'Poll created successfully!');
        setOpenCreate(false);
        fetchPolls();
      } else {
        toast.error(response.message || 'Failed to create poll.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error occurred.');
    }
  };

  const handleEditPoll = async () => {
    if (!validateForm()) return;
    try {
      const validOptions = options.filter((o) => o.trim() !== '');
      const payload = {
        title,
        description,
        option_1: validOptions[0] || '',
        option_2: validOptions[1] || '',
        option_3: validOptions[2] || '',
        option_4: validOptions[3] || '',
        options: validOptions,
        start_date: startDate || null,
        end_date: endDate || null,
        is_active: Number(isActive)
      };
      const response = await pollService.updatePoll(currentPoll.id || currentPoll.poll_id, payload);
      if (response.success) {
        toast.success(response.message || 'Poll updated successfully!');
        setOpenEdit(false);
        fetchPolls();
      } else {
        toast.error(response.message || 'Failed to update poll.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error occurred.');
    }
  };

  const handleDeletePoll = async () => {
    try {
      const response = await pollService.deletePoll(currentPoll.id || currentPoll.poll_id);
      if (response.success) {
        toast.success(response.message || 'Poll deleted successfully!');
        setOpenDelete(false);
        fetchPolls();
      } else {
        toast.error(response.message || 'Failed to delete poll.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error occurred.');
    }
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      {/* Title */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#1E293B', mb: 1 }}>
            Opinion Polls
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Poppins', color: '#64748B' }}>
            Publish civic surveys and vote collections to gauge public opinion on municipal decisions.
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
          Create Poll
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ borderRadius: '12px', mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Polls Table Card */}
      <Card sx={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(15,23,42,.06)' }}>
        <TableContainer>
          <Table sx={{ minWidth: 950 }}>
            <TableHead sx={{ backgroundColor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#64748B', width: 80 }}>Poll ID</TableCell>
                <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#64748B' }}>Poll Title</TableCell>
                <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#64748B' }}>Description</TableCell>
                <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#64748B' }}>Start Date</TableCell>
                <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#64748B' }}>End Date</TableCell>
                <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#64748B' }}>Created By</TableCell>
                <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#64748B' }}>Status</TableCell>
                <TableCell align="right" sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#64748B', pr: 3 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                [1, 2, 3].map((idx) => (
                  <TableRow key={idx}>
                    <TableCell><Skeleton variant="text" width={40} /></TableCell>
                    <TableCell><Skeleton variant="text" width={180} /></TableCell>
                    <TableCell><Skeleton variant="text" width={150} /></TableCell>
                    <TableCell><Skeleton variant="text" width={80} /></TableCell>
                    <TableCell><Skeleton variant="text" width={80} /></TableCell>
                    <TableCell><Skeleton variant="text" width={70} /></TableCell>
                    <TableCell><Skeleton variant="text" width={70} /></TableCell>
                    <TableCell align="right"><Skeleton variant="text" width={80} /></TableCell>
                  </TableRow>
                ))
              ) : polls.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ fontFamily: 'Poppins', py: 4, color: '#64748B' }}>
                    No public polls created yet. Click "Create Poll" to start.
                  </TableCell>
                </TableRow>
              ) : (
                polls.map((poll) => {
                  const targetPollId = poll.id || poll.poll_id;
                  const isActiveFlag = poll.is_active !== undefined ? poll.is_active : 1;

                  return (
                    <TableRow key={targetPollId} hover>
                      {/* 1. ID */}
                      <TableCell sx={{ fontFamily: 'Poppins', color: '#64748B', fontWeight: 500 }}>#{targetPollId}</TableCell>

                      {/* 2. Title */}
                      <TableCell sx={{ fontFamily: 'Poppins', color: '#1E293B', fontWeight: 600, maxWidth: 260, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {poll.title}
                      </TableCell>

                      {/* 3. Description */}
                      <TableCell sx={{ fontFamily: 'Poppins', color: '#64748B', fontSize: '13px', maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {poll.description || 'N/A'}
                      </TableCell>

                      {/* 4. Start Date */}
                      <TableCell sx={{ fontFamily: 'Poppins', color: '#64748B', fontSize: '13px' }}>
                        {poll.start_date ? new Date(poll.start_date).toLocaleDateString() : 'N/A'}
                      </TableCell>

                      {/* 5. End Date */}
                      <TableCell sx={{ fontFamily: 'Poppins', color: '#64748B', fontSize: '13px' }}>
                        {poll.end_date ? new Date(poll.end_date).toLocaleDateString() : 'N/A'}
                      </TableCell>

                      {/* 7. Created By */}
                      <TableCell sx={{ fontFamily: 'Poppins', color: '#64748B', fontSize: '13px' }}>
                        {poll.created_by ? `Admin #${poll.created_by}` : 'System Admin'}
                      </TableCell>

                      {/* 6. Active Status */}
                      <TableCell>
                        <Chip
                          label={isActiveFlag ? 'Active' : 'Closed'}
                          size="small"
                          sx={{
                            fontFamily: 'Poppins',
                            fontSize: '11px',
                            backgroundColor: isActiveFlag ? '#22C55E15' : '#EF444415',
                            color: isActiveFlag ? '#22C55E' : '#EF4444',
                            fontWeight: 600,
                            borderRadius: '6px'
                          }}
                        />
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="right" sx={{ pr: 2 }}>
                        <IconButton onClick={() => handleOpenView(poll)} size="small" sx={{ color: '#64748B', mr: 0.5 }}>
                          <Visibility fontSize="small" />
                        </IconButton>
                        <IconButton onClick={() => handleOpenEdit(poll)} size="small" sx={{ color: '#2563EB', mr: 0.5 }}>
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton onClick={() => handleOpenDelete(poll)} size="small" sx={{ color: '#EF4444' }}>
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

      {/* CREATE DIALOG */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'Poppins', fontWeight: 600 }}>
          Create New Poll
          <IconButton onClick={() => setOpenCreate(false)} size="small"><Close /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Poll Title"
              placeholder="e.g. Community Park Renovation Initiative"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={!!formErrors.title}
              helperText={formErrors.title}
              fullWidth
              slotProps={{ inputLabel: { style: { fontFamily: 'Poppins' } }, htmlInput: { style: { fontFamily: 'Poppins' } } }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />

            <TextField
              label="Description"
              placeholder="Brief details explaining the poll objective..."
              multiline
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              slotProps={{ inputLabel: { style: { fontFamily: 'Poppins' } }, htmlInput: { style: { fontFamily: 'Poppins' } } }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />

            <Box>
              <Typography variant="subtitle2" sx={{ fontFamily: 'Poppins', color: '#1E293B', mb: 1, fontWeight: 600 }}>
                Answer Options
              </Typography>
              {formErrors.options && (
                <Alert severity="error" sx={{ py: 0, px: 1, mb: 1.5, borderRadius: '6px', fontSize: '12px' }}>
                  {formErrors.options}
                </Alert>
              )}
              <Stack spacing={1.5}>
                {options.map((opt, idx) => (
                  <Box key={idx} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <TextField
                      label={`Option ${idx + 1}`}
                      size="small"
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      fullWidth
                      slotProps={{ inputLabel: { style: { fontFamily: 'Poppins' } }, htmlInput: { style: { fontFamily: 'Poppins' } } }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                    />
                    <IconButton
                      color="error"
                      onClick={() => handleRemoveOptionField(idx)}
                      disabled={options.length <= 2}
                      size="small"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Stack>
              <Button
                size="small"
                startIcon={<Add />}
                onClick={handleAddOptionField}
                sx={{ mt: 1.5, textTransform: 'none', fontFamily: 'Poppins' }}
              >
                Add Option Field
              </Button>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={4}>
                <TextField
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  fullWidth
                  size="small"
                  slotProps={{
                    inputLabel: { shrink: true, style: { fontFamily: 'Poppins' } },
                    htmlInput: { style: { fontFamily: 'Poppins' } }
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  fullWidth
                  size="small"
                  slotProps={{
                    inputLabel: { shrink: true, style: { fontFamily: 'Poppins' } },
                    htmlInput: { style: { fontFamily: 'Poppins' } }
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                />
              </Grid>
              <Grid item xs={4}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ fontFamily: 'Poppins' }}>Status</InputLabel>
                  <Select
                    value={isActive}
                    label="Status"
                    onChange={(e) => setIsActive(e.target.value)}
                    sx={{ borderRadius: '8px', fontFamily: 'Poppins' }}
                  >
                    <MenuItem value={1} sx={{ fontFamily: 'Poppins' }}>Active</MenuItem>
                    <MenuItem value={0} sx={{ fontFamily: 'Poppins' }}>Closed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenCreate(false)} sx={{ fontFamily: 'Poppins', textTransform: 'none', color: '#64748B' }}>Cancel</Button>
          <Button variant="contained" onClick={handleCreatePoll} sx={{ fontFamily: 'Poppins', textTransform: 'none', backgroundColor: '#2563EB', '&:hover': { backgroundColor: '#1D4ED8' } }}>Create Poll</Button>
        </DialogActions>
      </Dialog>

      {/* EDIT DIALOG */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'Poppins', fontWeight: 600 }}>
          Edit Poll
          <IconButton onClick={() => setOpenEdit(false)} size="small"><Close /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Poll Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={!!formErrors.title}
              helperText={formErrors.title}
              fullWidth
              slotProps={{ inputLabel: { style: { fontFamily: 'Poppins' } }, htmlInput: { style: { fontFamily: 'Poppins' } } }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />

            <TextField
              label="Description"
              multiline
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              slotProps={{ inputLabel: { style: { fontFamily: 'Poppins' } }, htmlInput: { style: { fontFamily: 'Poppins' } } }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />

            <Box>
              <Typography variant="subtitle2" sx={{ fontFamily: 'Poppins', color: '#1E293B', mb: 1, fontWeight: 600 }}>
                Answer Options
              </Typography>
              <Stack spacing={1.5}>
                {options.map((opt, idx) => (
                  <Box key={idx} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <TextField
                      label={`Option ${idx + 1}`}
                      size="small"
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      fullWidth
                      slotProps={{ inputLabel: { style: { fontFamily: 'Poppins' } }, htmlInput: { style: { fontFamily: 'Poppins' } } }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                    />
                    <IconButton
                      color="error"
                      onClick={() => handleRemoveOptionField(idx)}
                      disabled={options.length <= 2}
                      size="small"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Stack>
              <Button
                size="small"
                startIcon={<Add />}
                onClick={handleAddOptionField}
                sx={{ mt: 1.5, textTransform: 'none', fontFamily: 'Poppins' }}
              >
                Add Option Field
              </Button>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={4}>
                <TextField
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  fullWidth
                  size="small"
                  slotProps={{
                    inputLabel: { shrink: true, style: { fontFamily: 'Poppins' } },
                    htmlInput: { style: { fontFamily: 'Poppins' } }
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  fullWidth
                  size="small"
                  slotProps={{
                    inputLabel: { shrink: true, style: { fontFamily: 'Poppins' } },
                    htmlInput: { style: { fontFamily: 'Poppins' } }
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                />
              </Grid>
              <Grid item xs={4}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ fontFamily: 'Poppins' }}>Status</InputLabel>
                  <Select
                    value={isActive}
                    label="Status"
                    onChange={(e) => setIsActive(e.target.value)}
                    sx={{ borderRadius: '8px', fontFamily: 'Poppins' }}
                  >
                    <MenuItem value={1} sx={{ fontFamily: 'Poppins' }}>Active</MenuItem>
                    <MenuItem value={0} sx={{ fontFamily: 'Poppins' }}>Closed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenEdit(false)} sx={{ fontFamily: 'Poppins', textTransform: 'none', color: '#64748B' }}>Cancel</Button>
          <Button variant="contained" onClick={handleEditPoll} sx={{ fontFamily: 'Poppins', textTransform: 'none', backgroundColor: '#2563EB', '&:hover': { backgroundColor: '#1D4ED8' } }}>Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* VIEW / OPTIONS DIALOG */}
      <Dialog open={openView} onClose={() => setOpenView(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'Poppins', fontWeight: 600 }}>
          Poll Vote Breakdown & Voter Activity
          <IconButton onClick={() => setOpenView(false)} size="small"><Close /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {currentPoll && (
            <Stack spacing={3} sx={{ py: 1 }}>
              <Box>
                <Typography variant="h6" sx={{ fontFamily: 'Poppins', color: '#1E293B', fontWeight: 600, lineHeight: 1.4, mb: 1 }}>
                  {currentPoll.title}
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'Poppins', color: '#64748B' }}>
                  {currentPoll.description || 'No description provided.'}
                </Typography>
              </Box>

              <Box sx={{ p: 2, backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <Grid container spacing={2}>
                  <Grid item xs={3}>
                    <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>Total Votes</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#2563EB' }}>
                      {currentPoll.total_votes || (currentPoll.options ? currentPoll.options.reduce((acc, curr) => acc + (curr.votes || 0), 0) : 0)} votes
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>Start Date</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B' }}>
                      {currentPoll.start_date ? new Date(currentPoll.start_date).toLocaleDateString() : 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>End Date</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B' }}>
                      {currentPoll.end_date ? new Date(currentPoll.end_date).toLocaleDateString() : 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>Status</Typography>
                    <Chip
                      label={currentPoll.is_active ? 'Active' : 'Closed'}
                      size="small"
                      sx={{
                        fontFamily: 'Poppins',
                        fontSize: '11px',
                        backgroundColor: currentPoll.is_active ? '#22C55E15' : '#EF444415',
                        color: currentPoll.is_active ? '#22C55E' : '#EF4444',
                        fontWeight: 600
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Vote Tallies per Option */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontFamily: 'Poppins', color: '#1E293B', mb: 2, fontWeight: 600 }}>
                  Option Tallies & Distribution (from poll_options & poll_votes):
                </Typography>
                <Stack spacing={2}>
                  {(() => {
                    const opts = currentPoll.options || [];
                    const grandTotal = currentPoll.total_votes || opts.reduce((acc, curr) => acc + (curr.votes || 0), 0);
                    
                    if (opts.length === 0) {
                      return (
                        <Typography variant="body2" sx={{ color: '#64748B', fontStyle: 'italic' }}>
                          No options registered for this poll.
                        </Typography>
                      );
                    }

                    return opts.map((opt, idx) => {
                      const vCount = opt.votes !== undefined ? opt.votes : 0;
                      const percentage = grandTotal > 0 ? (vCount / grandTotal) * 100 : 0;
                      const optLabel = typeof opt === 'object' ? (opt.option_text || opt.text || '') : String(opt);

                      return (
                        <Box key={idx} sx={{ p: 1.5, backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2" sx={{ fontFamily: 'Poppins', color: '#1E293B', fontWeight: 600 }}>
                              {idx + 1}. {optLabel}
                              {opt.id && <Typography component="span" variant="caption" sx={{ color: '#94A3B8', ml: 1 }}>(Option ID: #{opt.id})</Typography>}
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'Poppins', color: '#2563EB', fontWeight: 600 }}>
                              {vCount} votes ({percentage.toFixed(1)}%)
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={percentage}
                            sx={{
                              height: 8,
                              borderRadius: '4px',
                              backgroundColor: '#E2E8F0',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: '#2563EB',
                                borderRadius: '4px'
                              }
                            }}
                          />
                        </Box>
                      );
                    });
                  })()}
                </Stack>
              </Box>

              {/* Citizen Voter History */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontFamily: 'Poppins', color: '#1E293B', mb: 1.5, fontWeight: 600 }}>
                  Citizen Voter Activity Log (from poll_votes):
                </Typography>
                {!currentPoll.voters || currentPoll.voters.length === 0 ? (
                  <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', color: '#64748B', fontFamily: 'Poppins', fontSize: '13px' }}>
                    No citizen votes recorded yet for this poll.
                  </Paper>
                ) : (
                  <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '8px', maxHeight: 220 }}>
                    <Table size="small" stickyHeader>
                      <TableHead sx={{ backgroundColor: '#F8FAFC' }}>
                        <TableRow>
                          <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#64748B' }}>User ID</TableCell>
                          <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#64748B' }}>Citizen Name</TableCell>
                          <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#64748B' }}>Voted Option</TableCell>
                          <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#64748B' }}>Timestamp</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {currentPoll.voters.map((v) => (
                          <TableRow key={v.vote_id} hover>
                            <TableCell sx={{ fontFamily: 'Poppins', color: '#64748B' }}>#{v.user_id}</TableCell>
                            <TableCell sx={{ fontFamily: 'Poppins', color: '#1E293B', fontWeight: 500 }}>{v.user_name || 'Anonymous Citizen'}</TableCell>
                            <TableCell sx={{ fontFamily: 'Poppins', color: '#2563EB', fontWeight: 500 }}>{v.option_text}</TableCell>
                            <TableCell sx={{ fontFamily: 'Poppins', color: '#64748B', fontSize: '12px' }}>
                              {v.voted_at ? new Date(v.voted_at).toLocaleString() : 'N/A'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button variant="contained" onClick={() => setOpenView(false)} sx={{ fontFamily: 'Poppins', textTransform: 'none', backgroundColor: '#2563EB', '&:hover': { backgroundColor: '#1D4ED8' } }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* DELETE CONFIRM */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>Delete Poll</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontFamily: 'Poppins', color: '#64748B' }}>
            Are you sure you want to delete this opinion poll? Registered votes will be removed permanently.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenDelete(false)} sx={{ fontFamily: 'Poppins', textTransform: 'none', color: '#64748B' }}>Cancel</Button>
          <Button variant="contained" onClick={handleDeletePoll} sx={{ fontFamily: 'Poppins', textTransform: 'none', backgroundColor: '#EF4444', '&:hover': { backgroundColor: '#DC2626' } }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Polls;
