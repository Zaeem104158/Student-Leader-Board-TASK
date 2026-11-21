# ResultBoard

Student Result & Leaderboard System built with Express, MongoDB/Mongoose, and Next.js.

## Requirements

- Node.js 20.9 or newer
- MongoDB running locally, or a MongoDB connection string

## Configure and run

1. Start MongoDB.
2. Configure the backend environment in `backend/.env`:

   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/student_result_leaderboard
   JWT_SECRET=replace-with-a-long-random-secret
   JWT_EXPIRES_IN=1d
   CLIENT_URL=http://localhost:3000
   ```

3. Install and start the backend:

   ```sh
   cd backend
   npm install
   npm run dev
   ```

   The API is available at `http://localhost:5000/api`; `GET /api/health` checks availability. The server creates model indexes on startup.

4. In another terminal, configure the frontend in `frontend/.env.local` if the API is not at its default address:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

5. Install and start Next.js:

   ```sh
   cd frontend
   npm install
   npm run dev
   ```

   Open `http://localhost:3000`.

## Demo data

With the backend environment configured, run `cd backend && npm run seed`. It creates one administrator, 40 students, six exams, and their demo results. **Seeding clears the existing users, exams, and results in the configured database.** Do not run it against data you need to keep.

- Admin: `admin@school.com` / `admin123`
- Student: `student@school.com` / `student123` (all seeded students use this password)

## Main features

- Admin dashboard with result statistics and top students
- Student search, filtering, pagination, profile/results view, and CRUD
- Exam CRUD with scheduled, completed, and published states
- Individual and batch result entry with percentage, grade, GPA, and pass status
- Student results are visible after the related exam is published
- Overall and per-exam leaderboards, filterable by department

The API requires a bearer JWT for protected routes. Admin-only routes cover student management, result entry, exam changes, and dashboard statistics. Students can view their own published results and published exam leaderboards.

## Project layout

- `backend/src/models`, `controllers`, `routes`: Mongoose models and REST API
- `backend/src/seed/seed.js`: deterministic demo data generator
- `frontend/app`: Next.js App Router pages
- `frontend/lib`: auth context and API client

For each app, run its build with `npm run build` from that app's directory.
