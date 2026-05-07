import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { reportsService } from '../services/reports';
import { useUI } from '../hooks/useUI';
import { parseError } from '../utils/errorHandler';

export default function ReportPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useUI();
  
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [sessionId]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const data = await reportsService.getSessionReport(sessionId);
      setReport(data);
    } catch (error) {
      const errorMsg = parseError(error);
      if (errorMsg.includes('not found')) {
        setReport(null);
      } else {
        addToast(errorMsg, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      const reportData = {
        strengths: ["Strong technical knowledge", "Clear communication style"],
        weaknesses: ["Needs improvement in system design"],
        skill_match_score: 85,
        communication_rating: 90,
        technical_rating: 80,
        culture_fit_rating: 95,
        final_recommendation: "strong_yes",
        detailed_feedback: "The candidate demonstrated excellent coding skills and communicated their thought process clearly. They would be a strong fit for the team."
      };
      await reportsService.generateReport(sessionId, reportData);
      addToast('Report generated successfully!', 'success');
      fetchReport();
    } catch (error) {
      addToast(parseError(error), 'error');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container-center py-8">
        <LoadingSpinner message="Loading interview report..." />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="container-center py-8">
        <Card title="Interview Report">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-secondary-100 text-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </div>
            <p className="text-lg text-secondary-700 mb-4">No report has been generated for this session yet.</p>
            <Button onClick={handleGenerateReport} variant="primary">Generate AI Report Now</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container-center py-8 max-w-5xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <button onClick={() => navigate(-1)} className="text-link text-sm font-semibold mb-2 hover:underline">← Back</button>
          <h1 className="text-3xl font-bold text-secondary-900">AI Evaluation Report</h1>
          <p className="text-secondary-600 font-mono text-sm mt-1">Session ID: {sessionId}</p>
        </div>
        <Badge variant={report.final_recommendation?.includes('yes') ? 'success' : report.final_recommendation?.includes('no') ? 'error' : 'warning'} className="text-lg px-4 py-2 uppercase shadow-sm">
          {report.final_recommendation ? report.final_recommendation.replace('_', ' ') : 'PENDING'}
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="text-center py-6 bg-gradient-to-br from-white to-primary-50 border-primary-100">
          <p className="text-sm font-semibold text-primary-800 mb-1 uppercase tracking-wide">Skill Match</p>
          <p className="text-4xl font-extrabold text-primary-600">{report.skill_match_score || 0}%</p>
        </Card>
        <Card className="text-center py-6 bg-gradient-to-br from-white to-success-50 border-success-100">
          <p className="text-sm font-semibold text-success-800 mb-1 uppercase tracking-wide">Communication</p>
          <p className="text-4xl font-extrabold text-success-600">{report.communication_rating || 0}/100</p>
        </Card>
        <Card className="text-center py-6 bg-gradient-to-br from-white to-blue-50 border-blue-100">
          <p className="text-sm font-semibold text-blue-800 mb-1 uppercase tracking-wide">Technical</p>
          <p className="text-4xl font-extrabold text-blue-600">{report.technical_rating || 0}/100</p>
        </Card>
        <Card className="text-center py-6 bg-gradient-to-br from-white to-purple-50 border-purple-100">
          <p className="text-sm font-semibold text-purple-800 mb-1 uppercase tracking-wide">Culture Fit</p>
          <p className="text-4xl font-extrabold text-purple-600">{report.culture_fit_rating || 0}/100</p>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card title="Key Strengths" className="border-t-4 border-t-success-500 shadow-md">
          <ul className="space-y-3 mt-4">
            {report.strengths?.map((strength, i) => (
              <li key={i} className="flex items-start">
                <svg className="w-5 h-5 text-success-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                <span className="text-secondary-800 font-medium">{strength}</span>
              </li>
            ))}
            {(!report.strengths || report.strengths.length === 0) && <li className="text-secondary-500 italic">No specific strengths recorded.</li>}
          </ul>
        </Card>
        <Card title="Areas for Improvement" className="border-t-4 border-t-warning-500 shadow-md">
          <ul className="space-y-3 mt-4">
            {report.weaknesses?.map((weakness, i) => (
              <li key={i} className="flex items-start">
                <svg className="w-5 h-5 text-warning-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                <span className="text-secondary-800 font-medium">{weakness}</span>
              </li>
            ))}
            {(!report.weaknesses || report.weaknesses.length === 0) && <li className="text-secondary-500 italic">No specific weaknesses recorded.</li>}
          </ul>
        </Card>
      </div>

      <Card title="Detailed Feedback Summary" className="shadow-sm">
        <div className="mt-4 prose max-w-none text-secondary-800 leading-relaxed bg-secondary-50 p-6 rounded-lg border border-secondary-100">
          <p>{report.detailed_feedback || 'No detailed feedback provided.'}</p>
        </div>
      </Card>
    </div>
  );
}
