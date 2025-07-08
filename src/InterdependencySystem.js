import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaCheck } from 'react-icons/fa';

const InterdependencySystem = () => {
  const [currentCard, setCurrentCard] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [completedAssessments, setCompletedAssessments] = useState(new Set());

  const assessments = [
    {
      id: 'crb',
      title: 'Core Response Behaviors (CRBs)',
      description: 'Assess whether your organization\'s crisis responses are constructive (aligned, adaptive, resilient) or detrimental (reactive, misaligned, short-term).',
      questions: [
        {
          statement: 'Does your organization quickly adjust its strategy in response to emerging crises?',
          clarification: 'Think of a recent crisis—how fast did your strategy shift?'
        },
        {
          statement: 'Does your team document and review lessons from past crises to avoid repeat failures?',
          clarification: 'E.g., retrospective sessions, updated playbooks.'
        },
        {
          statement: 'Are unconventional or innovative solutions welcomed during high-pressure moments?',
          clarification: 'Are new ideas explored instead of reverting to defaults?'
        },
        {
          statement: 'Do crisis-time decisions consistently reflect your organization’s core values?',
          clarification: 'Consider if ethical commitments are maintained under pressure.'
        },
        {
          statement: 'Is there evidence that integrity is upheld during crisis response—even at cost?',
          clarification: 'Were shortcuts or ethical compromises avoided?'
        },
        {
          statement: 'Does leadership messaging remain consistent and values-driven throughout crises?',
          clarification: 'Messaging tone: does it match long-term vision or just spin?'
        },
        {
          statement: 'Do your crisis responses result in long-term resolution rather than temporary relief?',
          clarification: 'Did the issue resurface due to incomplete fixes?'
        },
        {
          statement: 'Is reputational damage minimized or reversed after crisis handling?',
          clarification: 'Public or partner trust recovered/improved?'
        },
        {
          statement: 'Do stakeholders express increased confidence in leadership after crises?',
          clarification: 'Client/employee feedback, engagement, media tone.'
        },
        {
          statement: 'Are risks regularly identified and addressed before they escalate?',
          clarification: 'Routine risk reviews, red flags tracked.'
        },
        {
          statement: 'Does your organization take early action during signs of instability?',
          clarification: 'E.g., preemptive hiring freeze, early supply shifts.'
        },
        {
          statement: 'Is scenario planning or war-gaming used for crisis preparedness?',
          clarification: 'Think of future simulations or contingency drills.'
        },
        {
          statement: 'Do cross-functional teams collaborate clearly during crises?',
          clarification: 'Look for shared crisis boards, joint task forces.'
        },
        {
          statement: 'Are team roles and responsibilities clear during high-stakes events?',
          clarification: 'Ambiguity reduced or leadership overlaps?'
        },
        {
          statement: 'Is there a culture that avoids blame and focuses on solutions during setbacks?',
          clarification: 'Who gets questioned first—the person or the system?'
        },
      ]
    },
    {
      id: 'internal-client',
      title: 'Internal Client Satisfaction',
      description: 'To objectively assess how well internal teams serve each other as clients, using clear, real-world behavior and performance indicators.',
      questions: [
        {
          statement: 'Are service requests typically acknowledged within 24 hours of being sent?',
          clarification: 'Think about the average time between a request and a response.'
        },
        {
          statement: 'Do service teams inform clients when there are delays or issues fulfilling requests?',
          clarification: 'Was the client updated before escalation?'
        },
        {
          statement: 'Is the final output often reviewed by the service team for accuracy before delivery?',
          clarification: 'Do errors get caught internally or by the client?'
        },
        {
          statement: 'Do service teams communicate clearly what is being delivered, by when, and how?',
          clarification: 'Were timelines and scope made clear from the start?'
        },
        {
          statement: 'Is there a process for internal clients to raise concerns and receive follow-up?',
          clarification: 'Think of helpdesks, ticketing, or feedback forms.'
        },
        {
          statement: 'Have internal teams received direct appreciation from clients for their professionalism?',
          clarification: 'Check emails, messages, or mentions in review.'
        },
        {
          statement: 'Do internal service teams routinely offer solutions beyond what was requested?',
          clarification: 'Examples of proactive problem-solving or added insights.'
        },
        {
          statement: 'Are deliverables from internal teams consistently aligned with what the requesting team needs to meet its own goals?',
          clarification: 'Do they improve or complicate the requester’s job?'
        },
        {
          statement: 'Are internal clients regularly engaged for feedback on how to improve the service?',
          clarification: 'Surveys, check-ins, reviews, etc.'
        },
        {
          statement: 'Has the service team adjusted its delivery methods or tools based on past client feedback?',
          clarification: 'Evidence of evolution or fixed style?'
        },
        
      ]
    },
    {
      id: 'dependency-mapping',
      title: 'Dependency Mapping',
      description: 'Help leaders and teams assess the strength, clarity, and risks of their operational interdependencies.',
      questions: [
        {
          statement: 'Is the reason why your team depends on this other team or process clearly defined and agreed on?',
          clarification: 'Purpose alignment — why the dependency exists.'
        },
        // Add all 10 questions
      ]
    },
    {
      id: 'trust-flow',
      title: 'Cross-Team Trust and Flow Index',
      description: 'To measure trust, feedback loops, and communication fluidity between departments or cross-functional teams.',
      questions: [
        {
          statement: 'Do teams address issues or breakdowns directly with each other before escalating?',
          clarification: 'E.g., Teams try resolution together before looping in leadership.'
        },
        // Add all 10 questions
      ]
    },
    {
      id: 'silo-impact',
      title: 'Silo Impact Scorecard',
      description: 'To evaluate the presence and cost of silos in decision-making, delivery, and learning across functions or units.',
      questions: [
        {
          statement: 'Do both teams consult each other before making decisions that impact shared workflows?',
          clarification: 'Checks for upstream-downstream awareness and consultation.'
        },
        // Add all 5 questions
      ]
    },
    {
      id: 'breakdown-risk',
      title: 'Interaction Breakdown Risk Audit',
      description: 'To Detect where collaboration is likely to fail due to unclear, irregular, or broken interaction links between teams, departments, or individuals.',
      questions: [
        {
          statement: 'Are the roles and responsibilities of both parties clearly defined in the interaction?',
          clarification: 'Interaction Clarity — E.g., each team knows what they owe and expect.'
        },
        // Add all 5 questions
      ]
    }
  ];

  const handleAnswer = (assessmentId, questionIndex, answer) => {
    setAnswers(prev => ({
      ...prev,
      [assessmentId]: {
        ...prev[assessmentId],
        [questionIndex]: answer
      }
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < currentCard.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Mark assessment as completed
      setCompletedAssessments(prev => new Set(prev).add(currentCard.id));
      setCurrentCard(null);
      setCurrentQuestion(0);
    }
  };

  const calculateScore = (assessmentId) => {
    if (!answers[assessmentId]) return 0;
    
    const responses = Object.values(answers[assessmentId]);
    return responses.reduce((total, answer) => {
      if (answer === 'Yes') return total + 10;
      if (answer === 'Not Sure') return total + 5;
      return total + 1;
    }, 0);
  };

  const interpretScore = (score, assessmentId) => {
    const maxScore = assessments.find(a => a.id === assessmentId).questions.length * 10;
    
    if (assessmentId === 'crb') {
      if (score >= 140 && score <= 150) return '✅ Highly Constructive CRBs';
      if (score >= 90 && score <= 139) return '🟡 Moderate CRBs';
      return '🔴 Detrimental CRBs';
    }
    // Add interpretations for other assessments
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {!currentCard ? (
          <>
            <div className="flex items-center mb-8">
              <button 
                onClick={() => window.history.back()}
                className="flex items-center text-indigo-600 hover:text-indigo-800"
              >
                <FaArrowLeft className="mr-2" /> Back to Systems
              </button>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8"
            >
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                System of Interdependency & Interaction
              </h1>
              <p className="text-gray-600 mb-6">
                This captures how parts of the organization rely on each other. This system emphasizes that everything in an organization is connected.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h2 className="font-bold text-blue-800 mb-2">Assessment Goal</h2>
                <p className="text-blue-700">
                  Identify where collaboration is likely to fail between teams, departments, or individuals
                </p>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assessments.map((assessment) => (
                <motion.div
                  key={assessment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                  className={`bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transition-all ${
                    completedAssessments.has(assessment.id) 
                      ? 'border-2 border-green-500' 
                      : 'border border-gray-200 hover:border-indigo-300'
                  }`}
                  onClick={() => {
                    setCurrentCard(assessment);
                    setCurrentQuestion(0);
                  }}
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {assessment.title}
                      </h3>
                      {completedAssessments.has(assessment.id) && (
                        <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center">
                          <FaCheck className="mr-1" /> Completed
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-4">
                      {assessment.description}
                    </p>
                    
                    {completedAssessments.has(assessment.id) && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">Score: {calculateScore(assessment.id)}</span>
                          <span className="font-medium">
                            {interpretScore(calculateScore(assessment.id), assessment.id)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600" 
                            style={{ 
                              width: `${(calculateScore(assessment.id) / (assessment.questions.length * 10)) * 100}%` 
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200">
              <button 
                onClick={() => setCurrentCard(null)}
                className="flex items-center text-indigo-600 hover:text-indigo-800 mb-4"
              >
                <FaArrowLeft className="mr-2" /> Back to Assessments
              </button>
              
              <div className="flex items-start">
                <div className="bg-indigo-100 p-3 rounded-lg mr-4">
                  <span className="text-indigo-800 font-bold">🔗</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {currentCard.title}
                  </h2>
                  <p className="text-gray-600">
                    {currentCard.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-700">
                  Question {currentQuestion + 1} of {currentCard.questions.length}
                </h3>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                    style={{ 
                      width: `${((currentQuestion + 1) / currentCard.questions.length) * 100}%` 
                    }}
                  />
                </div>
              </div>

              <div className="mb-8">
                <h4 className="text-xl font-medium text-gray-800 mb-4">
                  {currentCard.questions[currentQuestion].statement}
                </h4>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-700 italic">
                    {currentCard.questions[currentQuestion].clarification}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {['Yes', 'Not Sure', 'No'].map((option) => (
                  <motion.button
                    key={option}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 rounded-xl border-2 text-center font-medium transition-colors ${
                      answers[currentCard.id]?.[currentQuestion] === option
                        ? option === 'Yes' 
                          ? 'bg-green-50 border-green-500 text-green-700' 
                          : option === 'Not Sure' 
                            ? 'bg-yellow-50 border-yellow-500 text-yellow-700' 
                            : 'bg-red-50 border-red-500 text-red-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-indigo-400'
                    }`}
                    onClick={() => handleAnswer(currentCard.id, currentQuestion, option)}
                  >
                    {option}
                  </motion.button>
                ))}
              </div>

              <div className="flex justify-between">
                {currentQuestion > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
                    onClick={() => setCurrentQuestion(currentQuestion - 1)}
                  >
                    Previous
                  </motion.button>
                )}
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-6 py-3 rounded-lg font-medium ml-auto ${
                    answers[currentCard.id]?.[currentQuestion]
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={!answers[currentCard.id]?.[currentQuestion]}
                  onClick={handleNextQuestion}
                >
                  {currentQuestion === currentCard.questions.length - 1 ? 'Complete Assessment' : 'Next'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default InterdependencySystem;