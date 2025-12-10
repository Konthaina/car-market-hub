# Car Market Hub

Marketplace where sellers list cars and buyers browse with images.

## Stack
- Backend: Laravel 12 + Sanctum + MySQL
- Frontend: React + Vite (Router, Axios, Zustand)
- Storage: Local/S3 (public disk for images)

## Folders
```
car-marketplace-platform/
  backend/   # Laravel API
  frontend/  # React SPA
```

## Quick Start (local)
Backend:
```bash
cd backend
cp .env.example .env   # Windows: copy .env.example .env
composer install && php artisan key:generate
php artisan migrate && php artisan storage:link
php artisan serve --host=127.0.0.1 --port=8000
```

Frontend:
```bash
cd frontend
npm install
npm run dev -- --host --port 5173
```

## Docker (recommended)
```bash
docker compose up --build
# backend:  http://localhost:8000
# frontend: http://localhost:5173
```
- Persistent uploads: `backend_storage` volume mounts to `storage/` in the backend container.
- Image URLs use `APP_URL` + `/storage/...` (compose sets `APP_URL=http://localhost:8000`).
- On container start the backend Dockerfile removes any stale `public/storage` and recreates the symlink to the mounted volume.

## Auth
- `POST /register`, `POST /login`, `POST /logout`
- `GET /api/user` (requires login)

## Cars API (v1)
- `GET /api/cars` list & filter
- `GET /api/cars/{id}` details (+images)
- `POST /api/cars` create (auth)
- `PUT/PATCH /api/cars/{id}` update (owner/admin)
- `DELETE /api/cars/{id}` delete (owner/admin)

## DB (core)
- users: name, email, password, role (`buyer|seller|admin`), profile_image_path
- cars: make, model, year, mileage, price, condition, location, status, description
- car_images: car_id, path, alt, is_cover, position

## Contribute
- Branch: `feat/*`, `fix/*`
- MR: what/why/screenshots

## License
MIT
