# Nova Task Manager — Separated Frontend and Backend

This project has been separated properly into two independent folders:

```text
nova-task-manager-separated
├── frontend   # React + Vite website
└── backend    # Node + Express + SQLite API
```

## Start the backend

Open Terminal 1:

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

Backend runs on: `http://localhost:5000`

Test it here: `http://localhost:5000/api/health`

## Start the frontend

Open Terminal 2:

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Frontend runs on: `http://localhost:5173`

## frontend/.env

```env
VITE_API_URL=http://localhost:5000/api
```

## backend/.env

```env
PORT=5000
FRONTEND_URL=http://localhost:5173
JWT_SECRET=replace-this-with-a-long-random-secret
SQLITE_PATH=./database.sqlite
```

## Deploy frontend on Vercel

Use the `frontend` folder as the project folder.

Set this Vercel environment variable:

```env
VITE_API_URL=https://your-backend-url.onrender.com/api
```

## Deploy backend on Render

Use the `backend` folder as the project folder.

Build command:

```bash
npm install
```

Start command:

```bash
npm start
```

Set this Render environment variable:

```env
FRONTEND_URL=https://your-frontend-url.vercel.app
```

The backend creates the SQLite database automatically.
