# CEO Assessment App Backend

## Quick Deploy to Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/your-template)

## Setup Instructions

1. **Clone and prepare:**
   ```bash
   git clone https://github.com/viczenith/ConseQ-X-landing.git
   cd ConseQ-X-landing
   ```

2. **Install dependencies:**
   ```bash
   npm install express cors dotenv openai
   ```

3. **Deploy to Railway:**
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub account
   - Deploy from this repo
   - Add environment variables in Railway dashboard

4. **Environment Variables to add in Railway:**
   ```
   OPENAI_API_KEY=your_new_openai_key
   HF_TOKEN=your_new_huggingface_token
   PORT=3000
   ```

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/generate-predictions` - OpenAI predictions
- `POST /api/huggingface-chat` - Hugging Face chat

## Local Development

```bash
npm run dev:server
```