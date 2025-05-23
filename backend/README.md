# Authentication Backend

Simple Express.js authentication with JWT and role-based access control.

## Setup

```
npm install
npm start
```

## Endpoints
- `POST /signup` - create a user `{ username, password, role }`
- `POST /login` - log in `{ username, password }`, returns JWT token
- `GET /profile` - get logged in user info (requires Authorization header)
- `GET /instructor` - instructor-only route
- `GET /student` - student-only route

This is a minimal example and does not persist users between restarts.
