CONTEQ-X


src/
├── pages/
│   ├── Assessment.js
│   ├── AssessmentResults.js
│   └── Systems/
│       ├── InterdependencySystem.js
│       ├── SystemOfInlignment.js
│       ├── SystemOfInvestigation.js
│       ├── SystemOfOrchestration.js
│       ├── SystemOfIllustration.js
│       └── SystemOfInterpretation.js
├── components/
│   ├── ResultAnalysis.js
│   ├── ReportGenerator.js
│   └── ReportPDF.js
└── utils/
    └── aiPromptGenerator.js

MODELS
| Model Name          | Model ID for OpenRouter           | Notes                            |
| ------------------- | --------------------------------- | -------------------------------- |
| OpenChat 3.5        | `openchat/openchat-3.5`           | ✅ Free & conversational          |
| Mistral 7B Instruct | `mistralai/mistral-7b-instruct`   | ✅ Free & powerful                |
| Mixtral 8x7B        | `mistralai/mixtral-8x7b-instruct` | ⚠️ May require usage rights      |
| Command R+          | `cohere/command-r-plus`           | ✅ Fast & optimized for reasoning |
                                  
| -------------------- | ----------------------------------- | ------------------------------------------ |
| Mistral 7B Instruct  | `"mistralai/mistral-7b-instruct"`   | Fast, free, and solid for reasoning & chat |
| Command R+           | `"cohere/command-r-plus"`           | Free, general-purpose, long context        |
| Gemini-Pro (Google)  | `"google/gemini-pro"`               | Needs API limits respected                 |
| Claude Instant       | `"anthropic/claude-instant-v1"`     | Fast Claude-style replies                  |
| Llama-3 8B Instruct  | `"meta-llama/llama-3-8b-instruct"`  | Smaller LLaMA3 version                     |
| Llama-3 70B Instruct | `"meta-llama/llama-3-70b-instruct"` | ⚠️ Might be rate-limited or require pro    |
