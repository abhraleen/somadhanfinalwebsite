<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1N9uszUx1xy4O6bRqxjdxKDeb8r4wBCiK

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Environment Variables (Database later)

This project uses Vite. Any env variable must start with `VITE_` to be exposed to the client via `import.meta.env`.

- `VITE_SUPABASE_URL`: Supabase Project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anon public key

Setup:

1. Copy [.env.example](.env.example) to `.env.local`
2. Fill your values
3. Restart `npm run dev`

Note: Database writes are currently disabled and the app uses localStorage via [hooks/useEnquiries.ts](hooks/useEnquiries.ts) until you provide keys and enable integration.
