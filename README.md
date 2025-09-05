# Neon Mortgage (Extracted)

This repository contains an extracted, mortgage-only API and Next.js frontend for the `/get-mortgage` flow and the mortgage admin API.

## Quickstart

1. Copy `.env.example` to `.env` and set your values
2. Install deps and build Next.js (optional):

```bash
npm ci
cd app && npm ci && npm run build
```

3. Start API server:

```bash
npm start
```

Health: `http://localhost:5000/health`
Create Application: `POST /api/landing/application/create`

## Deploy

- GitHub Actions workflow builds the Next.js app for CI
- Dockerfile provided for containerized API

