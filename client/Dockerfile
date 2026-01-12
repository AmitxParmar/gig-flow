# Stage 1: Build stage
FROM node:22-alpine AS builder

# Set the working directory
WORKDIR /app

# Install pnpm for efficient dependency management
RUN npm install -g pnpm

# Copy package configuration files
# Copying these separately allows leveraging Docker cache
COPY package.json pnpm-lock.yaml ./

# Install dependencies
# Using --frozen-lockfile ensures the build is reproducible
RUN pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Set environment variables for build if necessary
# ARG VITE_API_URL
# ENV VITE_API_URL=$VITE_API_URL

# Build the application
RUN pnpm run build

# Stage 2: Production stage
FROM nginx:stable-alpine

# Use a non-root user for better security (optional but recommended)
# Note: nginx alpine usually doesn't have a non-root user setup by default that can run on port 80
# For simplicity and standard practices, we'll keep it as root but apply best configurations

# Copy the build output from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration for optimization
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 3000

# Health check to ensure the container is running correctly
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
