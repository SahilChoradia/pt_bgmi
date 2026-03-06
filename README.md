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
- 🔐 **Authentication with role-based access control**
- 👤 **User management with Admin panel**
- 📺 **Streamer mode for live broadcasts**

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **TailwindCSS**
- **MongoDB** (via Mongoose)
- **NextAuth.js** (Authentication)
- **bcryptjs** (Password hashing)
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

3. Set up environment variables. Create a `.env.local` file:
```env
# MongoDB Connection String
MONGODB_URI=your_mongodb_connection_string

# NextAuth.js Configuration
# Generate a secret with: openssl rand -base64 32
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

4. Run the development server:
```bash
npm run dev
```

5. **Create the initial admin user:**
   - Visit `http://localhost:3000/api/seed` in your browser
   - This will create an admin user with:
     - Email: `admin@bgmi.com`
     - Password: `admin123`
   - **Important:** Change the password after first login!

6. Open [http://localhost:3000](http://localhost:3000) and log in.

## Authentication & Roles

### User Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Create/edit/delete tournaments, manage users, assign roles, full access |
| **Editor** | Edit tournament data, add match results, manage teams (assigned tournaments only) |
| **Viewer** | View leaderboard, access streamer mode (read-only) |

### Default Role
New users are created with the `viewer` role by default.

### Pages

| Page | Access |
|------|--------|
| `/login` | Public |
| `/dashboard` | All authenticated users |
| `/admin` | Admin only |
| `/` (Tournament Management) | Admin & Editor |
| `/stream?tournamentId=xxx` | All users (read-only) |

## Deployment to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel:
   - `MONGODB_URI` - Your MongoDB connection string
   - `NEXTAUTH_SECRET` - A secure random string
   - `NEXTAUTH_URL` - Your production URL (e.g., `https://your-app.vercel.app`)
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
│   │   ├── auth/[...nextauth]/  # NextAuth.js handler
│   │   ├── tournaments/
│   │   │   ├── accessible/      # User-accessible tournaments
│   │   │   └── assign/          # Tournament assignment
│   │   ├── teams/
│   │   ├── matches/
│   │   ├── users/               # User management
│   │   │   └── role/            # Role management
│   │   └── seed/                # Initial admin seeding
│   ├── admin/                   # Admin panel
│   ├── dashboard/               # User dashboard
│   ├── login/                   # Login page
│   ├── stream/                  # Streamer mode
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── Header.tsx
│   ├── SessionProvider.tsx      # NextAuth session wrapper
│   ├── TournamentForm.tsx
│   ├── TournamentSelector.tsx
│   ├── AddTeamForm.tsx
│   ├── TeamList.tsx
│   ├── MatchEntry.tsx
│   ├── Leaderboard.tsx
│   ├── MatchHistory.tsx
│   ├── StreamerLeaderboard.tsx
│   └── VerticalStreamerLeaderboard.tsx
├── lib/
│   ├── mongodb.ts
│   └── auth.ts                  # NextAuth configuration
├── models/
│   ├── Tournament.ts            # With createdBy & allowedUsers
│   ├── Team.ts
│   ├── Match.ts
│   └── User.ts                  # User model with roles
├── middleware.ts                # Route protection
├── scripts/
│   └── seed-admin.ts            # Admin seeding script
└── utils/
    ├── points.ts
    └── sorting.ts
```

## API Endpoints

### Authentication
- `POST /api/auth/[...nextauth]` - NextAuth.js handler

### Tournaments
- `GET /api/tournaments` - List all tournaments
- `POST /api/tournaments` - Create tournament (Admin only)
- `DELETE /api/tournaments?tournamentId=xxx` - Delete tournament (Admin only)
- `GET /api/tournaments/accessible` - List user's accessible tournaments
- `PUT /api/tournaments/assign` - Assign/unassign users to tournaments (Admin only)

### Teams
- `GET /api/teams?tournamentId=xxx` - List teams
- `POST /api/teams` - Create team (Admin/Editor)
- `PUT /api/teams` - Update team (Admin/Editor)
- `DELETE /api/teams?teamId=xxx` - Delete team (Admin/Editor)
- `POST /api/teams/reset` - Reset tournament stats (Admin/Editor)

### Matches
- `GET /api/matches?tournamentId=xxx` - List matches
- `POST /api/matches` - Add match results (Admin/Editor)

### Users
- `GET /api/users` - List all users (Admin only)
- `POST /api/users` - Create user (Admin only)
- `DELETE /api/users?userId=xxx` - Delete user (Admin only)
- `PUT /api/users/role` - Change user role (Admin only)

### Utility
- `GET /api/seed` - Create initial admin user (one-time use)

## License

MIT
