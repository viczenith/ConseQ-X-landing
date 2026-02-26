// Six canonical systems with display metadata
export const CANONICAL_SYSTEMS = [
  {
    key: 'interdependency',
    title: 'Interdependency',
    description: 'Cross-functional collaboration and dependency management',
    icon: '🔗',
    color: '#3B82F6', // blue-500
    order: 1
  },
  {
    key: 'orchestration',
    title: 'Orchestration',
    description: 'Development cycles, sprint planning, and continuous improvement',
    icon: '🔄',
    color: '#10B981', // emerald-500
    order: 2
  },
  {
    key: 'investigation',
    title: 'Investigation',
    description: 'Data analysis, research, and discovery processes',
    icon: '🔎',
    color: '#F59E0B', // amber-500
    order: 3
  },
  {
    key: 'interpretation',
    title: 'Interpretation',
    description: 'Insight generation, decision-making, and strategic analysis',
    icon: '💡',
    color: '#8B5CF6', // violet-500
    order: 4
  },
  {
    key: 'illustration',
    title: 'Illustration',
    description: 'Communication, visualization, and knowledge sharing',
    icon: '🔄',
    color: '#EF4444', // red-500
    order: 5
  },
  {
    key: 'inlignment',
    title: 'Inlignment',
    description: 'Strategic coordination, goal setting, and organizational coherence',
    icon: '🎯',
    color: '#06B6D4', // cyan-500
    order: 6
  }
];


export const LEGACY_TO_CANONICAL = {
  // Canonical keys map to themselves
  'interdependency': 'interdependency',
  'orchestration': 'orchestration',
  'investigation': 'investigation',
  'interpretation': 'interpretation',
  'illustration': 'illustration',
  'inlignment': 'inlignment',
  
  // Additional legacy variations that might exist
  'dependency': 'interdependency',
  'dependencies': 'interdependency',
  'analysis': 'investigation',
  'research': 'investigation',
  'insights': 'interpretation',
  'reporting': 'illustration',
  'visualization': 'illustration',
  'coordination': 'inlignment',
  'strategy': 'inlignment'
};

/**
 * Normalize a system key from legacy format to canonical format
 * @param {string} systemKey - Raw system key (possibly legacy)
 * @returns {string} Canonical system key
 */
export function normalizeSystemKey(systemKey) {
  if (!systemKey || typeof systemKey !== 'string') {
    return 'investigation'; // Default fallback
  }
  
  const normalized = systemKey.toLowerCase().trim();
  return LEGACY_TO_CANONICAL[normalized] || normalized;
}

/**
 * Get system metadata by canonical key
 * @param {string} systemKey - Canonical system key
 * @returns {object|null} System metadata or null if not found
 */
export function getSystemMetadata(systemKey) {
  const canonical = normalizeSystemKey(systemKey);
  return CANONICAL_SYSTEMS.find(s => s.key === canonical) || null;
}

/**
 * Get all systems formatted for UI display (sorted by order)
 * @returns {Array} Systems with UI metadata
 */
export function getSystemsForUI() {
  return CANONICAL_SYSTEMS
    .sort((a, b) => a.order - b.order)
    .map(system => ({
      id: system.key,
      key: system.key,
      title: system.title,
      description: system.description,
      icon: system.icon,
      color: system.color
    }));
}

/**
 * Validate if a system key is canonical
 * @param {string} systemKey - System key to validate
 * @returns {boolean} True if canonical, false otherwise
 */
export function isCanonicalSystem(systemKey) {
  return CANONICAL_SYSTEMS.some(s => s.key === systemKey);
}

// Default system weights for org health calculation
// TODO: Make these configurable per organization
export const DEFAULT_SYSTEM_WEIGHTS = {
  'interdependency': 0.18,
  'orchestration': 0.20,
  'investigation': 0.16,
  'interpretation': 0.18,
  'illustration': 0.14,
  'inlignment': 0.14
};

// Ensure weights sum to 1.0
const weightSum = Object.values(DEFAULT_SYSTEM_WEIGHTS).reduce((sum, w) => sum + w, 0);
if (Math.abs(weightSum - 1.0) > 0.001) {
  console.warn(`[systems.js] System weights sum to ${weightSum.toFixed(3)}, should be 1.0`);
}

// Organizational Health Framework Metadata
// This positions our tool as an "organizational doctor" that provides
// automated diagnosis beyond what ERP/BI platforms offer
export const FRAMEWORK_METADATA = {
  name: 'ConseQ-X Organizational Health Assessment',
  version: '1.0',
  description: 'Automated organizational health analysis across six holistic systems',
  differentiators: [
    'Holistic organizational diagnosis beyond operational metrics',
    'Automated analysis and recommendations vs manual BI configuration', 
    'Predictive and prescriptive insights vs descriptive reporting',
    'Cultural and behavioral factors integrated with operational data',
    'Purpose-built for organizational effectiveness vs generic analytics'
  ],
  targetGap: 'Bridges the space between operational ERP/BI data and strategic consulting insights',
  useCases: [
    'Post-merger integration assessment',
    'Organizational transformation tracking',
    'Performance turnaround monitoring',
    'Continuous health monitoring for SMEs',
    'Government agency effectiveness measurement'
  ]
};

// Value proposition vs traditional platforms
export const COMPETITIVE_ADVANTAGES = {
  vsERP: [
    'Analyzes intangible dynamics like culture and collaboration',
    'Provides narrative insights beyond transactional data',
    'Ready-made organizational health model vs complex customization'
  ],
  vsBI: [
    'Purpose-built framework vs empty canvas requiring expertise',
    'Automated interpretation and recommendations vs manual analysis',
    'Integrated organizational model vs piecemeal dashboard building'
  ],
  vsConsulting: [
    'Continuous monitoring vs one-off assessments',
    'Affordable software vs expensive consulting engagements',
    'Real-time insights vs periodic reports'
  ]
};
