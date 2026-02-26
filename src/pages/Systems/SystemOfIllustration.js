import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaCheck, FaTimes } from 'react-icons/fa';

const SystemOfIllustration = ({
  system,
  answers,
  setAnswers,
  onBack,
  darkMode
}) => {
  const [currentCard, setCurrentCard] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [completedAssessments, setCompletedAssessments] = useState(
    new Set(
      system.subAssessments
        .filter(sub =>
          answers[sub.id] &&
          Object.keys(answers[sub.id]).length === sub.questions.length
        )
        .map(sub => sub.id)
    )
  );

  const handleAnswer = (assessmentId, questionIndex, answer) => {
    const newAnswers = {
      ...answers,
      [assessmentId]: {
        ...(answers[assessmentId] || {}),
        [questionIndex]: answer
      }
    };
    setAnswers(newAnswers);

    if (currentQuestion < currentCard.questions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
    } else {
      const newCompleted = new Set(completedAssessments);
      newCompleted.add(currentCard.id);
      setCompletedAssessments(newCompleted);
      setTimeout(() => {
        setCurrentCard(null);
        setCurrentQuestion(0);
      }, 300);
    }
  };

  const getProgress = assessmentId =>
    answers[assessmentId] ? Object.keys(answers[assessmentId]).length : 0;

  const allCompleted =
    completedAssessments.size === system.subAssessments.length;

  return (
    <div
      className={`transition-colors duration-500 ${
        darkMode
          ? "bg-gradient-to-b from-gray-900 to-gray-800 text-gray-200"
          : "bg-gradient-to-b from-blue-50 to-indigo-100 text-gray-800"
      } p-2 sm:p-4 md:p-8`}
    >
      <div className="max-w-6xl mx-auto">
        {!currentCard ? (
          <>
            <div className="flex items-center mb-8">
              <button
                onClick={onBack}
                className={`flex items-center ${
                  darkMode
                    ? "text-indigo-400 hover:text-indigo-300"
                    : "text-indigo-600 hover:text-indigo-800"
                }`}
              >
                <FaArrowLeft className="mr-2" /> Back to Systems
              </button>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl shadow-xl p-6 md:p-8 mb-8 ${
                darkMode
                  ? "bg-gray-800/50 border border-gray-700"
                  : "bg-white border border-gray-200"
              }`}
            >
              <h1
                className={`text-3xl md:text-4xl font-bold mb-4 ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                {system.title}
              </h1>
              <p
                className={`mb-6 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {system.description}
              </p>
              <div
                className={`p-4 rounded-lg ${
                  darkMode
                    ? "bg-gray-900/30 border border-gray-700 text-blue-300"
                    : "bg-blue-50 border border-blue-200 text-blue-700"
                }`}
              >
                <h2
                  className={`font-bold mb-2 ${
                    darkMode ? "text-yellow-400" : "text-yellow-600"
                  }`}
                >
                  Assessment Goal
                </h2>
                <p>{system.goal}</p>
              </div>

              {/* Completion status bar */}
              <div
                className={`mt-6 p-4 rounded-lg ${
                  darkMode
                    ? "bg-gray-900/30 border border-gray-700"
                    : "bg-gray-100 border border-gray-200"
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3
                    className={`font-semibold ${
                      darkMode ? "text-green-400" : "text-green-600"
                    }`}
                  >
                    Progress: {completedAssessments.size} of{" "}
                    {system.subAssessments.length} completed
                  </h3>
                  {allCompleted && (
                    <div className="flex items-center text-green-500">
                      <FaCheck className="mr-2" />
                      <span className="font-bold">All Completed!</span>
                    </div>
                  )}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="h-2.5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"
                    style={{
                      width: `${
                        (completedAssessments.size /
                          system.subAssessments.length) *
                        100
                      }%`
                    }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Sub-assessment cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {system.subAssessments.map(assessment => {
                const isCompleted = completedAssessments.has(assessment.id);
                const progress = getProgress(assessment.id);
                const totalQuestions = assessment.questions.length;
                const progressPercent = (progress / totalQuestions) * 100;

                return (
                  <motion.div
                    key={assessment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -5 }}
                    className={`rounded-xl shadow-lg overflow-hidden cursor-pointer transition-all ${
                      darkMode
                        ? "bg-gray-800/30 border border-gray-700 hover:border-yellow-500"
                        : "bg-white border border-gray-200 hover:border-yellow-500"
                    } ${
                      isCompleted
                        ? darkMode
                          ? "border-green-500/50"
                          : "border-green-500/30 bg-green-50/50"
                        : ""
                    }`}
                    onClick={() => {
                      setCurrentCard(assessment);
                      setCurrentQuestion(0);
                    }}
                  >
                    <div className="p-5">
                      <div className="flex justify-between items-start">
                        <h3
                          className={`text-xl font-bold mb-2 ${
                            darkMode ? "text-white" : "text-gray-800"
                          }`}
                        >
                          {assessment.title}
                        </h3>
                        {isCompleted && (
                          <span
                            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center ${
                              darkMode
                                ? "bg-green-900/30 text-green-400"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            <FaCheck className="mr-1" /> Completed
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-sm mb-4 ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {assessment.description}
                      </p>

                      <div className="mt-4">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium">
                            {progress} of {totalQuestions} questions
                          </span>
                          <span className="font-medium">
                            {isCompleted ? "Completed" : "In Progress"}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        ) : (
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`rounded-2xl shadow-xl overflow-hidden ${
              darkMode
                ? "bg-gray-800/50 border border-gray-700"
                : "bg-white border border-gray-200"
            }`}
          >
            <div className="p-6 border-b border-gray-200">
              <button
                onClick={() => setCurrentCard(null)}
                className={`flex items-center mb-4 ${
                  darkMode
                    ? "text-indigo-400 hover:text-indigo-300"
                    : "text-indigo-600 hover:text-indigo-800"
                }`}
              >
                <FaArrowLeft className="mr-2" /> Back to Assessments
              </button>

              <div className="flex items-start">
                <div
                  className={`p-3 rounded-lg mr-4 ${
                    darkMode ? "bg-indigo-900/30" : "bg-indigo-100"
                  }`}
                >
                  <span
                    className={`font-bold ${
                      darkMode ? "text-indigo-300" : "text-indigo-800"
                    }`}
                  >
                    🔗
                  </span>
                </div>
                <div>
                  <h2
                    className={`text-2xl font-bold ${
                      darkMode ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {currentCard.title}
                  </h2>
                  <p
                    className={`${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {currentCard.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3
                  className={`text-lg font-semibold ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Question {currentQuestion + 1} of{" "}
                  {currentCard.questions.length}
                </h3>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                    style={{
                      width: `${
                        ((currentQuestion + 1) /
                          currentCard.questions.length) *
                        100
                      }%`
                    }}
                  />
                </div>
              </div>

              <div className="mb-8">
                <h4
                  className={`text-xl font-medium mb-4 ${
                    darkMode ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  {currentCard.questions[currentQuestion].statement}
                </h4>
                <div
                  className={`rounded-lg p-4 ${
                    darkMode
                      ? "bg-gray-800 border border-gray-700 text-blue-300"
                      : "bg-blue-50 border border-blue-200 text-blue-700"
                  }`}
                >
                  <p className="italic">
                    {currentCard.questions[currentQuestion].clarification}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {["Yes", "Not Sure", "No"].map(option => (
                  <motion.button
                    key={option}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() =>
                      handleAnswer(currentCard.id, currentQuestion, option)
                    }
                    className={`p-4 rounded-xl border-2 text-center font-medium transition-colors w-full flex items-center justify-center ${
                      answers[currentCard.id]?.[currentQuestion] === option
                        ? option === "Yes"
                          ? darkMode
                            ? "bg-green-900/20 border-green-600 text-green-300"
                            : "bg-green-100 border-green-500 text-green-700"
                          : option === "Not Sure"
                          ? darkMode
                            ? "bg-yellow-900/20 border-yellow-600 text-yellow-300"
                            : "bg-yellow-100 border-yellow-500 text-yellow-700"
                          : darkMode
                          ? "bg-red-900/20 border-red-600 text-red-300"
                          : "bg-red-100 border-red-500 text-red-700"
                        : darkMode
                        ? "bg-gray-700/50 border-gray-600 text-gray-300 hover:border-indigo-500 hover:bg-indigo-900/20"
                        : "bg-gray-100 border-gray-300 text-gray-700 hover:border-indigo-400 hover:bg-indigo-50"
                    }`}
                  >
                    {option === "Yes" && <FaCheck className="mr-3" />}
                    {option === "No" && <FaTimes className="mr-3" />}
                    <span className="font-bold">{option}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SystemOfIllustration;
