# syntax=docker/dockerfile:1

# ── Stage 1: Dependencies ────────────────────────────────────────
FROM node:20-alpine AS deps

RUN corepack enable && corepack prepare pnpm@10.28.2 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --ignore-scripts

# ── Stage 2: Build ───────────────────────────────────────────────
FROM deps AS build

COPY . .

ARG VITE_API_BASE_URL=/api
ARG VITE_COZE_API_KEY
ARG VITE_COZE_WORKFLOW_ID
ARG VITE_COZE_APP_ID
ARG VITE_COZE_BOT_ID

RUN pnpm run build

# ── Stage 3: Runtime (nginx) ─────────────────────────────────────
FROM nginx:1-alpine AS runtime

COPY --from=build /app/dist /usr/share/nginx/html
COPY <<'EOF' /etc/nginx/conf.d/default.conf
server {
    listen       80;
    server_name  _;
    root         /usr/share/nginx/html;
    index        index.html;

    # gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;
    gzip_min_length 256;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API reverse proxy (override via env or compose)
    location /api/ {
        proxy_pass         http://backend:9000;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }

    # static assets cache
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires    30d;
        add_header Cache-Control "public, immutable";
    }
}
EOF

RUN addgroup -g 1001 -S appgroup && \
    adduser  -u 1001 -S appuser -G appgroup && \
    chown -R appuser:appgroup /usr/share/nginx/html /var/cache/nginx /var/log/nginx && \
    touch /var/run/nginx.pid && chown appuser:appgroup /var/run/nginx.pid

USER appuser

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost:80/ || exit 1
