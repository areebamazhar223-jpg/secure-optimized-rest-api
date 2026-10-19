# Secure & Optimized REST API

A secure and optimized REST API built with Node.js, Express.js, SQLite, and JWT authentication.

## Features

- User registration and login
- Password hashing with bcrypt
- JWT-based authentication
- Role-based authorization for admin routes
- Product CRUD operations
- Pagination for product listings
- In-memory caching with a 30-second TTL
- Security middleware and input validation
- Automated API tests using Postman

## Tech Stack

- Node.js
- Express.js
- SQLite with better-sqlite3
- JSON Web Tokens (JWT)
- bcryptjs
- express-validator
- Postman

## Getting Started

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### 2. Open the backend folder

```bash
cd "Secure & Optimized REST API/backend"
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file in the backend folder and configure the required environment variables, including a strong `JWT_SECRET` and `PORT=3000`.

Never commit your `.env` file or real secrets to GitHub.

### 5. Start the server

```bash
node server.js
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register a new user |
| POST | `/api/auth/login` | Log in and receive a JWT |

### Products

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/products` | Get products with pagination |
| POST | `/api/products` | Create a product |
| GET | `/api/products/:id` | Get a product by ID |
| PUT | `/api/products/:id` | Update a product |
| DELETE | `/api/products/:id` | Delete a product |

Protected endpoints require a valid Bearer token. Admin-only operations require an admin account.

### Pagination Example

```http
GET /api/products?page=1&limit=2
```

## API Testing

API requests were tested using Postman. The product listing request has automated tests for:

- HTTP status code
- Valid JSON response
- Success status
- Pagination structure
- Product array and fields
- Cache header

Export the Postman collection and include the collection JSON file in the repository.

## Security Notes

- Passwords are hashed before storage.
- JWTs expire after one hour.
- Keep secrets in environment variables.
- Do not commit credentials, tokens, or private environment files.

## Author

**Areeba Mazhar**

GitHub: https://github.com/areebamazhar223-jpg
