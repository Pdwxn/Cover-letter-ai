# Auth Transparency

It's an educational web app that shows in real time what personal data any app receives when you log in using an external provider (Google, GitHub, or Discord). After you authenticate, the dashboard breaks down each field received from the OAuth token—name, email, avatar, unique ID, and more—explaining in plain language what a company can do with that information and how sensitive each piece of data is.

## Technology Stack

- Next.js 15 (App Router) — main framework with server and client components
- TypeScript — static typing throughout the application
- Tailwind CSS — utility styles
- Auth.js v5 (NextAuth) — session management and OAuth flow with Google, GitHub, and Discord
- Vercel — deployment and hosting with automatic CI/CD from GitHub
