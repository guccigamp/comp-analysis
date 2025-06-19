# Build stage
FROM node:20-bookworm AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Install Playwright browser binaries and required system dependencies in the builder (to leverage layer caching)
RUN npx playwright install --with-deps

# Production stage
FROM node:20-bookworm

WORKDIR /app

# Copy package files and install only production deps (includes Playwright runtime)
COPY package*.json ./
RUN npm ci --only=production && \
    npx playwright install --with-deps

# Copy built application from builder stage
COPY --from=builder /app/src ./src
COPY --from=builder /app/server.js ./

# Use the non-root user already present in the base image
USER node

# Expose port
EXPOSE 8000

# Set default environment variables
ENV NODE_ENV=production
ENV PORT=8000

# Start production server
CMD ["npm", "start"] 