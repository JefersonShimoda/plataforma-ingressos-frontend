import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import theme from './theme/theme';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/auth/AuthModal';
import { ServerWarmupModal } from './components/common/ServerWarmupModal';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Pages
import { HomePage } from './pages/HomePage';
import { EventDetailsPage } from './pages/EventDetailsPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { MyTicketsPage } from './pages/MyTicketsPage';
import { PublicTicketPage } from './pages/PublicTicketPage';
import { OrganizerDashboardPage } from './pages/OrganizerDashboardPage';
import { CreateEventPage } from './pages/CreateEventPage';
import { PorterCheckinPage } from './pages/PorterCheckinPage';
import { NotFoundPage } from './pages/NotFoundPage';

const GlobalAuthModal: React.FC = () => {
  const { authModalOpen, closeAuthModal, authModalTab } = useAuth();
  return (
    <AuthModal
      open={authModalOpen}
      onClose={closeAuthModal}
      initialTab={authModalTab}
    />
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider
        maxSnack={3}
        autoHideDuration={4000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        style={{
          borderRadius: '12px',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 600,
        }}
      >
        <AuthProvider>
          <BrowserRouter>
            <GlobalAuthModal />
            <ServerWarmupModal />
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
                backgroundColor: '#0B0F19',
              }}
            >
              <Navbar />
              <Box component="main" sx={{ flexGrow: 1 }}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/events/:id" element={<EventDetailsPage />} />
                  <Route path="/tickets/share/:shareToken" element={<PublicTicketPage />} />

                  {/* Client Protected Routes */}
                  <Route
                    path="/checkout/:reservationId"
                    element={
                      <ProtectedRoute allowedRoles={['CLIENT', 'ORGANIZER', 'PORTER']}>
                        <CheckoutPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/my-tickets"
                    element={
                      <ProtectedRoute allowedRoles={['CLIENT', 'ORGANIZER', 'PORTER']}>
                        <MyTicketsPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Organizer Protected Routes */}
                  <Route
                    path="/organizer"
                    element={
                      <ProtectedRoute allowedRoles={['ORGANIZER']}>
                        <OrganizerDashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/organizer/events/new"
                    element={
                      <ProtectedRoute allowedRoles={['ORGANIZER']}>
                        <CreateEventPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Porter / Check-in Protected Routes */}
                  <Route
                    path="/portaria"
                    element={
                      <ProtectedRoute allowedRoles={['PORTER', 'ORGANIZER']}>
                        <PorterCheckinPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Auth fallback route */}
                  <Route path="/login" element={<Navigate to="/" replace />} />

                  {/* 404 Route */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Box>
              <Footer />
            </Box>
          </BrowserRouter>
        </AuthProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
};

export default App;
