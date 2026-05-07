import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useUI } from '../hooks/useUI';
import { Button } from '../components/common/Button';
import { Input, Select } from '../components/common/Input';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorAlert } from '../components/common/Alert';
import { authService } from '../services/auth';
import { candidatesService } from '../services/candidates';
import { employersService } from '../services/employers';
import { validateRegisterForm, validateCandidateForm } from '../utils/validators';
import { parseError } from '../utils/errorHandler';
import { USER_ROLES } from '../utils/constants';
import { Mail, Lock, User, Briefcase, Target } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, loading, setLoading } = useAuth();
  const { addToast } = useUI();

  const roleParam = searchParams.get('role') || 'employer';
  const [role, setRole] = useState(roleParam);
  const [step, setStep] = useState(1); // Step 1: Role selection, Step 2: Account setup

  // Account setup form
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobile: '',
    companyName: '',
    website: '',
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

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    // Validate form
    const { isValid, errors: validationErrors } = validateRegisterForm(formData, role);

    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);

      if (role === 'employer') {
        // Register employer first
        const employerData = {
          company_name: formData.companyName,
          website: formData.website || '',
          contact_email: formData.email
        };
        const newEmployer = await employersService.create(employerData);

        // Register user
        const registrationData = {
          full_name: formData.fullName,
          email: formData.email,
          password: formData.password,
          employer_id: newEmployer.id,
          role: USER_ROLES.EMPLOYER,
        };

        const user = await authService.register(registrationData);
        
        // Login after registration
        const loginResult = await authService.login(formData.email, formData.password);
        login(loginResult.user, loginResult.token);
        
        addToast('Registration successful! Welcome to Chakshu 🎉', 'success');
        navigate('/employer/dashboard');
      } else if (role === 'candidate') {
        // Register candidate
        const candidateData = {
          full_name: formData.fullName,
          email: formData.email,
          mobile: formData.mobile || null,
        };

        await candidatesService.register(candidateData);
        addToast('Registration successful! Check your email.', 'success');
        navigate('/login');
      }
    } catch (error) {
      const errorMsg = parseError(error);
      setApiError(errorMsg);
      addToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg">
        {/* Step 1: Role Selection */}
        {step === 1 && (
          <Card className="shadow-lg">
            <div className="text-center mb-8">
              <div className="inline-block mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-3xl">C</span>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-secondary-900">Join Chakshu</h1>
              <p className="text-secondary-600 mt-2">Choose your role to get started</p>
            </div>

            <div className="space-y-4">
              {/* Employer Option */}
              <button
                onClick={() => handleRoleSelect('employer')}
                className="w-full p-6 border-2 border-secondary-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all group"
              >
                <div className="flex items-start space-x-4">
                  <Briefcase className="w-8 h-8 text-primary-600 flex-shrink-0" />
                  <div className="text-left flex-1">
                    <h3 className="font-bold text-secondary-900 group-hover:text-primary-600">
                      I'm an Employer
                    </h3>
                    <p className="text-sm text-secondary-600 mt-1">
                      Post jobs and conduct AI-powered interviews
                    </p>
                  </div>
                  <div className="text-primary-600 group-hover:scale-110 transition-transform">
                    →
                  </div>
                </div>
              </button>

              {/* Candidate Option */}
              <button
                onClick={() => handleRoleSelect('candidate')}
                className="w-full p-6 border-2 border-secondary-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all group"
              >
                <div className="flex items-start space-x-4">
                  <Target className="w-8 h-8 text-primary-600 flex-shrink-0" />
                  <div className="text-left flex-1">
                    <h3 className="font-bold text-secondary-900 group-hover:text-primary-600">
                      I'm a Candidate
                    </h3>
                    <p className="text-sm text-secondary-600 mt-1">
                      Apply for jobs and showcase your skills
                    </p>
                  </div>
                  <div className="text-primary-600 group-hover:scale-110 transition-transform">
                    →
                  </div>
                </div>
              </button>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center border-t border-secondary-200 pt-6">
              <p className="text-secondary-600 text-sm">
                Already have an account?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="text-link font-semibold"
                >
                  Sign in
                </button>
              </p>
            </div>
          </Card>
        )}

        {/* Step 2: Account Setup */}
        {step === 2 && (
          <Card className="shadow-lg">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <button
                  onClick={() => setStep(1)}
                  className="text-secondary-600 hover:text-secondary-900 transition-colors"
                >
                  ←
                </button>
                <Badge variant="info">
                  {role === 'employer' ? 'Employer Registration' : 'Candidate Registration'}
                </Badge>
              </div>
              <h1 className="text-2xl font-bold text-secondary-900">Create Your Account</h1>
            </div>

            {/* Error Alert */}
            {apiError && (
              <ErrorAlert message={apiError} onClose={() => setApiError('')} />
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Full Name"
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                error={errors.fullName}
                placeholder="John Doe"
                icon={User}
                required
              />

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

              {role === 'employer' && (
                <>
                  <Input
                    label="Company Name"
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    error={errors.companyName}
                    placeholder="Tech Corp"
                    icon={Briefcase}
                    required
                  />
                  <Input
                    label="Company Website (Optional)"
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    error={errors.website}
                    placeholder="https://techcorp.com"
                  />
                </>
              )}

              {role === 'candidate' && (
                <Input
                  label="Mobile Number (Optional)"
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  error={errors.mobile}
                  placeholder="+1-555-0123"
                />
              )}

              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="At least 8 characters"
                icon={Lock}
                required
              />

              <Input
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                placeholder="Re-enter your password"
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
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center border-t border-secondary-200 pt-6">
              <p className="text-secondary-600 text-sm">
                Already have an account?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="text-link font-semibold"
                >
                  Sign in
                </button>
              </p>
            </div>
          </Card>
        )}

        {loading && <LoadingSpinner fullScreen />}
      </div>
    </div>
  );
}
