Mock server for local development

Usage:

- Start the processor:

  node mockJobProcessor.js

- To enqueue a job, add a JSON object to `server/data/jobQueue.json`. Example job shape:

  {
    "id": "job_1",
    "orgId": "org_123",
    "orgEmail": "dev@example.com",
    "fileName": "financials.csv",
    "name": "Financials Upload",
    "system": "finance"
  }

The processor will pick up jobs, simulate processing, write results to `processedJobs.json`, and queue a notification in `data/outbox.json`.
