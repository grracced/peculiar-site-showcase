# VerifAI Docker Development Environment

This guide explains how the Docker environment is configured and how to use it for local development.

## Architecture
The local development environment runs 4 interconnected containers using a custom bridge network (`verifai_network`):
1. **`postgres`**: Runs `postgres:15-alpine`. This is a lightweight database engine used instead of the full Supabase local stack to maximize startup speed and local iteration.
2. **`redis`**: Runs `redis:7-alpine`. This acts as the in-memory queue store required by BullMQ.
3. **`backend`**: Runs the Express API and background workers.
4. **`frontend`**: Runs the Next.js application.

## Startup Dependencies
Docker Compose is configured to use `depends_on` with `service_healthy`. This means the `backend` container will strictly wait for both `postgres` and `redis` to finish initializing and pass a ping check before it attempts to start. This prevents Prisma crashing on boot.

## How to Start Local Development

1. Ensure you have copied `.env.example` to `.env` in the root directory.
2. Run the following command from the root directory:

```bash
docker compose up -d
```

3. The services will be exposed on your local machine at:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **Postgres:** `localhost:5432` (Username: postgres, Password: postgres)
- **Redis:** `localhost:6379`

## Hot Reloading
The `docker-compose.override.yml` file maps your local source code directories directly into the running containers. 
When you save a file in VSCode, the changes will instantly reflect inside the container, triggering Next.js and Express to hot-reload.

## Troubleshooting

### Port Conflicts
If you receive a "port is already allocated" error, you likely have another instance of Postgres or Redis running on your machine.
- **Fix:** Either stop your local database instances or change the mapped host port in `docker-compose.override.yml` (e.g., `"5433:5432"`).

### Stale Database State
If you need to completely nuke the local database and start fresh:
```bash
docker compose down -v
```
*Warning: This destroys the `postgres_data` and `redis_data` persistent volumes.*

### Rebuilding Images
If you add a new package to `package.json`, the container's `node_modules` might get out of sync. Force a rebuild:
```bash
docker compose up -d --build
```
