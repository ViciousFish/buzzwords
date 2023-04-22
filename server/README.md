# Buzzwords Server

## Database

Buzzwords currently supports three storage types:

- In Memory (memory)
- SQLite (prisma)
- Mongodb (mongo)
- Edgedb (edgedb)

This can be controlled via the `DB_TYPE` environment variable.

If you choose SQLite, you must first run `npx prisma generate` and `npx prisma db push` to generate the Prisma client code and configure your local DB.

if you choose Edgedb, you must run `npx @edgedb/generate edgeql-js` (and maybe you need to install edgedb? unclear. Will update these instructions later)
