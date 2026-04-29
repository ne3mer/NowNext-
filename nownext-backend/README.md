# NowNext AI Backend

Production-ready TypeScript backend for the NowNext AI productivity mobile app.

## Stack

- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- JWT auth + bcrypt hashing
- Zod validation
- Helmet, CORS, Morgan, rate-limit

## Project Structure

`src/`

- `config/` env + database setup
- `controllers/` thin HTTP handlers
- `middleware/` auth, validation, rate-limit, error handling
- `models/` Mongoose models
- `routes/` API route definitions
- `services/` business logic
- `utils/` helpers (JWT, async handler, response, AppError)
- `validators/` Zod schemas
- `types/` shared types
- `app.ts` express app composition
- `server.ts` bootstrap and listen

## Environment

Copy `.env.example` to `.env`:

```bash
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nownext-ai
JWT_SECRET=change_this_to_a_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:8081
NODE_ENV=development
```

## Install and Run

```bash
npm install
npm run dev
```

Build/start production:

```bash
npm run build
npm run start
```

## API Docs

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (Bearer token)

### Tasks (all protected)

- `GET /api/tasks`
- `POST /api/tasks`
- `GET /api/tasks/:id`
- `PATCH /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `PATCH /api/tasks/:id/complete`
- `PATCH /api/tasks/reorder`
- `GET /api/tasks/suggestion/now`

## Response Shape

Success:

```json
{
  "success": true,
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "error": "Message"
}
```

## Example Requests

Register:

```json
{
  "name": "Nima",
  "email": "nima@example.com",
  "password": "StrongPass123"
}
```

Create task:

```json
{
  "title": "Plan sprint goals",
  "description": "Focus on launch blockers",
  "category": "weekly",
  "priority": "high",
  "status": "todo",
  "dueDate": "2026-05-05T09:00:00.000Z",
  "color": "#dbeafe",
  "order": 10
}
```
