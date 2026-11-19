import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { interviewService, resumeService } from '../services/api';
import { 
  Sparkles, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  AlertCircle, 
  Loader2, 
  Clock, 
  FileText, 
  Layers, 
  Sliders 
} from 'lucide-react';

const TOPIC_PRESETS = {
  quantitative_aptitude: [
    'Percentages', 'Profit and Loss', 'Time and Work', 'Time, Speed and Distance',
    'Ratio and Proportion', 'Probability', 'Permutations and Combinations',
    'Number Systems', 'Average', 'Logical Reasoning'
  ],
  technical: [
    'Data Structures and Algorithms', 'DBMS', 'SQL', 'Operating Systems',
    'Computer Networks', 'Object-Oriented Programming', 'Java', 'Python',
    'JavaScript', 'Web Development', 'Machine Learning'
  ],
  hr: [
    'Introduction', 'Strengths and Weaknesses', 'Career Goals',
    'Conflict Management', 'Teamwork', 'Leadership', 'Situational Scenarios'
  ],
  job_description: [
    'Core Responsibilities', 'Technical Stack Alignment', 'System Architecture',
    'Team Collaboration', 'Problem Solving Scenarios'
  ],
  resume_based: [
    'Featured Projects Deep Dive', 'System Architecture', 'Database & API Design',
    'Bug Resolution & Challenges', 'Technologies Ownership'
  ],
};

const CATEGORY_NAMES = {
  quantitative_aptitude: 'Quantitative Aptitude',
  technical: 'Technical Interview',
  hr: 'HR & Behavioral',
  job_description: 'Job Description-Based',
  resume_based: 'Resume-Based Interview',
};

const InterviewConfigPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();

  const [difficulty, setDifficulty] = useState('medium');
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [selectedTopics, setSelectedTopics] = useState(TOPIC_PRESETS[category] || []);
  const [jobDescription, setJobDescription] = useState('');
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');

  const [loadingResumes, setLoadingResumes] = useState(category === 'resume_based');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (category === 'resume_based') {
      const fetchResumes = async () => {
        try {
          const res = await resumeService.getResumes();
          const list = res.data.data.resumes || [];
          setResumes(list);
          if (list.length > 0) {
            setSelectedResumeId(list[0].id);
          }
        } catch {
          setError('Could not load resumes. Please upload a resume first.');
        } finally {
          setLoadingResumes(false);
        }
      };
      fetchResumes();
    }
  }, [category]);

  const toggleTopic = (topic) => {
    if (selectedTopics.includes(topic)) {
      if (selectedTopics.length === 1) return; // Keep at least one
      setSelectedTopics(selectedTopics.filter((t) => t !== topic));
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  const handleStartInterview = async () => {
    setError('');

    if (category === 'resume_based' && !selectedResumeId) {
      setError('Please select or upload a resume to proceed with a resume-based interview.');
      return;
    }

    if (category === 'job_description' && (!jobDescription || jobDescription.trim().length < 20)) {
      setError('Please paste a job description with at least 20 characters.');
      return;
    }

    try {
      setGenerating(true);
      const res = await interviewService.createInterview({
        category,
        difficulty,
        total_questions: Number(totalQuestions),
        duration_minutes: Number(durationMinutes),
        selected_topics: selectedTopics,
        job_description: category === 'job_description' ? jobDescription : null,
        resume_id: category === 'resume_based' ? Number(selectedResumeId) : null,
      });

      const interviewId = res.data.data.interview.id;
      navigate(`/interviews/${interviewId}`);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to create interview. Please try again.');
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/interviews/new"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Category Selection</span>
        </Link>
        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
          Step 2 of 2: Interview Configuration
        </span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Configure Your {CATEGORY_NAMES[category] || 'Interview'}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Customize difficulty, timing, and topics before the AI generates your session.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-8">
        {/* 1. Difficulty Selector */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Difficulty Level
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'easy', label: 'Easy', desc: 'Fundamental definitions & simple problems' },
              { id: 'medium', label: 'Medium', desc: 'Standard campus placement & tech rounds' },
              { id: 'hard', label: 'Hard', desc: 'Complex edge cases, architectures & tradeoffs' },
            ].map((lvl) => (
              <button
                key={lvl.id}
                type="button"
                onClick={() => setDifficulty(lvl.id)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  difficulty === lvl.id
                    ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-bold capitalize ${difficulty === lvl.id ? 'text-indigo-900' : 'text-slate-800'}`}>
                    {lvl.label}
                  </span>
                  {difficulty === lvl.id && <Check className="w-4 h-4 text-indigo-600" />}
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">{lvl.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Questions & Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Number of Questions
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 15, 20].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setTotalQuestions(num)}
                  className={`py-2.5 rounded-xl text-sm font-bold border transition-colors ${
                    totalQuestions === num
                      ? 'border-indigo-600 bg-indigo-600 text-white'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Interview Duration
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { mins: 15, label: '15m' },
                { mins: 30, label: '30m' },
                { mins: 45, label: '45m' },
                { mins: 60, label: '60m' },
              ].map((item) => (
                <button
                  key={item.mins}
                  type="button"
                  onClick={() => setDurationMinutes(item.mins)}
                  className={`py-2.5 rounded-xl text-sm font-bold border transition-colors ${
                    durationMinutes === item.mins
                      ? 'border-indigo-600 bg-indigo-600 text-white'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Resume Selection (If Resume-Based) */}
        {category === 'resume_based' && (
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Uploaded Resume
              </label>
              <Link to="/resumes" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                + Upload New Resume
              </Link>
            </div>

            {loadingResumes ? (
              <div className="flex items-center gap-2 text-sm text-slate-500 py-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading your resumes...</span>
              </div>
            ) : resumes.length > 0 ? (
              <div className="space-y-2">
                {resumes.map((r) => (
                  <label
                    key={r.id}
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                      Number(selectedResumeId) === Number(r.id)
                        ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-500'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="resume"
                        value={r.id}
                        checked={Number(selectedResumeId) === Number(r.id)}
                        onChange={() => setSelectedResumeId(r.id)}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <p className="text-sm font-bold text-slate-800">{r.original_name}</p>
                        <p className="text-[11px] text-slate-500">
                          {r.extracted_skills?.slice(0, 5).join(', ') || 'No skills extracted'}
                        </p>
                      </div>
                    </div>
                    <FileText className="w-4 h-4 text-slate-400" />
                  </label>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm space-y-2">
                <p className="font-semibold">No resumes found on file.</p>
                <p className="text-xs text-amber-700">
                  Please upload your resume in PDF or DOCX format before taking a resume-based interview.
                </p>
                <Link
                  to="/resumes"
                  className="inline-block mt-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg text-xs"
                >
                  Upload Resume Now
                </Link>
              </div>
            )}
          </div>
        )}

        {/* 4. Job Description Input (If JD-Based) */}
        {category === 'job_description' && (
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Paste Job Description / Requirements
            </label>
            <textarea
              rows={6}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job posting, roles & responsibilities, required skills, and qualification criteria here..."
              className="block w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-[11px] text-slate-500">
              The AI will extract required frameworks, databases, and responsibilities to formulate matching technical & HR questions.
            </p>
          </div>
        )}

        {/* 5. Topic Filters */}
        {TOPIC_PRESETS[category] && (
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Select Specific Focus Topics
            </label>
            <div className="flex flex-wrap gap-2">
              {TOPIC_PRESETS[category].map((topic) => {
                const isSelected = selectedTopics.includes(topic);
                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => toggleTopic(topic)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-indigo-600" />}
                    <span>{topic}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Start Button */}
        <div className="pt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={handleStartInterview}
            disabled={generating || (category === 'resume_based' && !selectedResumeId)}
            className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg shadow-indigo-200 transition-all disabled:opacity-60"
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating Personalized AI Questions...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Generate Questions & Start Interview</span>
                <ArrowRight className="w-5 h-5 ml-1" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewConfigPage;
