import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Target, Mic, BarChart3, Briefcase, Users } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    if (user?.role === 'employer') {
      navigate('/employer/dashboard', { replace: true });
    } else if (user?.role === 'candidate') {
      navigate('/', { replace: true });
    }
  }

  return (
    <div className="container-center py-16">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="inline-block mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-5xl">C</span>
          </div>
        </div>

        <h1 className="text-5xl font-bold text-secondary-900 mb-4">
          Chakshu
        </h1>
        <p className="text-2xl text-primary-600 font-semibold mb-6">
          Smart Interviews, Better Hires
        </p>

        <p className="text-lg text-secondary-700 max-w-2xl mx-auto mb-8">
          AI-enabled interview platform designed to streamline your hiring process.
          Employers create jobs and conduct intelligent interviews. Candidates showcase
          their skills through voice-based interactive sessions.
        </p>

        {!isAuthenticated && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/register?role=employer')}
            >
              Register as Employer
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/register?role=candidate')}
            >
              Register as Candidate
            </Button>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <Card hoverable className="text-center">
          <div className="flex justify-center mb-4">
            <Target className="w-12 h-12 text-primary-600" />
          </div>
          <h3 className="text-xl font-bold text-secondary-900 mb-2">Smart Screening</h3>
          <p className="text-secondary-700">
            AI-powered interview questions tailored to job requirements
          </p>
        </Card>

        <Card hoverable className="text-center">
          <div className="flex justify-center mb-4">
            <Mic className="w-12 h-12 text-primary-600" />
          </div>
          <h3 className="text-xl font-bold text-secondary-900 mb-2">Audio Interviews</h3>
          <p className="text-secondary-700">
            Candidates express themselves naturally through voice-based responses
          </p>
        </Card>

        <Card hoverable className="text-center">
          <div className="flex justify-center mb-4">
            <BarChart3 className="w-12 h-12 text-primary-600" />
          </div>
          <h3 className="text-xl font-bold text-secondary-900 mb-2">AI Reports</h3>
          <p className="text-secondary-700">
            Comprehensive analysis with scores, feedback, and recommendations
          </p>
        </Card>
      </div>

      {/* How It Works Section */}
      <div className="bg-secondary-50 rounded-lg p-12 mb-16">
        <h2 className="text-3xl font-bold text-secondary-900 text-center mb-12">
          How It Works
        </h2>

        <div className="grid md:grid-cols-4 gap-8">
          {[
            { step: 1, title: 'Create Job', desc: 'Employers post job roles with JD' },
            { step: 2, title: 'Register Candidate', desc: 'Candidates apply with their details' },
            { step: 3, title: 'AI Interview', desc: 'Smart questions asked via audio' },
            { step: 4, title: 'Get Report', desc: 'Detailed candidate assessment' },
          ].map((item, idx) => (
            <div key={idx} className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-2xl">
                {item.step}
              </div>
              <h4 className="font-semibold text-secondary-900 mb-2">{item.title}</h4>
              <p className="text-secondary-700 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      {!isAuthenticated && (
        <div className="text-center py-12">
          <h2 className="text-3xl font-bold text-secondary-900 mb-6">Ready to get started?</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/register')}
            >
              Create Account
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
