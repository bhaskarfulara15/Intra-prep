/**
 * Comprehensive Fallback Question Bank & Evaluation Engine
 * Ensures 100% operational availability for college students even if free-tier API quotas are exhausted
 */

export const APTITUDE_QUESTIONS = [
  {
    topic: 'Percentages',
    difficulty: 'Easy',
    question: 'A fruit seller had some apples. He sells 40% of the apples and still has 420 apples left. How many apples did he have originally?',
    expectedConcepts: ['Complementary percentage (100% - 40% = 60%)', 'Forming algebraic equation: 0.60 * Total = 420', 'Calculation: 420 / 0.60 = 700 apples'],
  },
  {
    topic: 'Profit and Loss',
    difficulty: 'Medium',
    question: 'A shopkeeper sells an article at a profit of 12.5%. If he had bought it at 10% less and sold it for $2 less, he would have gained 20%. Find the original cost price of the article.',
    expectedConcepts: ['Cost price and selling price representation', 'Equation setup with changed cost and selling price', 'Accurate calculation of cost price ($40)'],
  },
  {
    topic: 'Time and Work',
    difficulty: 'Easy',
    question: 'A can do a piece of work in 10 days, and B can do the same work in 15 days. How many days will they take to complete the work working together?',
    expectedConcepts: ['Work done per day (1/10 + 1/15)', 'Finding common denominator: 5/30 = 1/6', 'Reciprocal to find total time: 6 days'],
  },
  {
    topic: 'Time, Speed and Distance',
    difficulty: 'Medium',
    question: 'A train 125 meters long passes a man running at 5 km/hr in the same direction in 10 seconds. What is the speed of the train in km/hr?',
    expectedConcepts: ['Relative speed formula for objects moving in the same direction', 'Unit conversion between m/s and km/hr (multiplying by 18/5)', 'Calculation: 45 + 5 = 50 km/hr'],
  },
  {
    topic: 'Ratio and Proportion',
    difficulty: 'Easy',
    question: 'The ratio of boys to girls in a class is 5:3. If there are 40 students in the class, how many more boys are there than girls?',
    expectedConcepts: ['Total parts calculation (5 + 3 = 8 parts)', 'Value of 1 part (40 / 8 = 5)', 'Difference between boys (25) and girls (15) = 10'],
  },
  {
    topic: 'Probability',
    difficulty: 'Medium',
    question: 'Two dice are thrown simultaneously. What is the probability of getting a sum of 8 or a sum of 9?',
    expectedConcepts: ['Total sample space for 2 dice (36 outcomes)', 'Favorable outcomes for sum 8: (2,6), (3,5), (4,4), (5,3), (6,2) = 5', 'Favorable outcomes for sum 9: (3,6), (4,5), (5,4), (6,3) = 4', 'Summing disjoint probabilities: 9/36 = 1/4'],
  },
  {
    topic: 'Permutations and Combinations',
    difficulty: 'Medium',
    question: 'In how many different ways can the letters of the word "LEADING" be arranged such that the vowels always appear together?',
    expectedConcepts: ['Identifying vowels (E, A, I) as a single composite unit', 'Arranging the remaining consonants and composite block (4! * 5 or 5!)', 'Internal permutation of the 3 vowels (3! = 6)', 'Total ways: 5! * 3! = 120 * 6 = 720'],
  },
  {
    topic: 'Number Systems',
    difficulty: 'Easy',
    question: 'What is the smallest number that should be added to 1056 so that the sum is completely divisible by 23?',
    expectedConcepts: ['Division algorithm (1056 ÷ 23)', 'Finding remainder (1056 = 23 * 45 + 21)', 'Difference needed to reach next multiple: 23 - 21 = 2'],
  },
  {
    topic: 'Average',
    difficulty: 'Easy',
    question: 'The average weight of 8 men increases by 1.5 kg when a new man replaces one of them who weighs 65 kg. What is the weight of the new man?',
    expectedConcepts: ['Total increase in weight: 8 * 1.5 kg = 12 kg', 'New weight = Replaced weight + Total increase', 'Calculation: 65 + 12 = 77 kg'],
  },
  {
    topic: 'Logical Reasoning',
    difficulty: 'Medium',
    question: 'Look at this series: 7, 10, 8, 11, 9, 12, ... What number should come next, and what is the underlying logic?',
    expectedConcepts: ['Alternating pattern (+3, -2)', 'Identifying the sequence: 7(+3)=10, 10(-2)=8, 8(+3)=11, 11(-2)=9, 9(+3)=12', 'Next step is subtracting 2: 12 - 2 = 10'],
  },
];

