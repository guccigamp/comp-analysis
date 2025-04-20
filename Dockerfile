# Use Node 23.11.0 Alpine base image
FROM node:23.11.0-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy Prisma schema and database
COPY prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Start the app
CMD ["node", "src/app.js"]
