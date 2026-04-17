# Multi-stage Dockerfile for neurox-console (Vite SPA served by nginx).
#
# Build args:
#   VITE_API_URL  — absolute URL to the neurox-enterprise backend (default: /api proxy)
#   VITE_MCP_URL  — absolute URL to the MCP endpoint (default: derived from VITE_API_URL + /mcp)
#
# Runtime: nginx:1.27-alpine, serves static assets + proxies /api/* and /mcp to the backend.

# -----------------------------------------------------------------------------
# Stage 1: build the Vite bundle
# -----------------------------------------------------------------------------
FROM docker.io/library/node:22-alpine AS builder

WORKDIR /app

# Install deps. Prefer `npm ci` for reproducibility, but fall back to
# `npm install` when the lockfile is out of sync with package.json (this can
# happen in active development; CI pipelines should fail-fast instead).
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund || npm install --no-audit --no-fund

COPY . .

# Build-time configuration. Defaults work when the console is reverse-proxied
# under the same origin as the backend; override for cross-origin deployments.
ARG VITE_API_URL=""
ARG VITE_MCP_URL=""
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_MCP_URL=$VITE_MCP_URL

RUN npm run build

# -----------------------------------------------------------------------------
# Stage 2: runtime image with nginx
# -----------------------------------------------------------------------------
FROM docker.io/library/nginx:1.27-alpine

# Remove default config and replace with ours.
RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/neurox-console.conf

COPY --from=builder /app/dist /usr/share/nginx/html

# nginx runs as non-root by default in the alpine image's nginx user.
EXPOSE 80

HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1
