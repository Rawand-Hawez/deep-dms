# Build stage
FROM node:20-alpine AS build

# Accept build arguments (Coolify will inject these)
ARG VITE_API_BASE_URL
ARG VITE_MOCK_AUTH
ARG VITE_DEV_MODE

# Install build dependencies for native modules (Python, make, g++ for node-gyp)
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy package files and npm config for better caching
COPY package*.json .npmrc* ./

# Install dependencies with increased network timeout and retry
RUN npm install --prefer-offline --no-audit --progress=false

# Copy source code
COPY . .

# Set environment variables for Vite build
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_MOCK_AUTH=${VITE_MOCK_AUTH}
ENV VITE_DEV_MODE=${VITE_DEV_MODE}
ENV NODE_ENV=production

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check (using wget to check /health endpoint)
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
