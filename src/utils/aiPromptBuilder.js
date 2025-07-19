export const generateAIRequestBody = (selectedSystems, scores, userInfo) => {
  const systemAnalysisRequests = selectedSystems.map(system => {
    const systemScores = scores[system.id];
    return {
      systemId: system.id,
      systemName: system.title,
      description: system.description,
      subAssessments: system.subAssessments.map(sub => ({
        id: sub.id,
        title: sub.title,
        score: systemScores.subScores[sub.id]?.score || 0,
        maxScore: systemScores.subScores[sub.id]?.maxScore || 0,
        rating: systemScores.subScores[sub.id]?.rating || 'N/A',
        interpretation: systemScores.subScores[sub.id]?.interpretation || ''
      })),
      overallScore: systemScores.overallScore,
      overallRating: systemScores.overallRating
    };
  });

  return {
    userContext: {
      organization: userInfo.organization,
      industry: userInfo.industry || 'Not specified',
      role: userInfo.role,
      email: userInfo.email
    },
    systems: systemAnalysisRequests,
    analysisParameters: {
      depth: 'comprehensive',
      includeExamples: true,
      includeRecommendations: true,
      format: 'html'
    }
  };
};

export const getAIPrompt = (requestData) => {
  const intro = `You are a McKinsey-level senior organizational consultant analyzing assessment results. 
  Provide a comprehensive analysis of the organization's systems health based on these scores.`;
  
  const context = `Organization: ${requestData.userContext.organization}
  Industry: ${requestData.userContext.industry}
  Role: ${requestData.userContext.role}`;
  
  const analysisInstructions = `For each system:
  1. Explain what the score means in practical terms
  2. Analyze impact on critical organizational components (revenue, turnover, workflow, etc.)
  3. Provide real-world examples of potential effects
  4. Suggest immediate amelioration steps
  5. Outline long-term improvement strategies
  6. Relate to system archetypes without naming them explicitly
  
  Structure the analysis with:
  - Executive summary of organizational health
  - Detailed system-by-system analysis
  - Cross-system synergy/dysfunction analysis
  - Priority recommendations
  - Proposed consulting engagement outline`;
  
  const systemsPrompt = requestData.systems.map(system => {
    return `System: ${system.systemName} (Score: ${system.overallScore}/${system.overallRating})
    ${system.description}
    
    Sub-assessments:
    ${system.subAssessments.map(sub => 
      `- ${sub.title}: ${sub.score}/${sub.maxScore} (${sub.rating})`
    ).join('\n')}`;
  }).join('\n\n');
  
  return `${intro}\n\n### Context:\n${context}\n\n### Analysis Instructions:\n${analysisInstructions}\n\n### Assessment Results:\n${systemsPrompt}`;
};