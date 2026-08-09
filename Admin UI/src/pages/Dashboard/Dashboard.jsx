import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  Skeleton
} from '@mui/material';
import {
  People,
  Feedback,
  Warning,
  LocalParking,
  Poll,
  ReportProblem
} from '@mui/icons-material';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { dashboardService } from '../../services/dashboard.service';
import { complaintService } from '../../services/complaint.service';
// import { emergencyService } from '../../services/emergency.service';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch dashboard statistics from API
        const statsResponse = await dashboardService.getStats();
        console.log("Dashboard Response:", statsResponse);
        if (statsResponse.success) {
          // Fetch lists from complaints and emergencies for the tables
          let recentComplaints = [];
          let recentEmergencies = [];

          try {
            const complaintsRes = await complaintService.getComplaints();
            if (complaintsRes.success) {
              recentComplaints = complaintsRes.data.slice(0, 5);
            }
          } catch (e) {
            console.error('Complaints service not active yet', e);
          }

          setDashboardData({
            stats: statsResponse.data,
            recentComplaints,
            recentEmergencies
          });
        } else {
          setError(statsResponse.message || 'Failed to fetch dashboard data.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Error connecting to the server.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width={250} height={40} />
          <Skeleton variant="text" width={400} height={20} />
        </Box>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid item xs={12} sm={6} md={4} lg={2} key={i}>
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: '12px' }} />
            </Grid>
          ))}
        </Grid>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: '12px' }} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: '12px' }} />
          </Grid>
        </Grid>
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: '12px' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ borderRadius: '12px' }}>
          {error}
        </Alert>
      </Box>
    );
  }

  const stats = dashboardData?.stats || {};
  const recentComplaints = dashboardData?.recentComplaints || [];
  const recentEmergencies = dashboardData?.recentEmergencies || [];

  const cardData = [
    { title: 'Total Users', count: stats.totalUsers || 0, icon: <People />, color: '#2563EB' },
    { title: 'Total Complaints', count: stats.totalComplaints || 0, icon: <ReportProblem />, color: '#F59E0B' },
    { title: 'Parking Bookings', count: stats.activeParkingBookings || 0, icon: <LocalParking />, color: '#22C55E' },
    { title: 'Feedback Count', count: stats.totalFeedbacks || 0, icon: <Feedback />, color: '#64748B' },
    { title: 'Polls Count', count: stats.activePolls || 0, icon: <Poll />, color: '#9333EA' },

  ];

  // Map backend complaint values to Pie Chart dataset
  const complaintStatusData = [
    { name: 'Pending', value: stats.pendingComplaints || 0, color: '#F59E0B' },
    { name: 'Resolved', value: stats.resolvedComplaints || 0, color: '#22C55E' }
  ];

  // Map general stats to charts dynamically to adapt to available properties
  const generalAnalyticsData = [
    { name: 'Users', count: stats.totalUsers || 0, color: '#2563EB' },
    { name: 'Complaints', count: stats.totalComplaints || 0, color: '#F59E0B' },
    { name: 'Feedbacks', count: stats.totalFeedbacks || 0, color: '#64748B' }
  ];

  return (
    <Box sx={{ p: 3, backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      {/* Title Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 600,
            color: '#1E293B',
            mb: 1
          }}
        >
          City Dashboard
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontFamily: 'Poppins, sans-serif',
            color: '#64748B'
          }}
        >
          Overview of municipal metrics, citizen feedback, and emergency dispatches.
        </Typography>
      </Box>

      {/* KPI Metric Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {cardData.map((card, idx) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={idx}>
            <Card
              sx={{
                borderRadius: '12px',
                border: '1px solid #E5E7EB',
                boxShadow: '0 2px 8px rgba(15,23,42,.06)',
                backgroundColor: '#FFFFFF',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 1.5
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 36,
                      height: 36,
                      borderRadius: '8px',
                      backgroundColor: `${card.color}15`,
                      color: card.color
                    }}
                  >
                    {card.icon}
                  </Box>
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: 'Poppins, sans-serif',
                    color: '#64748B',
                    fontWeight: 500,
                    display: 'block',
                    mb: 0.5
                  }}
                >
                  {card.title}
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 600,
                    color: '#1E293B'
                  }}
                >
                  {card.count.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Analytics Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Complaint Status Chart */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 2px 8px rgba(15,23,42,.06)'
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 600,
                  color: '#1E293B',
                  mb: 3
                }}
              >
                Complaint Status Ratio
              </Typography>
              <Box sx={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={complaintStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {complaintStatusData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        fontFamily: 'Poppins, sans-serif',
                        borderRadius: '8px',
                        border: '1px solid #E5E7EB'
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      formatter={(value) => (
                        <span style={{ fontFamily: 'Poppins, sans-serif', color: '#1E293B', fontSize: '12px' }}>
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Global Distribution Chart */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 2px 8px rgba(15,23,42,.06)'
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 600,
                  color: '#1E293B',
                  mb: 3
                }}
              >
                Registered Civic Volume Metrics
              </Typography>
              <Box sx={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={generalAnalyticsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis
                      dataKey="name"
                      stroke="#94A3B8"
                      style={{ fontSize: '11px', fontFamily: 'Poppins' }}
                    />
                    <YAxis stroke="#94A3B8" style={{ fontSize: '11px', fontFamily: 'Poppins' }} />
                    <Tooltip
                      contentStyle={{
                        fontFamily: 'Poppins, sans-serif',
                        borderRadius: '8px',
                        border: '1px solid #E5E7EB'
                      }}
                    />
                    <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} name="Volume">
                      {generalAnalyticsData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tables Row */}
      <Grid container spacing={3}>
        {/* Recent Complaints */}
        <Grid item xs={12} lg={6}>
          <Card
            sx={{
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 2px 8px rgba(15,23,42,.06)'
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 600,
                  color: '#1E293B',
                  mb: 2
                }}
              >
                Recent Complaints
              </Typography>
              <TableContainer component={Paper} elevation={0} sx={{ border: 'none' }}>
                <Table sx={{ minWidth: 400 }}>
                  <TableHead sx={{ backgroundColor: '#F8FAFC' }}>
                    <TableRow>
                      <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#64748B' }}>Title</TableCell>
                      <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#64748B' }}>Category</TableCell>
                      <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#64748B' }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentComplaints.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} align="center" sx={{ fontFamily: 'Poppins', color: '#64748B', py: 3 }}>
                          No recent complaints.
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentComplaints.map((row) => (
                        <TableRow
                          key={row.id}
                          hover
                          sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                          <TableCell sx={{ fontFamily: 'Poppins', color: '#1E293B' }}>{row.title}</TableCell>
                          <TableCell sx={{ fontFamily: 'Poppins', color: '#64748B' }}>{row.category}</TableCell>
                          <TableCell>
                            <Chip
                              label={row.status}
                              size="small"
                              sx={{
                                fontFamily: 'Poppins',
                                fontWeight: 500,
                                fontSize: '11px',
                                textTransform: 'capitalize',
                                backgroundColor:
                                  row.status === 'resolved'
                                    ? '#22C55E15'
                                    : row.status === 'in_progress'
                                      ? '#F59E0B15'
                                      : '#EF444415',
                                color:
                                  row.status === 'resolved'
                                    ? '#22C55E'
                                    : row.status === 'in_progress'
                                      ? '#F59E0B'
                                      : '#EF4444',
                                borderRadius: '6px'
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Emergencies */}
        <Grid item xs={12} lg={6}>
          <Card
            sx={{
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 2px 8px rgba(15,23,42,.06)'
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 600,
                  color: '#1E293B',
                  mb: 2
                }}
              >
                Recent Emergency Requests
              </Typography>
              <TableContainer component={Paper} elevation={0} sx={{ border: 'none' }}>
                <Table sx={{ minWidth: 400 }}>
                  <TableHead sx={{ backgroundColor: '#F8FAFC' }}>
                    <TableRow>
                      <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#64748B' }}>Type</TableCell>
                      <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#64748B' }}>Location</TableCell>
                      <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#64748B' }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentEmergencies.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} align="center" sx={{ fontFamily: 'Poppins', color: '#64748B', py: 3 }}>
                          No recent emergency dispatches.
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentEmergencies.map((row) => (
                        <TableRow
                          key={row.id}
                          hover
                          sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                          <TableCell sx={{ fontFamily: 'Poppins', color: '#1E293B', fontWeight: 500 }}>
                            {row.type}
                          </TableCell>
                          <TableCell sx={{ fontFamily: 'Poppins', color: '#64748B' }}>{row.location}</TableCell>
                          <TableCell>
                            <Chip
                              label={row.status}
                              size="small"
                              sx={{
                                fontFamily: 'Poppins',
                                fontWeight: 500,
                                fontSize: '11px',
                                textTransform: 'capitalize',
                                backgroundColor:
                                  row.status === 'resolved'
                                    ? '#22C55E15'
                                    : row.status === 'dispatched'
                                      ? '#F59E0B15'
                                      : '#EF444415',
                                color:
                                  row.status === 'resolved'
                                    ? '#22C55E'
                                    : row.status === 'dispatched'
                                      ? '#F59E0B'
                                      : '#EF4444',
                                borderRadius: '6px'
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
