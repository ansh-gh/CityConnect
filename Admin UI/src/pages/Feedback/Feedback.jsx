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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  Skeleton,
  Alert
} from '@mui/material';
import {
  Delete,
  Feedback as FeedbackIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { feedbackService } from '../../services/feedback.service';

const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dialog state
  const [openDelete, setOpenDelete] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

const fetchFeedbacks = async () => {
  try {
    setLoading(true);

    const response = await feedbackService.getFeedbacks();

    console.log("Full Response:", response);
    console.log("Response Data:", response.data);

    if (response.success) {
      setFeedbacks(response.data || []);
    } else {
      setError(response.message || "Failed to fetch feedback.");
    }
  } catch (err) {
    console.error(err);
    setError(err.response?.data?.message || "Error connecting to the server.");
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

  const handleOpenDelete = (id) => {
    setDeleteTargetId(id);
    setOpenDelete(true);
  };

  const handleDeleteFeedback = async () => {
    if (!deleteTargetId) return;
    try {
      const response = await feedbackService.deleteFeedback(deleteTargetId);
      if (response.success) {
        toast.success(response.message || 'Feedback deleted successfully!');
        setOpenDelete(false);
        setDeleteTargetId(null);
        fetchFeedbacks();
      } else {
        toast.error(response.message || 'Failed to delete feedback.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error occurred.');
    }
  };

  const paginatedFeedback = feedbacks.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ p: 3, backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      {/* Title */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#1E293B', mb: 1 }}>
          Citizen Feedback
        </Typography>
        <Typography variant="body2" sx={{ fontFamily: 'Poppins', color: '#64748B' }}>
          Browse system feedback, citizen satisfaction ratings, and written reviews regarding city apps and portals.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ borderRadius: '12px', mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Table Card */}
      <Card sx={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(15,23,42,.06)' }}>
        <TableContainer>
          <Table sx={{ minWidth: 900 }}>
            <TableHead sx={{ backgroundColor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#64748B', width: 70 }}>ID</TableCell>
                <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#64748B', width: 180 }}>Citizen</TableCell>
                <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#64748B', width: 150 }}>Complaint</TableCell>
                <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#64748B', width: 120 }}>Rating</TableCell>
                <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#64748B' }}>Feedback</TableCell>
                <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#64748B', width: 130 }}>Date</TableCell>
                <TableCell align="right" sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#64748B', pr: 3, width: 80 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                [1, 2, 3].map((idx) => (
                  <TableRow key={idx}>
                    <TableCell><Skeleton variant="text" width={40} /></TableCell>
                    <TableCell>
                      <Skeleton variant="text" width={100} />
                      <Skeleton variant="text" width={130} height={15} />
                    </TableCell>
                    <TableCell><Skeleton variant="text" width={100} /></TableCell>
                    <TableCell><Skeleton variant="text" width={80} /></TableCell>
                    <TableCell><Skeleton variant="text" width={280} /></TableCell>
                    <TableCell><Skeleton variant="text" width={90} /></TableCell>
                    <TableCell align="right"><Skeleton variant="text" width={40} /></TableCell>
                  </TableRow>
                ))
              ) : paginatedFeedback.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ fontFamily: 'Poppins', py: 4, color: '#64748B' }}>
                    No citizen feedback has been submitted yet.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedFeedback.map((fb) => (
                  <TableRow key={fb.feedback_id} hover>
                    <TableCell sx={{ fontFamily: 'Poppins', color: '#64748B' }}>#{fb.feedback_id}</TableCell>
                    
                    <TableCell>
                      <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#1E293B', fontSize: '14px' }}>
                        {fb.name}
                      </Typography>
                      <Typography variant="caption" sx={{ fontFamily: 'Poppins', color: '#64748B', display: 'block' }}>
                        {fb.email}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ fontFamily: 'Poppins', color: '#1E293B', fontSize: '13px' }}>
                      {fb.title || "General Feedback"}
                    </TableCell>

                    <TableCell>
                      <Rating value={fb.rating || 0} readOnly size="small" sx={{ color: '#F59E0B' }} />
                    </TableCell>

                    <TableCell sx={{ fontFamily: 'Poppins', color: '#1E293B', fontSize: '13px', lineHeight: 1.5, maxWidth: 350, wordBreak: 'break-word' }}>
                      {fb.message || <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>No comment provided</span>}
                    </TableCell>

                    <TableCell sx={{ fontFamily: 'Poppins', color: '#64748B', fontSize: '13px' }}>
                      {fb.created_at ? new Date(fb.created_at).toLocaleDateString() : 'N/A'}
                    </TableCell>

                    <TableCell align="right" sx={{ pr: 2 }}>
                      <IconButton onClick={() => handleOpenDelete(fb.feedback_id)} size="small" sx={{ color: '#EF4444' }}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={feedbacks.length}
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

      {/* DELETE DIALOG */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>Delete Feedback</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontFamily: 'Poppins', color: '#64748B' }}>
            Are you sure you want to permanently delete this citizen feedback record? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenDelete(false)} sx={{ fontFamily: 'Poppins', textTransform: 'none', color: '#64748B' }}>Cancel</Button>
          <Button variant="contained" onClick={handleDeleteFeedback} sx={{ fontFamily: 'Poppins', textTransform: 'none', backgroundColor: '#EF4444', '&:hover': { backgroundColor: '#DC2626' } }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Feedback;