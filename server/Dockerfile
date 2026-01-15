# Base stage
FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Builder stage
FROM base AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
# Configure pnpm for better network reliability and use no-frozen-lockfile
RUN pnpm config set network-timeout 300000 && \
  pnpm config set fetch-retries 5 && \
  pnpm config set fetch-retry-mintimeout 20000 && \
  pnpm install --no-frozen-lockfile
COPY . .
# Skipped prisma generate as requested
RUN pnpm run build
RUN pnpm prune --prod

# Runner stage
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8000

# Copy specific things we need
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./
COPY --from=builder /app/public ./public

# Create empty .env file (actual env vars come from docker-compose env_file)
RUN touch .env

EXPOSE 8000

# Install wget for healthcheck (slim doesn't have it by default, use built-in or install)
RUN apt-get update && apt-get install -y wget && rm -rf /var/lib/apt/lists/*

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost:8000/health || exit 1

CMD ["node", "dist/index.cjs"]
