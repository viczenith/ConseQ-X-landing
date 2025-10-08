# ConseQ-X Dashboard Features Guide

## AI Analysis Button

### Purpose
The **AI Analysis** button provides McKinsey-level organizational health insights by analyzing your uploaded data through an advanced AI engine. It serves as your "organizational doctor" providing:

- **Executive Summary**: High-level health assessment with key findings
- **Critical Insights**: Identification of systems requiring immediate attention  
- **Strategic Recommendations**: Specific, actionable improvement suggestions
- **Next Steps**: Concrete action items with timeline recommendations

### How It Works
1. **Data Collection**: Analyzes organizational data from uploads and assessments
2. **AI Processing**: Uses GPT-4 Turbo with organizational consulting expertise
3. **Report Generation**: Creates structured analysis report with insights
4. **Action Planning**: Provides specific recommendations and next steps

### Using the Feature
1. Click **AI Analysis** button in the dashboard sidebar
2. Wait for AI processing (2-3 seconds for analysis generation)
3. Review the comprehensive organizational health report
4. Use action buttons to:
   - Regenerate analysis with fresh insights
   - Export report for stakeholders
   - Schedule follow-up assessments

### Sample Output
```
Executive Summary: Your organization shows moderate health at 63%. 
Priority focus needed on investigation, interpretation systems.

Critical Insights:
• Investigation: Score of 45% suggests immediate attention needed
• Interpretation: Score of 52% suggests immediate attention needed

Strategic Recommendations:
• Implement weekly check-ins for underperforming systems
• Establish clear ownership and accountability metrics
• Consider cross-functional collaboration initiatives
```

---

## Connection Status Indicator

### Purpose
The **Connection Status** shows real-time data connectivity for live organizational monitoring. It indicates whether the dashboard can receive:

- Live system performance updates
- Real-time organizational health metrics
- Instant alerts for critical issues
- Continuous monitoring capabilities

### Status Types

#### 🟢 **Connected (Live)**
- **Meaning**: Real-time WebSocket connection active
- **Capabilities**: 
  - Live system updates every 5-10 seconds
  - Real-time organizational health monitoring
  - Instant alerts and notifications
  - Continuous data synchronization

#### 🔴 **Offline**
- **Meaning**: WebSocket connection failed or unavailable
- **Impact**:
  - No live updates
  - Using cached/historical data only
  - Real-time monitoring unavailable
  - Manual refresh required for updates

### Enabling Live Connection

#### Prerequisites
- Node.js installed on your system
- Access to localhost ports 4001-4002

#### Steps to Enable
1. **Open Terminal/Command Prompt**
2. **Navigate to project directory**:
   ```bash
   cd "path/to/ceo-assessment-app"
   ```

3. **Start Mock WebSocket Server**:
   ```bash
   node server/mockWsServer.js
   ```
   You should see: `Mock WS Server listening on ws://localhost:4002`

4. **Start Mock API Server** (optional, for enhanced features):
   ```bash
   node server/mockApi.js
   ```
   You should see: `Mock API listening on http://localhost:4001`

5. **Refresh Dashboard**: The connection indicator should change to "Connected"

#### Troubleshooting
- **Port Already in Use**: Try closing other applications using ports 4001-4002
- **Permission Issues**: Run terminal as administrator on Windows
- **Connection Still Failing**: Check firewall settings for localhost connections

### Live Data Features (When Connected)
- **Real-time System Scores**: Live updates of all 6 organizational systems
- **Performance Trends**: Continuous tracking of organizational health changes
- **Alert System**: Immediate notifications when systems drop below thresholds
- **Live Dashboard**: All charts and metrics update automatically
- **WebSocket Events**: Custom events for real-time organizational updates

---

## Integration with Organizational Framework

### Six Systems Monitoring
Both features integrate with ConseQ-X's core framework:

1. **Interdependency** 🔗 - Network analysis and collaboration metrics
2. **Iteration** 🔄 - Adaptive capacity and improvement cycles  
3. **Investigation** 🔍 - Analytical depth and root-cause analysis
4. **Integration** 🎯 - System alignment and coordination
5. **Implementation** ⚡ - Execution effectiveness and delivery
6. **Interpretation** 📊 - Insight generation and decision-making

### Executive-Level Value
- **AI Analysis**: Provides C-suite strategic insights beyond traditional BI tools
- **Live Connection**: Enables real-time organizational pulse monitoring
- **Combined Power**: Strategic AI insights + real-time operational awareness

### Best Practices
1. **Regular AI Analysis**: Run weekly analysis to track organizational health trends
2. **Keep Connection Live**: Enable real-time monitoring for proactive management
3. **Action on Insights**: Use AI recommendations as strategic planning input
4. **Monitor Trends**: Use live data to validate improvement initiatives
5. **Executive Reporting**: Export AI analysis for board and stakeholder updates

---

## Technical Architecture

### AI Analysis Pipeline
```
Organizational Data → AI Prompt → GPT-4 Turbo → Structured Analysis → Executive Report
```

### Live Connection Architecture  
```
React Dashboard ← WebSocket ← Mock Server ← Organizational Systems
```

### Data Flow
1. **Upload**: Manual data uploads through Data Management tab
2. **Process**: AI analysis of organizational health patterns
3. **Monitor**: Real-time tracking of system performance
4. **Alert**: Automated notifications for critical issues
5. **Report**: Executive summaries and strategic recommendations