import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { interviewService } from '../services/api';
import { 
  Trophy, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Sparkles, 
  ArrowLeft, 
  Printer, 
  Share2, 
  BookOpen, 
  Check, 
  HelpCircle, 
  Loader2, 
  TrendingUp, 
  Award,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

const InterviewReportPage = () => {
  const { id: interviewId } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedQuestions, setExpandedQuestions] = useState({});

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const res = await interviewService.getInterviewReport(interviewId);
        setData(res.data.data);

        // Expand all questions by default
        const initExpanded = {};
        res.data.data.questions?.forEach((q) => {
          initExpanded[q.questionId] = true;
        });
        setExpandedQuestions(initExpanded);
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Failed to load interview report.');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [interviewId]);

  const toggleExpand = (qId) => {
    setExpandedQuestions((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="mt-3 text-sm text-slate-500 font-medium">Generating your interview report card...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto mt-12 p-6 bg-white rounded-2xl border border-rose-200 shadow-sm text-center space-y-4">
        <XCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Report Error</h2>
        <p className="text-sm text-slate-600">{error || 'Report could not be retrieved.'}</p>
        <Link to="/dashboard" className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const { interview, parameterBreakdown, questions } = data;
  const overallScore = Number(interview.overall_score || 0);

  const getScoreVerdict = (score) => {
    if (score >= 8.5) return { label: 'Outstanding Candidate', color: 'text-emerald-700 bg-emerald-50 border-emerald-300' };
    if (score >= 7.0) return { label: 'Strong Performance', color: 'text-indigo-700 bg-indigo-50 border-indigo-300' };
    if (score >= 5.0) return { label: 'Good Foundation', color: 'text-amber-700 bg-amber-50 border-amber-300' };
    return { label: 'Needs Dedicated Preparation', color: 'text-rose-700 bg-rose-50 border-rose-300' };
  };

  const verdict = getScoreVerdict(overallScore);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 print:p-0">
      {/* Top Header / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Report</span>
          </button>
          <Link
            to="/interviews/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>Practice Another</span>
          </Link>
        </div>
      </div>

      {/* Main Scorecard Hero Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-3 max-w-lg text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border capitalize bg-slate-50 text-slate-700">
            <span>{interview.category?.replace('_', ' ')} Track</span>
            <span>•</span>
            <span>{interview.difficulty} Level</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Interview Performance Report
          </h1>
          <p className="text-xs text-slate-500">
            Completed on {new Date(interview.completed_at || interview.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} • {interview.total_questions} Questions Evaluated
          </p>

          <div className="pt-2">
            <span className={`inline-block text-xs font-extrabold px-3.5 py-1.5 rounded-full border ${verdict.color}`}>
              {verdict.label}
            </span>
          </div>
        </div>

        {/* Circular Score Gauge */}
        <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-200/80 w-full md:w-auto min-w-[220px]">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Overall Score</span>
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-black text-indigo-600 tracking-tight">{overallScore}</span>
            <span className="text-xl font-bold text-slate-400">/ 10</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 text-center">
            {overallScore >= 7.5 ? 'Well above hiring benchmark' : 'Keep practicing to reach 8.0+'}
          </p>
        </div>
      </div>

      {/* Summary Counts & Multi-Parameter Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Metric Pills */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Answer Accuracy Breakdown</h2>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-bold text-emerald-900">Correct Answers</span>
              </div>
              <span className="text-lg font-black text-emerald-700">{interview.correct_count}</span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-50 border border-amber-200">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span className="text-xs font-bold text-amber-900">Partially Correct</span>
              </div>
              <span className="text-lg font-black text-amber-700">{interview.partially_correct_count}</span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-rose-50 border border-rose-200">
              <div className="flex items-center gap-2.5">
                <XCircle className="w-5 h-5 text-rose-600" />
                <span className="text-xs font-bold text-rose-900">Incorrect / Missing</span>
              </div>
              <span className="text-lg font-black text-rose-700">{interview.incorrect_count}</span>
            </div>
          </div>

          {/* Strong / Weak Summary */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <p className="text-xs font-bold text-slate-700">Identified Strengths:</p>
            <div className="flex flex-wrap gap-1">
              {interview.report_summary?.strongAreas?.map((s, i) => (
                <span key={i} className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                  {s}
                </span>
              ))}
            </div>

            <p className="text-xs font-bold text-slate-700 pt-2">Topics for Revision:</p>
            <div className="flex flex-wrap gap-1">
              {interview.report_summary?.weakAreas?.map((w, i) => (
                <span key={i} className="text-[11px] px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-medium">
                  {w}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Parameter Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Evaluation Dimensions</h2>
              <p className="text-xs text-slate-500">Multidimensional grading based on technical accuracy, clarity & depth</p>
            </div>
            <Award className="w-5 h-5 text-indigo-500" />
          </div>

          <div className="h-64 w-full pt-4">
            {parameterBreakdown && parameterBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={parameterBreakdown} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="parameter" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', border: 'none' }}
                  />
                  <Bar dataKey="score" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Evaluation data unavailable
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Question-By-Question Detailed Breakdown */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          Detailed Question-By-Question Evaluations
        </h2>

        <div className="space-y-4">
          {questions.map((item) => {
            const isExpanded = expandedQuestions[item.questionId];
            const evalData = item.evaluation;
            const qScore = evalData?.score || 0;

            return (
              <div
                key={item.questionId}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
              >
                {/* Accordion Header */}
                <div
                  onClick={() => toggleExpand(item.questionId)}
                  className="p-5 sm:p-6 cursor-pointer hover:bg-slate-50 flex items-start justify-between gap-4 transition-colors"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-indigo-600">Question {item.questionNumber}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {item.topic}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        evalData?.verdict === 'correct'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : evalData?.verdict === 'partially_correct'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {evalData?.verdict?.replace('_', ' ') || 'evaluated'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {item.questionText}
                    </h3>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                      <span className="text-base font-black text-indigo-600">{qScore}</span>
                      <span className="text-xs text-slate-400">/10</span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-slate-100 space-y-5">
                    {/* Candidate's submitted answer */}
                    <div className="space-y-1.5">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Your Submitted Answer:</p>
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-mono text-xs">
                        {item.userAnswer ? item.userAnswer : <span className="italic text-slate-400">No answer submitted for this question.</span>}
                      </div>
                    </div>

                    {evalData && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* What Went Well */}
                        <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                          <p className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> What Went Well
                          </p>
                          <p className="text-xs text-emerald-800 leading-relaxed">{evalData.whatWentWell}</p>
                        </div>

                        {/* What Was Missing */}
                        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
                          <p className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-amber-600" /> What Was Missing
                          </p>
                          <p className="text-xs text-amber-800 leading-relaxed">{evalData.whatWasMissing}</p>
                        </div>

                        {/* Improvement Areas */}
                        <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-1 md:col-span-2">
                          <p className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                            <TrendingUp className="w-4 h-4 text-blue-600" /> Areas for Improvement
                          </p>
                          <p className="text-xs text-blue-800 leading-relaxed">{evalData.improvementAreas}</p>
                        </div>

                        {/* Suggested Ideal Answer */}
                        <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-1.5 md:col-span-2">
                          <p className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-indigo-600" /> Model Ideal Answer
                          </p>
                          <p className="text-xs text-indigo-900 leading-relaxed whitespace-pre-wrap">
                            {evalData.idealAnswer}
                          </p>
                        </div>

                        {/* Relevant Study Concepts */}
                        {evalData.studyConcepts && evalData.studyConcepts.length > 0 && (
                          <div className="md:col-span-2 flex items-center gap-2 pt-1">
                            <span className="text-xs font-bold text-slate-500">Related Concepts:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {evalData.studyConcepts.map((sc, i) => (
                                <span key={i} className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                                  {sc}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default InterviewReportPage;
