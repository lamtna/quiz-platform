# 🎮 Quiz Game Platform — Backend API

A production-style REST API for a multiplayer quiz game platform (Jeopardy / Kahoot style).  
Built with **Node.js**, **Express**, and **MongoDB**.

---

## 📁 Project Structure

```
quiz-platform/
├── server.js               # Entry point
├── app.js                  # Express app setup, middleware, routes
├── .env.example            # Environment variable template
├── package.json
└── src/
    ├── config/
    │   ├── db.js           # MongoDB connection
    │   └── constants.js    # App-wide constants
    ├── models/
    │   ├── User.js
    │   ├── Category.js
    │   ├── Question.js
    │   └── Game.js
    ├── controllers/
    │   ├── authController.js
    │   ├── userController.js
    │   ├── categoryController.js
    │   ├── questionController.js
    │   └── gameController.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── userRoutes.js
    │   ├── categoryRoutes.js
    │   ├── questionRoutes.js
    │   └── gameRoutes.js
    ├── middleware/
    │   ├── auth.js         # JWT protect + adminOnly
    │   ├── validate.js     # express-validator error collector
    │   └── errorHandler.js # Global error handler
    └── utils/
        ├── apiResponse.js  # Standardized response helpers
        ├── generateToken.js
        ├── pagination.js
        └── seeder.js       # Sample data seeder
```

---

## ⚙️ Setup Instructions

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

### 3. Seed sample data (optional but recommended)
```bash
npm run seed
# Creates: 1 admin user, 6 categories, 24 questions
# Admin credentials: admin@quiz.com / Admin@1234
```

### 4. Start the server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server runs at: `http://localhost:5000`  
Health check: `http://localhost:5000/health`

---

## 🔐 Authentication

All protected routes require a Bearer token:

```
Authorization: Bearer <your_jwt_token>
```

Tokens are returned on register and login.

---

## 📡 API Reference

### AUTH

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/me` | Private | Get current user |

### USERS

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/users` | Admin | List all users |
| GET | `/api/users/:id` | Admin | Get user by ID |
| PUT | `/api/users/:id/role` | Admin | Update user role |
| POST | `/api/users/:id/restore-free-game` | Admin | Restore free game |
| DELETE | `/api/users/:id` | Admin | Delete user |

### CATEGORIES

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/categories` | Private | List categories |
| GET | `/api/categories/:id` | Private | Get category |
| POST | `/api/categories` | Admin | Create category |
| PUT | `/api/categories/:id` | Admin | Update category |
| DELETE | `/api/categories/:id` | Admin | Delete category |

### QUESTIONS

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/questions` | Admin | List all questions |
| GET | `/api/questions/:id` | Private | Get question |
| POST | `/api/questions` | Admin | Create question |
| POST | `/api/questions/bulk` | Admin | Bulk create |
| PUT | `/api/questions/:id` | Admin | Update question |
| POST | `/api/questions/:id/reset` | Admin | Reset used status |
| DELETE | `/api/questions/:id` | Admin | Delete question |

