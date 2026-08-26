"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Box, 
  Container, 
  Typography, 
  OutlinedInput, 
  Button, 
  InputAdornment, 
  Link as MuiLink,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Divider,
  Fade
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SecurityIcon from "@mui/icons-material/Security";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#38bdf8", // Tailwind sky-400
    },
    background: {
      default: "#020617", // Tailwind slate-950
      paper: "#0f172a", // Tailwind slate-900
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 12,
  },
});

export default function LandingPage() {
  const [location, setLocation] = useState("");
  const router = useRouter();

  const handleContinue = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (location.trim()) {
      router.push(`/emergency?location=${encodeURIComponent(location.trim())}`);
    } else {
      router.push(`/emergency`);
    }
  };

  const handleUseCurrentLocation = () => {
    // In a real app, this would use the Geolocation API
    // For now, we simulate detecting a location
    setLocation("Current Location (GPS)");
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box 
        sx={{ 
          minHeight: "100vh", 
          display: "flex", 
          flexDirection: "column", 
          justifyContent: "center", 
          alignItems: "center",
          background: "radial-gradient(circle at center, #0f172a 0%, #020617 100%)",
          px: 2
        }}
      >
        <Fade in={true} timeout={1000}>
          <Container maxWidth="sm">
            <Box sx={{ textAlign: "center", mb: 6 }}>
              <Typography variant="h2" component="h1" color="white" gutterBottom sx={{ fontWeight: "bold" }}>
                MARG
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ letterSpacing: 1.5, textTransform: "uppercase", fontSize: "0.85rem" }}>
                Emergency Operating System
              </Typography>
            </Box>

            <Box 
              component="form" 
              onSubmit={handleContinue}
              sx={{ 
                bgcolor: "background.paper", 
                p: { xs: 4, sm: 6 }, 
                borderRadius: 4, 
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center"
              }}
            >
              <Typography variant="h5" color="white" sx={{ fontWeight: 500, mb: 4 }}>
                Where are you?
              </Typography>

              <OutlinedInput
                fullWidth
                placeholder="Enter your city or location..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                autoFocus
                startAdornment={
                  <InputAdornment position="start">
                    <LocationOnIcon color="action" />
                  </InputAdornment>
                }
                sx={{ 
                  mb: 2,
                  bgcolor: "rgba(0,0,0,0.2)",
                  '&:hover': { bgcolor: "rgba(0,0,0,0.3)" }
                }}
              />

              <Button 
                variant="text" 
                startIcon={<MyLocationIcon />}
                onClick={handleUseCurrentLocation}
                sx={{ mb: 4, color: "text.secondary", textTransform: "none" }}
              >
                Use my current location
              </Button>

              <Typography variant="body2" color="text.secondary" align="center" sx={{ maxWidth: "80%", mb: 4 }}>
                MARG will prepare emergency information, resources and guidance relevant to your area.
              </Typography>

              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleContinue}
                endIcon={<ArrowForwardIcon />}
                disabled={!location.trim()}
                sx={{ 
                  py: 1.5, 
                  fontWeight: "bold",
                  fontSize: "1.1rem"
                }}
              >
                Continue
              </Button>
            </Box>

            <Box sx={{ mt: 8, textAlign: "center" }}>
              <Divider sx={{ mb: 3, '&::before, &::after': { borderColor: 'rgba(255,255,255,0.1)' } }}>
                <Typography variant="body2" color="text.secondary">
                  Need operational access?
                </Typography>
              </Divider>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<SecurityIcon />}
                onClick={() => router.push("/admin")}
                sx={{ 
                  color: "text.secondary", 
                  borderColor: "rgba(255,255,255,0.1)",
                  '&:hover': { borderColor: "rgba(255,255,255,0.3)", color: "white" }
                }}
              >
                Command Center
              </Button>
            </Box>
          </Container>
        </Fade>
      </Box>
    </ThemeProvider>
  );
}
