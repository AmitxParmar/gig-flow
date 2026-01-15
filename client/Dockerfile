# Stage 1: Build stage
FROM node:22-slim AS builder

# Set the working directory
WORKDIR /app

# Enable corepack for pnpm (faster and more reliable than npm install -g)
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Copy package configuration files
COPY package.json pnpm-lock.yaml ./

# Install dependencies with network retry configuration
RUN pnpm config set network-timeout 300000 && \
  pnpm config set fetch-retries 5 && \
  pnpm config set fetch-retry-mintimeout 20000 && \
  pnpm install --no-frozen-lockfile

# Copy the rest of the application code
COPY . .

# Set environment variables for build
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build the application
RUN pnpm run build

# Stage 2: Production stage
FROM nginx:stable-alpine

# Copy the build output from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration for optimization
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 3000

# Health check (nginx alpine has wget)
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
