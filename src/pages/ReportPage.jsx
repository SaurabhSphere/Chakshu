import { useParams } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export default function ReportPage() {
  const { sessionId } = useParams();

  return (
    <div className="container-center py-8">
      <Card title="Interview Report">
        <div className="text-center py-12">
          <p className="text-lg text-secondary-700 mb-4">
            Report for session: {sessionId}
          </p>
          <p className="text-secondary-600 mb-8">
            The report feature is coming soon! This is where employers will see detailed interview analysis, scores, and recommendations.
          </p>
          <LoadingSpinner message="Loading interview report..." />
        </div>
      </Card>
    </div>
  );
}
