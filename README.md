<div align="center">

  # HavenHive Backend
  <img src="./src/public/server.png" height="400" width="800" alt="HavenHive"/>
</div>

A professional, feature-complete REST API for the HavenHive real estate marketplace platform. Built with Node.js, Express, TypeScript, and MongoDB.

## Features

### Authentication & Authorization

- User registration with email verification
- JWT-based authentication
- Password reset flow
- Role-based access control (User, Agent, Admin)
- Account verification with token expiry

### Property Management

- Full CRUD operations for property listings
- Advanced filtering by type, purpose, price, area, location, amenities
- Search with text indexing
- Property status management (draft, published, sold, rented, archived)
- Featured properties highlighting
- Image uploads to Cloudinary
- Statistics and analytics endpoints

### Bookings & Reviews

- Property booking management with status tracking
- User reviews with ratings (1-5 stars)
- Review aggregation per property
- Booking status workflow (pending, confirmed, completed, cancelled)

### Content Management

- Blog posts with categories
- Contact message handling with status tracking
- Admin dashboard statistics

### Security & Quality

- Input validation with Zod schemas
- Rate limiting on auth endpoints
- CORS protection
- Helmet.js security headers
- Password hashing with bcryptjs (salt rounds: 12)
- Error handling with custom AppError class
- Async handler wrapper for cleaner error catching

### Image Management

- Cloudinary integration for image uploads
- Support for multiple property images
- Avatar uploads for users

### Email Service

- Email verification on signup
- Password reset emails
- Booking confirmation emails
- SMTP support (configurable provider)

## Tech Stack

- **Runtime:** Node.js 20+
- **Language:** TypeScript
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (jsonwebtoken)
- **Validation:** Zod
- **File Upload:** Multer + Cloudinary
- **Email:** Nodemailer
- **Security:** Helmet, CORS, bcryptjs, express-rate-limit
- **Development:** tsx, ESLint

## Installation

### 1. Clone and Install

```bash
npm install
```

### 2. Environment Setup

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

**Required variables:**

- `MONGODB_URI`: MongoDB connection string (MongoDB Atlas or local)
- `JWT_SECRET`: Generate with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- `CLIENT_ORIGIN`: Your frontend URL (e.g., `http://localhost:3000` for dev)

**Optional variables:**

- `CLOUDINARY_*`: Image upload support (skip to disable image uploads)
- `SMTP_*`: Email service (skip to disable email sending)

### 3. Database Seeding (Optional)

Create initial admin and agent accounts:

```bash
npm run seed
```

Default seeded accounts:

- Admin: `admin@havenhive.com` / `Admin@123456`
- Agents: `john.agent@havenhive.com`, `sarah.agent@havenhive.com` (both with password `Agent@123456`)

Override with env variables:

- `SEED_ADMIN_EMAIL`
- `SEED_ADMIN_PASSWORD`

## Development

```bash
npm run dev
```

Starts the server with hot-reload on `http://localhost:5000`. The API health check is at `/health`.

## Production Build

```bash
npm run build
npm start
```

Compiled output is in the `dist/` directory.

## API Endpoints

All endpoints support both `/api/...` and `/api/v1/...` prefixes.

### Authentication (`/api/auth`)

- `POST /register` - Register new user
- `POST /login` - Login and get JWT token
- `GET /me` - Get current user profile (requires auth)
- `POST /logout` - Logout (requires auth)
- `POST /verify-email/request` - Request email verification (requires auth)
- `POST /verify-email` - Verify email with token
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password with token

### Properties (`/api/properties`)

- `GET /` - List properties with filters and pagination
- `GET /:id` - Get property details
- `POST /` - Create property (requires agent/admin role)
- `PATCH /:id` - Update property (requires agent/admin role)
- `DELETE /:id` - Delete property (requires admin role)
- `GET /featured` - Get featured properties
- `GET /stats` - Get property statistics

### Users (`/api/users`)

- `GET /` - List users (requires admin)
- `GET /:id` - Get user details (requires admin)
- `PATCH /me` - Update own profile (requires auth)
- `PATCH /:id` - Update user (requires admin)
- `DELETE /:id` - Delete user (requires admin)
- `POST /wishlist/:propertyId` - Toggle property wishlist (requires auth)
- `GET /stats` - Get user dashboard stats (requires auth)

### Bookings (`/api/bookings`)

- `POST /` - Create booking (requires auth)
- `GET /` - List bookings (requires auth)
- `GET /:id` - Get booking details (requires auth)
- `PATCH /:id` - Update booking status (requires agent/admin)
- `DELETE /:id` - Delete booking (requires admin)

### Reviews (`/api/reviews`)

