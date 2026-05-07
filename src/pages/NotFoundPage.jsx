import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="container-center flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-primary-600 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-secondary-900 mb-2">Page Not Found</h2>
        <p className="text-lg text-secondary-700 mb-8">
          Sorry, the page you're looking for doesn't exist.
        </p>
        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate('/')}
        >
          Go Home
        </Button>
      </div>
    </div>
  );
}
