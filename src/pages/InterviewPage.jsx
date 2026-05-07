import { useParams } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export default function InterviewPage() {
  const { sessionId } = useParams();

  return (
    <div className="container-center py-8">
      <Card title="Interview Session">
        <div className="text-center py-12">
          <p className="text-lg text-secondary-700 mb-4">
            Interview session: {sessionId}
          </p>
          <p className="text-secondary-600 mb-8">
            The interview feature is coming soon! This is where candidates will answer AI-generated questions via audio.
          </p>
          <LoadingSpinner message="Loading interview questions..." />
        </div>
      </Card>
    </div>
  );
}