- `GET /property/:propertyId` - Get reviews for a property
- `POST /` - Create or update review (requires auth)
- `DELETE /:id` - Delete review (requires admin)

### Blogs (`/api/blogs`)

- `GET /` - List blog posts (public sees published only)
- `GET /:slug` - Get blog post by slug
- `POST /` - Create blog (requires admin)
- `PATCH /:id` - Update blog (requires admin)
- `DELETE /:id` - Delete blog (requires admin)

### Contacts (`/api/contact` or `/api/contacts`)

- `POST /` - Submit contact form
- `GET /` - List contact messages (requires admin)
- `PATCH /:id/status` - Update contact status (requires admin)
- `DELETE /:id` - Delete contact message (requires admin)

## Deployment

### Vercel (Backend API)

This repository is preconfigured for Vercel using:

- `api/index.ts` as the serverless Express handler
- `vercel.json` to route all requests to the handler

#### Deploy Steps

1. Push this backend repository to GitHub.
2. In Vercel, click **Add New Project** and import the repository.
3. Framework preset: **Other**.
4. Root directory: repository root.
5. Build command: `npm run build`.
6. Install command: `npm install`.
7. Add the required Environment Variables in Vercel Project Settings:

- `NODE_ENV=production`
- `MONGODB_URI=...`
- `JWT_SECRET=...`
- `JWT_EXPIRES_IN=7d`
- `CLIENT_ORIGIN=https://your-frontend-domain.com`
- `CLOUDINARY_CLOUD_NAME=...` (optional)
- `CLOUDINARY_API_KEY=...` (optional)
- `CLOUDINARY_API_SECRET=...` (optional)
- `SMTP_HOST=...` (optional)
- `SMTP_PORT=587` (optional)
- `SMTP_USER=...` (optional)
- `SMTP_PASS=...` (optional)
- `SMTP_FROM_EMAIL=...` (optional)
- `SMTP_FROM_NAME=HavenHive` (optional)

#### After Deploy

- Health check: `GET https://your-vercel-domain.vercel.app/health`
- API base URL for frontend: `https://your-vercel-domain.vercel.app/api`

The backend supports both `/api/...` and `/api/v1/...` routes in production.

### Docker

Build and run the image:

```bash
docker build -t havenhive-backend .
docker run -p 5000:5000 --env-file .env havenhive-backend
```

### Environment for Production

Set these securely:

```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://[user]:[pass]@[cluster].mongodb.net/[db]
JWT_SECRET=[generate-new-secret]
CLIENT_ORIGIN=https://yourdomain.com
CLOUDINARY_CLOUD_NAME=[your-cloud-name]
CLOUDINARY_API_KEY=[your-api-key]
CLOUDINARY_API_SECRET=[your-secret]
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=[your-email]
SMTP_PASS=[your-app-password]
```

### Recommended Hosting

- **Database:** MongoDB Atlas (free tier available)
- **Hosting:** Render, Railway, Vercel, AWS Elastic Beanstalk, Heroku
- **Email:** Gmail (App Password), SendGrid, Mailgun
- **Image Storage:** Cloudinary (free tier available)

### Health Check

The API exposes a health endpoint for deployment monitoring:

```
GET /health
```

Response: `{ "success": true, "message": "HavenHive API is running" }`

## Rate Limiting

Authentication endpoints (`/auth/login`, `/auth/register`, etc.) have rate limiting:

- 20 requests per 15 minutes per IP

## Error Handling

All endpoints return JSON responses with consistent structure:

**Success:**

```json
{
  "success": true,
  "data": { ... },
  "token": "...",
  "message": "..."
}
```

**Error:**

```json
{
  "success": false,
  "message": "Error description"
}
```

HTTP status codes follow REST conventions (200, 201, 400, 401, 403, 404, 409, 500, etc.).

## Development Notes

- All password fields are selected with `.select("+password")` to keep them private by default
- Image uploads are async and don't block request responses
- Email sending is non-blocking (fires in background)
- Pagination defaults: `limit=12`, `page=1` (max limit: 100)
- Text search works on property title, description, address, city, and state
- Token expiry: JWT tokens default to 7 days; email/reset tokens expire in 24 hours / 1 hour respectively

## Troubleshooting

### MONGODB_URI connection error

- Verify connection string format: `mongodb+srv://user:pass@host/database`
- Check whitelist IP in MongoDB Atlas (allow all if local)
- Ensure database name matches

### Email not sending

- If SMTP not configured, emails are logged to console only
- Check `.env` has valid SMTP credentials
- Gmail requires an "App Password" (not account password) if 2FA is enabled

### Image uploads not working

- Verify Cloudinary credentials are set in `.env`
- Check file size (max 10MB per file)
- Ensure MIME type is image/\*

## Support

For issues or feature requests, contact the development team.
