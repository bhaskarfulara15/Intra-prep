import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { analyticsService } from '../services/api';
import { 
  PlusCircle, 
  Sparkles, 
  Trophy, 
  Target, 
  HelpCircle, 
  FileText, 
  ArrowRight, 
  Calendar, 
  Award, 
  TrendingUp,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar 
} from 'recharts';

const DashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await analyticsService.getDashboardAnalytics();
        setData(res.data.data);
      } catch (err) {
        setError('Failed to load dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="mt-3 text-sm text-slate-500 font-medium">Loading your interview dashboard...</p>
      </div>
    );
  }

  const summary = data?.summary || {
    totalInterviews: 0,
    averageScore: 0,
    bestScore: 0,
    totalQuestionsAttempted: 0,
    totalResumes: 0,
  };

  const statCards = [
    {
      title: 'Interviews Completed',
      value: summary.totalInterviews,
      icon: Target,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    },
    {
      title: 'Average Score',
      value: `${summary.averageScore} / 10`,
      icon: TrendingUp,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      title: 'Best Score',
      value: `${summary.bestScore} / 10`,
      icon: Trophy,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
      title: 'Questions Answered',
      value: summary.totalQuestionsAttempted,
      icon: HelpCircle,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-950/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-indigo-200 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Powered Interview Simulator</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Candidate'}!
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            {user?.target_role ? `Preparing for ${user.target_role}` : 'Prepare for technical and placement interviews'} • Practice with Quantitative Aptitude, Technical CS, HR, or your custom Resume.
          </p>
        </div>

        <Link
          to="/interviews/new"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-indigo-900 font-bold hover:bg-indigo-50 shadow-md transition-all flex-shrink-0"
        >
          <PlusCircle className="w-5 h-5 text-indigo-600" />
          <span>Start New Interview</span>
        </Link>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{card.title}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{card.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${card.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Performance Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Score Trends Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Score Trends (Out of 10)</h2>
              <p className="text-xs text-slate-500">Your performance progression across recent sessions</p>
            </div>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
              Recent 10
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            {data?.scoreTrends && data.scoreTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.scoreTrends} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', border: 'none' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#4f46e5"
                    strokeWidth={3}
                    dot={{ fill: '#4f46e5', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-200 rounded-xl">
                <TrendingUp className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-600">No interview data yet</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Complete your first interview to see performance trends visualized here.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Category Averages</h2>
              <p className="text-xs text-slate-500">Average scores across different interview tracks</p>
            </div>
            <Award className="w-5 h-5 text-slate-400" />
          </div>

          <div className="h-64 w-full pt-4">
            {data?.categoryBreakdown && data.categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.categoryBreakdown} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', border: 'none' }}
                  />
                  <Bar dataKey="avgScore" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-200 rounded-xl">
                <Award className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-600">No category scores yet</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Take interviews across Technical, Aptitude, or HR to view comparisons.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Interviews Table & Resume Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Interviews */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Recent Interview Attempts</h2>
            <Link to="/history" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
              View All History →
            </Link>
          </div>

          {data?.recentInterviews && data.recentInterviews.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {data.recentInterviews.map((item) => (
                <div key={item.id} className="p-4 sm:p-5 hover:bg-slate-50 flex items-center justify-between transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 capitalize">
                        {item.category.replace('_', ' ')}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${
                        item.difficulty === 'hard' 
                          ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                          : item.difficulty === 'medium'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {item.difficulty}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      <span>•</span>
                      <span>{item.total_questions} Questions</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    {item.status === 'completed' ? (
                      <div className="text-right">
                        <span className="text-xs font-medium text-slate-500 block">Score</span>
                        <span className="text-base font-bold text-indigo-600">{item.overall_score} / 10</span>
                      </div>
                    ) : (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                        In Progress
                      </span>
                    )}

                    <Link
                      to={item.status === 'completed' ? `/interviews/${item.id}/report` : `/interviews/${item.id}`}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title={item.status === 'completed' ? 'View Report' : 'Resume Session'}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-sm text-slate-500">No interview history yet. Click above to start your first session!</p>
            </div>
          )}
        </div>

        {/* Resume Quick Widget */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Resume-Based Preparation</h3>
              <p className="text-xs text-slate-500 mt-1">
                Upload your PDF or DOCX resume to generate interview questions tailored to your exact projects and technical stack.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex justify-between text-xs font-medium text-slate-600">
                <span>Resumes on file</span>
                <span className="font-bold text-slate-900">{summary.totalResumes}</span>
              </div>
              <p className="text-[11px] text-slate-500">
                AI automatically extracts skills and prepares deep-dive architectural questions.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <Link
              to="/resumes"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors"
            >
              <span>Manage Resumes</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
