# ---- Build stage ----
FROM node:18-alpine AS builder

ARG VITE_GOOGLE_MAPS_API
ARG VITE_MAP_ID
ARG VITE_GOOGLE_MAPS_STATIC_API

ENV VITE_GOOGLE_MAPS_API=$VITE_GOOGLE_MAPS_API \
    VITE_MAP_ID=$VITE_MAP_ID \
    VITE_GOOGLE_MAPS_STATIC_API=$VITE_GOOGLE_MAPS_STATIC_API

# Set working directory
WORKDIR /app

# Install dependencies based on the lockfile
COPY package*.json ./
RUN npm ci --production=false

# Copy the rest of the application source
COPY . .

# Build the application in production mode
RUN npm run build

# ---- Production stage ----
FROM nginx:1.25-alpine AS production

# Install envsubst for runtime variable substitution
RUN apk add --no-cache gettext

# Copy optimized build from the previous stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx template that will be rendered with env vars at container start
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Render sets a dynamic $PORT env variable. Default to 8080 for local use.
ENV PORT 8080

# Expose the runtime port
EXPOSE ${PORT}

# Generate final nginx config with the PORT value, then start nginx
CMD ["/bin/sh", "-c", "envsubst '$$PORT' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"] 