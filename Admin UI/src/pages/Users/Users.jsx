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
  TableSortLabel,
  TablePagination,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  Skeleton,
  Stack
} from '@mui/material';
import {
  Search,
  Delete,
  Visibility,
  Close
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { userService } from '../../services/user.service';

const Users = () => {
  // Data States
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination & Sorting States
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('name');
  const [order, setOrder] = useState('asc');
  const [search, setSearch] = useState('');

  // Dialog States
  const [openView, setOpenView] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  // Form States
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await userService.getUsers();
      if (response.success) {
        setUsers(response.data || []);
      } else {
        setError(response.message || 'Failed to fetch users.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error connecting to the server.');
    } finally {
      setLoading(false);
    }
  };

  // Sorting Handler
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Pagination Handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Search Handler
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const handleOpenView = async (user) => {
    try {
      const targetId = user.id;
      const res = await userService.getUserById(targetId);
      if (res.success) {
        setCurrentUser(res.data);
        setOpenView(true);
      } else {
        toast.error(res.message || 'Failed to load details.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error occurred loading details.');
    }
  };

  const handleOpenDelete = (user) => {
    setCurrentUser(user);
    setOpenDelete(true);
  };

  const handleDeleteUser = async () => {
    try {
      const targetId = currentUser.id;
      const response = await userService.deleteUser(targetId);
      if (response.success) {
        toast.success(response.message || 'User deleted successfully!');
        setOpenDelete(false);
        fetchUsers();
      } else {
        toast.error(response.message || 'Failed to delete user.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error occurred.');
    }
  };

  // Filter and Sort Logic
  const filteredUsers = users.filter((user) => {
    const userName = user.name || '';
    return (
      userName.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase()) ||
      user.phone?.includes(search)
    );
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aVal = a[orderBy] || '';
    let bVal = b[orderBy] || '';
    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();

    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });

  const paginatedUsers = sortedUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ p: 3, backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      {/* Title */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#1E293B', mb: 1 }}>
            User Management
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Poppins', color: '#64748B' }}>
            Browse registered citizens, assign administrator roles, and configure system access permissions.
          </Typography>
        </Box>
      </Box>

      {/* Main Grid Card */}
      <Card sx={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(15,23,42,.06)', mb: 4 }}>
        <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', backgroundColor: '#FFFFFF' }}>
          <TextField
            placeholder="Search by name, email, or phone..."
            size="small"
            value={search}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: '#64748B', fontSize: 20 }} />
                </InputAdornment>
              )
            }}
            sx={{
              width: { xs: '100%', sm: 360 },
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                fontFamily: 'Poppins',
                fontSize: '14px'
              }
            }}
          />
        </Box>

        {error && (
          <Box sx={{ px: 2, pb: 2 }}>
            <Alert severity="error" sx={{ borderRadius: '8px' }}>{error}</Alert>
          </Box>
        )}

        <TableContainer sx={{ maxHeight: '60vh' }}>
          <Table stickyHeader sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E5E7EB' }}>
                  <TableSortLabel
                    active={orderBy === 'name'}
                    direction={orderBy === 'name' ? order : 'asc'}
                    onClick={() => handleRequestSort('name')}
                    sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#64748B' }}
                  >
                    Name
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E5E7EB' }}>
                  <TableSortLabel
                    active={orderBy === 'email'}
                    direction={orderBy === 'email' ? order : 'asc'}
                    onClick={() => handleRequestSort('email')}
                    sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#64748B' }}
                  >
                    Email
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E5E7EB', fontFamily: 'Poppins', fontWeight: 600, color: '#64748B' }}>
                  Phone
                </TableCell>
                <TableCell sx={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E5E7EB' }}>
                  <TableSortLabel
                    active={orderBy === 'role'}
                    direction={orderBy === 'role' ? order : 'asc'}
                    onClick={() => handleRequestSort('role')}
                    sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#64748B' }}
                  >
                    Role
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E5E7EB' }}>
                  <TableSortLabel
                    active={orderBy === 'is_active'}
                    direction={orderBy === 'is_active' ? order : 'asc'}
                    onClick={() => handleRequestSort('is_active')}
                    sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#64748B' }}
                  >
                    Status
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right" sx={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E5E7EB', fontFamily: 'Poppins', fontWeight: 600, color: '#64748B', pr: 3 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                [1, 2, 3, 4, 5].map((idx) => (
                  <TableRow key={idx}>
                    <TableCell><Skeleton variant="text" width={120} /></TableCell>
                    <TableCell><Skeleton variant="text" width={180} /></TableCell>
                    <TableCell><Skeleton variant="text" width={100} /></TableCell>
                    <TableCell><Skeleton variant="text" width={80} /></TableCell>
                    <TableCell><Skeleton variant="text" width={80} /></TableCell>
                    <TableCell align="right"><Skeleton variant="text" width={100} /></TableCell>
                  </TableRow>
                ))
              ) : paginatedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ fontFamily: 'Poppins', color: '#64748B', py: 4 }}>
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user) => (
                  <TableRow key={user.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell sx={{ fontFamily: 'Poppins', color: '#1E293B', fontWeight: 500 }}>
                      {user.name}
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'Poppins', color: '#64748B' }}>{user.email}</TableCell>
                    <TableCell sx={{ fontFamily: 'Poppins', color: '#64748B' }}>{user.phone || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        size="small"
                        sx={{
                          fontFamily: 'Poppins',
                          fontSize: '11px',
                          textTransform: 'capitalize',
                          backgroundColor: user.role === 'admin' ? '#2563EB15' : '#64748B15',
                          color: user.role === 'admin' ? '#2563EB' : '#64748B',
                          borderRadius: '6px'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.is_active ? "Active" : "Inactive"}
                        size="small"
                        sx={{
                          fontFamily: 'Poppins',
                          fontSize: '11px',
                          textTransform: 'capitalize',
                          backgroundColor: user.is_active ? '#22C55E15' : '#EF444415',
                          color: user.is_active ? '#22C55E' : '#EF4444',
                          borderRadius: '6px'
                        }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ pr: 2 }}>
                      <IconButton onClick={() => handleOpenView(user)} size="small" sx={{ color: '#64748B', mr: 0.5 }}>
                        <Visibility fontSize="small" />
                      </IconButton>
                      <IconButton onClick={() => handleOpenDelete(user)} size="small" sx={{ color: '#EF4444' }}>
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
          count={filteredUsers.length}
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

      {/* VIEW DIALOG */}
      <Dialog open={openView} onClose={() => setOpenView(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'Poppins', fontWeight: 600 }}>
          User Details
          <IconButton onClick={() => setOpenView(false)} size="small"><Close /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {currentUser && (
            <Stack spacing={2} sx={{ py: 1 }}>
              <Box>
                <Typography variant="caption" sx={{ fontFamily: 'Poppins', color: '#64748B', display: 'block' }}>ID</Typography>
                <Typography variant="body1" sx={{ fontFamily: 'Poppins', color: '#1E293B', fontWeight: 500 }}>{currentUser.id}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ fontFamily: 'Poppins', color: '#64748B', display: 'block' }}>Name</Typography>
                <Typography variant="body1" sx={{ fontFamily: 'Poppins', color: '#1E293B', fontWeight: 500 }}>{currentUser.name}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ fontFamily: 'Poppins', color: '#64748B', display: 'block' }}>Email</Typography>
                <Typography variant="body1" sx={{ fontFamily: 'Poppins', color: '#1E293B', fontWeight: 500 }}>{currentUser.email}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ fontFamily: 'Poppins', color: '#64748B', display: 'block' }}>Phone</Typography>
                <Typography variant="body1" sx={{ fontFamily: 'Poppins', color: '#1E293B', fontWeight: 500 }}>{currentUser.phone || 'N/A'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ fontFamily: 'Poppins', color: '#64748B', display: 'block' }}>Role</Typography>
                <Chip
                  label={currentUser.role}
                  size="small"
                  sx={{
                    fontFamily: 'Poppins',
                    fontSize: '11px',
                    textTransform: 'capitalize',
                    backgroundColor: currentUser.role === 'admin' ? '#2563EB15' : '#64748B15',
                    color: currentUser.role === 'admin' ? '#2563EB' : '#64748B',
                    borderRadius: '6px',
                    mt: 0.5
                  }}
                />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ fontFamily: 'Poppins', color: '#64748B', display: 'block' }}>Status</Typography>
                <Chip
                  label={currentUser.is_active ? "Active" : "Inactive"}
                  size="small"
                  sx={{
                    fontFamily: 'Poppins',
                    fontSize: '11px',
                    textTransform: 'capitalize',
                    backgroundColor: currentUser.is_active ? '#22C55E15' : '#EF444415',
                    color: currentUser.is_active ? '#22C55E' : '#EF4444',
                    borderRadius: '6px',
                    mt: 0.5
                  }}
                />
              </Box>
              {currentUser.created_at && (
                <Box>
                  <Typography variant="caption" sx={{ fontFamily: 'Poppins', color: '#64748B', display: 'block' }}>Registered On</Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'Poppins', color: '#64748B' }}>
                    {new Date(currentUser.created_at).toLocaleDateString()}
                  </Typography>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button variant="contained" onClick={() => setOpenView(false)} sx={{ fontFamily: 'Poppins', textTransform: 'none', backgroundColor: '#2563EB', '&:hover': { backgroundColor: '#1D4ED8' } }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* DELETE CONFIRMATION */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>Delete User</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontFamily: 'Poppins', color: '#64748B' }}>
            Are you sure you want to delete user <strong>{currentUser?.name}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenDelete(false)} sx={{ fontFamily: 'Poppins', textTransform: 'none', color: '#64748B' }}>Cancel</Button>
          <Button variant="contained" onClick={handleDeleteUser} sx={{ fontFamily: 'Poppins', textTransform: 'none', backgroundColor: '#EF4444', '&:hover': { backgroundColor: '#DC2626' } }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users;