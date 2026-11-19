import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { interviewService } from '../services/api';
import { 
  History, 
  Trash2, 
  ArrowRight, 
  Calendar, 
  Clock, 
  Filter, 
  AlertCircle, 
  Loader2, 
  Sparkles,
  Trophy 
} from 'lucide-react';

const InterviewHistoryPage = () => {
  const [interviews, setInterviews] = useState([]);
  const [filterCategory, setFilterCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await interviewService.getInterviews();
      setInterviews(res.data.data.interviews || []);
    } catch (err) {
      setError('Failed to load interview history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this interview record? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(id);
      await interviewService.deleteInterview(id);
      setInterviews((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert('Failed to delete interview record.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredInterviews = interviews.filter((item) => {
    if (filterCategory === 'all') return true;
    return item.category === filterCategory;
  });

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="mt-3 text-sm text-slate-500 font-medium">Loading interview history...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <History className="w-7 h-7 text-indigo-600" />
            <span>Interview History</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Review past interview sessions, compare scores, and review detailed evaluations.
          </p>
        </div>

        <Link
          to="/interviews/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          <span>Start New Interview</span>
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-200">
        {[
          { id: 'all', label: 'All Interviews' },
          { id: 'quantitative_aptitude', label: 'Aptitude' },
          { id: 'technical', label: 'Technical' },
          { id: 'hr', label: 'HR & Behavioral' },
          { id: 'job_description', label: 'Job Description' },
          { id: 'resume_based', label: 'Resume-Based' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterCategory(tab.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterCategory === tab.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Interviews List */}
      {filteredInterviews.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
          {filteredInterviews.map((item) => {
            const isCompleted = item.status === 'completed';
            const score = Number(item.overall_score || 0);

            return (
              <div
                key={item.id}
                className="p-5 sm:p-6 hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 capitalize">
                      {item.category.replace('_', ' ')}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      item.difficulty === 'hard'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : item.difficulty === 'medium'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {item.difficulty}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      isCompleted ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {isCompleted ? 'Completed' : 'In Progress'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(item.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span>•</span>
                    <span>{item.total_questions} Questions</span>
                    <span>•</span>
                    <span>{item.duration_minutes} Minutes Allowed</span>
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                  {isCompleted ? (
                    <div className="text-left sm:text-right">
                      <span className="text-xs font-semibold text-slate-400 block uppercase">Overall Score</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-indigo-600">{score}</span>
                        <span className="text-xs text-slate-400 font-bold">/10</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-left sm:text-right">
                      <span className="text-xs text-slate-400 block italic">Not evaluated</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Link
                      to={isCompleted ? `/interviews/${item.id}/report` : `/interviews/${item.id}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
                    >
                      <span>{isCompleted ? 'View Report' : 'Resume Session'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors disabled:opacity-50"
                      title="Delete Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <History className="w-12 h-12 text-slate-300 mx-auto" />
          <div>
            <h3 className="text-base font-bold text-slate-900">No interviews found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              You haven't completed any interviews in this category yet.
            </p>
          </div>
          <Link
            to="/interviews/new"
            className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-sm"
          >
            Start an Interview Now
          </Link>
        </div>
      )}
    </div>
  );
};

export default InterviewHistoryPage;
