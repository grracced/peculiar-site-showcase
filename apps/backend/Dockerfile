# =============================================================================
# Stage 1: Base — Install dependencies
# =============================================================================
FROM node:20-alpine AS base

# Set the working directory to the monorepo root
WORKDIR /app

# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy root configurations and lockfiles
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY tsconfig.base.json .prettierrc .eslintrc.js ./

# Copy the backend app and any shared packages
COPY apps/backend ./apps/backend
COPY packages ./packages

# Install all dependencies required by the backend
RUN pnpm install --filter backend...

# =============================================================================
# Stage 2: Build — Compile TypeScript for production
# =============================================================================
FROM base AS builder

WORKDIR /app/apps/backend

# Compile TypeScript to JavaScript
RUN pnpm run build

# =============================================================================
# Stage 3: Production — Minimal runtime image
# =============================================================================
FROM node:20-alpine AS production

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy root configs and lockfiles for production install
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/backend/package.json ./apps/backend/package.json
COPY packages ./packages

# Install production dependencies only
RUN pnpm install --filter backend... --prod

# Copy compiled output from the builder stage
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist

# Copy OpenAPI specification (needed at runtime for Swagger in non-production)
COPY docs ./docs

# Set working directory to the backend app
WORKDIR /app/apps/backend

# Use non-root user for security
USER node

# Expose the API port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health/live || exit 1

# Start the application
CMD ["node", "dist/server.js"]