export const TECHNICAL_QUESTIONS = [
  {
    topic: 'Data Structures and Algorithms',
    difficulty: 'Medium',
    question: 'Explain the internal workings of a Hash Table. How does it handle hash collisions, and what is the difference between chaining and open addressing?',
    expectedConcepts: ['Hash function and bucket array', 'Time complexity: O(1) average vs O(n) worst case', 'Collision resolution via separate chaining (linked lists / red-black trees)', 'Collision resolution via open addressing (linear probing, quadratic probing, double hashing)'],
  },
  {
    topic: 'Data Structures and Algorithms',
    difficulty: 'Easy',
    question: 'Compare an Array with a Singly Linked List in terms of memory layout, random access, insertion, and deletion complexity.',
    expectedConcepts: ['Contiguous memory allocation vs node pointers in heap', 'O(1) random access by index for arrays vs O(n) traversal in linked lists', 'O(1) insertion/deletion at head for linked lists vs O(n) shifting in arrays'],
  },
  {
    topic: 'DBMS',
    difficulty: 'Medium',
    question: 'Explain the ACID properties of a relational database management system. Provide a real-world banking scenario demonstrating why each property is essential.',
    expectedConcepts: ['Atomicity (all or nothing transaction)', 'Consistency (valid state transitions and constraints)', 'Isolation (concurrency control and transaction levels)', 'Durability (committed data persists across server crashes)'],
  },
  {
    topic: 'Operating Systems',
    difficulty: 'Medium',
    question: 'What is a Deadlock in an Operating System? State the four Coffman conditions necessary for a deadlock to occur and describe one method to prevent it.',
    expectedConcepts: ['Definition of deadlock (resource waiting cycle)', 'Four Coffman conditions: Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait', 'Deadlock prevention strategy (e.g. resource ordering, Banker’s algorithm)'],
  },
  {
    topic: 'Computer Networks',
    difficulty: 'Easy',
    question: 'Explain the differences between TCP and UDP. When would a software engineer choose UDP over TCP?',
    expectedConcepts: ['Connection-oriented vs connectionless', 'Three-way handshake and reliable delivery with ACK/retransmission vs fire-and-forget', 'Head-of-line blocking vs low latency throughput', 'Use cases: HTTP/file transfers for TCP vs video streaming/online gaming/VoIP for UDP'],
  },
  {
    topic: 'Object-Oriented Programming',
    difficulty: 'Easy',
    question: 'What are the four pillars of Object-Oriented Programming? Provide a brief code or architectural example for each.',
    expectedConcepts: ['Encapsulation (bundling data and hiding private state via getters/setters)', 'Abstraction (exposing interface while hiding implementation)', 'Inheritance (code reuse via base/derived classes)', 'Polymorphism (compile-time overloading and runtime method overriding)'],
  },
  {
    topic: 'SQL',
    difficulty: 'Medium',
    question: 'What is the difference between WHERE and HAVING clauses in SQL? Can you use aggregate functions in a WHERE clause? Why or why not?',
    expectedConcepts: ['WHERE filters individual rows before grouping occurs', 'HAVING filters aggregated groups after GROUP BY', 'Aggregate functions cannot be used in WHERE because rows have not yet been grouped'],
  },
  {
    topic: 'JavaScript',
    difficulty: 'Medium',
    question: 'Explain the JavaScript Event Loop, Call Stack, Microtask Queue (Promises), and Macrotask Queue (setTimeout). What is the output order of execution when both are scheduled?',
    expectedConcepts: ['Single-threaded non-blocking runtime environment', 'Call Stack execution', 'Microtasks (Promises, queueMicrotask) have higher priority and drain completely before Macrotasks', 'Macrotasks (setTimeout, setInterval, I/O) execute on subsequent loop iterations'],
  },
  {
    topic: 'Python',
    difficulty: 'Medium',
    question: 'Explain the difference between mutable and immutable data types in Python. How does Python handle default mutable arguments in function definitions?',
    expectedConcepts: ['Mutable types (lists, dicts, sets) vs Immutable types (ints, strings, tuples)', 'Pass-by-object-reference semantics', 'Pitfall of default mutable arguments evaluated once at function definition time', 'Best practice of using None as default and instantiating inside function body'],
  },
  {
    topic: 'Java',
    difficulty: 'Medium',
    question: 'Explain the differences between the `==` operator and `.equals()` method in Java. How does Java manage string memory with the String Pool?',
    expectedConcepts: ['`==` tests reference equality (memory address)', '`.equals()` tests logical content equality', 'String literal pooling in heap memory', 'String immutability and thread safety'],
  },
  {
    topic: 'Web Development',
    difficulty: 'Medium',
    question: 'Explain how JWT (JSON Web Token) authentication works in a modern web application. How should tokens be stored securely, and what is the purpose of the signature?',
    expectedConcepts: ['Structure of JWT (Header, Payload, Signature)', 'Stateless authentication without server session storage', 'Cryptographic signature verification using secret or public key', 'Storage considerations (HttpOnly cookies vs memory to prevent XSS)'],
  },
  {
    topic: 'Machine Learning',
    difficulty: 'Medium',
    question: 'What is the Bias-Variance tradeoff in supervised machine learning? How do underfitting and overfitting relate to this concept, and how can regularization help?',
    expectedConcepts: ['Bias: error from erroneous assumptions in learning algorithm (underfitting)', 'Variance: error from sensitivity to small fluctuations in training set (overfitting)', 'Tradeoff balance for optimal generalization on unseen test data', 'Regularization techniques (L1 Lasso, L2 Ridge, Dropout) to penalize complexity'],
  },
];

