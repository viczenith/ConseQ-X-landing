import { systems } from '../data/systems';

// export const generateAIPrompt = (scores, userInfo) => {
//   let prompt = `Act as a McKinsey-level organizational consultant. Analyze these assessment results for ${userInfo.organization}:\n\n`;
  
//   // Add scores and interpretations
//   Object.entries(scores).forEach(([systemId, systemScore]) => {
//     const system = systems.find(s => s.id === systemId);
//     prompt += `## ${system.title} System\n`;
//     prompt += `Score: ${systemScore.systemScore}/${systemScore.maxSystemScore}\n`;
//     prompt += `Interpretation: ${systemScore.interpretation}\n\n`;
    
//     // Add sub-assessment details
//     Object.entries(systemScore.subAssessments).forEach(([subId, subScore]) => {
//       const sub = system.subAssessments.find(s => s.id === subId);
//       prompt += `### ${sub.title}\n`;
//       prompt += `Score: ${subScore.score}/${subScore.maxScore}\n`;
//       prompt += `Rating: ${subScore.interpretation.rating}\n`;
//       prompt += `Analysis: ${subScore.interpretation.interpretation}\n\n`;
//     });
//   });
  
//   // Add comprehensive analysis instructions
//   prompt += `\n\nProvide a comprehensive analysis covering:
// 1. Impact on critical organizational components (revenue, turnover, workflow, culture)
// 2. Practical examples of how scores manifest in real operations
// 3. Specific improvement strategies for each system
// 4. Connection between system scores and organizational performance
// 5. Step-by-step action plan prioritizing quick wins and long-term solutions
  
// Format your response:
// - Use clear, consultant-grade language with practical examples
// - Include both positive and negative implications
// - Provide measurable recommendations
// - Highlight interdependencies between systems
// - Conclude with overall organizational health assessment`;
  
//   return prompt;
// };

// // Mock API call (replace with real API integration)
// export const generateAIAnalysis = async (scores) => {
//   // In a real implementation, you would call an AI API here
//   // For demo purposes, return a mock response
//   return new Promise(resolve => {
//     setTimeout(() => {
//       resolve(`Based on your assessment results, ${userInfo.organization} demonstrates strong alignment in vision and strategy but shows opportunities for improvement in operational execution. 

// Your System of Inlignment scored 82/100, indicating clear strategic direction. However, the System of Orchestration scored 65/100, suggesting process inefficiencies are creating bottlenecks.

// Key impacts:
// - Revenue: Potential 15-20% increase with improved processes
// - Employee morale: High alignment scores correlate with strong engagement
// - Innovation: Moderate scores indicate opportunities for improvement

// Recommendations:
// 1. Implement cross-functional workshops to streamline workflows
// 2. Establish monthly innovation sessions with dedicated resources
// 3. Develop key performance indicators for process efficiency

// Overall organizational health: Good foundation with significant upside potential. Focus on operational excellence to unlock full potential.`);
//     }, 2000);
//   });
// };



export const generateAIPrompt = (scores, userInfo) => {
  let prompt = `Act as a McKinsey-level organizational consultant. Analyze these assessment results for ${userInfo.organization}:\n\n`;
  
  // Add scores and interpretations
  Object.entries(scores).forEach(([systemId, systemScore]) => {
    const system = systems.find(s => s.id === systemId);
    prompt += `## ${system.title} System\n`;
    prompt += `Score: ${systemScore.systemScore}/${systemScore.maxSystemScore}\n`;
    prompt += `Interpretation: ${systemScore.interpretation}\n\n`;
    
    // Add sub-assessment details
    Object.entries(systemScore.subAssessments).forEach(([subId, subScore]) => {
      const sub = system.subAssessments.find(s => s.id === subId);
      prompt += `### ${sub.title}\n`;
      prompt += `Score: ${subScore.score}/${subScore.maxScore}\n`;
      prompt += `Rating: ${subScore.interpretation.rating}\n`;
      prompt += `Analysis: ${subScore.interpretation.interpretation}\n\n`;
    });
  });
  
  // Add comprehensive analysis instructions
  prompt += `\n\nProvide a comprehensive analysis covering:
1. Impact on critical organizational components (revenue, turnover, workflow, culture)
2. Practical examples of how scores manifest in real operations
3. Specific improvement strategies for each system
4. Connection between system scores and organizational performance
5. Step-by-step action plan prioritizing quick wins and long-term solutions
  
Format your response:
- Use clear, consultant-grade language with practical examples
- Include both positive and negative implications
- Provide measurable recommendations
- Highlight interdependencies between systems
- Conclude with overall organizational health assessment`;

  return prompt;
};

// Now accepts both scores and userInfo
export const generateAIAnalysis = async (scores, userInfo) => {
  // In a real implementation, you would call an AI API here.
  // For demo purposes, return a mock response:
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(`Based on your assessment results, ${userInfo.organization} demonstrates strong alignment in vision and strategy but shows opportunities for improvement in operational execution. 

Your System of Alignment scored 82/100, indicating clear strategic direction. However, the System of Orchestration scored 65/100, suggesting process inefficiencies are creating bottlenecks.

Key impacts:
- Revenue: Potential 15-20% increase with improved processes
- Employee morale: High alignment scores correlate with strong engagement
- Innovation: Moderate scores indicate opportunities for improvement

Recommendations:
1. Implement cross-functional workshops to streamline workflows
2. Establish monthly innovation sessions with dedicated resources
3. Develop key performance indicators for process efficiency

Overall organizational health: Good foundation with significant upside potential. Focus on operational excellence to unlock full potential.`);
    }, 2000);
  });
};
