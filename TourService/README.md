# Tour Service

Tourism application tour management microservice.

## Features

- Tour creation and management
- Draft and published states
- Tag-based categorization
- Author-based tour filtering
- Authentication and authorization

## API Endpoints

### Tours
- `POST /api/tours` - Create new tour
- `GET /api/tours` - Get all tours (public)
- `GET /api/tours/my` - Get my tours (authenticated)
- `GET /api/tours/:id` - Get tour by ID
- `PUT /api/tours/:id` - Update tour
- `DELETE /api/tours/:id` - Delete tour

## Environment Variables

- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 3003)
- `DB_HOST` - PostgreSQL host
- `DB_PORT` - PostgreSQL port
- `DB_NAME` - Database name
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `AUTH_SERVICE_URL` - Authentication service URL

## Usage

```bash
npm install
npm start
```