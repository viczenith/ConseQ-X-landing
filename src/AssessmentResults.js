import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ResultAnalysis from './components/ResultAnalysis';
import ReportGenerator from './components/ReportGenerator';
import { systems } from './data/systems';
import { 
  calculateSubAssessmentScore,
  getSubAssessmentInterpretation,
  getSystemInterpretation
} from './utils/scoringUtils';

import { generateAIAnalysis } from './utils/aiPromptGenerator';

export default function AssessmentResults() {
  const location = useLocation();
  const { userInfo, answers } = location.state || {};
  const [completedSystems, setCompletedSystems] = useState([]);
  const [reportType, setReportType] = useState('full');
  const [selectedSystems, setSelectedSystems] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  // Calculate completed systems
  useEffect(() => {
    const completed = systems.filter(system => {
      return system.subAssessments.every(sub => 
        answers[sub.id] && 
        Object.keys(answers[sub.id]).length === sub.questions.length
      );
    });
    setCompletedSystems(completed);
    setSelectedSystems(completed.map(sys => sys.id));
  }, [answers]);

  // Calculate scores
  const calculateScores = () => {
    const scores = {};
    
    completedSystems.forEach(system => {
      const systemScores = {
        systemScore: 0,
        maxSystemScore: 0,
        subAssessments: {}
      };
      
      system.subAssessments.forEach(sub => {
        const scoreData = calculateSubAssessmentScore(sub.id, answers[sub.id]);
        const interpretation = getSubAssessmentInterpretation(sub.id, scoreData.score);
        
        systemScores.subAssessments[sub.id] = {
          ...scoreData,
          interpretation
        };
        
        systemScores.systemScore += scoreData.score;
        systemScores.maxSystemScore += scoreData.maxScore;
      });
      
      systemScores.interpretation = getSystemInterpretation(
        system.id, 
        systemScores.systemScore
      );
      
      scores[system.id] = systemScores;
    });
    
    return scores;
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const scores = calculateScores();
      const response = await generateAIAnalysis(scores);
      setAnalysis(response);
    } catch (error) {
      console.error("Error generating analysis:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Assessment Results</h1>
      
      {/* Report Type Selection */}
      <div className="mb-8 p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Report Options</h2>
        <div className="flex space-x-4">
          <button 
            className={`px-4 py-2 rounded ${reportType === 'full' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setReportType('full')}
          >
            Full Report
          </button>
          <button 
            className={`px-4 py-2 rounded ${reportType === 'selected' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setReportType('selected')}
          >
            Selected Systems
          </button>
        </div>
        
        {reportType === 'selected' && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">Select Systems:</h3>
            {completedSystems.map(system => (
              <div key={system.id} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={selectedSystems.includes(system.id)}
                  onChange={() => handleSystemSelect(system.id)}
                  className="mr-2"
                />
                <span>{system.title}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* AI Analysis Section */}
      {analysis ? (
        <ResultAnalysis analysis={analysis} />
      ) : (
        <div className="text-center py-12">
          <button 
            onClick={handleGenerateReport}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Generating Report...' : 'Generate AI Analysis'}
          </button>
        </div>
      )}
      
      {/* PDF Download */}
      {analysis && (
        <div className="mt-8">
          <ReportGenerator analysis={analysis} userInfo={userInfo} />
        </div>
      )}
    </div>
  );
  
  function handleSystemSelect(systemId) {
    setSelectedSystems(prev => 
      prev.includes(systemId)
        ? prev.filter(id => id !== systemId)
        : [...prev, systemId]
    );
  }
}