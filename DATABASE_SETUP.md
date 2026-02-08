# Database Setup Guide

## Prerequisites

The app requires PostgreSQL for data persistence. You have two options:

### Option 1: Local PostgreSQL (Development)

1. **Install PostgreSQL** (if not already installed):
   ```bash
   # macOS (using Homebrew)
   brew install postgresql@15
   brew services start postgresql@15
   
   # Or use Postgres.app
   # Download from https://postgresapp.com/
   ```

2. **Create Database**:
   ```bash
   # Connect to PostgreSQL
   psql postgres
   
   # Create database
   CREATE DATABASE surprise;
   
   # Create user (if needed)
   CREATE USER postgres WITH PASSWORD 'postgres';
   GRANT ALL PRIVILEGES ON DATABASE surprise TO postgres;
   
   # Exit
   \q
   ```

3. **Update .env** (already configured):
   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/surprise
   ```

### Option 2: Neon (Cloud PostgreSQL - Recommended for Production)

1. **Sign up for Neon** at https://neon.tech
2. **Create a new project**
3. **Copy the connection string**
4. **Update .env**:
   ```env
   DATABASE_URL=postgresql://[user]:[password]@[hostname]/[database]?sslmode=require
   ```

## Run Database Migrations

Once your database is set up, run migrations to create tables:

```bash
# Generate migration files (if schema changes)
npm run db:generate

# Run migrations to create tables
npm run db:migrate

# Open Drizzle Studio to view/edit data
npm run db:studio
```

## Seed Initial Data (Optional)

Create a seed script to populate test data:

```bash
# Create seed file
touch src/server/db/seed.ts
```

Then add seed data for parking lots, spots, etc.

## Verify Database Connection

Test the database connection:

```bash
psql postgresql://postgres:postgres@localhost:5432/surprise -c "SELECT version();"
```

## Troubleshooting

### Connection Refused
- Ensure PostgreSQL is running: `brew services list`
- Check port 5432 is not blocked
- Verify credentials in .env

### Migration Errors
- Ensure database exists
- Check user has proper permissions
- Review migration files in drizzle/ folder

### SSL/TLS Issues (Neon)
- Add `?sslmode=require` to connection string
- Check firewall settings

## Database Schema

The app uses these main tables:
- `user` - User accounts (Better Auth)
- `session` - User sessions (Better Auth)
- `organization` - Multi-tenant organizations (Better Auth)
- `account` - OAuth accounts (Better Auth)
- `parking_lot` - Parking facilities
- `parking_spot` - Individual parking spaces
- `vehicle` - Registered vehicles
- `reservation` - Parking reservations
- `payment` - Payment transactions

All tables are automatically created by Drizzle migrations.

## Demo Mode (No Database Required)

For quick testing without database setup, use demo mode:
1. Visit `/demo`
2. Click "Start Demo"
3. All data is stored in memory/localStorage

Demo mode is perfect for:
- Quick feature testing
- E2E tests
- Demonstrations
- UI development
