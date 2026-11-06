# syntax=docker/dockerfile:1
# Laravel 12/13 + React/Inertia + Wayfinder | Coolify Dockerfile build pack
# Requires: composer.lock, pnpm-lock.yaml, pnpm-workspace.yaml and .npmrc

ARG PHP_IMAGE=php:8.4-fpm-bookworm

# ===== 1. Build PHP extensions (cached across source changes) =====
FROM ${PHP_IMAGE} AS php-build
RUN apt-get update && apt-get install -y --no-install-recommends \
    $PHPIZE_DEPS git unzip \
    libfreetype6-dev libicu-dev libjpeg62-turbo-dev \
    libonig-dev libpng-dev libpq-dev libwebp-dev libzip-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install -j"$(nproc)" \
       bcmath exif gd intl mbstring pcntl pdo_mysql pdo_pgsql zip \
    && docker-php-ext-enable opcache \
    && rm -rf /var/lib/apt/lists/*

# Optional: enable when Redis / Horizon is needed (then rebuild the image)
# RUN pecl install redis && docker-php-ext-enable redis

# ===== 2. Install production PHP dependencies =====
FROM php-build AS vendor
COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer
WORKDIR /var/www
ENV COMPOSER_ALLOW_SUPERUSER=1
COPY composer.json composer.lock ./
RUN --mount=type=cache,target=/tmp/composer-cache \
    COMPOSER_CACHE_DIR=/tmp/composer-cache composer install \
    --no-dev --prefer-dist --no-interaction --no-progress \
    --no-scripts --no-autoloader
COPY . .
RUN composer dump-autoload --no-dev --optimize --no-scripts --no-interaction

# ===== 3. Build frontend: PHP + Composer + Node + Wayfinder =====
# IMPORTANT: inherit vendor, NOT php-build: Composer and vendor/ are required.
FROM vendor AS frontend
COPY --from=node:24-bookworm-slim /usr/local/bin/node /usr/local/bin/node
COPY --from=node:24-bookworm-slim /usr/local/lib/node_modules/ /usr/local/lib/node_modules/
RUN ln -sf /usr/local/lib/node_modules/corepack/dist/corepack.js /usr/local/bin/corepack \
    && corepack enable
WORKDIR /var/www
ENV CI=true
RUN mkdir -p bootstrap/cache storage/framework/cache/data \
    storage/framework/sessions storage/framework/views storage/logs
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm config set store-dir /pnpm/store \
    && pnpm install --frozen-lockfile
ARG VITE_APP_NAME=Laravel
ENV VITE_APP_NAME=${VITE_APP_NAME}
# Explicit generation makes Laravel exceptions visible before Vite runs.
RUN php artisan wayfinder:generate --with-form -vvv
RUN pnpm run build

# ===== 4. Minimal runtime (no Node.js/node_modules) =====
FROM ${PHP_IMAGE} AS production
RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx supervisor curl ca-certificates \
    libfreetype6 libicu72 libjpeg62-turbo libonig5 \
    libpng16-16 libpq5 libwebp7 libzip4 \
    && rm -rf /var/lib/apt/lists/* \
    && rm -f /etc/nginx/sites-enabled/default
COPY --from=php-build /usr/local/lib/php/extensions/ /usr/local/lib/php/extensions/
COPY --from=php-build /usr/local/etc/php/conf.d/ /usr/local/etc/php/conf.d/
WORKDIR /var/www
COPY --from=vendor --chown=www-data:www-data /var/www /var/www
COPY --from=frontend --chown=www-data:www-data /var/www/public/build /var/www/public/build
# Wayfinder generated source is needed by the Vite build, not generally at runtime.
COPY docker/php.ini /usr/local/etc/php/conf.d/99-production.ini
COPY docker/php-fpm.conf /usr/local/etc/php-fpm.d/zz-production.conf
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/entrypoint.sh /usr/local/bin/application-entrypoint
RUN chmod 0755 /usr/local/bin/application-entrypoint \
    && mkdir -p /run/nginx /var/www/storage/framework/cache/data \
      /var/www/storage/framework/sessions /var/www/storage/framework/views \
      /var/www/storage/logs /var/www/bootstrap/cache \
    && chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache
ENV APP_ENV=production APP_DEBUG=false
# Optional services configured separately in Coolify: Redis, Reverb, Meilisearch.
# Enable Horizon/Pulse only in docker/supervisord.conf when actually installed.
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
    CMD curl -fsS --max-time 5 http://127.0.0.1/up >/dev/null || exit 1
ENTRYPOINT ["/usr/local/bin/application-entrypoint"]
CMD ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
