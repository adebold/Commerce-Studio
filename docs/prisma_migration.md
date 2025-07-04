# Migrating from SQLAlchemy to Prisma

This document provides instructions for migrating the database ORM from SQLAlchemy and Alembic to Prisma.

## Overview

The project previously used SQLAlchemy as the ORM and Alembic for database migrations. This migration replaces them with Prisma, which provides:

- Type-safe database client
- Automatic migrations
- Improved developer experience
- Better performance

## Prerequisites

- PostgreSQL database
- Node.js and npm (for Prisma CLI)
- Python 3.8+

## Migration Steps

### 1. Install Dependencies

The required dependencies have been added to `requirements.txt`:

```
prisma>=0.9.0  # Prisma Client Python
prisma-client-py>=0.9.0  # Prisma Client Python CLI tools
```

Install them with:

```bash
pip install -r requirements.txt
```

### 2. Set Up Prisma

Run the setup script to initialize Prisma:

```bash
# Make the script executable
chmod +x scripts/setup_prisma.sh

# Run the setup script
./scripts/setup_prisma.sh
```

This script will:
- Create a `.env` file in the `prisma` directory with the database connection string
- Generate the Prisma client
- Create the database if it doesn't exist
- Run the initial migration

Alternatively, you can use the Python setup script:

```bash
python scripts/setup_prisma.py
```

### 3. Migrate Data

If you have existing data in your SQLAlchemy database, you can migrate it to Prisma using the migration script:

```bash
# Set the SQLAlchemy database URL
export SQLALCHEMY_DATABASE_URL="${PRISMA_MIGRATION_SECRET}"

# Run the migration script
python scripts/migrate_to_prisma.py
```

This script will:
- Export data from the SQLAlchemy database
- Import it into the Prisma database
- Verify the migration was successful

### 4. Update Configuration

The application has been updated to use Prisma by default. You can control this behavior with the following environment variables:

```
# Enable or disable Prisma (default: True)
USE_PRISMA=True

# PostgreSQL connection string for Prisma
DATABASE_URL=${PRISMA_MIGRATION_SECRET}
```

### 5. Code Changes

The following files have been added or modified:

- `prisma/schema.prisma`: Prisma schema file defining the database models
- `src/api/database/prisma_client.py`: Prisma client module
- `src/api/prisma_database.py`: Database operations using Prisma
- `src/api/core/config.py`: Updated configuration with Prisma settings
- `src/api/main.py`: Updated to initialize Prisma client

### 6. Verify Migration

To verify that the migration was successful, run the application and check that it can connect to the database and perform operations using Prisma.

## Rollback

If you need to rollback to SQLAlchemy, you can set the `USE_PRISMA` environment variable to `False`:

```
USE_PRISMA=False
```

This will cause the application to use the original SQLAlchemy database module.

## Troubleshooting

### Connection Issues

If you encounter connection issues, check that:

1. The PostgreSQL database is running
2. The `DATABASE_URL` environment variable is correctly set
3. The database user has the necessary permissions

### Migration Issues

If you encounter issues with the migration:

1. Check the logs for error messages
2. Verify that the SQLAlchemy database is accessible
3. Try running the migration script with the `--verbose` flag for more detailed output

### Client Generation Issues

If the Prisma client fails to generate:

1. Make sure Node.js and npm are installed
2. Try running `npx prisma generate` manually
3. Check that the `schema.prisma` file is valid

## References

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Client Python](https://prisma-client-py.readthedocs.io/en/stable/)
- [SQLAlchemy to Prisma Migration Guide](https://www.prisma.io/docs/orm/more/migrating-to-prisma/migrate-from-sqlalchemy)