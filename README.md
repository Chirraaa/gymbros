# GymBros

A progressive web app for tracking gym progress with your friends. Live at [gymbrostrack.vercel.app](https://gymbrostrack.vercel.app).

## Features

- Workout logging with sets, reps, and weight tracking
- Automatic BMI calculation and progress charts
- XP system with levels and ranks
- Weekly leaderboard among friends (GymWars)
- Hype reactions on friend workouts
- Friend requests and social feed
- Installable as a PWA on mobile

## Stack

- **Framework** — Next.js 16 (App Router)
- **Auth** — Clerk
- **Database** — Neon (PostgreSQL) + Prisma
- **UI** — Shadcn UI + Tailwind CSS
- **Charts** — Recharts
- **Hosting** — Vercel

## Getting Started

```bash
git clone https://github.com/yourusername/gymbros
cd gymbros
npm install
```

Copy `.env.local.example` to `.env.local` and fill in your keys:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=
DATABASE_URL=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

```bash
npx prisma db push
npm run dev
```

## Environment Setup

You will need accounts on:
- [Clerk](https://clerk.com) for authentication
- [Neon](https://neon.tech) for the database
- [Vercel](https://vercel.com) for deployment

Set up a Clerk webhook pointing to `/api/webhooks/clerk` with `user.created` and `user.updated` events enabled.

## Self Hosting

This project is fully self-hostable. All services used have free tiers sufficient for personal use.

## Support

If you find this useful, you can support the project here: [Buy me a coffee](https://buymeacoffee.com/yourname)

## License

MIT