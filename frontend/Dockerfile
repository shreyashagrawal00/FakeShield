# ============================================================
# FakeShield AI — Frontend Dockerfile (multi-stage)
# Stage 1: Build with Node.js
# Stage 2: Serve with nginx
# ============================================================

# ---- Stage 1: Build ----
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source files
COPY . .

# Pass the backend API URL at build time (default points to docker-compose service name)
ARG VITE_API_URL=http://localhost:8001
ENV VITE_API_URL=$VITE_API_URL

# Build the production bundle
RUN npm run build

# ---- Stage 2: Serve with nginx ----
FROM nginx:alpine

# Remove the default nginx page
RUN rm -rf /usr/share/nginx/html/*

# Copy built files from Stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config for SPA routing (handles React client-side routes)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
