# Deployment Guide

This guide covers deploying ByteForge Aegis with Docker and nginx reverse proxy.

## Architecture

```
                    ┌──────────────┐
   Browser ──────►  │    nginx     │
                    │  (port 443)  │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
     /api/frontend/*      /api/*    everything else
              │            │            │
              ▼            ▼            ▼
     ┌────────────┐  ┌──────────┐  ┌────────────┐
     │  frontend   │  │ backend  │  │  frontend   │
     │  (Next.js)  │  │ (Flask)  │  │  (Next.js)  │
     │  port 3000  │  │ port 5678│  │  port 3000  │
     └────────────┘  └──────────┘  └────────────┘
```

The frontend handles all page rendering and the `/api/frontend/*` routes (site lookup, login proxy, admin dashboards). The backend handles all other `/api/*` routes (authentication, site management, user management).

## Docker Compose

```yaml
services:
  aegis:
    image: ghcr.io/jmazzahacks/byteforge-aegis:latest
    container_name: aegis
    restart: unless-stopped
    ports:
      - "127.0.0.1:5678:5678"
    environment:
      - DB_HOST=your-db-host
      - DB_PORT=5432
      - DB_NAME=aegis
      - DB_USER=aegis_admin
      - DB_PASSWORD=your-db-password
      - SECRET_KEY=your-secret-key
      - MASTER_API_KEY=your-master-api-key
      - MAILGUN_API_KEY=your-mailgun-key
      - MAILGUN_DOMAIN=your-mailgun-domain

  aegis-frontend:
    image: ghcr.io/jmazzahacks/byteforge-aegis-frontend:latest
    container_name: aegis-frontend
    restart: unless-stopped
    ports:
      - "127.0.0.1:3000:3000"
    environment:
      - API_URL=http://aegis:5678
      - AEGIS_ADMIN_DOMAIN=aegis.yourdomain.com
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://127.0.0.1:3000/api/frontend/health"]
      interval: 30s
      timeout: 3s
      start_period: 40s
      retries: 3
```

### Environment Variables

**Backend (`aegis`)**

| Variable | Description |
|----------|-------------|
| `DB_HOST` | PostgreSQL host |
| `DB_PORT` | PostgreSQL port (default: 5432) |
| `DB_NAME` | Database name |
| `DB_USER` | Database user |
| `DB_PASSWORD` | Database password |
| `SECRET_KEY` | Secret key for token signing |
| `MASTER_API_KEY` | API key for administrative operations |
| `MAILGUN_API_KEY` | Mailgun API key for transactional emails |
| `MAILGUN_DOMAIN` | Mailgun sending domain |

**Frontend (`aegis-frontend`)**

| Variable | Description |
|----------|-------------|
| `API_URL` | Backend API URL (internal Docker network, e.g., `http://aegis:5678`) |
| `AEGIS_ADMIN_DOMAIN` | Domain of the admin site created by `bootstrap_aegis.py` |

## Nginx Configuration

The key routing requirement: `/api/frontend/*` must go to the **frontend** container, while all other `/api/*` routes go to the **backend** container. Nginx matches the longest prefix first, so put the more specific block before the general one.

```nginx
server {
    listen 443 ssl;
    server_name aegis.yourdomain.com;

    # SSL configuration
    ssl_certificate     /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Frontend API routes -> frontend (Next.js)
    # MUST appear before the general /api/ block
    location /api/frontend/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # All other API routes -> backend (Flask)
    location /api/ {
        proxy_pass http://127.0.0.1:5678;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Everything else -> frontend (Next.js)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Route Summary

| Path | Destination | Purpose |
|------|-------------|---------|
| `/api/frontend/*` | Frontend (3000) | Site lookup, login proxy, admin dashboards |
| `/api/*` | Backend (5678) | All auth/site/user API endpoints |
| `/*` | Frontend (3000) | Pages, static assets |

## Bootstrapping the Admin Site

After deploying both containers, run the bootstrap script to create the admin site and admin user:

```bash
# From the backend project directory
source bin/activate && python admin_scripts/bootstrap_aegis.py

# Or via Docker
docker exec -it aegis python admin_scripts/bootstrap_aegis.py
```

The script will prompt for:
1. API URL (default from `API_URL` env var)
2. Master API key (default from `MASTER_API_KEY` env var)
3. Admin site domain (should match `AEGIS_ADMIN_DOMAIN` in docker-compose)
4. Admin site name
5. Frontend URL
6. Email configuration
7. Admin user email

After completing the script:
1. Check the admin email for a verification link
2. Click the link to set a password
3. Navigate to `https://aegis.yourdomain.com/aegis-admin/login`
4. Login with the admin credentials

## Building and Publishing Images

Both projects include a `build-publish.sh` script that auto-increments the version, builds for `linux/amd64`, and pushes to GitHub Container Registry:

```bash
# Build and push (with cache)
./build-publish.sh

# Build and push (no cache, for clean rebuilds)
./build-publish.sh --no-cache
```

## Updating

To deploy a new version:

```bash
# On the server
docker compose pull
docker compose up -d
```
