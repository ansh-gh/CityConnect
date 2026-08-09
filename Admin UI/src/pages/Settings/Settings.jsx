import React from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Stack,
  Chip,
  Divider,
} from "@mui/material";
import { Person } from "@mui/icons-material";

import cityLogo from "../../assets/photo_2026-04-23_23-37-01.jpg";

const Settings = () => {
  const admin = useSelector((state) => state.auth.user);

  return (
    <Box
      sx={{
        p: 3,
        minHeight: "60vh",
        backgroundColor: "#F8FAFC",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 500,
          borderRadius: "14px",
          border: "1px solid #c5d4f2",
          boxShadow: "0 2px 12px rgba(15,23,42,.05)",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Stack direction="row" spacing={2} alignItems="center" mb={3}>
            <Avatar
              src={cityLogo}
              alt="Administrator Profile"
              sx={{
                width: 56,
                height: 56,
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
              }}
            />

            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: "Poppins",
                  fontWeight: 600,
                }}
              >
                Administrator Profile
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: "#64748B",
                  fontFamily: "Poppins",
                }}
              >
                Logged in administrator details
              </Typography>
            </Box>
          </Stack>

          <Divider sx={{ mb: 4 }} />

          {/* Avatar */}
          <Stack alignItems="center" spacing={2} mb={4}>
            <Avatar
              src={cityLogo}
              alt="Admin Profile Picture"
              sx={{
                width: 96,
                height: 96,
                boxShadow: "0 4px 14px rgba(37,99,235,0.25)",
                border: "3px solid #2563EB"
              }}
            />

            <Typography
              variant="h5"
              sx={{
                fontFamily: "Poppins",
                fontWeight: 600,
              }}
            >
              {admin?.name || admin?.full_name || "Municipal Officer"}
            </Typography>

            <Chip
              label={admin?.role}
              sx={{
                bgcolor: "#2563EB15",
                color: "#2563EB",
                fontWeight: 500,
              }}
            />
          </Stack>

          {/* Details */}
          <Stack spacing={3}>
            <Box>
              <Typography
                variant="caption"
                sx={{
                  color: "#64748B",
                  fontFamily: "Poppins",
                }}
              >
                Email
              </Typography>

              <Typography
                sx={{
                  fontFamily: "Poppins",
                  fontWeight: 500,
                }}
              >
                {admin?.email}
              </Typography>
            </Box>

            <Box>
              <Typography
                variant="caption"
                sx={{
                  color: "#64748B",
                  fontFamily: "Poppins",
                }}
              >
                Role
              </Typography>

              <Typography
                sx={{
                  fontFamily: "Poppins",
                  fontWeight: 500,
                  textTransform: "capitalize",
                }}
              >
                {admin?.role}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Settings;