# StandTrack — Daily Standup Companion

A full-stack web application that helps developers prepare structured daily standup updates by logging tasks, blockers, and questions throughout the day.

## Problem

At the daily standup meeting, developers often:
- Forget what they worked on
- Struggle to remember blockers and questions
- Scramble to organize their thoughts last minute
- Rely on unstructured tools like Notepad

**StandTrack** solves this by providing a clean, organized interface to log your day's work and generate formatted standup summaries with a single click.

## Features

### Core
- **Daily Entry Management** — Create, edit, and delete entries with structured fields: tasks done, next tasks, blockers, questions, and notes
- **Auto-Formatted Standup Summary** — Generate a clean, copy-paste-ready standup update for any date
- **Entry History** — Browse and view all past entries with pagination
- **Authentication** — Secure registration/login with JWT-based auth

### Advanced
- **Dynamic Meeting Time** — Set your default daily meeting time (e.g., 3:30 PM) per user
- **Per-Day Meeting Overrides** — Change the meeting time for a specific day without affecting your default
- **Email Reminders (Cron Jobs)** — Configure up to 3 daily email reminders to log your entry before the meeting
- **Custom Reminder Email** — Send reminders to your account email or a custom email address

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | Next.js (App Router), TypeScript, Tailwind CSS |
| Backend     | Node.js, Express.js                 |
| Database    | MongoDB with Mongoose               |
| Auth        | JWT (JSON Web Tokens), bcrypt       |
| Validation  | Joi                                 |
| Email       | Nodemailer                          |
| Scheduling  | node-cron                           |
| HTTP Client | Axios                               |

## Project Structure

```
StandTrack/
├── backend/
│   ├── src/
│   │   ├── app.js                # Express entry point
│   │   ├── models/               # Mongoose schemas (User, Entry, MeetingOverride)
│   │   ├── controllers/          # Request handlers
│   │   ├── services/             # Business logic + email + cron
│   │   ├── routes/               # API route definitions
│   │   ├── middlewares/          # Auth, validation, error handling
│   │   └── validators/           # Joi validation schemas
│   ├── .env                      # Environment variables
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/                  # Next.js App Router pages
│   │   │   ├── page.tsx          # Landing page
│   │   │   ├── login/            # Login page
│   │   │   ├── register/         # Registration page
│   │   │   ├── dashboard/        # Today's entry + meeting time
│   │   │   ├── history/          # Past entries browser
│   │   │   ├── summary/          # Standup summary generator
│   │   │   └── settings/         # Meeting time + reminder config
│   │   ├── components/           # Reusable UI components
│   │   ├── context/              # React Context (Auth)
│   │   └── lib/                  # API client (Axios)
│   └── package.json
│
└── README.md
```

## API Endpoints

### Authentication
| Method | Endpoint              | Description         |
|--------|-----------------------|---------------------|
| POST   | `/api/auth/register`  | Register a new user |
| POST   | `/api/auth/login`     | Login and get JWT   |
| GET    | `/api/auth/profile`   | Get current user    |

### Entries
| Method | Endpoint                | Description              |
|--------|-------------------------|--------------------------|
| POST   | `/api/entries`          | Create a new entry       |
| GET    | `/api/entries`          | Get all entries (paginated) |
| GET    | `/api/entries/today`    | Get today's entry        |
| GET    | `/api/entries/date/:date` | Get entry by date      |
| GET    | `/api/entries/:id`      | Get entry by ID          |
| PUT    | `/api/entries/:id`      | Update an entry          |
| DELETE | `/api/entries/:id`      | Delete an entry          |

### Settings
| Method | Endpoint                           | Description                       |
|--------|------------------------------------|-----------------------------------|
| GET    | `/api/settings`                    | Get all user settings             |
| PUT    | `/api/settings/meeting-time`       | Update default meeting time       |
| GET    | `/api/settings/meeting-time/:date` | Get meeting time for specific date|
| POST   | `/api/settings/meeting-override`   | Set override for a specific date  |
| GET    | `/api/settings/meeting-overrides`  | List all future overrides         |
| DELETE | `/api/settings/meeting-override/:date` | Remove a date override        |
| PUT    | `/api/settings/reminders`          | Update reminder settings          |

## Running Locally

### Prerequisites
- **Node.js** v18+ 
- **MongoDB** running locally on `mongodb://localhost:27017` (or a cloud URI)
- **npm** (comes with Node.js)

### 1. Clone the repository

```bash
git clone https://github.com/mohamed-ounissi/StandTrack.git
cd StandTrack
```

### 2. Setup the Backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/standtrack
JWT_SECRET=your_secret_key_change_this
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000

# SMTP Configuration (for email reminders)
# Leave SMTP_USER and SMTP_PASS empty to use mock mode (logs to console)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=your_email@gmail.com
```

> **Note:** For Gmail, you need to create an [App Password](https://support.google.com/accounts/answer/185833). Leave `SMTP_USER` and `SMTP_PASS` empty to run in mock mode (reminders are logged to the console instead of sent via email).

Start the backend:

```bash
npm run dev
```

The API will be running at `http://localhost:5000`.

### 3. Setup the Frontend

```bash
cd frontend
npm install
```

Create a `.env.local` file in `frontend/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

The app will be running at `http://localhost:3000`.

### 4. Open the App

Navigate to [http://localhost:3000](http://localhost:3000) in your browser. Register an account and start logging your daily standups!

## Email Reminders Setup

1. Go to **Settings** in the app
2. Set your default meeting time
3. Enable **Email Reminders**
4. Optionally enter a custom email (or it uses your account email)
5. Add up to **3 reminder times** (e.g., 14:00, 15:00, 15:15)
6. The system uses **cron jobs** to check every minute and send reminders at your configured times
7. Reminders are only sent if you **haven't logged your entry** yet for the day

## Live Version

> Coming soon — URL will be added after deployment.

## Future Improvements

- AI-generated standup summaries
- Slack / Microsoft Teams integration
- Calendar view for entries
- Weekly/monthly analytics and statistics
- Team mode (shared standup board)
- Push notifications (browser)
- Dark/light theme toggle


