import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useUI } from '../hooks/useUI';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card } from '../components/common/Card';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorAlert } from '../components/common/Alert';
import { authService } from '../services/auth';
import { validateLoginForm } from '../utils/validators';
import { parseError } from '../utils/errorHandler';
import { Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useAuth();
  const { addToast } = useUI();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    // Validate
    const { isValid, errors: validationErrors } = validateLoginForm(
      formData.email,
      formData.password
    );

    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    try {
      const { user, token } = await authService.login(formData.email, formData.password);
      login(user, token);
      addToast('Login successful! 🎉', 'success');
      
      // Redirect based on role
      if (user.role === 'employer') {
        navigate('/employer/dashboard');
      } else {
        navigate('/');
      }
    } catch (error) {
      const errorMsg = parseError(error);
      setApiError(errorMsg);
      addToast(errorMsg, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-3xl">C</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-secondary-900">Welcome Back</h1>
            <p className="text-secondary-600 mt-2">Sign in to your Chakshu account</p>
          </div>

          {/* Error Alert */}
          {apiError && (
            <ErrorAlert message={apiError} onClose={() => setApiError('')} />
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="you@example.com"
              icon={Mail}
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="Enter your password"
              icon={Lock}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={loading}
              className="mt-6"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center border-t border-secondary-200 pt-6">
            <p className="text-secondary-600 text-sm">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-link font-semibold"
              >
                Create one
              </button>
            </p>
          </div>
        </Card>

        {/* Loading Spinner */}
        {loading && <LoadingSpinner fullScreen message="Signing you in..." />}
      </div>
    </div>
  );
}
