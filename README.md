# MessageHub

One inbox for every contact form.

Aggregate contact form submissions from multiple sources into a single, clean dashboard. Create named forms that each receive a unique public API endpoint, and view all submitted messages in a unified inbox with search, filtering, and sorting.

## Tech Stack

- **Framework:** Next.js 16 with App Router
- **Authentication:** Auth.js v5 (NextAuth) with Google OAuth + Credentials (JWT strategy)
- **Database:** MongoDB via native `mongodb` driver (`@auth/mongodb-adapter`)
- **UI:** Tailwind CSS v4 + shadcn/ui (base-ui)
- **Validation:** Zod
- **Font:** Geist (Geist Sans & Geist Mono)

## Setup

### Prerequisites

- Node.js 20+
- A MongoDB database (local or [MongoDB Atlas](https://www.mongodb.com/atlas) free tier)
- Google OAuth credentials ([Google Cloud Console](https://console.cloud.google.com/apis/credentials))

### 1. Clone and install

```bash
git clone <repo-url>
cd messagehub
npm install
```

### 2. Set up environment variables

Copy the example env file:

```bash
cp .env.example .env
```

Edit `.env` with your values:

| Variable | Description |
|---|---|
| `DATABASE_URL` | MongoDB connection string (e.g. `mongodb+srv://...` or `mongodb://localhost:27017/messagehub`) |
| `AUTH_SECRET` | Generate with `openssl rand -base64 32` |
| `AUTH_GOOGLE_ID` | Your Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | Your Google OAuth client secret |

> **Google OAuth redirect URI:** Add `http://localhost:3000/api/auth/callback/google` to your Google Cloud Console authorized redirect URIs.

### 3. Start the dev server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

> **Note for local MongoDB:** Some MongoDB features (transactions, change streams) require a replica set. [MongoDB Atlas](https://www.mongodb.com/atlas) free tier handles this automatically. For local development, a standalone instance is sufficient for basic usage.

## Features

- **Unified inbox** — All form submissions in one place with expand/collapse JSON viewer
- **Search** — Full-text search across message bodies
- **Filters** — Filter by form, read/unread status
- **Sorting** — Newest or oldest first
- **Pagination** — 20 messages per page
- **Form management** — Create, view, and delete forms with unique API endpoints
- **Public submit endpoint** — CORS-enabled POST endpoint per form
- **Authentication** — Google OAuth + email/password registration
- **Responsive sidebar** — Collapsible navigation with unread count badge

## Using your form endpoint

### Fetch API (JavaScript)

```js
fetch("https://yourdomain.com/api/forms/YOUR_FORM_SLUG/submit", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "Jane Doe",
    email: "jane@example.com",
    subject: "Partnership inquiry",
    message: "Hi, I'd love to discuss..."
  })
})
```

### HTML form

```html
<form id="contact-form">
  <input type="text" name="name" placeholder="Your name" required />
  <input type="email" name="email" placeholder="Your email" required />
  <textarea name="message" placeholder="Your message" required></textarea>
  <button type="submit">Send</button>
</form>

<script>
document.getElementById("contact-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  await fetch("https://yourdomain.com/api/forms/YOUR_FORM_SLUG/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
});
</script>
```

## API Routes

| Route | Auth | Description |
|---|---|---|
| `POST /api/auth/register` | Public | Create an account |
| `GET /api/forms` | Required | List your forms |
| `POST /api/forms` | Required | Create a new form |
| `GET /api/forms/[slug]` | Required | Get a single form |
| `DELETE /api/forms/[slug]` | Required | Delete a form and its messages |
| `POST /api/forms/[slug]/submit` | Public | Submit a message to a form |
| `GET /api/messages` | Required | List messages (with filters, sort, pagination) |
| `PATCH /api/messages/[id]` | Required | Mark read/unread |
| `DELETE /api/messages/[id]` | Required | Delete a message |

## Deployment

Deploy to Vercel, Netlify, or any Node.js hosting platform. Ensure all environment variables are configured in the production environment.

## License

MIT