export const HR_QUESTIONS = [
  {
    topic: 'Introduction',
    difficulty: 'Easy',
    question: 'Tell me about yourself. Walk me through your academic background, technical skills, and key projects you have built.',
    expectedConcepts: ['Elevator pitch structure (Past, Present, Future)', 'Highlighting education and key technical competencies', 'Brief mention of passion projects and career aspirations'],
  },
  {
    topic: 'Strengths and Weaknesses',
    difficulty: 'Medium',
    question: 'What is your greatest technical or professional strength, and what is an area or weakness you are actively working to improve?',
    expectedConcepts: ['Genuine, non-generic strength backed by an example', 'Real weakness framed positively with active steps taken to overcome it', 'Self-awareness and growth mindset'],
  },
  {
    topic: 'Conflict Management',
    difficulty: 'Medium',
    question: 'Describe a situation where you had a disagreement with a team member during a group project or hackathon. How did you resolve it?',
    expectedConcepts: ['Using the STAR method (Situation, Task, Action, Result)', 'Professional, objective communication focusing on the problem rather than personalities', 'Collaborative resolution and successful project outcome'],
  },
  {
    topic: 'Teamwork',
    difficulty: 'Easy',
    question: 'Give an example of a successful team project you contributed to. What specific role did you play, and how did you ensure the team met its deadline?',
    expectedConcepts: ['Clear articulation of personal contributions', 'Collaboration, task delegation, and version control/communication tools used', 'Project completion and lessons learned'],
  },
  {
    topic: 'Leadership',
    difficulty: 'Medium',
    question: 'Tell me about a time you had to take initiative or lead an effort when there was no clear guidance or direction.',
    expectedConcepts: ['Identifying ambiguity and taking proactive steps', 'Organizing requirements, breaking tasks down, and seeking input', 'Positive measurable outcome'],
  },
  {
    topic: 'Career Goals',
    difficulty: 'Easy',
    question: 'Where do you see yourself in 3 to 5 years, and how does this entry-level role fit into your long-term career aspirations?',
    expectedConcepts: ['Focus on mastering foundational engineering skills', 'Desire to take on larger architectural responsibilities and mentor others', 'Alignment with software engineering growth paths'],
  },
  {
    topic: 'Situational',
    difficulty: 'Hard',
    question: 'Suppose you are assigned a critical production bug on a technology stack you have never worked with before, and the deadline is tomorrow. How would you handle this situation?',
    expectedConcepts: ['Calm prioritization and problem diagnosis', 'Consulting official documentation, logs, and reproducible test cases', 'Communicating early with team leads/peers to avoid silent blocking', 'Testing the fix thoroughly before deployment'],
  },
];

