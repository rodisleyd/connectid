import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AppLayout from './pages/AppLayout';
import PublicCardPage from './pages/PublicCardPage';
import AdminDashboard from './pages/AdminDashboard';

// Mock Auth Protection for now (Will integrate Firebase Auth state later)
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    // TODO: Check Firebase Auth
    const isAuthenticated = true; // Temporary allow
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/card/:id" element={<PublicCardPage />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route
                    path="/app"
                    element={
                        <ProtectedRoute>
                            <AppLayout />
                        </ProtectedRoute>
                    }
                />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
};

export default App;
