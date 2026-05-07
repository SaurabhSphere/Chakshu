import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { InterviewProvider } from './context/InterviewContext';
import { UIProvider } from './context/UIContext';
import { Navbar } from './components/common/Navbar';
import { ToastContainer } from './components/common/ToastContainer';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Pages - Import placeholders (will create later)
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EmployerDashboard from './pages/EmployerDashboard';
import CreateJobPage from './pages/CreateJobPage';
import InterviewPage from './pages/InterviewPage';
import ReportPage from './pages/ReportPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {

  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <InterviewProvider>
            <UIProvider>
              <div className="flex flex-col min-h-screen bg-white">
                <Navbar />
                <main className="flex-1">
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    {/* Protected Routes - Employer */}
                    <Route element={<ProtectedRoute allowedRoles={['employer']} />}>
                      <Route path="/employer/dashboard" element={<EmployerDashboard />} />
                      <Route path="/employer/jobs/create" element={<CreateJobPage />} />
                      <Route path="/employer/reports/:sessionId" element={<ReportPage />} />
                    </Route>

                    {/* Protected Routes - Candidate */}
                    <Route element={<ProtectedRoute allowedRoles={['candidate']} />}>
                      <Route path="/candidate/interview/:sessionId" element={<InterviewPage />} />
                    </Route>

                    {/* Fallback */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </main>
                <ToastContainer />
              </div>
            </UIProvider>
          </InterviewProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
