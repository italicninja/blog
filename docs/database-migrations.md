# Database Migrations Guide

This document provides guidance on managing database migrations for the blog application using Prisma.

## Overview

The blog uses Prisma as an ORM with PostgreSQL as the database. All database schema changes are managed through Prisma migrations.

## Prerequisites

- Node.js (v18 or later)
- PostgreSQL database (local or hosted)
- Environment variables configured (see `.env.example`)

## Environment Variables

Ensure you have the following environment variables set:

```bash
# For migrations and database management
POSTGRES_URL_NON_POOLING="postgresql://user:password@host:port/database"

# For application runtime (with connection pooling)
POSTGRES_PRISMA_URL="postgresql://user:password@host:port/database?pgbouncer=true"
```

## Common Migration Commands

### 1. Generate Prisma Client

After any schema changes or fresh install:

```bash
npm run postinstall
# or
npx prisma generate
```

### 2. Create a New Migration (Development)

When you modify the Prisma schema (`prisma/schema.prisma`):

```bash
npx prisma migrate dev --name describe_your_changes
```

Example:
```bash
npx prisma migrate dev --name add_user_permissions
```

This will:
- Create a new migration file in `prisma/migrations/`
- Apply the migration to your development database
- Regenerate the Prisma Client

### 3. Apply Migrations (Production)

To apply pending migrations to production:

```bash
npx prisma migrate deploy
```

Or use the helper script:
```bash
npm run migrate-production
```

**⚠️ Important**: Always test migrations in a staging environment before applying to production!

### 4. Reset Database (Development Only)

To reset the database and reapply all migrations:

```bash
npx prisma migrate reset
```

**⚠️ Warning**: This will delete all data in your database!

### 5. Check Migration Status

To see which migrations have been applied:

```bash
npx prisma migrate status
```

## Migration Workflow

### Development Environment

1. Modify `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name your_change_description`
3. Test the changes locally
4. Commit both the schema changes and migration files

### Production Deployment

1. Ensure all migrations are committed to version control
2. Deploy your application code
3. Run migrations using one of these methods:

   **Option A: Using the migration script**
   ```bash
   npm run migrate-production
   ```

   **Option B: Manual deployment**
   ```bash
   npx prisma migrate deploy
   ```

   **Option C: Vercel deployment** (automatic)
   - Migrations run automatically during build via `npm run build`
   - The build script includes `prisma generate`

## Database Backup

Before running migrations in production, always create a backup:

```bash
# Using the backup script
npm run backup-database

# Or manually with PostgreSQL
pg_dump $POSTGRES_URL_NON_POOLING > backup_$(date +%Y%m%d_%H%M%S).sql
```

## Troubleshooting

### Migration Failed

If a migration fails:

1. Check the error message carefully
2. Review the migration SQL in `prisma/migrations/`
3. For development: `npx prisma migrate reset` and try again
4. For production: You may need to manually fix the database state

### Schema Drift Detected

If Prisma detects schema drift:

```bash
# Check what's different
npx prisma migrate status

# In development, reset and reapply
npx prisma migrate reset

# In production, investigate before proceeding
npx prisma db pull  # See current database schema
```

### Connection Issues

- Verify environment variables are set correctly
- Check database connection from command line: `psql $POSTGRES_URL_NON_POOLING`
- For pooled connections, ensure PgBouncer is configured correctly

## Best Practices

1. **Always backup before migrating production**
2. **Test migrations in staging first**
3. **Use descriptive migration names**: `add_post_versioning` not `update_schema`
4. **Keep migrations atomic**: One logical change per migration
5. **Never edit existing migrations** once they're applied to production
6. **Review generated SQL** before applying migrations
7. **Document breaking changes** in migration commit messages

## Reverting Migrations

Prisma doesn't support automatic rollbacks. To revert:

1. **Development**: Use `npx prisma migrate reset` and remove the migration
2. **Production**:
   - Create a new migration that reverses the changes
   - Or restore from backup
   - Never delete migration files from a production database

## Schema Changes Checklist

Before creating a migration:

- [ ] Is the schema change backward compatible?
- [ ] Do I need to migrate existing data?
- [ ] Have I updated the application code to handle the change?
- [ ] Have I tested this locally?
- [ ] Have I created a database backup (for production)?
- [ ] Does this affect any indexes or query performance?

## Additional Resources

- [Prisma Migration Documentation](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## Getting Help

If you encounter issues:

1. Check the Prisma documentation
2. Review the error logs
3. Check database connection and permissions
4. Consult the team before making changes to production

---

**Last Updated**: 2025-01-15
