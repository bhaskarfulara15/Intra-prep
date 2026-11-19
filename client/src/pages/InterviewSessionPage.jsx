import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewService } from '../services/api';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Loader2, 
  Send, 
  Sparkles, 
  Flag 
} from 'lucide-react';

const InterviewSessionPage = () => {
  const { id: interviewId } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionId]: string }
  const [savingMap, setSavingMap] = useState({}); // { [questionId]: boolean }

  const [timeLeft, setTimeLeft] = useState(null); // in seconds
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [error, setError] = useState('');
  const [showHint, setShowHint] = useState(false);

  // Fetch interview session
  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoading(true);
        const res = await interviewService.getInterviewById(interviewId);
        const { interview: interviewData, questions: qList } = res.data.data;

        if (interviewData.status === 'completed') {
          // If already completed, go to report
          navigate(`/interviews/${interviewId}/report`, { replace: true });
          return;
        }

        setInterview(interviewData);
        setQuestions(qList);

        // Preload answers already in DB
        const initialAnswers = {};
        qList.forEach((q) => {
          if (q.answer?.answer_text) {
            initialAnswers[q.id] = q.answer.answer_text;
          }
        });
        setAnswers(initialAnswers);

        // Calculate initial timer based on duration
        const totalDurationSec = (interviewData.duration_minutes || 15) * 60;
        const createdTime = new Date(interviewData.created_at).getTime();
        const now = Date.now();
        const elapsedSec = Math.floor((now - createdTime) / 1000);
        const remaining = Math.max(0, totalDurationSec - elapsedSec);
        setTimeLeft(remaining);
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Failed to load interview session.');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [interviewId, navigate]);

  // Countdown timer tick
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || evaluating) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishInterview(); // Auto-submit when time expires
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, evaluating]);

  // Save current answer
  const saveAnswer = async (questionId, text) => {
    try {
      setSavingMap((prev) => ({ ...prev, [questionId]: true }));
      await interviewService.submitAnswer(interviewId, {
        question_id: questionId,
        answer_text: text || '',
      });
    } catch (err) {
      console.warn('Failed to auto-save answer:', err.message);
    } finally {
      setSavingMap((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  const handleTextChange = (e) => {
    const text = e.target.value;
    const currentQuestion = questions[currentIndex];
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: text }));
  };

  const handleNext = async () => {
    const currentQ = questions[currentIndex];
    if (answers[currentQ.id]) {
      await saveAnswer(currentQ.id, answers[currentQ.id]);
    }
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowHint(false);
    }
  };

  const handlePrev = async () => {
    const currentQ = questions[currentIndex];
    if (answers[currentQ.id]) {
      await saveAnswer(currentQ.id, answers[currentQ.id]);
    }
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowHint(false);
    }
  };

  const handleJumpTo = async (index) => {
    const currentQ = questions[currentIndex];
    if (answers[currentQ.id]) {
      await saveAnswer(currentQ.id, answers[currentQ.id]);
    }
    setCurrentIndex(index);
    setShowHint(false);
  };

  const handleFinishInterview = async () => {
    setShowFinishModal(false);
    setEvaluating(true);
    setError('');

    try {
      // Save current question answer first if any
      const currentQ = questions[currentIndex];
      if (answers[currentQ.id]) {
        await saveAnswer(currentQ.id, answers[currentQ.id]);
      }

      // Complete interview and trigger AI evaluations
      await interviewService.completeInterview(interviewId);
      navigate(`/interviews/${interviewId}/report`);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Error evaluating interview.');
      setEvaluating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="mt-3 text-sm text-slate-500 font-medium">Preparing your interview simulator...</p>
      </div>
    );
  }

  if (error && !evaluating) {
    return (
      <div className="max-w-xl mx-auto mt-12 p-6 bg-white rounded-2xl border border-rose-200 shadow-sm text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Session Error</h2>
        <p className="text-sm text-slate-600">{error}</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex] || {};
  const currentAnswer = answers[currentQ.id] || '';
  const wordCount = currentAnswer.trim().split(/\s+/).filter(Boolean).length;
  const isSaving = savingMap[currentQ.id];

  // Format timer MM:SS
  const mins = Math.floor((timeLeft || 0) / 60);
  const secs = (timeLeft || 0) % 60;
  const isTimeCritical = (timeLeft || 0) < 180; // under 3 mins

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Session Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
            {interview?.category?.replace('_', ' ')}
          </span>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs text-slate-600 font-medium hidden sm:inline">
            Question {currentIndex + 1} of {questions.length}
          </span>
        </div>

        {/* Timer Widget */}
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-sm font-bold border transition-colors ${
            isTimeCritical
              ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
              : 'bg-slate-50 text-slate-700 border-slate-200'
          }`}>
            <Clock className="w-4 h-4 text-slate-500" />
            <span>
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </span>
          </div>

          <button
            onClick={() => setShowFinishModal(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Finish Interview</span>
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Question Navigation Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Navigate:</span>
            <div className="flex flex-wrap gap-1.5">
              {questions.map((q, idx) => {
                const isAnswered = !!(answers[q.id] && answers[q.id].trim().length > 0);
                const isCurrent = idx === currentIndex;
                return (
                  <button
                    key={q.id}
                    onClick={() => handleJumpTo(idx)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                      isCurrent
                        ? 'bg-indigo-600 text-white ring-2 ring-indigo-300'
                        : isAnswered
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                        : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Answered
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" /> Pending
            </span>
          </div>
        </div>

        {/* Current Question Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-indigo-600">
                Question {currentIndex + 1}
              </span>
              <span className="text-slate-300">/</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                {currentQ.topic}
              </span>
            </div>

            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
              currentQ.difficulty === 'hard'
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : currentQ.difficulty === 'medium'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}>
              {currentQ.difficulty}
            </span>
          </div>

          {/* Question Text */}
          <div className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-relaxed">
              {currentQ.question_text}
            </h2>

            {/* Expected concepts collapsible hint */}
            {currentQ.expected_concepts && currentQ.expected_concepts.length > 0 && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowHint(!showHint)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-indigo-600"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{showHint ? 'Hide Concept Keypoints' : 'View Concept Keypoints Hint'}</span>
                </button>
                {showHint && (
                  <div className="mt-2 p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs text-indigo-900 space-y-1">
                    <p className="font-semibold text-indigo-950">Key evaluation topics to consider addressing:</p>
                    <ul className="list-disc list-inside space-y-0.5 text-indigo-800">
                      {currentQ.expected_concepts.map((concept, i) => (
                        <li key={i}>{concept}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Answer Input Area */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-700 uppercase tracking-wider">Your Answer</span>
              <div className="flex items-center gap-3">
                {isSaving && (
                  <span className="text-slate-400 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Saving...
                  </span>
                )}
                <span>{wordCount} words • {currentAnswer.length} characters</span>
              </div>
            </div>

            <textarea
              rows={10}
              value={currentAnswer}
              onChange={handleTextChange}
              placeholder="Type your structured explanation, code examples, or mathematical derivation here..."
              className="block w-full p-4 bg-slate-50 border border-slate-300 rounded-xl text-sm sm:text-base text-slate-900 leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Navigation & Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={() => saveAnswer(currentQ.id, currentAnswer)}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Answer</span>
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-colors"
              >
                <span>Next Question</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setShowFinishModal(true)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-colors"
              >
                <span>Finish & Submit</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      {showFinishModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Finish and Submit Interview?</h3>
              <p className="text-xs text-slate-500 mt-1">
                You have answered {Object.values(answers).filter(a => a && a.trim().length > 0).length} of {questions.length} questions.
                Once submitted, the AI will evaluate your technical accuracy, clarity, and generate your scorecard.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setShowFinishModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Continue Answering
              </button>
              <button
                onClick={handleFinishInterview}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md"
              >
                Yes, Submit for Evaluation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Evaluating AI Loading Overlay */}
      {evaluating && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/30 border border-indigo-400/50 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-indigo-300 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold">Evaluating Your Answers With AI</h2>
          <p className="text-slate-300 text-sm max-w-md leading-relaxed">
            The AI is analyzing your technical accuracy, depth, relevance, and formulating constructive improvement feedback...
          </p>
          <div className="flex items-center gap-2 text-xs text-indigo-300">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Please do not close this window</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewSessionPage;
