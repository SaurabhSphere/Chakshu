import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUI } from '../hooks/useUI';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input, TextArea, Select } from '../components/common/Input';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorAlert } from '../components/common/Alert';
import { jobsService } from '../services/jobs';
import { parseError } from '../utils/errorHandler';
import { validateJobForm } from '../utils/validators';
import { useAuth } from '../hooks/useAuth';

export default function CreateJobPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useUI();

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    title: '',
    department: '',
    description: '',
    experienceMin: 0,
    experienceMax: 10,
    skills: '',
    status: 'active',
  });

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
    const { isValid, errors: validationErrors } = validateJobForm(formData);
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);

      const jobData = {
        employer_id: user?.employer_id,
        title: formData.title,
        department: formData.department,
        job_description: formData.description,
        experience_min: parseInt(formData.experienceMin),
        experience_max: parseInt(formData.experienceMax),
        skills: formData.skills
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s.length > 0),
        status: formData.status,
      };

      await jobsService.create(jobData);
      addToast('Job created successfully! 🎉', 'success');
      navigate('/employer/dashboard');
    } catch (error) {
      const errorMsg = parseError(error);
      setApiError(errorMsg);
      addToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-center py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/employer/dashboard')}
            className="text-link text-sm font-semibold mb-4"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-secondary-900">Create New Job</h1>
          <p className="text-secondary-600 mt-2">Post a job and start receiving applications</p>
        </div>

        <Card>
          {apiError && (
            <ErrorAlert message={apiError} onClose={() => setApiError('')} />
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <Input
              label="Job Title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              error={errors.title}
              placeholder="e.g., Senior Python Developer"
              required
            />

            {/* Department */}
            <Input
              label="Department"
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              error={errors.department}
              placeholder="e.g., Engineering"
              required
            />

            {/* Experience Range */}
            <div className="grid md:grid-cols-2 gap-6">
              <Input
                label="Minimum Experience (years)"
                type="number"
                name="experienceMin"
                value={formData.experienceMin}
                onChange={handleChange}
                min="0"
              />
              <Input
                label="Maximum Experience (years)"
                type="number"
                name="experienceMax"
                value={formData.experienceMax}
                onChange={handleChange}
                min="0"
              />
            </div>

            {/* Description */}
            <TextArea
              label="Job Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              error={errors.description}
              placeholder="Describe the role, responsibilities, and requirements..."
              rows={6}
              required
            />

            {/* Skills */}
            <TextArea
              label="Required Skills (comma-separated)"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="Python, FastAPI, PostgreSQL, Docker"
              rows={3}
            />

            {/* Status */}
            <Select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'draft', label: 'Draft' },
                { value: 'closed', label: 'Closed' },
              ]}
            />

            {/* Buttons */}
            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={() => navigate('/employer/dashboard')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Job'}
              </Button>
            </div>
          </form>
        </Card>

        {loading && <LoadingSpinner fullScreen />}
      </div>
    </div>
  );
}
