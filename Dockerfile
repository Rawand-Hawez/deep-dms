# Multi-stage build for Vue.js application
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Accept build arguments (Coolify will inject these)
ARG VITE_API_BASE_URL
ARG VITE_MOCK_AUTH
ARG VITE_DEV_MODE

# Convert build args to environment variables for Vite
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_MOCK_AUTH=${VITE_MOCK_AUTH}
ENV VITE_DEV_MODE=${VITE_DEV_MODE}
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
