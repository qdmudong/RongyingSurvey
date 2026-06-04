# Rongying Survey

Lightweight mobile assessment app for publishing surveys, collecting named submissions, showing immediate results, and exporting admin data.

## Current Assessment

- `萨提亚应对姿态自我测评`
- Public URL: `http://localhost:3000/s/satir-coping`
- Admin URL: `http://localhost:3000/admin`
- Default local admin password: `admin123`

Set `ADMIN_PASSWORD` before deployment.

## Local Development

```bash
npm install
npm run db:push
npm run dev
```

The SQLite database is `dev.db` by default. It is ignored by git because it contains runtime data.

## Verification

```bash
npm run lint
npm run build
```

## Docker

```bash
docker compose up -d --build
```

The Docker Compose setup stores SQLite data in the `survey-data` volume. Caddy listens on ports `80` and `443`, gets an HTTPS certificate, and proxies traffic to the app on Docker-internal port `3000`.

Production URLs:

- `https://124-220-45-252.nip.io/s/satir-coping`
- `https://124-220-45-252.nip.io/admin`

Change `ADMIN_PASSWORD` in `docker-compose.yml` before exposing the app publicly.

## Main Routes

- `/` home page
- `/s/[slug]` public mobile assessment page
- `/r/[id]` result page after submission
- `/admin` admin dashboard with QR code, latest submissions, and CSV export
