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
  TablePagination,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Skeleton,
  Stack,
  Grid,
  Tooltip,
  Avatar
} from '@mui/material';
import {
  Search,
  Visibility,
  Close,
  LocationOn,
  OpenInNew,
  Image as ImageIcon,
  CheckCircle
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { complaintService } from '../../services/complaint.service';

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination & Filters
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Dialog State
  const [openDetails, setOpenDetails] = useState(false);
  const [currentComplaint, setCurrentComplaint] = useState(null);
  const [updateStatus, setUpdateStatus] = useState('');
  const [adminRemark, setAdminRemark] = useState('');
  const [updating, setUpdating] = useState(false);

  // Cloudinary Lightbox State
  const [openImageModal, setOpenImageModal] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await complaintService.getComplaints();
      if (response.success) {
        setComplaints(response.complaints || []);
      } else {
        setError(response.message || 'Failed to fetch complaints.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error connecting to the server.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDetails = (complaint) => {
    setCurrentComplaint(complaint);
    setUpdateStatus(complaint.status || 'submitted');
    setAdminRemark(complaint.admin_remark || '');
    setOpenDetails(true);
  };

  const handleUpdateStatus = async () => {
    if (!currentComplaint) return;
    try {
      setUpdating(true);
      const complaintId = currentComplaint.id; // Fix: use id instead of complaint_id
      const response = await complaintService.updateComplaintStatus(complaintId, {
        status: updateStatus,
        remarks: adminRemark
      });

      if (response.success) {
        toast.success(response.message || 'Complaint status updated successfully!');
        setOpenDetails(false);
        fetchComplaints();
      } else {
        toast.error(response.message || 'Failed to update status.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating status.');
    } finally {
      setUpdating(false);
    }
  };

  const handleOpenImage = (url) => {
    if (!url) return;
    setSelectedImageUrl(url);
    setOpenImageModal(true);
  };

  const formatCategory = (cat) => {
    if (!cat) return 'General';
    return cat.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  function getPriorityLevel(score) {
    if (score >= 4) return 'high';
    if (score >= 2) return 'medium';
    return 'low';
  }

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'high':
        return { color: '#EF4444', bg: '#EF444415' };
      case 'medium':
        return { color: '#F59E0B', bg: '#F59E0B15' };
      default:
        return { color: '#22C55E', bg: '#22C55E15' };
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'submitted':
        return { label: 'Submitted', color: '#64748B', bg: '#F1F5F9' };
      case 'under_review':
        return { label: 'Under Review', color: '#7C3AED', bg: '#F3E8FF' };
      case 'in_progress':
        return { label: 'In Progress', color: '#2563EB', bg: '#EFF6FF' };
      case 'resolved':
        return { label: 'Resolved', color: '#22C55E', bg: '#DCFCE7' };
      case 'rejected':
        return { label: 'Rejected', color: '#EF4444', bg: '#FEE2E2' };
      default:
        return { label: status, color: '#64748B', bg: '#F1F5F9' };
    }
  };

  // Filter Logic
  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      c.ticket_no?.toLowerCase().includes(search.toLowerCase()) ||
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.address?.toLowerCase().includes(search.toLowerCase()) ||
      c.location?.toLowerCase().includes(search.toLowerCase()) ||
      c.category?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || c.category === categoryFilter;

    // Fix: removed matchesPriority to prevent crash
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const paginatedComplaints = filteredComplaints.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ p: 3, backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      {/* Page Title */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#1E293B', mb: 1 }}>
          Citizen Complaints Management
        </Typography>
        <Typography variant="body2" sx={{ fontFamily: 'Poppins', color: '#64748B' }}>
          Review ticket submissions, inspect Cloudinary evidence photos, assign workers, and update complaint resolution status.
        </Typography>
      </Box>

      {/* Main Filter Toolbar */}
      <Card sx={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(15,23,42,.06)', mb: 4 }}>
        <Box sx={{ p: 2, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, backgroundColor: '#FFFFFF', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search ticket no, title, citizen, category..."
            size="small"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: '#64748B', fontSize: 20 }} />
                </InputAdornment>
              )
            }}
            sx={{
              flexGrow: 1,
              minWidth: { xs: '100%', md: 280 },
              '& .MuiOutlinedInput-root': { borderRadius: '8px', fontFamily: 'Poppins', fontSize: '14px' }
            }}
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: { xs: '100%', md: 'auto' } }}>
            {/* Status Filter */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel sx={{ fontFamily: 'Poppins' }}>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                sx={{ borderRadius: '8px', fontFamily: 'Poppins' }}
              >
                <MenuItem value="all" sx={{ fontFamily: 'Poppins' }}>All Status</MenuItem>
                <MenuItem value="submitted" sx={{ fontFamily: 'Poppins' }}>Submitted</MenuItem>
                <MenuItem value="under_review" sx={{ fontFamily: 'Poppins' }}>Under Review</MenuItem>
                <MenuItem value="in_progress" sx={{ fontFamily: 'Poppins' }}>In Progress</MenuItem>
                <MenuItem value="resolved" sx={{ fontFamily: 'Poppins' }}>Resolved</MenuItem>
                <MenuItem value="rejected" sx={{ fontFamily: 'Poppins' }}>Rejected</MenuItem>
              </Select>
            </FormControl>

            {/* Category Filter */}
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel sx={{ fontFamily: 'Poppins' }}>Category</InputLabel>
              <Select
                value={categoryFilter}
                label="Category"
                onChange={(e) => { setCategoryFilter(e.target.value); setPage(0); }}
                sx={{ borderRadius: '8px', fontFamily: 'Poppins' }}
              >
                <MenuItem value="all" sx={{ fontFamily: 'Poppins' }}>All Categories</MenuItem>
                <MenuItem value="road" sx={{ fontFamily: 'Poppins' }}>Road</MenuItem>
                <MenuItem value="garbage" sx={{ fontFamily: 'Poppins' }}>Garbage</MenuItem>
                <MenuItem value="street_light" sx={{ fontFamily: 'Poppins' }}>Street Light</MenuItem>
                <MenuItem value="water_supply" sx={{ fontFamily: 'Poppins' }}>Water Supply</MenuItem>
                <MenuItem value="drainage" sx={{ fontFamily: 'Poppins' }}>Drainage</MenuItem>
                <MenuItem value="public_property" sx={{ fontFamily: 'Poppins' }}>Public Property</MenuItem>
                <MenuItem value="other" sx={{ fontFamily: 'Poppins' }}>Other</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Box>

        {error && (
          <Box sx={{ px: 2, pb: 2 }}>
            <Alert severity="error" sx={{ borderRadius: '8px' }}>{error}</Alert>
          </Box>
        )}

        {/* Complaints Table */}
        <TableContainer sx={{ maxHeight: '65vh' }}>
          <Table stickyHeader sx={{ minWidth: 950 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E5E7EB', fontFamily: 'Poppins', fontWeight: 600, color: '#64748B', width: 110 }}>
                  Ticket No
                </TableCell>
                <TableCell sx={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E5E7EB', fontFamily: 'Poppins', fontWeight: 600, color: '#64748B', width: 70 }}>
                  Media
                </TableCell>
                <TableCell sx={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E5E7EB', fontFamily: 'Poppins', fontWeight: 600, color: '#64748B' }}>
                  Title & Description
                </TableCell>
                <TableCell sx={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E5E7EB', fontFamily: 'Poppins', fontWeight: 600, color: '#64748B', width: 140 }}>
                  Citizen
                </TableCell>
                <TableCell sx={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E5E7EB', fontFamily: 'Poppins', fontWeight: 600, color: '#64748B', width: 130 }}>
                  Category
                </TableCell>
                <TableCell sx={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E5E7EB', fontFamily: 'Poppins', fontWeight: 600, color: '#64748B', width: 100 }}>
                  Priority
                </TableCell>
                <TableCell sx={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E5E7EB', fontFamily: 'Poppins', fontWeight: 600, color: '#64748B', width: 130 }}>
                  Status
                </TableCell>
                <TableCell align="right" sx={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E5E7EB', fontFamily: 'Poppins', fontWeight: 600, color: '#64748B', pr: 3, width: 100 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                [1, 2, 3, 4, 5].map((idx) => (
                  <TableRow key={idx}>
                    <TableCell><Skeleton variant="text" width={70} /></TableCell>
                    <TableCell><Skeleton variant="rectangular" width={40} height={40} sx={{ borderRadius: '6px' }} /></TableCell>
                    <TableCell><Skeleton variant="text" width={180} /></TableCell>
                    <TableCell><Skeleton variant="text" width={110} /></TableCell>
                    <TableCell><Skeleton variant="text" width={90} /></TableCell>
                    <TableCell><Skeleton variant="text" width={60} /></TableCell>
                    <TableCell><Skeleton variant="text" width={80} /></TableCell>
                    <TableCell align="right"><Skeleton variant="text" width={60} /></TableCell>
                  </TableRow>
                ))
              ) : paginatedComplaints.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ fontFamily: 'Poppins', color: '#64748B', py: 4 }}>
                    No citizen complaints found matching selected filters.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedComplaints.map((c) => {
                  const priority = getPriorityLevel(c.priority_score);
                  const priStyle = getPriorityStyle(priority);
                  const statStyle = getStatusStyle(c.status);

                  return (
                    <TableRow key={c.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      {/* Ticket No */}
                      <TableCell sx={{ fontFamily: 'Poppins', color: '#2563EB', fontWeight: 600, fontSize: '13px' }}>
                        {c.ticket_no || `TICK-${c.id}`}
                      </TableCell>

                      {/* Cloudinary Image Thumbnail */}
                      <TableCell>
                        {c.images && c.images.length > 0 ? (
                          <Tooltip title="Click to expand Cloudinary image" arrow placement="top">
                            <Avatar
                              src={c.images[0]}
                              variant="rounded"
                              onClick={() => handleOpenImage(c.images[0])}
                              sx={{
                                width: 42,
                                height: 42,
                                cursor: 'pointer',
                                border: '1px solid #E5E7EB',
                                transition: 'transform 0.2s',
                                '&:hover': { transform: 'scale(1.1)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }
                              }}
                            />
                          </Tooltip>
                        ) : (
                          <Avatar variant="rounded" sx={{ width: 42, height: 42, backgroundColor: '#F1F5F9', color: '#94A3B8' }}>
                            <ImageIcon fontSize="small" />
                          </Avatar>
                        )}
                      </TableCell>

                      {/* Title & Description */}
                      <TableCell sx={{ fontFamily: 'Poppins' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1E293B' }}>
                          {c.title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {c.description}
                        </Typography>
                      </TableCell>

                      {/* Citizen Name */}
                      <TableCell sx={{ fontFamily: 'Poppins', color: '#334155', fontWeight: 500, fontSize: '13px' }}>
                        {c.name}
                      </TableCell>

                      {/* Category */}
                      <TableCell sx={{ fontFamily: 'Poppins', color: '#64748B', fontSize: '13px' }}>
                        {formatCategory(c.category)}
                      </TableCell>

                      {/* Priority */}
                      <TableCell>
                        <Chip
                          label={priority}
                          size="small"
                          sx={{
                            fontFamily: 'Poppins',
                            fontSize: '11px',
                            textTransform: 'capitalize',
                            backgroundColor: priStyle.bg,
                            color: priStyle.color,
                            fontWeight: 600,
                            borderRadius: '6px'
                          }}
                        />
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Chip
                          label={statStyle.label}
                          size="small"
                          sx={{
                            fontFamily: 'Poppins',
                            fontSize: '11px',
                            backgroundColor: statStyle.bg,
                            color: statStyle.color,
                            fontWeight: 600,
                            borderRadius: '6px'
                          }}
                        />
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="right" sx={{ pr: 2 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Visibility />}
                          onClick={() => handleOpenDetails(c)}
                          sx={{
                            textTransform: 'none',
                            fontFamily: 'Poppins',
                            fontSize: '12px',
                            borderColor: '#E5E7EB',
                            color: '#64748B',
                            '&:hover': {
                              borderColor: '#2563EB',
                              color: '#2563EB',
                              backgroundColor: 'transparent'
                            }
                          }}
                        >
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Table Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredComplaints.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            borderTop: '1px solid #E5E7EB',
            fontFamily: 'Poppins',
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              fontFamily: 'Poppins',
              fontSize: '12px'
            }
          }}
        />
      </Card>

      {/* COMPLAINT DETAILS & STATUS UPDATE MODAL */}
      <Dialog open={openDetails} onClose={() => setOpenDetails(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'Poppins', fontWeight: 600 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <span>Ticket Details</span>
            <Chip
              label={currentComplaint?.ticket_no || `TICK-${currentComplaint?.id}`}
              size="small"
              sx={{ fontFamily: 'Poppins', fontWeight: 700, backgroundColor: '#2563EB15', color: '#2563EB', borderRadius: '6px' }}
            />
          </Box>
          <IconButton onClick={() => setOpenDetails(false)} size="small"><Close /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {currentComplaint && (
            <Grid container spacing={3} sx={{ py: 1 }}>
              {/* Left Column: Complaint & Media Info */}
              <Grid item xs={12} md={7}>
                <Stack spacing={2.5}>
                  <Box>
                    <Typography variant="caption" sx={{ fontFamily: 'Poppins', color: '#64748B', display: 'block' }}>Complaint Title</Typography>
                    <Typography variant="h6" sx={{ fontFamily: 'Poppins', color: '#1E293B', fontWeight: 600 }}>
                      {currentComplaint.title}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{ fontFamily: 'Poppins', color: '#64748B', display: 'block' }}>Description</Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'Poppins', color: '#334155', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                      {currentComplaint.description}
                    </Typography>
                  </Box>

                  {/* Cloudinary Evidence Image Card */}
                  <Box>
                    <Typography variant="caption" sx={{ fontFamily: 'Poppins', color: '#64748B', mb: 1, display: 'block' }}>
                      Cloudinary Evidence Photo
                    </Typography>
                    {currentComplaint.images && currentComplaint.images.length > 0 ? (
                      <Card
                        onClick={() => handleOpenImage(currentComplaint.images[0])}
                        sx={{
                          borderRadius: '8px',
                          border: '1px solid #E5E7EB',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          position: 'relative',
                          maxWidth: '100%',
                          maxHeight: 240,
                          display: 'flex',
                          justifyContent: 'center',
                          backgroundColor: '#0F172A',
                          '&:hover img': { opacity: 0.85 }
                        }}
                      >
                        <img
                          src={currentComplaint.images[0]}
                          alt="Cloudinary Uploaded Complaint Evidence"
                          style={{ maxWidth: '100%', maxHeight: 240, objectFit: 'contain', transition: 'opacity 0.2s' }}
                        />
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 8,
                            right: 8,
                            backgroundColor: 'rgba(15,23,42,0.75)',
                            color: '#FFFFFF',
                            borderRadius: '4px',
                            px: 1,
                            py: 0.5,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5
                          }}
                        >
                          <OpenInNew sx={{ fontSize: 14 }} />
                          <Typography variant="caption" sx={{ fontFamily: 'Poppins', fontSize: '11px' }}>Click to Expand</Typography>
                        </Box>
                      </Card>
                    ) : (
                      <Box sx={{ p: 2, borderRadius: '8px', border: '1px dashed #CBD5E1', backgroundColor: '#F8FAFC', textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ fontFamily: 'Poppins', color: '#94A3B8' }}>
                          No image photo uploaded for this complaint.
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Location & GPS Map Link */}
                  {currentComplaint.location && (
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <LocationOn sx={{ color: '#EF4444', mt: 0.2, fontSize: 20 }} />
                      <Box>
                        <Typography variant="caption" sx={{ fontFamily: 'Poppins', color: '#64748B', display: 'block' }}>
                          Incident Location & GPS
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'Poppins', color: '#1E293B', fontWeight: 500 }}>
                          {currentComplaint.location}
                        </Typography>
                        {currentComplaint.latitude && currentComplaint.longitude && (
                          <Button
                            size="small"
                            target="_blank"
                            rel="noopener noreferrer"
                            href={`https://www.google.com/maps?q=${currentComplaint.latitude},${currentComplaint.longitude}`}
                            startIcon={<OpenInNew sx={{ fontSize: '14px !important' }} />}
                            sx={{
                              mt: 0.5,
                              p: 0,
                              fontFamily: 'Poppins',
                              fontSize: '12px',
                              textTransform: 'none',
                              color: '#2563EB'
                            }}
                          >
                            View Coordinates on Google Maps ({currentComplaint.latitude}, {currentComplaint.longitude})
                          </Button>
                        )}
                      </Box>
                    </Box>
                  )}
                </Stack>
              </Grid>

              {/* Right Column: Ticket Metadata & Status Management */}
              <Grid item xs={12} md={5}>
                <Card sx={{ p: 2.5, border: '1px solid #E5E7EB', boxShadow: 'none', backgroundColor: '#F8FAFC', borderRadius: '10px' }}>
                  <Typography variant="subtitle2" sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#1E293B', mb: 2 }}>
                    Ticket Metadata & Actions
                  </Typography>

                  <Stack spacing={2} sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" sx={{ fontFamily: 'Poppins', color: '#64748B' }}>Citizen Name</Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'Poppins', color: '#1E293B', fontWeight: 600 }}>
                        {currentComplaint.name}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" sx={{ fontFamily: 'Poppins', color: '#64748B' }}>Category</Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'Poppins', color: '#1E293B', fontWeight: 500 }}>
                        {formatCategory(currentComplaint.category)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" sx={{ fontFamily: 'Poppins', color: '#64748B' }}>Priority Level</Typography>
                      <Chip
                        label={getPriorityLevel(currentComplaint.priority_score)}
                        size="small"
                        sx={{
                          fontFamily: 'Poppins',
                          fontSize: '11px',
                          textTransform: 'capitalize',
                          backgroundColor: getPriorityStyle(getPriorityLevel(currentComplaint.priority_score)).bg,
                          color: getPriorityStyle(getPriorityLevel(currentComplaint.priority_score)).color,
                          fontWeight: 600,
                          borderRadius: '6px'
                        }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" sx={{ fontFamily: 'Poppins', color: '#64748B' }}>Assigned Worker Unit</Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'Poppins', color: '#1E293B', fontWeight: 500 }}>
                        {currentComplaint.assigned_worker || <span style={{ fontStyle: 'italic', color: '#94A3B8' }}>Unassigned</span>}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" sx={{ fontFamily: 'Poppins', color: '#64748B' }}>Submitted Date</Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'Poppins', color: '#1E293B' }}>
                        {currentComplaint.created_at ? new Date(currentComplaint.created_at).toLocaleDateString() : 'N/A'}
                      </Typography>
                    </Box>

                    {currentComplaint.resolved_at && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" sx={{ fontFamily: 'Poppins', color: '#22C55E' }}>Resolved Date</Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'Poppins', color: '#22C55E', fontWeight: 600 }}>
                          {new Date(currentComplaint.resolved_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                    )}
                  </Stack>

                  {/* Status Control Form */}
                  <Stack spacing={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel sx={{ fontFamily: 'Poppins' }}>Ticket Status</InputLabel>
                      <Select
                        value={updateStatus}
                        label="Ticket Status"
                        onChange={(e) => setUpdateStatus(e.target.value)}
                        sx={{ borderRadius: '8px', fontFamily: 'Poppins', backgroundColor: '#FFFFFF' }}
                      >
                        <MenuItem value="submitted" sx={{ fontFamily: 'Poppins' }}>Submitted</MenuItem>
                        <MenuItem value="under_review" sx={{ fontFamily: 'Poppins' }}>Under Review</MenuItem>
                        <MenuItem value="in_progress" sx={{ fontFamily: 'Poppins' }}>In Progress</MenuItem>
                        <MenuItem value="resolved" sx={{ fontFamily: 'Poppins' }}>Resolved</MenuItem>
                        <MenuItem value="rejected" sx={{ fontFamily: 'Poppins' }}>Rejected</MenuItem>
                      </Select>
                    </FormControl>

                    <TextField
                      label="Admin Remark / Internal Note"
                      placeholder="Add remarks for citizen or field team..."
                      multiline
                      rows={3}
                      value={adminRemark}
                      onChange={(e) => setAdminRemark(e.target.value)}
                      fullWidth
                      slotProps={{ inputLabel: { style: { fontFamily: 'Poppins' } }, htmlInput: { style: { fontFamily: 'Poppins' } } }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: '#FFFFFF' } }}
                    />
                  </Stack>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenDetails(false)} sx={{ fontFamily: 'Poppins', textTransform: 'none', color: '#64748B' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={updating}
            onClick={handleUpdateStatus}
            startIcon={<CheckCircle />}
            sx={{
              fontFamily: 'Poppins',
              textTransform: 'none',
              backgroundColor: '#2563EB',
              '&:hover': { backgroundColor: '#1D4ED8' }
            }}
          >
            Save Status & Remark
          </Button>
        </DialogActions>
      </Dialog>

      {/* CLOUDINARY FULLSCREEN LIGHTBOX MODAL */}
      <Dialog open={openImageModal} onClose={() => setOpenImageModal(false)} maxWidth="lg">
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'Poppins', fontWeight: 600 }}>
          Cloudinary Evidence Photo Viewer
          <IconButton onClick={() => setOpenImageModal(false)} size="small"><Close /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', justifyContent: 'center', backgroundColor: '#0F172A', p: 2 }}>
          {selectedImageUrl && (
            <img
              src={selectedImageUrl}
              alt="Cloudinary Full Resolution Evidence"
              style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain', borderRadius: '8px' }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Button
            target="_blank"
            rel="noopener noreferrer"
            href={selectedImageUrl}
            startIcon={<OpenInNew />}
            sx={{ fontFamily: 'Poppins', textTransform: 'none', color: '#2563EB' }}
          >
            Open Original Cloudinary URL
          </Button>
          <Button variant="contained" onClick={() => setOpenImageModal(false)} sx={{ fontFamily: 'Poppins', textTransform: 'none' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Complaints;