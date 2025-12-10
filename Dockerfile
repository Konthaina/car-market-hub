# Root Dockerfile for Render deploys (builds the Laravel backend)
FROM php:8.2-cli

# System deps & PHP extensions
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
ENV COMPOSER_ALLOW_SUPERUSER=1

# App code (copy backend folder)
WORKDIR /var/www/html
COPY backend/. .

# Ensure storage/cache exist (especially when storage is a mounted volume)
RUN mkdir -p storage/app/public storage/framework/{cache,sessions,views} bootstrap/cache || true

EXPOSE 8000

# Simple startup: install deps, migrate, link storage (only if missing), run server
CMD sh -lc '\
    composer install \
    --no-interaction \
    --prefer-dist \
    --optimize-autoloader \
    --ignore-platform-reqs \
    && php artisan key:generate --force || true \
    && php artisan migrate:fresh --seed --force || true \
    && rm -rf public/storage \
    && php artisan storage:link --force || true \
    && php artisan serve --host=0.0.0.0 --port=8000 \
    '
