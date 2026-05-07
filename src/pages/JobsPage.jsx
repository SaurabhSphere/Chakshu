import { useState, useEffect } from 'react';
import { jobsService } from '../services/jobs';
import { applicationsService } from '../services/applications';
import { useAuth } from '../hooks/useAuth';
import { useUI } from '../hooks/useUI';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { parseError } from '../utils/errorHandler';

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingFor, setApplyingFor] = useState(null);
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useUI();
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await jobsService.list({ limit: 50, offset: 0, status: 'active' });
      setJobs(data?.items || []);
    } catch (error) {
      addToast(parseError(error), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId) => {
    if (!isAuthenticated) {
      addToast('Please login as a candidate to apply for jobs.', 'warning');
      navigate('/login');
      return;
    }

    if (user?.role !== 'candidate') {
      addToast('Only candidates can apply for jobs.', 'error');
      return;
    }

    try {
      setApplyingFor(jobId);
      await applicationsService.create({
        candidate_id: user.id,
        job_id: jobId,
        source: 'web'
      });
      addToast('Successfully applied for the job! 🎉', 'success');
    } catch (error) {
      addToast(parseError(error), 'error');
    } finally {
      setApplyingFor(null);
    }
  };

  return (
    <div className="container-center py-8 max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-secondary-900">Explore Open Roles</h1>
        <p className="text-secondary-600 mt-3 text-lg">Find your next opportunity and apply with one click.</p>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading jobs..." />
      ) : jobs.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-secondary-600 text-lg">No active jobs found right now. Check back later!</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {jobs.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow border border-secondary-200">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-secondary-900">{job.title}</h2>
                  <div className="flex flex-wrap items-center gap-3 mt-2 mb-4">
                    <Badge variant="primary">{job.department}</Badge>
                    <span className="text-sm text-secondary-600">
                      Experience: {job.experience_min} - {job.experience_max} years
                    </span>
                  </div>
                  <p className="text-secondary-700 mt-2 line-clamp-3 whitespace-pre-wrap">{job.job_description}</p>
                  
                  {job.skills && job.skills.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {job.skills.map(skill => (
                        <span key={skill} className="px-2 py-1 bg-secondary-100 text-secondary-700 text-xs rounded-md font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="mt-4 md:mt-0 flex flex-col items-end shrink-0">
                  <Button 
                    onClick={() => handleApply(job.id)} 
                    variant="primary" 
                    size="lg"
                    disabled={applyingFor === job.id}
                  >
                    {applyingFor === job.id ? 'Applying...' : 'Apply Now'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
