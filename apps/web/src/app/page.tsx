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
import { resolveLocation, reverseGeocode, ResolvedLocation } from "@/lib/location";

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
  const [resolved, setResolved] = useState<ResolvedLocation | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const handleContinue = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const result = resolved || await handleResolve();
    if (!result) return;
    router.push(`/emergency?display=${encodeURIComponent(result.displayName)}&lat=${result.latitude}&lng=${result.longitude}`);
  };

  const handleResolve = async (value = location): Promise<ResolvedLocation | null> => {
    setBusy(true); setError(""); setResolved(null);
    try {
      const result = await resolveLocation(value);
      setLocation(result.displayName.split(",")[0]); setResolved(result); return result;
    } catch (err) { setError(err instanceof Error ? err.message : "Could not resolve that location."); return null; }
    finally { setBusy(false); }
  };

  const handleUseCurrentLocation = () => {
    setError("");
    if (!navigator.geolocation) { setError("This browser does not support location services."); return; }
    setBusy(true); setResolved(null);
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const result = await reverseGeocode(coords.latitude, coords.longitude);
        setLocation(result.displayName.split(",")[0]); setResolved(result);
      } catch (err) { setError(err instanceof Error ? err.message : "Could not name your current area."); }
      finally { setBusy(false); }
    }, (geoError) => {
      const messages: Record<number, string> = { 1: "Location permission was denied. You can enter a city instead.", 2: "Your position is currently unavailable.", 3: "Location detection timed out. Try again or enter a city." };
      setError(messages[geoError.code] || "Could not detect your current location."); setBusy(false);
    }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
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
                onChange={(e) => { setLocation(e.target.value); setResolved(null); setError(""); }}
                onBlur={() => location.trim() && !resolved && handleResolve()}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleResolve(); } }}
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
                {busy ? "Resolving location..." : "Use my current location"}
              </Button>

              {error && <Typography color="error" variant="body2" sx={{ mb: 2, textAlign: "center" }}>{error}</Typography>}
              {resolved && <Typography color="success.main" variant="body2" sx={{ mb: 2, textAlign: "center" }}>Location verified · {resolved.latitude.toFixed(4)}, {resolved.longitude.toFixed(4)}</Typography>}

              <Typography variant="body2" color="text.secondary" align="center" sx={{ maxWidth: "80%", mb: 4 }}>
                MARG will prepare emergency information, resources and guidance relevant to your area.
              </Typography>

              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleContinue}
                endIcon={<ArrowForwardIcon />}
                disabled={!location.trim() || !resolved || busy}
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
