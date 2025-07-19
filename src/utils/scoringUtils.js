// /**
//  * Calculate the total score for a single sub‑assessment based on user answers.
//  * @param {object} subAssessment – the rubric subAssessment object
//  * @param {object} answers – the answers map, e.g. { [subAssessment.id]: { 0: 'Yes', 1: 'No', … } }
//  * @returns {{ score: number, interpretation: { rating:string, interpretation:string } }}
//  */
// export function calculateSubAssessmentScore(subAssessment, answers) {
//   const responseMap = answers[subAssessment.id] || {};
//   // sum each answered question’s score
//   const score = subAssessment.questions.reduce((sum, _, idx) => {
//     const label = responseMap[idx];
//     const rubric = subAssessment.scoringRubric.find(r => r.label === label);
//     return sum + (rubric ? rubric.score : 0);
//   }, 0);

//   const interpretation = getSubAssessmentInterpretation(subAssessment, score);
//   return { score, interpretation };
// }

// /**
//  * Interpretation bucket for a given sub‑assessment score.
//  */
// export function getSubAssessmentInterpretation(subAssessment, score) {
//   const bucket = subAssessment.scoreInterpretation.find(
//     b => score >= b.range[0] && score <= b.range[1]
//   );
//   return bucket || { rating: '', interpretation: '' };
// }


// /**
//  * Calculate the total system score by summing all sub‑assessment scores.
//  * @param {object} system – the full system object from rubrics
//  * @param {object} answers – the answers map for all subAssessments
//  * @returns {{ totalScore: number, interpretation: { rating:string, interpretation:string } }}
//  */
// export function calculateTotalScore(system, answers) {
//   const totalScore = system.subAssessments.reduce((sum, sub) => {
//     const { score } = calculateSubAssessmentScore(sub, answers);
//     return sum + score;
//   }, 0);

//   const interpretation = getSystemInterpretation(system, totalScore);
//   return { totalScore, interpretation };
// }

// /**
//  * totalScoreInterpretation bucket.
//  */
// export function getSystemInterpretation(system, totalScore) {
//   const bucket = (system.totalScoreInterpretation || []).find(
//     b => totalScore >= b.range[0] && totalScore <= b.range[1]
//   );
//   return bucket || { rating: '', interpretation: '' };
// }


/**
 * Calculate the total score for a single sub‑assessment based on user answers.
 * @param {object} subAssessment – the rubric subAssessment object
 * @param {object} answers – the answers map, e.g., { 0: 'Yes', 1: 'No', … } for the subAssessment
 * @returns {{ score: number, interpretation: { rating: string, interpretation: string, recommendations: string[] } }}
 */
export function calculateSubAssessmentScore(subAssessment, answers) {
  const responseMap = answers; // This is the object with question indices as keys and the selected option label as values.
  let score = 0;
  
  // Calculate the score by summing the points for each answer
  subAssessment.questions.forEach((_, index) => {
    const answerLabel = responseMap[index];
    if (answerLabel) {
      const rubricItem = subAssessment.scoringRubric.find(r => r.label === answerLabel);
      if (rubricItem) {
        score += rubricItem.score;
      }
    }
  });
  
  // Find the interpretation for this score
  const interpretation = getSubAssessmentInterpretation(subAssessment, score);
  
  return { score, interpretation };
}

/**
 * Interpretation bucket for a given sub‑assessment score.
 */
export function getSubAssessmentInterpretation(subAssessment, score) {
  const bucket = subAssessment.scoreInterpretation.find(
    b => score >= b.range[0] && score <= b.range[1]
  );
  
  if (bucket) {
    return {
      rating: bucket.rating,
      interpretation: bucket.interpretation,
      recommendations: bucket.recommendations || []
    };
  }
  
  return {
    rating: 'N/A',
    interpretation: 'No interpretation available for this score.',
    recommendations: []
  };
}

/**
 * Calculate the total system score by summing all sub‑assessment scores.
 * @param {object} system – the full system object from rubrics
 * @param {object} answers – the answers map for all subAssessments
 * @returns {{ totalScore: number, interpretation: { rating: string, interpretation: string, recommendations: string[] } }}
 */
export function calculateTotalScore(system, answers) {
  let totalScore = 0;
  system.subAssessments.forEach(sub => {
    const { score } = calculateSubAssessmentScore(sub, answers[sub.id] || {});
    totalScore += score;
  });
  
  const interpretation = getSystemInterpretation(system, totalScore);
  return { totalScore, interpretation };
}

/**
 * totalScoreInterpretation bucket.
 */
export function getSystemInterpretation(system, totalScore) {
  const bucket = (system.totalScoreInterpretation || []).find(
    b => totalScore >= b.range[0] && totalScore <= b.range[1]
  );
  
  if (bucket) {
    return {
      rating: bucket.rating,
      interpretation: bucket.interpretation,
      recommendations: bucket.recommendations || []
    };
  }
  
  return {
    rating: 'N/A',
    interpretation: 'No interpretation available for this score.',
    recommendations: []
  };
}