# Pastebin Lite (Backend)

A small, minimal Pastebin-like backend API to create and view short-lived or limited-view pastes.

✅ **Features:**
- Create a paste with content, optional TTL (time-to-live in seconds) and optional max views
- Retrieve paste content via a JSON API (consumes a view)
- View paste content as simple HTML
- Health check endpoint

---

## Tech stack
- Node.js + Express
- MongoDB (via Mongoose)
- dotenv for configuration

---

## Getting started

### Prerequisites
- Node.js (local or hosted)

### Install

```bash
npm install
```

### Environment variables
Create a `.env` file in the project root with:

```env
MONGO_URI=mongodb://localhost:27017/pastebin
PORT=5000
# Optional for testing: set TEST_MODE=1 and pass X-TEST-NOW-MS header to control time
TEST_MODE=0
```

### Run

Start in development mode:

```bash
npm run dev
```

Start production:

```bash
npm start
```

Server runs on `http://localhost:<PORT>` (default `5000`).

---

## API

Base: `http://<HOST>`

### Health

GET /api/healthz

Response:
```json
{ "ok": true }
```

### Create a paste

POST /api/pastes

Body (JSON):
- `content` (string, required)
- `ttl_seconds` (integer, optional) — paste expires after this many seconds
- `max_views` (integer, optional) — paste expires after this many views

Example:

```bash
curl -X POST "http://localhost:5000/api/pastes" \
  -H "Content-Type: application/json" \
  -d '{"content":"Hello world","ttl_seconds":3600,"max_views":5}'
```

Success response (201):
```json
{
  "id": "<paste-id>",
  "url": "http://localhost:5000/p/<paste-id>"
}
```

### Get paste (JSON)

GET /api/pastes/:id

- Returns `content`, `remaining_views` (null if unlimited), and `expires_at` (or null)
- Each successful GET consumes one view when `max_views` is set

Example response:
```json
{
  "content": "...",
  "remaining_views": 2,
  "expires_at": "2025-12-30T12:34:56.789Z"
}
```

Errors: `404` for not found, expired, or view limit exceeded.

### View paste (HTML)

GET /p/:id

- Renders the paste in a minimal HTML page (`<pre>`)
- Also consumes a view if `max_views` is set

---

## Data model
The `Paste` model contains:
- `content` (string)
- `createdAt` (date)
- `expiresAt` (date|null)
- `maxViews` (number|null)
- `views` (number)

---

## Notes & testing helpers
- When `TEST_MODE=1`, you can pass `X-TEST-NOW-MS` header (epoch ms) to simulate current time for TTL checks.
- The API validates `content`, `ttl_seconds`, and `max_views` and returns `400` for invalid inputs.
