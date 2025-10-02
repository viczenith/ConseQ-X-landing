export const SYSTEMS_DEFS = {
  interpretation: {
    id: "interpretation",
    title: "Interpretation",
    // subAssessments array: unique ids so CEO panel can track each sub-item
    subAssessments: [
      { id: "int-1", title: "Leadership clarity" },
      { id: "int-2", title: "Market understanding" },
      { id: "int-3", title: "Decision feedback" },
    ],
  },

  investigation: {
    id: "investigation",
    title: "Investigation",
    subAssessments: [
      { id: "inv-1", title: "Data availability" },
      { id: "inv-2", title: "Metrics discipline" },
      { id: "inv-3", title: "Root cause processes" },
      { id: "inv-4", title: "Compliance checks" },
    ],
  },

  orchestration: {
    id: "orchestration",
    title: "Orchestration",
    subAssessments: [
      { id: "orc-1", title: "Team handoffs" },
      { id: "orc-2", title: "RACI alignment" },
      { id: "orc-3", title: "Sprint reliability" },
      { id: "orc-4", title: "Cross-team dependencies" },
      { id: "orc-5", title: "Escalation paths" },
    ],
  },

  inlignment: {
    id: "inlignment",
    title: "Inlignment",
    subAssessments: [
      { id: "inl-1", title: "Mission understood" },
      { id: "inl-2", title: "Goal alignment" },
      { id: "inl-3", title: "OKR process" },
    ],
  },

  illustration: {
    id: "illustration",
    title: "Illustration",
    subAssessments: [
      { id: "ill-1", title: "Reports clarity" },
      { id: "ill-2", title: "Visualization quality" },
    ],
  },

  interdependency: {
    id: "interdependency",
    title: "Interdependency",
    subAssessments: [
      { id: "intd-1", title: "Service dependencies" },
      { id: "intd-2", title: "Third-party risk" },
      { id: "intd-3", title: "Shared SLAs" },
    ],
  },
};
