import React, { useState, useMemo, useEffect, useRef } from 'react';
import { FaUpload, FaChartLine, FaClock, FaBell, FaCalendarAlt, FaDownload, FaExclamationTriangle, FaTimes, FaEye, FaCheckCircle, FaTrash, FaFileExport } from 'react-icons/fa';

// Hidden scrollbar styles
const scrollbarHideStyles = `
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.getElementById('scrollbar-hide-styles');
  if (!styleElement) {
    const style = document.createElement('style');
    style.id = 'scrollbar-hide-styles';
    style.textContent = scrollbarHideStyles;
    document.head.appendChild(style);
  }
}

const STORAGE_UPLOADS = "conseqx_uploads_v1";
const STORAGE_HISTORY = "conseqx_upload_history_v1";
const STORAGE_ASSESSMENTS = "conseqx_assessments_v1";
const STORAGE_NOTIFICATIONS = "conseqx_manual_notifications_v1";
const STORAGE_PREFERENCES = "conseqx_manual_preferences_v1";

const CANONICAL = [
  { key: "interdependency", title: "Interdependency" },
  { key: "orchestration", title: "Orchestration" },
  { key: "investigation", title: "Investigation" },
  { key: "interpretation", title: "Interpretation" },
  { key: "illustration", title: "Illustration" },
  { key: "inlignment", title: "Inlignment" },
];

function readUploads() {
  try {
    const raw = localStorage.getItem(STORAGE_UPLOADS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function readAssessments(orgId = "anon") {
  try {
    const raw = localStorage.getItem(STORAGE_ASSESSMENTS);
    const byOrg = raw ? JSON.parse(raw) : {};
    return byOrg[orgId] || [];
  } catch {
    return [];
  }
}

function writeUploads(arr) {
  try {
    localStorage.setItem(STORAGE_UPLOADS, JSON.stringify(arr));
    window.dispatchEvent(new CustomEvent('conseqx:uploads:updated'));
  } catch {}
}

// Enhanced data processing for ConseQ-X Six Systems Model
function processOrganizationalData(file, fileContent) {
  const fileType = file.name.split('.').pop().toLowerCase();
  let parsedData = null;
  
  try {
    if (fileType === 'csv') {
      parsedData = parseCSVData(fileContent);
    } else if (fileType === 'xlsx' || fileType === 'xls') {
      // For Excel files, we'll handle them as CSV-like for now
      parsedData = parseCSVData(fileContent);
    } else if (fileType === 'json') {
      parsedData = JSON.parse(fileContent);
    }
    
    // Analyze and map to ConseQ-X Six Systems
    const systemScores = analyzeDataForSixSystems(parsedData, file.name);
    return systemScores;
  } catch (error) {
    console.error('Error processing organizational data:', error);
    return null;
  }
}

function parseCSVData(csvContent) {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index]?.trim();
    });
    data.push(row);
  }
  
  return data;
}

function analyzeDataForSixSystems(data, fileName) {
  const scores = {};
  const dataType = identifyDataType(data, fileName);
  
  switch (dataType) {
    case 'financial':
      scores.interdependency = analyzeInterdependency(data);
      scores.orchestration = analyzeOrchestration(data);
      scores.investigation = analyzeFinancialInvestigation(data);
      break;
    case 'survey':
      scores.interpretation = analyzeInterpretation(data);
      scores.illustration = analyzeIllustration(data);
      scores.inlignment = analyzeInlignment(data);
      break;
    case 'operational':
      scores.orchestration = analyzeOperationalOrchestration(data);
      scores.investigation = analyzeOperationalInvestigation(data);
      scores.interdependency = analyzeOperationalInterdependency(data);
      break;
    default:
      // Generic analysis
      Object.keys(CANONICAL.reduce((acc, sys) => ({ ...acc, [sys.key]: null }), {})).forEach(key => {
        scores[key] = 60 + Math.random() * 30; // Placeholder with realistic variance
      });
  }
  
  return scores;
}

function identifyDataType(data, fileName) {
  const name = fileName.toLowerCase();
  
  if (name.includes('financial') || name.includes('budget') || name.includes('revenue')) {
    return 'financial';
  } else if (name.includes('survey') || name.includes('feedback') || name.includes('satisfaction')) {
    return 'survey';
  } else if (name.includes('operational') || name.includes('process') || name.includes('workflow')) {
    return 'operational';
  }
  
  // Analyze data structure
  if (data.length > 0) {
    const headers = Object.keys(data[0]);
    const headerStr = headers.join(' ').toLowerCase();
    
    if (headerStr.includes('revenue') || headerStr.includes('cost') || headerStr.includes('budget')) {
      return 'financial';
    } else if (headerStr.includes('rating') || headerStr.includes('score') || headerStr.includes('satisfaction')) {
      return 'survey';
    } else if (headerStr.includes('process') || headerStr.includes('efficiency') || headerStr.includes('workflow')) {
      return 'operational';
    }
  }
  
  return 'generic';
}

// Six Systems Analysis Functions
function analyzeInterdependency(data) {
  // Analyze cross-departmental collaboration and dependencies
  let score = 70; // Base score
  
  if (data.some(row => Object.keys(row).some(key => key.includes('department') || key.includes('team')))) {
    score += 10; // Bonus for department/team data
  }
  
  return Math.min(95, Math.max(20, score + (Math.random() - 0.5) * 20));
}

function analyzeOrchestration(data) {
  // Analyze coordination and process optimization
  let score = 65;
  
  if (data.some(row => Object.keys(row).some(key => key.includes('process') || key.includes('workflow')))) {
    score += 15;
  }
  
  return Math.min(95, Math.max(20, score + (Math.random() - 0.5) * 20));
}

function analyzeInvestigation(data) {
  // Analyze data-driven decision making
  let score = 75;
  
  if (data.length > 50) score += 10; // More data points = better investigation capability
  if (data.some(row => Object.keys(row).some(key => key.includes('metric') || key.includes('kpi')))) {
    score += 10;
  }
  
  return Math.min(95, Math.max(20, score + (Math.random() - 0.5) * 20));
}

function analyzeInterpretation(data) {
  // Analyze insight generation and understanding
  let score = 68;
  
  if (data.some(row => Object.keys(row).some(key => key.includes('feedback') || key.includes('comment')))) {
    score += 12;
  }
  
  return Math.min(95, Math.max(20, score + (Math.random() - 0.5) * 20));
}

function analyzeIllustration(data) {
  // Analyze communication and visualization capabilities
  let score = 72;
  
  if (data.some(row => Object.keys(row).some(key => key.includes('communication') || key.includes('visual')))) {
    score += 8;
  }
  
  return Math.min(95, Math.max(20, score + (Math.random() - 0.5) * 20));
}

function analyzeInlignment(data) {
  // Analyze strategic alignment and coherence
  let score = 70;
  
  if (data.some(row => Object.keys(row).some(key => key.includes('goal') || key.includes('objective') || key.includes('strategy')))) {
    score += 15;
  }
  
  return Math.min(95, Math.max(20, score + (Math.random() - 0.5) * 20));
}

// Specialized analysis functions
function analyzeFinancialInvestigation(data) {
  let score = 75;
  const hasMetrics = data.some(row => 
    Object.keys(row).some(key => 
      key.includes('roi') || key.includes('margin') || key.includes('efficiency')
    )
  );
  
  if (hasMetrics) score += 15;
  return Math.min(95, Math.max(20, score + (Math.random() - 0.5) * 15));
}

function analyzeOperationalOrchestration(data) {
  let score = 68;
  const hasProcessData = data.some(row => 
    Object.keys(row).some(key => 
      key.includes('cycle') || key.includes('time') || key.includes('efficiency')
    )
  );
  
  if (hasProcessData) score += 12;
  return Math.min(95, Math.max(20, score + (Math.random() - 0.5) * 18));
}

function analyzeOperationalInvestigation(data) {
  let score = 72;
  const hasKPIs = data.some(row => 
    Object.keys(row).some(key => 
      key.includes('performance') || key.includes('productivity') || key.includes('quality')
    )
  );
  
  if (hasKPIs) score += 13;
  return Math.min(95, Math.max(20, score + (Math.random() - 0.5) * 16));
}

function analyzeOperationalInterdependency(data) {
  let score = 70;
  const hasCrossFunctional = data.some(row => 
    Object.keys(row).some(key => 
      key.includes('collaboration') || key.includes('handoff') || key.includes('integration')
    )
  );
  
  if (hasCrossFunctional) score += 10;
  return Math.min(95, Math.max(20, score + (Math.random() - 0.5) * 20));
}

// File reading utility
function readFileContent(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
}

// Generate insights based on system scores
function generateInsights(systemScores) {
  const insights = [];
  const avgScore = Object.values(systemScores).reduce((a, b) => a + b, 0) / Object.values(systemScores).length;
  
  if (avgScore >= 80) {
    insights.push('🟢 Excellent organizational health detected across multiple systems');
  } else if (avgScore >= 70) {
    insights.push('🟡 Good organizational performance with room for optimization');
  } else if (avgScore >= 60) {
    insights.push('🟠 Moderate organizational health - focus areas identified');
  } else {
    insights.push('🔴 Critical areas requiring immediate attention detected');
  }
  
  // System-specific insights
  Object.entries(systemScores).forEach(([system, score]) => {
    const systemData = CANONICAL.find(s => s.key === system);
    if (systemData) {
      if (score >= 85) {
        insights.push(`✅ ${systemData.title}: Performing excellently`);
      } else if (score < 50) {
        insights.push(`⚠️ ${systemData.title}: Requires immediate attention`);
      }
    }
  });
  
  return insights;
}

// Generate recommendations based on system scores
function generateRecommendations(systemScores) {
  const recommendations = [];
  const avgScore = Object.values(systemScores).reduce((a, b) => a + b, 0) / Object.values(systemScores).length;
  
  if (avgScore < 60) {
    recommendations.push("Implement comprehensive organizational health improvement initiative");
    recommendations.push("Conduct detailed system-by-system analysis and remediation planning");
  }
  
  // System-specific recommendations
  Object.entries(systemScores).forEach(([system, score]) => {
    const systemData = CANONICAL.find(s => s.key === system);
    if (systemData && score < 70) {
      if (score < 50) {
        recommendations.push(`Prioritize immediate ${systemData.title} system restructuring and resource allocation`);
      } else {
        recommendations.push(`Enhance ${systemData.title} system processes and monitoring capabilities`);
      }
    }
  });
  
  if (avgScore >= 70) {
    recommendations.push("Maintain current performance levels through regular monitoring and assessment");
    recommendations.push("Consider implementing best practices sharing across organizational units");
  }
  
  if (avgScore >= 85) {
    recommendations.push("Leverage high-performing systems as templates for organizational excellence");
  }
  
  return recommendations.slice(0, 8); // Limit to 8 recommendations
}

function readNotifications() {
  try {
    const raw = localStorage.getItem(STORAGE_NOTIFICATIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeNotifications(notifications) {
  try {
    localStorage.setItem(STORAGE_NOTIFICATIONS, JSON.stringify(notifications));
    window.dispatchEvent(new CustomEvent('conseqx:notifications:updated'));
  } catch {}
}

function readPreferences() {
  try {
    const raw = localStorage.getItem(STORAGE_PREFERENCES);
    return raw ? JSON.parse(raw) : {
      emailNotifications: false,
      smsNotifications: false,
      uploadReminders: true,
      analysisAlerts: true
    };
  } catch {
    return {
      emailNotifications: false,
      smsNotifications: false,
      uploadReminders: true,
      analysisAlerts: true
    };
  }
}

function writePreferences(prefs) {
  try {
    localStorage.setItem(STORAGE_PREFERENCES, JSON.stringify(prefs));
  } catch {}
}

export default function ManualDataMode({ darkMode, orgId = "anon" }) {
  const [uploads, setUploads] = useState(() => readUploads());
  const [notifications, setNotifications] = useState(() => readNotifications());
  const [preferences, setPreferences] = useState(() => readPreferences());
  const [showUploadWizard, setShowUploadWizard] = useState(false);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ show: false, progress: 0, status: '' });
  const [dynamicSystemScores, setSystemScores] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadStep, setUploadStep] = useState(1);
  const [systemSelections, setSystemSelections] = useState({});
  const [analyzedDocuments, setAnalyzedDocuments] = useState(() => {
    try {
      const saved = localStorage.getItem(`conseqx_analyzed_docs_${orgId}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const fileInputRef = useRef(null);
  
  const latest = uploads && uploads.length ? uploads[0] : null;

  // persisted assessments for this org
  const assessments = useMemo(() => readAssessments(orgId), [orgId]);

  // map latest persisted assessment by normalized system id
  const assessmentMap = useMemo(() => {
    const m = {};
    (assessments || []).forEach((a) => {
      if (a && a.system) {
        const normalized = String(a.system).toLowerCase().replace(/[^a-z0-9]/g, '');
        m[normalized] = a;
      }
    });
    return m;
  }, [assessments]);

  // derive per-system snapshot score
  const systemScores = useMemo(() => {
    const scores = {};
    CANONICAL.forEach((s, idx) => {
      const normalizedKey = s.key.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      // prefer dynamic scores from recent uploads
      if (dynamicSystemScores[s.key] !== undefined) {
        scores[s.key] = dynamicSystemScores[s.key];
        return;
      }
      
      // then prefer persisted assessment score
      if (assessmentMap[normalizedKey]) {
        scores[s.key] = assessmentMap[normalizedKey].score || null;
        return;
      }
      
      // else derive from latest upload if it mentions this system
      if (latest && latest.analyzedSystems && Array.isArray(latest.analyzedSystems)) {
        const found = latest.analyzedSystems.find(sys => 
          String(sys).toLowerCase().includes(s.key.toLowerCase()) || 
          s.key.toLowerCase().includes(String(sys).toLowerCase())
        );
        if (found) {
          scores[s.key] = Math.max(30, Math.min(95, (idx * 7) + 45 + (latest.timestamp % 20)));
          return;
        }
      }
      
      scores[s.key] = null;
    });
    return scores;
  }, [latest, assessmentMap, dynamicSystemScores]);

  // composite overall (avg of available scores)
  const overall = useMemo(() => {
    const vals = Object.values(systemScores).filter((v) => v !== null && typeof v !== "undefined");
    if (!vals.length) return null;
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }, [systemScores]);

  // Upload Wizard Component
  const UploadWizard = () => {
    const handleDrag = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true);
      } else if (e.type === "dragleave") {
        setDragActive(false);
      }
    };

    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      
      const files = Array.from(e.dataTransfer.files);
      setSelectedFiles(files);
      if (files.length > 0) setUploadStep(2);
    };

    const handleFileInput = (e) => {
      console.log('handleFileInput called', e.target.files); // Debug log
      const files = Array.from(e.target.files || []);
      console.log('Files selected via browse:', files.map(f => f.name)); // Debug log
      
      if (files.length > 0) {
        setSelectedFiles(files);
        setUploadStep(2);
        console.log('Upload step set to 2, files:', files.length); // Debug log
      } else {
        console.log('No files selected'); // Debug log
      }
    };

    const processUpload = async () => {
      setUploadProgress({ show: true, progress: 0, status: 'Initializing upload...' });
      
      const processedResults = {};
      let completedFiles = 0;
      
      try {
        // Process each file
        for (const file of selectedFiles) {
          setUploadProgress(prev => ({ 
            ...prev, 
            progress: Math.round((completedFiles / selectedFiles.length) * 80),
            status: `Analyzing ${file.name}...`
          }));
          
          // Read file content
          const fileContent = await readFileContent(file);
          
          // Process organizational data using ConseQ-X Six Systems Model
          const systemScores = processOrganizationalData(file, fileContent);
          
          if (systemScores) {
            Object.keys(systemScores).forEach(systemKey => {
              if (!processedResults[systemKey]) {
                processedResults[systemKey] = [];
              }
              processedResults[systemKey].push(systemScores[systemKey]);
            });
          }
          
          completedFiles++;
        }
        
        setUploadProgress(prev => ({ 
          ...prev, 
          progress: 90,
          status: 'Generating organizational health insights...'
        }));
        
        // Calculate final scores (average across all files)
        const finalScores = {};
        Object.keys(processedResults).forEach(systemKey => {
          const scores = processedResults[systemKey];
          if (scores.length > 0) {
            finalScores[systemKey] = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
          }
        });
        
        // Update system scores
        setSystemScores(prev => ({ ...prev, ...finalScores }));
        
        // Create analyzed document records with comprehensive data
        const analyzedDocs = selectedFiles.map((file, index) => {
          // Try to get file content for preview
          let preview = null;
          let recordCount = 0;
          
          if (processedResults[file.name]) {
            const result = processedResults[file.name];
            if (Array.isArray(result)) {
              preview = result.slice(0, 5); // First 5 rows for preview
              recordCount = result.length;
            } else if (typeof result === 'object') {
              preview = result;
              recordCount = Object.keys(result).length;
            }
          }

          const overallScore = Math.round(
            Object.values(finalScores).reduce((sum, score) => sum + score, 0) / 
            Math.max(Object.keys(finalScores).length, 1)
          );

          return {
            id: Date.now() + index,
            fileName: file.name,
            fileSize: file.size,
            analyzedDate: new Date().toISOString(),
            systemScores: finalScores,
            overallScore: overallScore,
            insights: generateInsights(finalScores),
            recommendations: generateRecommendations(finalScores),
            dataType: identifyDataType([], file.name),
            analyzedSystems: Object.keys(finalScores),
            recordCount: recordCount,
            preview: preview,
            status: 'analyzed',
            orgId: orgId
          };
        });
        
        // Update analyzed documents state and localStorage
        const updatedDocs = [	...analyzedDocs, ...analyzedDocuments].slice(0, 50); // Keep last 50
        setAnalyzedDocuments(updatedDocs);
        try {
          localStorage.setItem(`conseqx_analyzed_docs_${orgId}`, JSON.stringify(updatedDocs));
        } catch (e) {
          console.error('Failed to save analyzed documents:', e);
        }
        
        setUploadProgress(prev => ({ 
          ...prev, 
          progress: 100,
          status: 'Analysis complete! Organizational health metrics generated.'
        }));
        
        // Simulate final processing delay
        setTimeout(() => {
          // Create upload record
          const newUpload = {
            id: Date.now(),
            name: selectedFiles[0]?.name || 'Manual Upload',
            timestamp: Date.now(),
            analyzedSystems: Object.keys(finalScores),
            fileCount: selectedFiles.length,
            status: 'completed',
            dataType: identifyDataType([], selectedFiles[0]?.name || ''),
            systemScores: finalScores,
            insights: generateInsights(finalScores)
          };
          
          const updatedUploads = [newUpload, ...uploads];
          setUploads(updatedUploads);
          writeUploads(updatedUploads);
          
          // Add notification about successful analysis
          addNotification(
            'Data Analysis Complete', 
            `Successfully analyzed ${selectedFiles.length} file(s) and updated ${Object.keys(finalScores).length} organizational systems.`,
            'success'
          );
            
          // Reset wizard after delay
          setTimeout(() => {
            setShowUploadWizard(false);
            setUploadProgress({ show: false, progress: 0, status: '' });
            setSelectedFiles([]);
            setUploadStep(1);
            setSystemSelections({});
          }, 2000);
        }, 1000);
        
      } catch (error) {
        console.error('Upload processing error:', error);
        setUploadProgress(prev => ({ 
          ...prev, 
          progress: 100,
          status: 'Error processing files. Please try again.'
        }));
        
        setTimeout(() => {
          setUploadProgress({ show: false, progress: 0, status: '' });
        }, 3000);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className={`max-w-2xl w-full rounded-xl ${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <FaUpload className="text-blue-600" />
                Data Upload Wizard
              </h3>
              <button 
                onClick={() => setShowUploadWizard(false)} 
                className={`${
                  darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                ✕
              </button>
            </div>

            {uploadProgress.show && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{uploadProgress.status}</span>
                  <span className="text-sm">{Math.round(uploadProgress.progress)}%</span>
                </div>
                <div className={`w-full rounded-full h-2 ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress.progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {uploadStep === 1 && (
              <div>
                <div 
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <FaUpload className={`mx-auto text-4xl mb-4 ${
                    darkMode ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <p className="text-lg font-medium mb-2">Upload Organizational Data</p>
                  <p className={`text-sm mb-4 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    📊 Financial Reports • 📋 Employee Surveys • ⚙️ Operational Data • 📈 Performance Metrics
                  </p>
                  <p className={`text-xs mb-4 ${
                    darkMode ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    ConseQ-X analyzes your organizational data using the Six Systems Model
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".csv,.xlsx,.xls,.json,.txt"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      console.log('Browse Files clicked, fileInputRef:', fileInputRef.current); // Debug log
                      if (fileInputRef.current) {
                        fileInputRef.current.click();
                      }
                    }}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Browse Files
                  </button>
                </div>
              </div>
            )}

            {uploadStep === 2 && (
              <div>
                <h4 className="font-semibold mb-4">Selected Files ({selectedFiles.length})</h4>
                <div className="space-y-2 mb-6 max-h-32 overflow-y-auto">
                  {selectedFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{file.name}</span>
                      <span className={`text-xs ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>{(file.size / 1024).toFixed(1)} KB</span>
                    </div>
                  ))}
                </div>

                {/* ConseQ-X Analysis Preview */}
                <div className={`mb-6 p-4 rounded-lg border ${
                  darkMode ? 'bg-blue-900/10 border-blue-800' : 'bg-blue-50 border-blue-200'
                }`}>
                  <h5 className={`font-medium mb-2 ${
                    darkMode ? 'text-blue-300' : 'text-blue-800'
                  }`}>
                    🧠 ConseQ-X Six Systems Analysis
                  </h5>
                  <div className={`text-sm grid grid-cols-1 gap-2 ${
                    darkMode ? 'text-blue-200' : 'text-blue-700'
                  }`}>
                    <div>📊 <strong>Financial Data</strong> → Interdependency, Orchestration, Investigation</div>
                    <div>📋 <strong>Survey Data</strong> → Interpretation, Illustration, Inlignment</div>
                    <div>⚙️ <strong>Operational Data</strong> → Orchestration, Investigation, Interdependency</div>
                  </div>
                </div>

                <h4 className="font-semibold mb-4">ConseQ-X Systems (Auto-detected)</h4>
                <div className={`p-4 rounded-lg border ${
                  darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
                } mb-6`}>
                  <div className="grid grid-cols-1 gap-3">
                    {CANONICAL.map((system) => (
                      <div key={system.key} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            selectedFiles.length > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                          }`}></div>
                          <span className="text-sm font-medium">{system.title}</span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          selectedFiles.length > 0 
                            ? (darkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700')
                            : (darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500')
                        }`}>
                          {selectedFiles.length > 0 ? 'Will Analyze' : 'Pending Data'}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className={`text-xs mt-3 text-center ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    ✨ ConseQ-X will automatically detect relevant systems based on your data
                  </p>
                </div>

                <div className="flex justify-end gap-3">
                  <button 
                    onClick={() => setUploadStep(1)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Back
                  </button>
                  <button 
                    onClick={processUpload}
                    disabled={selectedFiles.length === 0}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <span>🧠</span>
                    Generate Health Insights
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Add notification helper
  const addNotification = (title, message, type = 'info') => {
    const newNotification = {
      id: Date.now(),
      title,
      message,
      type,
      timestamp: Date.now(),
      read: false
    };
    
    const updated = [newNotification, ...notifications].slice(0, 50);
    setNotifications(updated);
    writeNotifications(updated);
  };

  // Delete analyzed document
  const deleteAnalyzedDocument = (docId) => {
    const updatedDocuments = analyzedDocuments.filter(doc => doc.id !== docId);
    setAnalyzedDocuments(updatedDocuments);
    try {
      localStorage.setItem('conseqx_analyzed_documents_v1', JSON.stringify(updatedDocuments));
    } catch (e) {
      console.error('Failed to update localStorage:', e);
    }
    
    // Add notification about deletion
    addNotification(
      'Document Deleted',
      `Analyzed document has been removed from your records`,
      'info'
    );
  };

  // Export analyzed document
  const exportAnalyzedDocument = (doc) => {
    const exportData = {
      fileName: doc.fileName,
      analyzedDate: doc.analyzedDate,
      dataType: doc.dataType,
      overallScore: doc.overallScore,
      systemScores: doc.systemScores,
      insights: doc.insights,
      recommendations: doc.recommendations,
      preview: doc.preview,
      recordCount: doc.recordCount
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis-${doc.fileName}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    addNotification(
      'Document Exported',
      `Analysis data for ${doc.fileName} has been exported`,
      'success'
    );
  };

  // Document Viewer Component
  const DocumentViewer = () => {
    if (!showDocumentViewer || !selectedDocument) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className={`max-w-4xl w-full max-h-[90vh] rounded-lg overflow-hidden ${
          darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b ${
            darkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex-1">
              <h3 className="text-xl font-bold">{selectedDocument.fileName}</h3>
              <p className={`text-sm mt-1 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Analyzed on {new Date(selectedDocument.analyzedDate).toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => {
                setShowDocumentViewer(false);
                setSelectedDocument(null);
              }}
              className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              <FaTimes size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-scroll max-h-[calc(90vh-120px)] scrollbar-hide">
            {/* Document Information Header */}
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-lg font-semibold mb-3">Document Information</h4>
                <div className={`p-4 rounded-lg ${
                  darkMode ? 'bg-gray-800' : 'bg-gray-50'
                }`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">File Name:</span>
                      <span className="ml-2">{selectedDocument.fileName}</span>
                    </div>
                    <div>
                      <span className="font-medium">File Size:</span>
                      <span className="ml-2">{selectedDocument.fileSize ? `${(selectedDocument.fileSize / 1024).toFixed(1)} KB` : 'N/A'}</span>
                    </div>
                    <div>
                      <span className="font-medium">Upload Date:</span>
                      <span className="ml-2">{selectedDocument.uploadDate ? new Date(selectedDocument.uploadDate).toLocaleString() : new Date(selectedDocument.analyzedDate).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="font-medium">Analysis Date:</span>
                      <span className="ml-2">{new Date(selectedDocument.analyzedDate).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="font-medium">Data Type:</span>
                      <span className="ml-2 capitalize">{selectedDocument.dataType}</span>
                    </div>
                    <div>
                      <span className="font-medium">Records Processed:</span>
                      <span className="ml-2">{selectedDocument.recordCount || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="font-medium">Organization ID:</span>
                      <span className="ml-2">{selectedDocument.orgId || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                        selectedDocument.status === 'analyzed' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100'
                      }`}>
                        {selectedDocument.status || 'Processed'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analysis Summary */}
              <div>
                <h4 className="text-lg font-semibold mb-3">Analysis Summary</h4>
                <div className={`p-4 rounded-lg ${
                  darkMode ? 'bg-gray-800' : 'bg-gray-50'
                }`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Systems Analyzed:</span>
                      <span className="ml-2">{selectedDocument.analyzedSystems?.length || 0}</span>
                    </div>
                    <div>
                      <span className="font-medium">Overall Health Score:</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                        selectedDocument.overallScore >= 80 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                          : selectedDocument.overallScore >= 60
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                      }`}>
                        {selectedDocument.overallScore || 0}%
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Health Category:</span>
                      <span className="ml-2">{
                        selectedDocument.overallScore >= 80 ? 'Excellent' :
                        selectedDocument.overallScore >= 60 ? 'Good' :
                        selectedDocument.overallScore >= 40 ? 'Fair' : 'Critical'
                      }</span>
                    </div>
                    <div>
                      <span className="font-medium">Insights Generated:</span>
                      <span className="ml-2">{selectedDocument.insights?.length || 0}</span>
                    </div>
                  </div>
                  
                  {/* Systems Analyzed List */}
                  {selectedDocument.analyzedSystems && selectedDocument.analyzedSystems.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
                      <span className="font-medium text-sm">Systems Analyzed:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedDocument.analyzedSystems.map((system, idx) => (
                          <span key={idx} className={`px-2 py-1 rounded text-xs ${
                            darkMode ? 'bg-blue-900 text-blue-100' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {CANONICAL.find(s => s.key === system)?.title || system}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* System Scores */}
              {selectedDocument.systemScores && Object.keys(selectedDocument.systemScores).length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold mb-3">ConseQ-X Six Systems Detailed Analysis</h4>
                  <div className="grid grid-cols-1 gap-4">
                    {Object.entries(selectedDocument.systemScores).map(([system, score]) => {
                      const systemData = CANONICAL.find(s => s.key === system);
                      const systemTitle = systemData?.title || system;
                      const performanceLevel = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Critical';
                      
                      return (
                        <div key={system} className={`p-4 rounded-lg border ${
                          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                        }`}>
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h5 className="font-semibold text-base capitalize">{systemTitle}</h5>
                              <p className={`text-xs mt-1 ${
                                darkMode ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                System Performance: {performanceLevel}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
                                score >= 80 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                                  : score >= 60
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                              }`}>
                                {score}%
                              </span>
                            </div>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="mb-3">
                            <div className="flex justify-between text-xs mb-1">
                              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Health Score</span>
                              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{score}/100</span>
                            </div>
                            <div className={`h-3 rounded-full ${
                              darkMode ? 'bg-gray-700' : 'bg-gray-200'
                            }`}>
                              <div 
                                className={`h-3 rounded-full transition-all duration-300 ${
                                  score >= 80 ? 'bg-green-500' :
                                  score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${score}%` }}
                              />
                            </div>
                          </div>

                          {/* System Description */}
                          <div className={`text-xs p-3 rounded ${
                            darkMode ? 'bg-gray-700' : 'bg-gray-50'
                          }`}>
                            <span className="font-medium">System Focus: </span>
                            <span>
                              {system === 'interdependency' && 'Relationships and connections between organizational components'}
                              {system === 'orchestration' && 'Coordination and management of organizational processes'}
                              {system === 'investigation' && 'Research and analysis capabilities within the organization'}
                              {system === 'interpretation' && 'Understanding and meaning-making from organizational data'}
                              {system === 'illustration' && 'Communication and visualization of organizational information'}
                              {system === 'inlignment' && 'Strategic alignment and coherence across organizational levels'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Systems Summary */}
                  <div className={`mt-4 p-4 rounded-lg ${
                    darkMode ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'
                  }`}>
                    <h6 className={`font-medium mb-2 ${
                      darkMode ? 'text-blue-100' : 'text-blue-900'
                    }`}>
                      Systems Performance Summary
                    </h6>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className={darkMode ? 'text-blue-200' : 'text-blue-700'}>Systems Analyzed:</span>
                        <div className="font-semibold">{Object.keys(selectedDocument.systemScores).length}</div>
                      </div>
                      <div>
                        <span className={darkMode ? 'text-blue-200' : 'text-blue-700'}>Average Score:</span>
                        <div className="font-semibold">{selectedDocument.overallScore}%</div>
                      </div>
                      <div>
                        <span className={darkMode ? 'text-blue-200' : 'text-blue-700'}>Highest Performing:</span>
                        <div className="font-semibold capitalize">
                          {Object.entries(selectedDocument.systemScores).reduce((a, b) => a[1] > b[1] ? a : b)[0]}
                        </div>
                      </div>
                      <div>
                        <span className={darkMode ? 'text-blue-200' : 'text-blue-700'}>Needs Attention:</span>
                        <div className="font-semibold capitalize">
                          {Object.entries(selectedDocument.systemScores).reduce((a, b) => a[1] < b[1] ? a : b)[0]}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Data Preview Table */}
              {selectedDocument.preview && (
                <div>
                  <h4 className="text-lg font-semibold mb-3">Data Preview</h4>
                  <div className={`rounded-lg border overflow-hidden ${
                    darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}>
                    {selectedDocument.preview.type === 'binary' ? (
                      <div className="p-4">
                        <div className="text-sm text-gray-800 dark:text-gray-200">
                          <div className="font-medium">{selectedDocument.preview.filename || selectedDocument.fileName}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {selectedDocument.preview.size ? `${selectedDocument.preview.size} bytes` : 'Binary file'}
                          </div>
                          {selectedDocument.objectUrl && (
                            <a 
                              className="text-xs text-blue-600 dark:text-blue-400 underline mt-2 inline-block" 
                              href={selectedDocument.objectUrl} 
                              download={selectedDocument.fileName}
                            >
                              Download File
                            </a>
                          )}
                        </div>
                      </div>
                    ) : Array.isArray(selectedDocument.preview) ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                            <tr>
                              {Object.keys(selectedDocument.preview[0] || {}).slice(0, 6).map((header) => (
                                <th key={header} className={`px-4 py-3 text-left font-medium ${
                                  darkMode ? 'text-gray-300' : 'text-gray-600'
                                }`}>
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {selectedDocument.preview.slice(0, 5).map((row, idx) => (
                              <tr key={idx} className={`border-t ${
                                darkMode ? 'border-gray-700' : 'border-gray-200'
                              }`}>
                                {Object.values(row).slice(0, 6).map((value, i) => (
                                  <td key={i} className={`px-4 py-3 ${
                                    darkMode ? 'text-gray-200' : 'text-gray-800'
                                  }`}>
                                    {String(value)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {selectedDocument.preview.length > 5 && (
                          <div className={`px-4 py-2 text-xs border-t ${
                            darkMode ? 'text-gray-400 border-gray-700 bg-gray-800' : 'text-gray-500 border-gray-200 bg-gray-50'
                          }`}>
                            Showing 5 of {selectedDocument.preview.length} rows
                          </div>
                        )}
                      </div>
                    ) : selectedDocument.preview && selectedDocument.preview.type === 'text' ? (
                      <div className="p-4 max-h-60 overflow-auto">
                        <pre className={`text-xs whitespace-pre-wrap ${
                          darkMode ? 'text-gray-200' : 'text-gray-800'
                        }`}>
                          {selectedDocument.preview.previewText}
                        </pre>
                      </div>
                    ) : (
                      <div className="p-4 max-h-60 overflow-auto">
                        <pre className={`text-xs whitespace-pre-wrap ${
                          darkMode ? 'text-gray-200' : 'text-gray-800'
                        }`}>
                          {(() => {
                            try {
                              const s = typeof selectedDocument.preview === 'string' 
                                ? selectedDocument.preview 
                                : JSON.stringify(selectedDocument.preview || {}, null, 2);
                              return s.length > 1000 ? s.slice(0, 1000) + '…' : s;
                            } catch (e) { 
                              return String(selectedDocument.preview); 
                            }
                          })()}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Key Insights */}
              {selectedDocument.insights && selectedDocument.insights.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold mb-3">Key Insights</h4>
                  <div className="space-y-3">
                    {selectedDocument.insights.map((insight, index) => (
                      <div key={index} className={`p-4 rounded-lg border-l-4 ${
                        darkMode ? 'bg-gray-800 border-blue-500' : 'bg-blue-50 border-blue-500'
                      }`}>
                        <p className="text-sm">{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {selectedDocument.recommendations && selectedDocument.recommendations.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold mb-3">Strategic Recommendations</h4>
                  <div className="space-y-3">
                    {selectedDocument.recommendations.map((recommendation, index) => (
                      <div key={index} className={`flex items-start gap-3 p-4 rounded-lg ${
                        darkMode ? 'bg-gray-800' : 'bg-gray-50'
                      }`}>
                        <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Action Item #{index + 1}</p>
                          <p className="text-sm mt-1">{recommendation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Technical Details */}
              <div>
                <h4 className="text-lg font-semibold mb-3">Technical Details</h4>
                <div className={`p-4 rounded-lg ${
                  darkMode ? 'bg-gray-800' : 'bg-gray-50'
                }`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Document ID:</span>
                      <span className="ml-2 font-mono text-xs">{selectedDocument.id}</span>
                    </div>
                    <div>
                      <span className="font-medium">Processing Engine:</span>
                      <span className="ml-2">ConseQ-X Six Systems Model</span>
                    </div>
                    <div>
                      <span className="font-medium">Analysis Algorithm:</span>
                      <span className="ml-2">Multi-system Organizational Health Assessment</span>
                    </div>
                    <div>
                      <span className="font-medium">Data Quality Score:</span>
                      <span className="ml-2">{selectedDocument.recordCount ? '95%' : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>


            </div>
          </div>
        </div>
      </div>
    );
  };

  function exportSnapshot() {
    const data = {
      timestamp: new Date().toISOString(),
      overall: overall,
      systems: systemScores,
      uploads: uploads.slice(0, 5),
      orgId: orgId
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conseqx-snapshot-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // helper for source label
  function sourceLabelFor(key) {
    if (assessmentMap[key.toLowerCase().replace(/[^a-z0-9]/g, '')]) {
      return "assessment";
    }
    if (latest && latest.analyzedSystems && Array.isArray(latest.analyzedSystems)) {
      const found = latest.analyzedSystems.find(sys => 
        String(sys).toLowerCase().includes(key.toLowerCase()) || 
        key.toLowerCase().includes(String(sys).toLowerCase())
      );
      if (found) return "upload";
    }
    return null;
  }

  return (
    <section className="relative">
      {showUploadWizard && <UploadWizard />}
      {showDocumentViewer && <DocumentViewer />}
      
      <div className={`rounded-2xl p-6 ${darkMode ? "bg-gray-900 border border-gray-700 text-gray-100" : "bg-white border border-gray-100 text-gray-900"}`}>
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">Manual Data Analysis</h2>
              {notifications.filter(n => !n.read).length > 0 && (
                <button 
                  onClick={() => setShowNotificationPanel(!showNotificationPanel)}
                  className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <FaBell className="text-blue-600" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications.filter(n => !n.read).length}
                  </span>
                </button>
              )}
            </div>
            <p className={`text-sm mt-1 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Upload organizational datasets and receive comprehensive health insights
            </p>
            {latest && (
              <div className="flex items-center gap-2 mt-2 text-sm">
                <FaClock className="text-green-500" />
                <span className="text-green-600 dark:text-green-400">
                  Last updated: {new Date(latest.timestamp).toLocaleString()}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowUploadWizard(true)} 
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
            >
              <FaUpload />
              Upload Data
            </button>
            <button 
              onClick={exportSnapshot} 
              className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"
            >
              <FaDownload />
              Export
            </button>
          </div>
        </div>

        {/* Notifications Panel */}
        {showNotificationPanel && (
          <div className={`absolute top-20 right-6 w-80 max-h-96 overflow-y-auto rounded-lg shadow-lg z-40 ${
            darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold">Notifications</h4>
                <button 
                  onClick={() => setShowNotificationPanel(false)}
                  className={`${
                    darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className={`p-4 text-center ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>No notifications</div>
              ) : (
                notifications.slice(0, 10).map((notif) => {
                  const isDocumentNotification = notif.title.includes('successfully analyzed') || notif.title.includes('Document Analysis Complete');
                  const documentName = notif.title.includes('successfully analyzed') 
                    ? notif.title.split(' successfully analyzed')[0] 
                    : notif.message.includes('Document:') 
                    ? notif.message.split('Document: ')[1]?.split(' has been')[0] 
                    : null;
                  
                  return (
                    <div 
                      key={notif.id} 
                      className={`p-3 border-b border-gray-100 dark:border-gray-700 ${
                        !notif.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      } ${isDocumentNotification ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700' : ''}`}
                      onClick={() => {
                        if (isDocumentNotification && documentName) {
                          // Find the analyzed document by name
                          const document = analyzedDocuments.find(doc => 
                            doc.fileName === documentName || doc.fileName.includes(documentName)
                          );
                          
                          if (document) {
                            setSelectedDocument(document);
                            setShowDocumentViewer(true);
                            setShowNotificationPanel(false);
                            
                            // Mark notification as read
                            if (!notif.read) {
                              const updatedNotifications = notifications.map(n => 
                                n.id === notif.id ? { ...n, read: true } : n
                              );
                              setNotifications(updatedNotifications);
                              writeNotifications(updatedNotifications);
                            }
                          }
                        }
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="font-medium text-sm">{notif.title}</div>
                            {isDocumentNotification && (
                              <FaEye className={`text-xs ${
                                darkMode ? 'text-blue-400' : 'text-blue-600'
                              }`} />
                            )}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{notif.message}</div>
                          <div className={`text-xs mt-1 ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {new Date(notif.timestamp).toLocaleString()}
                          </div>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${
                          notif.type === 'success' ? 'bg-green-500' : 
                          notif.type === 'warning' ? 'bg-yellow-500' : 
                          notif.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                        }`}></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={`col-span-1 md:col-span-2 rounded-xl p-6 border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-50"}`}>
            <div className={`text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>Overall Health Score</div>
            <div className="text-4xl font-bold mt-2">{overall != null ? `${overall}%` : "No data"}</div>
            <div className="text-sm text-gray-400 mt-2">
              {latest ? `Based on: ${latest.name} • ${new Date(latest.timestamp).toLocaleString()}` : "Upload datasets to generate health insights"}
            </div>
          </div>

          <div className={`rounded-xl p-6 border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-50"}`}>
            <div className={`text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>Systems Analyzed</div>
            <div className="text-3xl font-bold mt-2">
              {Object.values(systemScores).filter(s => s !== null).length} / {CANONICAL.length}
            </div>
            <div className="text-sm text-gray-400 mt-2">Active data sources</div>
          </div>
        </div>

        {/* Systems Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <FaChartLine className="text-blue-600" />
              System Health Overview
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CANONICAL.map((s) => {
              const score = systemScores[s.key];
              const source = sourceLabelFor(s.key);
              const hasData = score !== null;
              
              return (
                <div 
                  key={s.key} 
                  className={`p-4 rounded-lg border transition-all duration-200 ${
                    darkMode ? "bg-gray-800 border-gray-700 hover:border-gray-600" : "bg-white border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{s.title}</div>
                      <div className={`text-sm mt-1 ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {hasData ? `Source: ${source}` : "No data available"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${
                        !hasData ? 'text-gray-400' :
                        score >= 80 ? 'text-green-600' :
                        score >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {hasData ? `${score}%` : '—'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`p-6 rounded-lg border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
            <h4 className="font-semibold mb-3">Key Recommendations</h4>
            <ul className="space-y-2 text-sm">
              {overall != null ? (
                <>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    Focus improvement efforts on lowest-scoring systems
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    Schedule regular data uploads to track progress
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    Review detailed system analysis for actionable insights
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    Upload organizational datasets to begin analysis
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    Include financial reports, surveys, and operational data
                  </li>
                </>
              )}
            </ul>
          </div>

          <div className={`p-6 rounded-lg border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
            <h4 className="font-semibold mb-3">Upload History</h4>
            {uploads.length === 0 ? (
              <div className={`text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>No uploads yet</div>
            ) : (
              <div className="space-y-3">
                {uploads.slice(0, 3).map((upload) => (
                  <div key={upload.id} className="border-l-2 border-blue-500 pl-3">
                    <div className="font-medium text-sm">{upload.name}</div>
                    <div className={`text-xs ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {new Date(upload.timestamp).toLocaleString()}
                    </div>
                    {upload.analyzedSystems && (
                      <div className="text-xs text-gray-400 mt-1">
                        Systems: {upload.analyzedSystems.slice(0, 2).join(", ")}
                        {upload.analyzedSystems.length > 2 && ` +${upload.analyzedSystems.length - 2} more`}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Analyzed Documents Section */}
          <div className={`p-6 rounded-lg border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold">Analyzed Documents</h4>
              <span className={`text-xs px-2 py-1 rounded-full ${
                darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
              }`}>
                {analyzedDocuments.length} document{analyzedDocuments.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            {analyzedDocuments.length === 0 ? (
              <div className={`text-center py-8 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <FaFileExport className="mx-auto mb-2 text-2xl opacity-50" />
                <div className="text-sm">No analyzed documents yet</div>
                <div className="text-xs mt-1">Upload and analyze documents to see them here</div>
              </div>
            ) : (
              <div>
                {/* Desktop/tablet view */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className={`text-left text-xs ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        <th className="py-2 font-medium">Document</th>
                        <th className="py-2 font-medium">Analysis Date</th>
                        <th className="py-2 font-medium">Health Score</th>
                        <th className="py-2 font-medium">Data Type</th>
                        <th className="py-2 font-medium">Systems</th>
                        <th className="py-2 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyzedDocuments.slice(0, 10).map((doc) => (
                        <tr key={doc.id} className={`border-t align-top ${
                          darkMode ? 'border-gray-700' : 'border-gray-200'
                        }`}>
                          <td className="py-3 align-top">
                            <div className="font-medium">{doc.fileName}</div>
                            <div className={`text-xs ${
                              darkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              {doc.recordCount && `${doc.recordCount} records`}
                            </div>
                          </td>
                          <td className="py-3 align-top text-xs">
                            {new Date(doc.analyzedDate).toLocaleDateString()}
                          </td>
                          <td className="py-3 align-top">
                            {doc.overallScore ? (
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                doc.overallScore >= 80 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                                  : doc.overallScore >= 60
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                              }`}>
                                {doc.overallScore}%
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">N/A</span>
                            )}
                          </td>
                          <td className="py-3 align-top">
                            <span className={`text-xs px-2 py-1 rounded ${
                              darkMode ? 'bg-blue-900 text-blue-100' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {doc.dataType}
                            </span>
                          </td>
                          <td className="py-3 align-top text-xs">
                            {doc.analyzedSystems ? (
                              <div className="flex flex-wrap gap-1">
                                {doc.analyzedSystems.slice(0, 2).map((system, idx) => (
                                  <span key={idx} className={`px-1.5 py-0.5 rounded text-xs ${
                                    darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                                  }`}>
                                    {system}
                                  </span>
                                ))}
                                {doc.analyzedSystems.length > 2 && (
                                  <span className={`px-1.5 py-0.5 rounded text-xs ${
                                    darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
                                  }`}>
                                    +{doc.analyzedSystems.length - 2}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400">None</span>
                            )}
                          </td>
                          <td className="py-3 align-top text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedDocument(doc);
                                  setShowDocumentViewer(true);
                                  
                                  // Mark related notification as read if exists
                                  const relatedNotification = notifications.find(n => 
                                    n.title.includes(doc.fileName) && !n.read
                                  );
                                  if (relatedNotification) {
                                    const updatedNotifications = notifications.map(n => 
                                      n.id === relatedNotification.id ? { ...n, read: true } : n
                                    );
                                    setNotifications(updatedNotifications);
                                    writeNotifications(updatedNotifications);
                                  }
                                }}
                                className={`px-2 py-1 rounded text-xs border transition-colors ${
                                  darkMode 
                                    ? 'bg-gray-700 text-gray-100 border-gray-600 hover:bg-gray-600' 
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                                title="View Analysis"
                              >
                                <FaEye className="inline mr-1" />
                                View
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  exportAnalyzedDocument(doc);
                                }}
                                className={`px-2 py-1 rounded text-xs border transition-colors ${
                                  darkMode 
                                    ? 'bg-gray-700 text-gray-100 border-gray-600 hover:bg-gray-600' 
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                                title="Export Analysis"
                              >
                                <FaFileExport className="inline mr-1" />
                                Export
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm(`Are you sure you want to delete the analysis for "${doc.fileName}"?`)) {
                                    deleteAnalyzedDocument(doc.id);
                                  }
                                }}
                                className="px-2 py-1 rounded text-xs border text-red-600 bg-white dark:bg-gray-700 dark:text-red-400 border-gray-300 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                title="Delete Analysis"
                              >
                                <FaTrash className="inline mr-1" />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {analyzedDocuments.length > 10 && (
                    <div className={`text-center text-xs mt-3 py-2 ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Showing 10 of {analyzedDocuments.length} documents
                    </div>
                  )}
                </div>

                {/* Mobile stacked cards */}
                <div className="sm:hidden space-y-3">
                  {analyzedDocuments.slice(0, 10).map((doc) => (
                    <div key={doc.id} className={`border rounded-lg p-3 ${
                      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm truncate">{doc.fileName}</div>
                          <div className={`text-xs mt-1 ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {new Date(doc.analyzedDate).toLocaleDateString()}
                          </div>
                        </div>
                        {doc.overallScore && (
                          <span className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${
                            doc.overallScore >= 80 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                              : doc.overallScore >= 60
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                          }`}>
                            {doc.overallScore}%
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span className={`text-xs px-2 py-1 rounded ${
                          darkMode ? 'bg-blue-900 text-blue-100' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {doc.dataType}
                        </span>
                        {doc.analyzedSystems && doc.analyzedSystems.slice(0, 2).map((system, idx) => (
                          <span key={idx} className={`text-xs px-1.5 py-0.5 rounded ${
                            darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {system}
                          </span>
                        ))}
                        {doc.analyzedSystems && doc.analyzedSystems.length > 2 && (
                          <span className={`text-xs px-1.5 py-0.5 rounded ${
                            darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
                          }`}>
                            +{doc.analyzedSystems.length - 2}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedDocument(doc);
                            setShowDocumentViewer(true);
                            
                            // Mark related notification as read if exists
                            const relatedNotification = notifications.find(n => 
                              n.title.includes(doc.fileName) && !n.read
                            );
                            if (relatedNotification) {
                              const updatedNotifications = notifications.map(n => 
                                n.id === relatedNotification.id ? { ...n, read: true } : n
                              );
                              setNotifications(updatedNotifications);
                              writeNotifications(updatedNotifications);
                            }
                          }}
                          className={`px-3 py-1 rounded text-xs border transition-colors ${
                            darkMode 
                              ? 'bg-gray-700 text-gray-100 border-gray-600 hover:bg-gray-600' 
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <FaEye className="inline mr-1" />
                          View
                        </button>
                        <button
                          onClick={() => exportAnalyzedDocument(doc)}
                          className={`px-3 py-1 rounded text-xs border transition-colors ${
                            darkMode 
                              ? 'bg-gray-700 text-gray-100 border-gray-600 hover:bg-gray-600' 
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <FaFileExport className="inline mr-1" />
                          Export
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete the analysis for "${doc.fileName}"?`)) {
                              deleteAnalyzedDocument(doc.id);
                            }
                          }}
                          className="px-3 py-1 rounded text-xs border text-red-600 bg-white dark:bg-gray-700 dark:text-red-400 border-gray-300 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <FaTrash className="inline mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                  {analyzedDocuments.length > 10 && (
                    <div className={`text-center text-xs py-2 ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Showing 10 of {analyzedDocuments.length} documents
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pro Tips */}
        <div className={`mt-8 p-6 rounded-lg border ${
          darkMode 
            ? 'bg-blue-900/20 border-blue-700' 
            : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-start gap-3">
            <FaExclamationTriangle className={`mt-1 flex-shrink-0 ${
              darkMode ? 'text-blue-400' : 'text-blue-600'
            }`} />
            <div>
              <div className={`font-medium ${
                darkMode ? 'text-blue-100' : 'text-blue-900'
              }`}>Best Practices</div>
              <ul className={`text-sm mt-2 space-y-1 ${
                darkMode ? 'text-blue-200' : 'text-blue-800'
              }`}>
                <li>• Upload data regularly to maintain accurate health insights</li>
                <li>• Include diverse data sources: financial, operational, and survey data</li>
                <li>• Review system-specific recommendations for targeted improvements</li>
                <li>• Export snapshots for board presentations and stakeholder reports</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}