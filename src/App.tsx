import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { TimerProvider } from './contexts/TimerContext';
import { FloatingTimer } from './components/FloatingTimer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { CreateDebate } from './pages/CreateDebate';
import { DebateDetail } from './pages/DebateDetail';

function App() {
  return (
    <AuthProvider>
      <TimerProvider>
        <BrowserRouter>
          <FloatingTimer />
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/debates/create"
            element={
              <ProtectedRoute>
                <CreateDebate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/debates/:id"
            element={
              <ProtectedRoute>
                <DebateDetail />
              </ProtectedRoute>
            }
          />
        </Routes>
        </BrowserRouter>
      </TimerProvider>
    </AuthProvider>
  );
}

export default App;