### GAMES

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/games` | Private | List games (own / all for admin) |
| GET | `/api/games/:id` | Private | Get game state |
| GET | `/api/games/:id/summary` | Private | Final score summary |
| POST | `/api/games` | Private | Create game |
| POST | `/api/games/:id/select-question` | Private | Select a board cell |
| POST | `/api/games/:id/reveal-answer` | Private | Reveal answer + award points |
| POST | `/api/games/:id/finish` | Private | Force-finish game |
| DELETE | `/api/games/:id` | Private | Delete game |

---

## 📋 Example Requests

### Register
```json
POST /api/auth/register
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123"
}
```

### Login
```json
POST /api/auth/login
{
  "email": "jane@example.com",
  "password": "secret123"
}
```

### Create a Category (Admin)
```json
POST /api/categories
Authorization: Bearer <admin_token>
{
  "name": "World History",
  "image": "https://example.com/history.jpg"
}
```

### Create a Question (Admin)
```json
POST /api/questions
Authorization: Bearer <admin_token>
{
  "categoryId": "64abc123...",
  "text": "Who wrote Romeo and Juliet?",
  "answer": "William Shakespeare",
  "difficulty": 200,
  "timer": 30,
  "media": {
    "image": null,
    "audio": null,
    "video": { "url": null, "isReplayable": true }
  },
  "answerMedia": {
    "image": "https://example.com/shakespeare.jpg"
  }
}
```

### Bulk Create Questions (Admin)
```json
POST /api/questions/bulk
Authorization: Bearer <admin_token>
{
  "categoryId": "64abc123...",
  "questions": [
    { "text": "Question 1?", "answer": "A1", "difficulty": 200 },
    { "text": "Question 2?", "answer": "A2", "difficulty": 400 },
    { "text": "Question 3?", "answer": "A3", "difficulty": 600 },
    { "text": "Question 4?", "answer": "A4", "difficulty": 800 }
  ]
}
```

### Create a Game
```json
POST /api/games
Authorization: Bearer <user_token>
{
  "gameName": "Friday Night Quiz",
  "teamAName": "Red Team",
  "teamBName": "Blue Team",
  "categoryIds": [
    "64cat001...",
    "64cat002...",
    "64cat003...",
    "64cat004...",
    "64cat005...",
    "64cat006..."
  ]
}
```

### Select a Question (During Game)
```json
POST /api/games/:gameId/select-question
Authorization: Bearer <user_token>
{
  "categoryId": "64cat001...",
  "difficulty": 400
}
```
**Response includes:** question text, media, timer. Answer is NOT revealed yet.

### Reveal Answer + Award Points
```json
POST /api/games/:gameId/reveal-answer
Authorization: Bearer <user_token>
{
  "teamScored": "teamA"
}
// Or null if no team scored: "teamScored": null
```
**Response includes:** answer text, answer media, updated scores. If board is complete, includes winner.

### Get Game Summary (Final Screen)
```json
GET /api/games/:gameId/summary
Authorization: Bearer <user_token>
```

---

## 🎮 Gameplay Flow

```
1.  User registers    → hasFreeGame = true
2.  User logs in      → gets JWT
3.  User picks 6 categories from /api/categories
4.  POST /api/games   → board built (6×4 = 24 cells), hasFreeGame = false
5.  Game board shown to frontend
6.  Team picks a cell → POST /api/games/:id/select-question
7.  Timer starts on frontend (timer value returned)
8.  Team answers verbally (host judges)
9.  Host clicks "Show Answer" → POST /api/games/:id/reveal-answer
        body: { teamScored: "teamA" | "teamB" | null }
10. Answer + optional media shown
11. Repeat steps 6–10 until all 24 cells answered
12. Game auto-finishes → winner declared
13. GET /api/games/:id/summary → final screen
```

---

## 🏗️ Architecture Notes

- **MVC** — Models, Controllers, Routes are clearly separated
- **Standardized responses** — All endpoints use `apiResponse.js` helpers
- **Global error handler** — Catches Mongoose, JWT, and custom errors centrally
- **Input validation** — `express-validator` on all write endpoints
- **Security** — Helmet, CORS, rate limiting out of the box
- **Free game system** — `hasFreeGame` boolean on User, consumed at game creation
- **Board as embedded document** — 24 cells stored inside the Game document for atomic updates
- **Question locking** — `used: true` prevents same question appearing in multiple games
- **Admin isolation** — `adminOnly` middleware cleanly gates all management routes

---

## 🔮 Frontend Integration Notes

- All responses follow `{ success, message, data }` shape
- Paginated lists include a `pagination` object
- Game board cells have `isAnswered`, `answeredBy`, `questionId` — enough for the frontend to render the Jeopardy-style grid
- The `selectQuestion` endpoint never returns the answer — only `revealAnswer` does
- `timer` (seconds) is returned per question so the frontend can run its own countdown
- `answerMedia` supports image, audio, and video (with `isReplayable` flag for video)
