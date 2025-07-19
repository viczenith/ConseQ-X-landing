// import React from 'react';
// import { rubrics } from '../rubrics';
// import { FaNetworkWired, FaLink, FaSearch, FaCog, FaImage, FaBookOpen } from 'react-icons/fa';

// const iconMap = {
//   interdependency: <FaNetworkWired />,
//   inlignment:      <FaLink />,
//   investigation:   <FaSearch />,
//   orchestration:   <FaCog />,
//   illustration:    <FaImage />,
//   interpretation:  <FaBookOpen />
// };

// export const systems = rubrics.map(system => ({
//   id:          system.id,
//   title:       system.title,
//   icon:        iconMap[system.id] || null,
//   description: system.description,
//   goal:        system.goal,
//   subAssessments: system.subAssessments.map(sa => ({
//     id:                  sa.id,
//     title:               sa.title,
//     description:         sa.description,
//     questions:           sa.questions,
//     scoringRubric:       sa.scoringRubric,
//     scoreInterpretation: sa.scoreInterpretation
//   })),
  
//   totalScoreInterpretation: system.totalScoreInterpretation
// }));


import React from 'react';
import { rubrics } from '../rubrics';
import { FaNetworkWired, FaLink, FaSearch, FaCog, FaImage, FaBookOpen } from 'react-icons/fa';

const iconMap = {
  interdependency: <FaNetworkWired />,
  inlignment:      <FaLink />,
  investigation:   <FaSearch />,
  orchestration:   <FaCog />,
  illustration:    <FaImage />,
  interpretation:  <FaBookOpen />
};

export const systems = rubrics.map(system => ({
  id:          system.id,
  title:       system.title,
  icon:        iconMap[system.id] || null,
  description: system.description,
  goal:        system.goal,
  subAssessments: system.subAssessments.map(sa => ({
    id:                  sa.id,
    title:               sa.title,
    description:         sa.description,
    questions:           sa.questions,
    scoringRubric:       sa.scoringRubric,
    scoreInterpretation: sa.scoreInterpretation
  })),
  
  totalScoreInterpretation: system.totalScoreInterpretation
}));