import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calculator, 
  Code2, 
  Users, 
  Briefcase, 
  FileCheck2, 
  ArrowRight, 
  Sparkles,
  Check
} from 'lucide-react';

const InterviewSelectionPage = () => {
  const navigate = useNavigate();

  const categories = [
    {
      id: 'quantitative_aptitude',
      title: 'Quantitative Aptitude',
      subtitle: 'Campus placement & aptitude round preparation',
      description: 'Practice speed, numerical accuracy, and logical reasoning under timed test conditions.',
      icon: Calculator,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200 group-hover:border-emerald-400',
      tag: 'Campus Placement Essential',
      topics: [
        'Percentages', 'Profit and Loss', 'Time and Work', 'Time, Speed & Distance',
        'Ratio and Proportion', 'Probability', 'Permutations & Combinations', 'Number Systems',
        'Average', 'Logical Reasoning'
      ],
    },
    {
      id: 'technical',
      title: 'Technical Interview',
      subtitle: 'Core CS concepts & programming languages',
      description: 'Sharpen your knowledge of Data Structures, DBMS, Operating Systems, Networks, and programming fundamentals.',
      icon: Code2,
      color: 'bg-blue-50 text-blue-600 border-blue-200 group-hover:border-blue-400',
      tag: 'Software Engineering',
      topics: [
        'Data Structures & Algorithms', 'DBMS & SQL', 'Operating Systems',
        'Computer Networks', 'Object-Oriented Programming', 'Java', 'Python', 'JavaScript / Web Dev', 'Machine Learning'
      ],
    },
    {
      id: 'hr',
      title: 'HR & Behavioral Interview',
      subtitle: 'Culture fit & behavioral assessment',
      description: 'Prepare structured responses using the STAR method for leadership, teamwork, conflicts, and self-introduction.',
      icon: Users,
      color: 'bg-purple-50 text-purple-600 border-purple-200 group-hover:border-purple-400',
      tag: 'All Companies & Roles',
      topics: [
        'Tell me about yourself', 'Strengths & Weaknesses', 'Career Goals (3-5 Years)',
        'Conflict Management', 'Teamwork Experience', 'Leadership Scenarios', 'Handling High-Pressure Deadlines'
      ],
    },
    {
      id: 'job_description',
      title: 'Job Description-Based',
      subtitle: 'Targeted questions based on role requirements',
      description: 'Paste any job posting or internship notice. The AI reverse-engineers technical & scenario-based questions matching the JD.',
      icon: Briefcase,
      color: 'bg-amber-50 text-amber-600 border-amber-200 group-hover:border-amber-400',
      tag: 'Role-Specific Targeting',
      topics: [
        'Key Responsibilities Mapping', 'Required Frameworks & Tools', 'System Architecture Questions',
        'Cross-Functional Collaboration', 'Role-Specific Problem Solving'
      ],
    },
    {
      id: 'resume_based',
      title: 'Resume-Based Interview',
      subtitle: 'Interrogate your actual projects & experience',
      description: 'Upload your PDF/DOCX resume. The AI asks about real tech stacks, implementation hurdles, and project architectures.',
      icon: FileCheck2,
      color: 'bg-rose-50 text-rose-600 border-rose-200 group-hover:border-rose-400',
      tag: 'Candidate Personalized',
      topics: [
        'Project Architecture & Design', 'Database & API Implementation', 'Edge Case & Bug Resolution',
        'Tools & Tech Stack Verification', 'Demonstrating Technical Ownership'
      ],
    },
  ];

  const handleSelect = (categoryId) => {
    navigate(`/interviews/configure/${categoryId}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Step 1 of 2: Select Track</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Choose Your Interview Category
        </h1>
        <p className="text-base text-slate-600">
          Pick the category you want to practice today. You can customize topics, difficulty, and duration in the next step.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <div
              key={cat.id}
              onClick={() => handleSelect(cat.id)}
              className="group cursor-pointer bg-white rounded-2xl p-6 border border-slate-200 hover:border-indigo-400 hover:shadow-xl transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-105 ${cat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {cat.tag}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">{cat.subtitle}</p>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{cat.description}</p>
                </div>

                {/* Sample Topics */}
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Included Topics:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.topics.slice(0, 4).map((topic, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200/80 text-slate-600"
                      >
                        {topic}
                      </span>
                    ))}
                    {cat.topics.length > 4 && (
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-50 text-slate-400 font-medium">
                        +{cat.topics.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600 group-hover:text-indigo-700">
                <span>Configure & Start Interview</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InterviewSelectionPage;
