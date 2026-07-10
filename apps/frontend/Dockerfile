# Base Node Image
FROM node:20-alpine AS base

# Set the working directory to the monorepo root
WORKDIR /app

# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy root configurations and lockfiles
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY tsconfig.base.json .prettierrc .eslintrc.js ./

# Copy the frontend app and any shared packages
COPY apps/frontend ./apps/frontend
COPY packages ./packages

# Install all dependencies required by the frontend
RUN pnpm install --filter frontend...

# Set working directory to the frontend app
WORKDIR /app/apps/frontend

# Expose Next.js default port
EXPOSE 3000

# Start the application in development mode
# Note: In production, this would be `pnpm run build` followed by `pnpm start`
CMD ["pnpm", "run", "dev"]
