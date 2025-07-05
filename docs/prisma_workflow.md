# Prisma Workflow Guide

This document outlines the proper workflow for using Prisma in both local development and deployment environments.

## Local Development Workflow

### Initial Setup

1. **Install Prisma CLI and Client** (run once):
   ```bash
   npm install prisma --save-dev
   npm install @prisma/client
   ```

2. **Initialize Prisma** (run once):
   ```bash
   npx prisma init
   ```
   This creates a `prisma/schema.prisma` file and a `.env` file for your database URL.

3. **Configure your local database connection** in the `.env` file:
   ```
   DATABASE_URL="${PRISMA_WORKFLOW_SECRET}"
   ```

### Database Modeling

Define your database schema in the `prisma/schema.prisma` file:

```prisma
model User {
  id    Int     @id @default(autoincrement())
  name  String
  email String  @unique
}
```

### Running Migrations Locally

Generate and apply database migrations to your local DB:

```bash
npx prisma migrate dev --name init
```

This will:
- Create a new migration file
- Apply it to your local database
- Regenerate the Prisma client

### Using Prisma Client in Code

```typescript
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// Example: Query all users
async function getUsers() {
  const users = await prisma.user.findMany()
  return users
}
```

## Deployment Workflow

### Important: Do Not Run `prisma migrate dev` in Production

`migrate dev` is only for local development. It:
- Applies migrations
- May reset data if schema changes
- Is interactive

### Instead, Use `prisma migrate deploy` in CI/CD

On deploy (e.g., in a GitHub Actions, Vercel, or Docker build step):

```bash
npx prisma migrate deploy
```

This reads the `migrations/` directory and applies it to the production DB non-interactively.

### Make Sure the Prisma Client Is Generated

Either:
- Run `npx prisma generate` as part of your build step, or
- Let frameworks like Next.js do it (Vercel automatically generates Prisma client for serverless functions if configured)

### Environment Configuration

Your production `.env` file should point to the production database.

## Our Project Setup

In our project, we've implemented this workflow as follows:

1. **Local Development**:
   - Use the standard Prisma CLI commands directly
   - Run `npx prisma migrate dev` for local development

2. **Deployment**:
   - We use `scripts/setup_prisma.py` which:
     - Sets up the appropriate environment
     - Runs `npx prisma migrate deploy` for production/deployment
     - Generates the Prisma client with `npx prisma generate`
   - This script is called from our deployment script (`deployment-scripts/deploy-to-staging-modified.ps1`)

3. **Environment Variables**:
   - Local: Use local `.env` file
   - Staging/Production: Environment variables are set in the deployment configuration

## Summary

| Task | Local Dev | Cloud Build / CI/CD |
|------|-----------|---------------------|
| Modeling Schema | Yes | No |
| Running Migrations | `prisma migrate dev` | `prisma migrate deploy` |
| Prisma Client Generation | `prisma generate` | `prisma generate` |
| Database URL | Local `.env` | Production `.env` |

## Troubleshooting

If you encounter issues with Prisma migrations:

1. **Local Development**:
   - Ensure your local database is running
   - Check your `.env` file for correct database URL
   - Try running `npx prisma migrate reset` to reset your database (caution: this will delete all data)

2. **Deployment**:
   - Check the logs for any errors
   - Ensure the database URL is correctly set in the environment
   - Verify that the service account has the necessary permissions to access the database