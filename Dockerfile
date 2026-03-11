# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:25-alpine AS builder

WORKDIR /app

# Install dependencies first (cached layer)
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# ── Stage 2: Serve ────────────────────────────────────────────────────────────
FROM nginx:alpine AS runner

# Patch OS-level vulnerabilities
RUN apk upgrade --no-cache

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# SPA routing: redirect all 404s to index.html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
