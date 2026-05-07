import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Button } from '../components/common/Button';
import { TextArea } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { interviewsService } from '../services/interviews';
import { useUI } from '../hooks/useUI';
import { parseError } from '../utils/errorHandler';

export default function InterviewPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useUI();

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    initInterview();
  }, [sessionId]);

  const initInterview = async () => {
    try {
      setLoading(true);
      const sessionData = await interviewsService.getSession(sessionId);
      setSession(sessionData);

      if (sessionData.status === 'completed') {
        setIsCompleted(true);
        setLoading(false);
        return;
      }

      if (sessionData.status === 'pending') {
         await interviewsService.startSession(sessionId);
      }

      const questionsData = await interviewsService.getQuestions(sessionId);
      const fetchedQuestions = questionsData.items || questionsData || [];
      
      // Auto-generate some questions if none exist for testing purposes
      if (fetchedQuestions.length === 0) {
        await interviewsService.addQuestion(sessionId, {
          question: "Tell me about your experience with building RESTful APIs.",
          category: "technical",
          difficulty: "medium",
          generated_by_ai: true
        });
        await interviewsService.addQuestion(sessionId, {
          question: "How do you handle state management in large React applications?",
          category: "technical",
          difficulty: "hard",
          generated_by_ai: true
        });
        const freshData = await interviewsService.getQuestions(sessionId);
        setQuestions(freshData.items || freshData || []);
      } else {
        setQuestions(fetchedQuestions);
      }
    } catch (error) {
      addToast(parseError(error), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (!answerText.trim()) {
      addToast('Please provide an answer before proceeding.', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      const currentQuestion = questions[currentIndex];
      
      await interviewsService.submitAnswer(currentQuestion.id, {
        answer_text: answerText,
      });

      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setAnswerText('');
      } else {
        await interviewsService.endSession(sessionId);
        setIsCompleted(true);
        addToast('Interview completed successfully!', 'success');
      }
    } catch (error) {
      addToast(parseError(error), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="container-center py-12"><LoadingSpinner message="Initializing AI interview..." /></div>;

  if (isCompleted) {
    return (
      <div className="container-center py-12 max-w-2xl mx-auto">
        <Card className="text-center py-16 shadow-lg border-t-8 border-t-success-500">
          <div className="w-24 h-24 bg-success-100 text-success-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h2 className="text-3xl font-extrabold text-secondary-900 mb-4">Interview Completed!</h2>
          <p className="text-lg text-secondary-600 mb-8 max-w-md mx-auto">Thank you for your time. Your responses have been recorded successfully. The employer will review your AI report shortly.</p>
          <Button onClick={() => navigate('/')} variant="primary" size="lg">Return Home</Button>
        </Card>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="container-center py-12">
        <Card title="Interview Session Error" className="border-t-4 border-t-error-500">
          <p className="text-secondary-600 text-center py-8">No questions were found for this interview session. Please contact the administrator.</p>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="container-center py-8 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Live AI Interview</h1>
          <p className="text-secondary-500 mt-1">Please answer the questions thoughtfully.</p>
        </div>
        <div className="flex flex-col items-end">
          <Badge variant="primary" className="text-sm px-3 py-1 shadow-sm">
            Question {currentIndex + 1} of {questions.length}
          </Badge>
          <div className="w-32 h-2 bg-secondary-200 rounded-full mt-3 overflow-hidden">
            <div 
              className="h-full bg-primary-600 transition-all duration-500"
              style={{ width: `${((currentIndex) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-secondary-200 overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-primary-50 to-white px-8 py-6 border-b border-secondary-200">
          <div className="flex justify-between items-start">
             <h3 className="text-sm font-bold text-primary-800 tracking-wider uppercase">Question {currentIndex + 1}</h3>
             {currentQuestion.difficulty && (
               <Badge variant={currentQuestion.difficulty === 'hard' ? 'error' : currentQuestion.difficulty === 'medium' ? 'warning' : 'success'} className="capitalize shadow-sm">
                 {currentQuestion.difficulty}
               </Badge>
             )}
          </div>
          <p className="text-2xl text-secondary-900 mt-4 font-semibold leading-relaxed">{currentQuestion.question}</p>
        </div>
        
        <div className="p-8 bg-secondary-50">
          <TextArea
            label="Your Answer"
            placeholder="Type your answer here... Take your time to be as detailed and structured as possible."
            rows={10}
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            className="text-lg bg-white shadow-inner"
          />
        </div>
      </div>

      <div className="flex justify-between items-center mt-8">
        <p className="text-sm text-secondary-500">Your progress is automatically saved when you move to the next question.</p>
        <Button 
          onClick={handleNext} 
          variant="primary" 
          size="lg" 
          disabled={submitting}
          className="shadow-md hover:shadow-lg transition-all"
        >
          {submitting ? 'Submitting...' : currentIndex === questions.length - 1 ? 'Finish Interview' : 'Submit & Next Question ➔'}
        </Button>
      </div>
    </div>
  );
}
