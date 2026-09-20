# Multi-stage Dockerfile for Photo Sharing Platform (Cloud Run / AWS ECS Ready)

# Stage 1: Build & Package
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies first for Docker layer caching
COPY package*.json ./
RUN npm ci

# Copy application source code
COPY . .

# Compile frontend SPA and backend TypeScript server into dist/
RUN npm run build

# Stage 2: Production Runtime
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy compiled assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# Ensure uploads and thumbnails directories exist with proper permissions
RUN mkdir -p /app/uploads/thumbnails && chown -R node:node /app

USER node

EXPOSE 3000

CMD ["node", "dist/server.cjs"]
