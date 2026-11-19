import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  ArrowRight, 
  Calculator, 
  Code2, 
  Users, 
  Briefcase, 
  FileCheck2, 
  Award, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  BarChart3 
} from 'lucide-react';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  const categories = [
    {
      title: 'Quantitative Aptitude',
      desc: 'Master percentages, profit & loss, time/work, speed/distance, probability, and permutations.',
      icon: Calculator,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      badge: '10 Core Topics',
    },
    {
      title: 'Technical Interview',
      desc: 'In-depth DSA, DBMS, OS, Computer Networks, OOP, System Design, Java, Python, and JavaScript.',
      icon: Code2,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
      badge: 'Programming & CS Core',
    },
    {
      title: 'HR & Behavioral',
      desc: 'Practice STAR situational questions, leadership, conflict resolution, teamwork, and strengths/weaknesses.',
      icon: Users,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
      badge: 'Behavioral & Culture Fit',
    },
    {
      title: 'Job Description-Based',
      desc: 'Paste any job posting or company requirements. AI reverse-engineers targeted interview questions.',
      icon: Briefcase,
      color: 'bg-amber-50 text-amber-600 border-amber-200',
      badge: 'Tailored to Target Job',
    },
    {
      title: 'Resume-Based Interview',
      desc: 'Upload your PDF/DOCX resume. AI conducts deep-dive interrogation on your real projects and tech stack.',
      icon: FileCheck2,
      color: 'bg-rose-50 text-rose-600 border-rose-200',
      badge: 'Personalized to You',
    },
  ];

  const features = [
    {
      title: 'Real-Time AI Question Generation',
      desc: 'Dynamic questions adapt to your chosen difficulty (Easy, Medium, Hard) without repetitive question banks.',
      icon: Zap,
    },
    {
      title: 'Multi-Parameter Fair Evaluation',
      desc: 'Evaluates Technical Accuracy, Conceptual Understanding, Relevance, Completeness, and Clarity with ideal answers.',
      icon: Award,
    },
    {
      title: 'Resume Parsing & Skill Extraction',
      desc: 'Supports PDF and DOCX uploads, automatically identifying key libraries, databases, and frameworks.',
      icon: FileCheck2,
    },
    {
      title: 'Actionable Performance Reports',
      desc: 'Visual score breakdowns, identifying strong and weak topics with personalized study recommendations.',
      icon: BarChart3,
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-28 lg:pb-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.100),white)] opacity-70" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold mb-8 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Built Specifically for College Students & Freshers</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] max-w-4xl mx-auto">
            Crack Your Campus & Job Interviews With <span className="text-indigo-600">Personalized AI</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Practice Quantitative Aptitude, CS Core, HR, Job Descriptions, and your actual Resume. Receive instant multidimensional AI evaluations and comprehensive feedback.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={isAuthenticated ? '/dashboard' : '/register'}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-200 hover:shadow-xl transition-all"
            >
              <span>{isAuthenticated ? 'Go to Dashboard' : 'Start Free Practice'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {!isAuthenticated && (
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold border border-slate-200 transition-all"
              >
                Sign In to Account
              </Link>
            )}
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 100% Free Tier AI Models
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> No Credit Card or Paid APIs Required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Relational MySQL Persistence
            </span>
          </div>
        </div>
      </section>

      {/* 5 Interview Categories Section */}
      <section className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Tailored Interview Formats</h2>
            <p className="mt-2 text-3xl font-bold text-slate-900 tracking-tight sm:text-4xl">
              Everything You Need to Get Hired
            </p>
            <p className="mt-4 text-base text-slate-600">
              Select any of the 5 interview categories to simulate real placement drives and tech company interviews.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <div
                  key={idx}
                  className="bg-slate-50/70 rounded-2xl p-6 border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${cat.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-600">
                        {cat.badge}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{cat.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{cat.desc}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-200/80">
                    <Link
                      to={isAuthenticated ? '/interviews/new' : '/login'}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                      <span>Practice {cat.title}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Platform Capabilities</h2>
            <p className="mt-2 text-3xl font-bold text-slate-900 tracking-tight sm:text-4xl">
              How the AI Evaluator Works
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div key={i} className="flex gap-4 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex-shrink-0 flex items-center justify-center text-indigo-600">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{feat.title}</h3>
                    <p className="mt-1 text-sm text-slate-600 leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-indigo-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Ace Your Next Technical Interview?
          </h2>
          <p className="text-indigo-200 max-w-xl mx-auto text-base">
            Create an account in seconds, upload your resume or select a topic, and begin practicing real interview questions with instant AI feedback.
          </p>
          <div>
            <Link
              to={isAuthenticated ? '/dashboard' : '/register'}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-indigo-900 font-bold hover:bg-indigo-50 shadow-lg transition-all"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4 text-indigo-600" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
