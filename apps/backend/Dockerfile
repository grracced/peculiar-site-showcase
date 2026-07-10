# Base Node Image
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

# Set working directory to the backend app
WORKDIR /app/apps/backend

# Expose the API port
EXPOSE 3001

# Start the application in development mode
# Note: In production, this would be `pnpm run build` followed by `pnpm start`
CMD ["pnpm", "run", "dev"]
