import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useUI } from '../hooks/useUI';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { jobsService } from '../services/jobs';
import { parseError } from '../utils/errorHandler';

export default function EmployerDashboard() {
  const { user } = useAuth();
  const { addToast } = useUI();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await jobsService.list({ limit: 10, offset: 0 });
      setJobs(Array.isArray(data) ? data : []);
    } catch (error) {
      addToast(parseError(error), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-center py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Dashboard</h1>
          <p className="text-secondary-600 mt-2">Welcome back, {user?.full_name || 'Employer'}</p>
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate('/employer/jobs/create')}
          className="mt-4 sm:mt-0"
        >
          + Create New Job
        </Button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="text-center">
            <p className="text-4xl font-bold text-primary-600">{jobs.length}</p>
            <p className="text-secondary-700 mt-2">Active Jobs</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-4xl font-bold text-success-600">0</p>
            <p className="text-secondary-700 mt-2">Pending Interviews</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-4xl font-bold text-primary-600">0</p>
            <p className="text-secondary-700 mt-2">Completed Interviews</p>
          </div>
        </Card>
      </div>

      {/* Jobs List */}
      <Card title="Active Jobs" subtitle="Manage your job postings">
        {loading ? (
          <LoadingSpinner />
        ) : jobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-secondary-600 mb-4">No jobs created yet</p>
            <Button
              variant="primary"
              onClick={() => navigate('/employer/jobs/create')}
            >
              Create Your First Job
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="border border-secondary-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-secondary-900">{job.title}</h3>
                    <p className="text-sm text-secondary-600">{job.department}</p>
                  </div>
                  <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                    <Badge variant={job.status === 'active' ? 'success' : 'warning'}>
                      {job.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
