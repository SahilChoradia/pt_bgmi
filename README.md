# BGMI Point Table Maker

A production-ready full-stack Next.js 14 application for managing BGMI (Battlegrounds Mobile India) tournaments with live leaderboards and match tracking.

## Features

- 🏆 Multiple tournament support with data isolation
- 👥 Team registration and management
- 🎮 Unlimited match entry with automatic point calculation
- 📊 Live leaderboard with real-time updates
- 📈 Match history tracking
- 📥 CSV export functionality
- 🔄 Tournament reset option
- 🎨 Dark esports-themed UI

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **TailwindCSS**
- **MongoDB** (via Mongoose)
- **React useState** (no complex state management)
- **Lucide Icons**

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB database (local or Atlas)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd bgmi-point-table-maker
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Edit `.env.local` and add your MongoDB connection string:
```
MONGODB_URI=your_mongodb_connection_string
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add `MONGODB_URI` in Vercel Environment Variables
4. Deploy!

The application will be live instantly - no separate backend server required.

## BGMI Scoring System

### Placement Points
- 1st → 10 points
- 2nd → 6 points
- 3rd → 5 points
- 4th → 4 points
- 5th → 3 points
- 6th → 2 points
- 7th → 1 point
- 8th → 1 point
- 9th-16th → 0 points

### Kill Points
- 1 Kill = 1 point

### Total Points
Total Points = Placement Points + Kill Points

### Leaderboard Ranking
1. Higher Total Points
2. Higher Kill Points
3. Higher Placement Points

## Project Structure

```
bgmi-point-table-maker/
├── app/
│   ├── api/
│   │   ├── tournaments/
│   │   ├── teams/
│   │   └── matches/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── Header.tsx
│   ├── TournamentForm.tsx
│   ├── TournamentSelector.tsx
│   ├── AddTeamForm.tsx
│   ├── TeamList.tsx
│   ├── MatchEntry.tsx
│   ├── Leaderboard.tsx
│   └── MatchHistory.tsx
├── lib/
│   └── mongodb.ts
├── models/
│   ├── Tournament.ts
│   ├── Team.ts
│   └── Match.ts
└── utils/
    ├── points.ts
    └── sorting.ts
```

## License

MIT


