import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';
import RootRedirect from './components/RootRedirect';
import LoginPage from './pages/LoginPage';
import AttendancePage from './pages/AttendancePage';
import AttendanceHistoryPage from './pages/AttendanceHistoryPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import EmployeeManagement from './pages/EmployeeManagement';
import AdminAttendancePage from './pages/AdminAttendancePage';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route
            path="/login"
            element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            }
          />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route
                path="/"
                element={
                  <ProtectedRoute requiredRole="employee">
                    <AttendancePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute requiredRole="employee">
                    <AttendanceHistoryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employees"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <EmployeeManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/attendance"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminAttendancePage />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Route>

          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
