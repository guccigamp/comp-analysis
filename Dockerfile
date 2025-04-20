# Use Node 23.11.0 Alpine base image
FROM node:23.11.0-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy Prisma schema and database
COPY prisma ./prisma/

# Generate Prisma client and run the first migration
RUN npx prisma generate --schema ./prisma/schema.prisma && npx prisma migrate dev --name init

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Start the app
CMD ["node", "src/app.js"]
