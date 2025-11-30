# Car Market Hub 🚗✨

A tiny, shiny marketplace where **sellers list cars** and **buyers find love at first drive**.  

## 🧰 Stack
- **Backend:** Laravel 12 + Sanctum + MySQL
- **Frontend:** React + Vite (Router, Axios, Zustand)
- **Storage:** Local/S3 for images

## 📦 Folders
```
car-marketplace-platform/
├─ backend/   # Laravel API
└─ frontend/  # React SPA
```

## ⚡ Quick Start
**Backend**
```bash
cd backend
cp .env.example .env   # Windows: copy .env.example .env
composer install && php artisan key:generate
php artisan migrate && php artisan storage:link
php artisan serve --host=127.0.0.1 --port=8000
```

**Frontend**
```bash
cd ../frontend
npm install
npm run dev
```

## 🔐 Auth (cookie-based)
- `POST /register`, `POST /login`, `POST /logout`
- `GET /api/user` → current user (requires login)

## 🚘 Cars API (v1)
- `GET /api/cars` – list & filter
- `GET /api/cars/{id}` – details (+images)
- `POST /api/cars` – create (auth)
- `PUT/PATCH /api/cars/{id}` – update (owner/admin)
- `DELETE /api/cars/{id}` – delete (owner/admin)

## 🧱 DB (core)
- **users**: name, email, password, role (`buyer|seller|admin`)
- **cars**: make, model, year, mileage, price, condition, location, status, description
- **car_images**: car_id, path, sort

## 🗺️ Roadmap (mini)
1) Listings CRUD ✅  
2) Filters & images ✅  
3) Chat 💬  
4) Favorites ⭐  
5) Admin 🛡️  

## 🤝 Contribute
- Branch: `feat/*`, `fix/*`
- MR: what/why/screenshots

## 📜 License
MIT © Angkor Science Team