/**
 * Generate fallback questions based on category, topics, and requested count
 */
export function generateFallbackQuestions(category, selectedTopics = [], count = 5, resumeData = null, jobDescription = null) {
  let pool = [];

  if (category === 'quantitative_aptitude') {
    pool = [...APTITUDE_QUESTIONS];
    if (selectedTopics && selectedTopics.length > 0) {
      const filtered = pool.filter((q) => selectedTopics.includes(q.topic));
      if (filtered.length >= count) pool = filtered;
    }
  } else if (category === 'technical') {
    pool = [...TECHNICAL_QUESTIONS];
    if (selectedTopics && selectedTopics.length > 0) {
      const filtered = pool.filter((q) => selectedTopics.some((t) => q.topic.toLowerCase().includes(t.toLowerCase())));
      if (filtered.length > 0) pool = filtered;
    }
  } else if (category === 'hr') {
    pool = [...HR_QUESTIONS];
  } else if (category === 'job_description') {
    // Generate customized JD questions based on text keywords
    pool = [
      {
        topic: 'Job Requirements Alignment',
        difficulty: 'Medium',
        question: `Based on the provided job description, explain how your technical background and problem-solving skills prepare you for the key responsibilities of this position.`,
        expectedConcepts: ['Mapping past coursework or personal projects to requirements', 'Demonstrating familiarity with the core tech stack', 'Confidence and eagerness to learn'],
      },
      {
        topic: 'System Architecture',
        difficulty: 'Medium',
        question: `The job description emphasizes delivering scalable, reliable software. Walk through how you would architect a modern web application from frontend to backend and database.`,
        expectedConcepts: ['Client-server separation', 'RESTful API or GraphQL integration', 'Database normalization and caching', 'Error handling and deployment'],
      },
      {
        topic: 'Technical Problem Solving',
        difficulty: 'Hard',
        question: `Describe a complex bug or performance bottleneck you encountered in one of your projects that mirrors the technical challenges outlined in this job description. How did you debug and resolve it?`,
        expectedConcepts: ['Systematic debugging methodology', 'Root cause analysis', 'Testing and validation of the solution'],
      },
      {
        topic: 'Collaboration in Fast-Paced Teams',
        difficulty: 'Easy',
        question: `This role requires collaborating with cross-functional teams (developers, designers, product managers). How do you approach code reviews, feedback, and version control?`,
        expectedConcepts: ['Constructive code reviews and clean git branching workflows', 'Clear documentation and asynchronous communication', 'Agile/Scrum familiarity'],
      },
      {
        topic: 'Engineering Best Practices',
        difficulty: 'Medium',
        question: `How do you ensure your code is maintainable, secure, and production-ready? What automated testing or linting practices do you follow?`,
        expectedConcepts: ['Unit and integration testing', 'Clean code principles and modularity', 'Input validation and security awareness'],
      },
    ];
  } else if (category === 'resume_based') {
    // Tailor questions to skills found in resume
    const skills = resumeData?.extractedSkills || ['Web Development', 'Data Structures', 'Databases', 'APIs'];
    const primarySkill = skills[0] || 'Software Development';
    const secondarySkill = skills[1] || 'Databases';
    const tertiarySkill = skills[2] || 'System Architecture';

    pool = [
      {
        topic: `${primarySkill} Architecture`,
        difficulty: 'Medium',
        question: `Your resume highlights experience with ${primarySkill}. Walk me through a challenging project where you utilized ${primarySkill}. What were the architectural decisions, state management, and API integrations involved?`,
        expectedConcepts: [`Real-world application of ${primarySkill}`, 'Project architecture and design patterns', 'Overcoming implementation hurdles'],
      },
      {
        topic: `${secondarySkill} Implementation`,
        difficulty: 'Medium',
        question: `In your projects mentioning ${secondarySkill}, how did you design the schema, handle data consistency, and optimize query or runtime performance?`,
        expectedConcepts: [`Database / Core logic design in ${secondarySkill}`, 'Indexing, transactions, or state integrity', 'Practical optimization strategies'],
      },
      {
        topic: `${tertiarySkill} Challenges`,
        difficulty: 'Hard',
        question: `Can you discuss a specific technical hurdle or unexpected edge case you ran into while working with ${tertiarySkill} on your resume, and how you engineered a fix?`,
        expectedConcepts: ['Clear explanation of the root challenge', 'Options considered and tradeoffs evaluated', 'Measurable successful outcome'],
      },
      {
        topic: 'Project Ownership and Testing',
        difficulty: 'Easy',
        question: `Choose one featured project from your resume. How did you test your application to ensure it handles invalid inputs, network failures, and edge cases gracefully?`,
        expectedConcepts: ['Testing strategy (unit tests, manual testing, edge case checks)', 'Error boundaries and user feedback', 'Validation logic'],
      },
      {
        topic: 'Continuous Learning',
        difficulty: 'Easy',
        question: `Looking at your resume's technology list, what is a technology or framework you learned recently, why did you decide to learn it, and what did you build with it?`,
        expectedConcepts: ['Curiosity and self-driven learning', 'Rapid onboarding on new tech', 'Practical hands-on implementation'],
      },
    ];
  }

  // Shuffle and slice count
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * Fallback answer evaluation when AI service is unavailable
 */
export function evaluateAnswerFallback(question, answer) {
  const cleanAns = (answer || '').trim();
  const wordCount = cleanAns.split(/\s+/).filter(Boolean).length;

  if (wordCount < 5) {
    return {
      score: 2.0,
      technicalAccuracy: 2.0,
      conceptualUnderstanding: 2.0,
      relevance: 3.0,
      completeness: 1.0,
      clarity: 3.0,
      verdict: 'incorrect',
      whatWentWell: 'You submitted an initial response.',
      whatWasMissing: 'The answer is too brief to demonstrate technical depth or conceptual understanding.',
      improvementAreas: 'Explain the core principles with specific terminology, examples, and step-by-step reasoning.',
      idealAnswer: question.expectedConcepts 
        ? `A complete answer should address:\n${question.expectedConcepts.map(c => `• ${c}`).join('\n')}`
        : 'A well-rounded answer explains the fundamental theory, practical tradeoffs, and real-world examples.',
      studyConcepts: question.expectedConcepts || ['Foundations of ' + question.topic],
    };
  }

  // Check how many expected concepts are mentioned
  let matchedConcepts = 0;
  if (Array.isArray(question.expectedConcepts)) {
    for (const concept of question.expectedConcepts) {
      const keywords = concept.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      const hasMatch = keywords.some(k => cleanAns.toLowerCase().includes(k));
      if (hasMatch) matchedConcepts++;
    }
  }

  const baseScore = Math.min(
    9.5,
    Math.max(4.0, 4.0 + (matchedConcepts * 1.5) + (wordCount > 30 ? 1.5 : 0.5))
  );

  const roundedScore = Number(baseScore.toFixed(1));
  const verdict = roundedScore >= 7.5 ? 'correct' : roundedScore >= 5.0 ? 'partially_correct' : 'incorrect';

  return {
    score: roundedScore,
    technicalAccuracy: Math.min(10, Number((roundedScore + 0.2).toFixed(1))),
    conceptualUnderstanding: Number(roundedScore.toFixed(1)),
    relevance: Math.min(10, Number((roundedScore + 0.5).toFixed(1))),
    completeness: Math.max(3.0, Number((roundedScore - 0.5).toFixed(1))),
    clarity: 8.0,
    verdict,
    whatWentWell: 'Good attempt covering core aspects of the topic with structured communication.',
    whatWasMissing: matchedConcepts < 2 
      ? 'Could expand further on specific edge cases, underlying mechanics, and architectural tradeoffs.'
      : 'Include concrete code snippets or numerical proofs where applicable.',
    improvementAreas: 'Focus on structuring answers using the definition -> mechanism -> real-world example paradigm.',
    idealAnswer: question.expectedConcepts 
      ? `A high-scoring answer covers:\n${question.expectedConcepts.map(c => `• ${c}`).join('\n')}`
      : 'Provide a structured definition, internal working principles, and an illustrative scenario.',
    studyConcepts: question.expectedConcepts || [question.topic],
  };
}
