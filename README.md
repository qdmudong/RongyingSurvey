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

The Docker Compose setup stores SQLite data in the `survey-data` volume and runs the app on port `3000`.

Change `ADMIN_PASSWORD` in `docker-compose.yml` before exposing the app publicly.

## Main Routes

- `/` home page
- `/s/[slug]` public mobile assessment page
- `/r/[id]` result page after submission
- `/admin` admin dashboard with QR code, latest submissions, and CSV export
